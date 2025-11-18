/**
 * Analytics Adapter Interface
 *
 * Allows tracking of usage metrics and user behavior.
 * Implementations can send to Google Analytics, Mixpanel, custom analytics systems, etc.
 */

export interface AnalyticsEvent {
  event: string
  userId?: string
  properties?: Record<string, unknown>
  timestamp?: number
}

export interface IAnalyticsAdapter {
  /**
   * Track a generic event
   */
  track(event: AnalyticsEvent): Promise<void>

  /**
   * Track playbook view
   */
  trackPlaybookView(playbookId: string, userId?: string): Promise<void>

  /**
   * Track playbook creation
   */
  trackPlaybookCreated(playbookId: string, userId: string, metadata?: Record<string, unknown>): Promise<void>

  /**
   * Track session start
   */
  trackSessionStarted(sessionId: string, playbookId: string, facilitatorId: string): Promise<void>

  /**
   * Track session completion
   */
  trackSessionCompleted(sessionId: string, durationMinutes: number, participantCount?: number): Promise<void>

  /**
   * Track feedback submission
   */
  trackFeedbackSubmitted(sessionId: string, rating?: number): Promise<void>

  /**
   * Identify a user (set user properties)
   */
  identify(userId: string, properties: Record<string, unknown>): Promise<void>
}

/**
 * In-memory analytics adapter for development/testing
 */
export class InMemoryAnalyticsAdapter implements IAnalyticsAdapter {
  private events: AnalyticsEvent[] = []

  async track(event: AnalyticsEvent): Promise<void> {
    this.events.push({
      ...event,
      timestamp: event.timestamp || Date.now(),
    })
    console.log('[Analytics]', event.event, event.properties)
  }

  async trackPlaybookView(playbookId: string, userId?: string): Promise<void> {
    await this.track({
      event: 'playbook_viewed',
      userId,
      properties: { playbookId },
    })
  }

  async trackPlaybookCreated(playbookId: string, userId: string, metadata?: Record<string, unknown>): Promise<void> {
    await this.track({
      event: 'playbook_created',
      userId,
      properties: { playbookId, ...metadata },
    })
  }

  async trackSessionStarted(sessionId: string, playbookId: string, facilitatorId: string): Promise<void> {
    await this.track({
      event: 'session_started',
      userId: facilitatorId,
      properties: { sessionId, playbookId },
    })
  }

  async trackSessionCompleted(sessionId: string, durationMinutes: number, participantCount?: number): Promise<void> {
    await this.track({
      event: 'session_completed',
      properties: { sessionId, durationMinutes, participantCount },
    })
  }

  async trackFeedbackSubmitted(sessionId: string, rating?: number): Promise<void> {
    await this.track({
      event: 'feedback_submitted',
      properties: { sessionId, rating },
    })
  }

  async identify(userId: string, properties: Record<string, unknown>): Promise<void> {
    console.log(`[Analytics] Identify user ${userId}:`, properties)
  }

  /**
   * Get all tracked events (for testing)
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  /**
   * Clear all events (for testing)
   */
  clear(): void {
    this.events = []
  }
}

// Singleton instance
let analyticsAdapter: IAnalyticsAdapter = new InMemoryAnalyticsAdapter()

export function setAnalyticsAdapter(adapter: IAnalyticsAdapter): void {
  analyticsAdapter = adapter
}

export function getAnalyticsAdapter(): IAnalyticsAdapter {
  return analyticsAdapter
}
