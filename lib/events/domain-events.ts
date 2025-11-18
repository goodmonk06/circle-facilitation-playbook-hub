/**
 * Domain Events System
 *
 * Provides a lightweight event bus for domain events.
 * Allows decoupling of business logic and enables reactive behaviors.
 */

import { logger } from '../logger'

export interface DomainEvent {
  type: string
  aggregateId: string
  timestamp: number
  payload: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export type EventHandler = (event: DomainEvent) => Promise<void> | void

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map()
  private globalHandlers: EventHandler[] = []

  /**
   * Subscribe to a specific event type
   */
  on(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || []
    this.handlers.set(eventType, [...existing, handler])
  }

  /**
   * Subscribe to all events
   */
  onAny(handler: EventHandler): void {
    this.globalHandlers.push(handler)
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || []
    this.handlers.set(
      eventType,
      existing.filter((h) => h !== handler)
    )
  }

  /**
   * Publish an event
   */
  async emit(event: DomainEvent): Promise<void> {
    logger.debug('Domain event emitted', { event: event.type, aggregateId: event.aggregateId })

    // Get type-specific handlers
    const typeHandlers = this.handlers.get(event.type) || []

    // Combine with global handlers
    const allHandlers = [...typeHandlers, ...this.globalHandlers]

    // Execute all handlers
    for (const handler of allHandlers) {
      try {
        await handler(event)
      } catch (error) {
        logger.error(`Error in event handler for ${event.type}`, error, {
          event: event.type,
          aggregateId: event.aggregateId,
        })
      }
    }
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear()
    this.globalHandlers = []
  }
}

// Singleton event bus
const eventBus = new EventBus()

export { eventBus }

// Helper to create and emit events
export function createEvent(
  type: string,
  aggregateId: string,
  payload: Record<string, unknown>,
  metadata?: Record<string, unknown>
): DomainEvent {
  return {
    type,
    aggregateId,
    timestamp: Date.now(),
    payload,
    metadata,
  }
}

export async function emitEvent(
  type: string,
  aggregateId: string,
  payload: Record<string, unknown>,
  metadata?: Record<string, unknown>
): Promise<void> {
  const event = createEvent(type, aggregateId, payload, metadata)
  await eventBus.emit(event)
}

// Event type constants
export const EventTypes = {
  // Playbook events
  PLAYBOOK_CREATED: 'playbook.created',
  PLAYBOOK_UPDATED: 'playbook.updated',
  PLAYBOOK_PUBLISHED: 'playbook.published',
  PLAYBOOK_ARCHIVED: 'playbook.archived',
  PLAYBOOK_DELETED: 'playbook.deleted',
  PLAYBOOK_VIEWED: 'playbook.viewed',

  // Session events
  SESSION_SCHEDULED: 'session.scheduled',
  SESSION_STARTED: 'session.started',
  SESSION_COMPLETED: 'session.completed',
  SESSION_CANCELLED: 'session.cancelled',

  // Feedback events
  FEEDBACK_SUBMITTED: 'feedback.submitted',

  // Comment events
  COMMENT_ADDED: 'comment.added',
  COMMENT_RESOLVED: 'comment.resolved',

  // Version events
  VERSION_CREATED: 'version.created',
} as const

export type EventType = (typeof EventTypes)[keyof typeof EventTypes]
