/**
 * Playbook Service
 *
 * Business logic layer for playbook operations.
 * Orchestrates database access, events, and adapter calls.
 */

import { prisma } from '../prisma'
import { logger } from '../logger'
import { metrics, MetricNames } from '../metrics'
import { emitEvent, EventTypes } from '../events/domain-events'
import { getNotificationAdapter } from '../adapters/notification'
import { getAnalyticsAdapter } from '../adapters/analytics'
import { NotFoundError, ConflictError } from '../errors'
import { parseJsonField, stringifyJsonField } from '../json-utils'
import type { PlaybookStatus, DifficultyLevel } from '@prisma/client'

export interface CreatePlaybookDTO {
  creatorId?: string
  communityId?: string
  key: string
  title: string
  descriptionMarkdown?: string
  status?: PlaybookStatus
  difficulty?: DifficultyLevel
  intendedGroupSizeRange?: { min: number; max: number }
  tags?: string[]
  prerequisites?: string[]
  category?: string[]
  language?: string
}

export interface UpdatePlaybookDTO {
  title?: string
  descriptionMarkdown?: string
  status?: PlaybookStatus
  difficulty?: DifficultyLevel
  intendedGroupSizeRange?: { min: number; max: number }
  tags?: string[]
  prerequisites?: string[]
  category?: string[]
}

export class PlaybookService {
  /**
   * Create a new playbook
   */
  async create(data: CreatePlaybookDTO) {
    const requestLogger = logger.child({ operation: 'createPlaybook', key: data.key })

    requestLogger.info('Creating playbook')

    // Check if key already exists
    const existing = await prisma.playbook.findUnique({
      where: { key: data.key },
    })

    if (existing) {
      throw new ConflictError(`Playbook with key '${data.key}' already exists`)
    }

    const playbook = await prisma.playbook.create({
      data: {
        creatorId: data.creatorId,
        communityId: data.communityId,
        key: data.key,
        title: data.title,
        descriptionMarkdown: data.descriptionMarkdown,
        status: data.status || 'DRAFT',
        difficulty: data.difficulty,
        intendedGroupSizeRangeJson: stringifyJsonField(data.intendedGroupSizeRange),
        tagsJson: stringifyJsonField(data.tags),
        prerequisitesJson: stringifyJsonField(data.prerequisites),
        categoryJson: stringifyJsonField(data.category),
        language: data.language || 'en',
      },
    })

    // Record metrics
    metrics.recordCounter(MetricNames.PLAYBOOK_CREATED)

    // Track analytics
    if (data.creatorId) {
      await getAnalyticsAdapter().trackPlaybookCreated(playbook.id, data.creatorId, {
        difficulty: playbook.difficulty,
        tags: data.tags,
      })
    }

    // Emit domain event
    await emitEvent(EventTypes.PLAYBOOK_CREATED, playbook.id, {
      key: playbook.key,
      title: playbook.title,
      creatorId: data.creatorId,
    })

    // Send notification
    if (data.creatorId) {
      await getNotificationAdapter().notifyPlaybookCreated(playbook.id, data.creatorId)
    }

    requestLogger.info('Playbook created successfully', { id: playbook.id })

    return playbook
  }

  /**
   * Get playbook by ID
   */
  async getById(id: string) {
    const playbook = await prisma.playbook.findUnique({
      where: { id },
      include: {
        creator: true,
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!playbook) {
      throw new NotFoundError('Playbook', id)
    }

    // Track view
    metrics.recordCounter(MetricNames.PLAYBOOK_VIEWED)
    await emitEvent(EventTypes.PLAYBOOK_VIEWED, playbook.id, {
      key: playbook.key,
    })

    return playbook
  }

  /**
   * Get playbook by key
   */
  async getByKey(key: string) {
    const playbook = await prisma.playbook.findUnique({
      where: { key },
      include: {
        creator: true,
        phases: {
          orderBy: { orderIndex: 'asc' },
          include: {
            steps: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    })

    if (!playbook) {
      throw new NotFoundError('Playbook', key)
    }

    // Track view
    metrics.recordCounter(MetricNames.PLAYBOOK_VIEWED)
    await emitEvent(EventTypes.PLAYBOOK_VIEWED, playbook.id, {
      key: playbook.key,
    })

    return playbook
  }

  /**
   * Update playbook
   */
  async update(id: string, data: UpdatePlaybookDTO) {
    const requestLogger = logger.child({ operation: 'updatePlaybook', id })

    requestLogger.info('Updating playbook')

    // Verify playbook exists
    await this.getById(id)

    const playbook = await prisma.playbook.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.descriptionMarkdown !== undefined && {
          descriptionMarkdown: data.descriptionMarkdown,
        }),
        ...(data.status && { status: data.status }),
        ...(data.difficulty !== undefined && { difficulty: data.difficulty }),
        ...(data.intendedGroupSizeRange !== undefined && {
          intendedGroupSizeRangeJson: stringifyJsonField(data.intendedGroupSizeRange),
        }),
        ...(data.tags !== undefined && {
          tagsJson: stringifyJsonField(data.tags),
        }),
        ...(data.prerequisites !== undefined && {
          prerequisitesJson: stringifyJsonField(data.prerequisites),
        }),
        ...(data.category !== undefined && {
          categoryJson: stringifyJsonField(data.category),
        }),
      },
    })

    // Record metrics
    metrics.recordCounter(MetricNames.PLAYBOOK_UPDATED)

    // Emit event
    await emitEvent(EventTypes.PLAYBOOK_UPDATED, playbook.id, {
      updates: Object.keys(data),
    })

    requestLogger.info('Playbook updated successfully')

    return playbook
  }

  /**
   * Publish a playbook
   */
  async publish(id: string) {
    const requestLogger = logger.child({ operation: 'publishPlaybook', id })

    requestLogger.info('Publishing playbook')

    const playbook = await prisma.playbook.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })

    // Emit event
    await emitEvent(EventTypes.PLAYBOOK_PUBLISHED, playbook.id, {
      key: playbook.key,
      title: playbook.title,
    })

    // TODO: Notify subscribers (would need subscription system)
    requestLogger.info('Playbook published successfully')

    return playbook
  }

  /**
   * Delete playbook
   */
  async delete(id: string) {
    const requestLogger = logger.child({ operation: 'deletePlaybook', id })

    requestLogger.info('Deleting playbook')

    // Verify exists
    const playbook = await this.getById(id)

    await prisma.playbook.delete({
      where: { id },
    })

    // Record metrics
    metrics.recordCounter(MetricNames.PLAYBOOK_DELETED)

    // Emit event
    await emitEvent(EventTypes.PLAYBOOK_DELETED, id, {
      key: playbook.key,
      title: playbook.title,
    })

    requestLogger.info('Playbook deleted successfully')
  }
}

// Singleton instance
export const playbookService = new PlaybookService()
