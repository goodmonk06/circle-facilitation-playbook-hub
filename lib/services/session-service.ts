/**
 * Session Service
 *
 * Business logic for playbook session management.
 * Handles scheduling, execution tracking, and completion.
 */

import { prisma } from '../prisma'
import { logger } from '../logger'
import { metrics } from '../metrics'
import { emitEvent, EventTypes } from '../events/domain-events'
import { getNotificationAdapter } from '../adapters/notification'
import { getAnalyticsAdapter } from '../adapters/analytics'
import { NotFoundError, ValidationError } from '../errors'
import type { SessionStatus } from '@prisma/client'

export interface CreateSessionDTO {
  playbookId: string
  facilitatorId: string
  title?: string
  scheduledAt?: Date
  participantCount?: number
  context?: Record<string, unknown>
}

export interface UpdateSessionDTO {
  title?: string
  status?: SessionStatus
  scheduledAt?: Date
  participantCount?: number
  notes?: string
  context?: Record<string, unknown>
}

export interface CompleteSessionDTO {
  participantCount?: number
  notes?: string
}

export class SessionService {
  /**
   * Create a new session
   */
  async create(data: CreateSessionDTO) {
    const requestLogger = logger.child({
      operation: 'createSession',
      playbookId: data.playbookId,
    })

    requestLogger.info('Creating session')

    // Verify playbook exists
    const playbook = await prisma.playbook.findUnique({
      where: { id: data.playbookId },
    })

    if (!playbook) {
      throw new NotFoundError('Playbook', data.playbookId)
    }

    const session = await prisma.playbookSession.create({
      data: {
        playbookId: data.playbookId,
        facilitatorId: data.facilitatorId,
        title: data.title,
        scheduledAt: data.scheduledAt,
        participantCount: data.participantCount,
        contextJson: data.context ? JSON.stringify(data.context) : null,
      },
    })

    // Emit event
    await emitEvent(EventTypes.SESSION_SCHEDULED, session.id, {
      playbookId: data.playbookId,
      facilitatorId: data.facilitatorId,
      scheduledAt: data.scheduledAt,
    })

    requestLogger.info('Session created successfully', { id: session.id })

    return session
  }

  /**
   * Start a session
   */
  async start(id: string) {
    const requestLogger = logger.child({ operation: 'startSession', id })

    requestLogger.info('Starting session')

    const session = await prisma.playbookSession.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
      include: {
        playbook: true,
      },
    })

    // Track analytics
    await getAnalyticsAdapter().trackSessionStarted(
      session.id,
      session.playbookId,
      session.facilitatorId
    )

    // Emit event
    await emitEvent(EventTypes.SESSION_STARTED, session.id, {
      playbookId: session.playbookId,
      facilitatorId: session.facilitatorId,
    })

    requestLogger.info('Session started successfully')

    return session
  }

  /**
   * Complete a session
   */
  async complete(id: string, data: CompleteSessionDTO) {
    const requestLogger = logger.child({ operation: 'completeSession', id })

    requestLogger.info('Completing session')

    const session = await prisma.playbookSession.findUnique({
      where: { id },
    })

    if (!session) {
      throw new NotFoundError('Session', id)
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new ValidationError('Can only complete sessions that are in progress')
    }

    const completedAt = new Date()
    const actualDurationMinutes = session.startedAt
      ? Math.round((completedAt.getTime() - session.startedAt.getTime()) / 60000)
      : undefined

    const updatedSession = await prisma.playbookSession.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt,
        actualDurationMinutes,
        participantCount: data.participantCount ?? session.participantCount,
        notesMarkdown: data.notes,
      },
    })

    // Track analytics
    await getAnalyticsAdapter().trackSessionCompleted(
      id,
      actualDurationMinutes || 0,
      updatedSession.participantCount || undefined
    )

    // Emit event
    await emitEvent(EventTypes.SESSION_COMPLETED, id, {
      playbookId: session.playbookId,
      facilitatorId: session.facilitatorId,
      durationMinutes: actualDurationMinutes,
    })

    requestLogger.info('Session completed successfully')

    return updatedSession
  }

  /**
   * Cancel a session
   */
  async cancel(id: string) {
    const requestLogger = logger.child({ operation: 'cancelSession', id })

    requestLogger.info('Cancelling session')

    const session = await prisma.playbookSession.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    })

    // Emit event
    await emitEvent(EventTypes.SESSION_CANCELLED, id, {
      playbookId: session.playbookId,
      facilitatorId: session.facilitatorId,
    })

    requestLogger.info('Session cancelled successfully')

    return session
  }

  /**
   * Get session by ID
   */
  async getById(id: string) {
    const session = await prisma.playbookSession.findUnique({
      where: { id },
      include: {
        playbook: true,
        facilitator: true,
        feedback: true,
      },
    })

    if (!session) {
      throw new NotFoundError('Session', id)
    }

    return session
  }

  /**
   * List sessions for a playbook
   */
  async listByPlaybook(playbookId: string) {
    return prisma.playbookSession.findMany({
      where: { playbookId },
      include: {
        facilitator: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  /**
   * List sessions for a facilitator
   */
  async listByFacilitator(facilitatorId: string) {
    return prisma.playbookSession.findMany({
      where: { facilitatorId },
      include: {
        playbook: true,
      },
      orderBy: {
        scheduledAt: 'desc',
      },
    })
  }

  /**
   * Add feedback to a session
   */
  async addFeedback(
    sessionId: string,
    data: {
      userId?: string
      rating?: number
      feedbackText?: string
      suggestionsText?: string
      wouldRecommend?: boolean
      metadata?: Record<string, unknown>
    }
  ) {
    const requestLogger = logger.child({ operation: 'addFeedback', sessionId })

    requestLogger.info('Adding feedback to session')

    // Verify session exists
    const session = await this.getById(sessionId)

    const feedback = await prisma.sessionFeedback.create({
      data: {
        sessionId,
        userId: data.userId,
        rating: data.rating,
        feedbackText: data.feedbackText,
        suggestionsText: data.suggestionsText,
        wouldRecommend: data.wouldRecommend,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    })

    // Track analytics
    await getAnalyticsAdapter().trackFeedbackSubmitted(sessionId, data.rating)

    // Notify facilitator
    await getNotificationAdapter().notifyFeedbackReceived(sessionId, session.facilitatorId)

    // Emit event
    await emitEvent(EventTypes.FEEDBACK_SUBMITTED, feedback.id, {
      sessionId,
      rating: data.rating,
      userId: data.userId,
    })

    requestLogger.info('Feedback added successfully', { id: feedback.id })

    return feedback
  }
}

// Singleton instance
export const sessionService = new SessionService()
