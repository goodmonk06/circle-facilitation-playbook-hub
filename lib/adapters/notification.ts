/**
 * Notification Adapter Interface
 *
 * Allows external systems to receive notifications about playbook events.
 * Implementations can send emails, push notifications, webhooks, etc.
 */

export interface NotificationPayload {
  recipient: string | string[]
  subject: string
  message: string
  metadata?: Record<string, unknown>
}

export interface INotificationAdapter {
  /**
   * Send a notification to one or more recipients
   */
  send(payload: NotificationPayload): Promise<void>

  /**
   * Send notification about new playbook creation
   */
  notifyPlaybookCreated(playbookId: string, creatorId: string): Promise<void>

  /**
   * Send notification about playbook publication
   */
  notifyPlaybookPublished(playbookId: string, subscribers: string[]): Promise<void>

  /**
   * Send notification about session starting soon
   */
  notifySessionStarting(sessionId: string, facilitatorId: string, minutesUntilStart: number): Promise<void>

  /**
   * Send notification about new feedback received
   */
  notifyFeedbackReceived(sessionId: string, facilitatorId: string): Promise<void>
}

/**
 * No-op implementation for development/testing
 */
export class NoOpNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log('[NoOpNotification] Would send:', payload)
  }

  async notifyPlaybookCreated(playbookId: string, creatorId: string): Promise<void> {
    console.log(`[NoOpNotification] Playbook created: ${playbookId} by ${creatorId}`)
  }

  async notifyPlaybookPublished(playbookId: string, subscribers: string[]): Promise<void> {
    console.log(`[NoOpNotification] Playbook published: ${playbookId}, notifying ${subscribers.length} subscribers`)
  }

  async notifySessionStarting(sessionId: string, facilitatorId: string, minutesUntilStart: number): Promise<void> {
    console.log(`[NoOpNotification] Session ${sessionId} starting in ${minutesUntilStart} minutes`)
  }

  async notifyFeedbackReceived(sessionId: string, facilitatorId: string): Promise<void> {
    console.log(`[NoOpNotification] New feedback for session ${sessionId}`)
  }
}

/**
 * Console-based implementation for development
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload): Promise<void> {
    console.log('=== NOTIFICATION ===')
    console.log(`To: ${Array.isArray(payload.recipient) ? payload.recipient.join(', ') : payload.recipient}`)
    console.log(`Subject: ${payload.subject}`)
    console.log(`Message: ${payload.message}`)
    if (payload.metadata) {
      console.log(`Metadata:`, payload.metadata)
    }
    console.log('====================')
  }

  async notifyPlaybookCreated(playbookId: string, creatorId: string): Promise<void> {
    await this.send({
      recipient: creatorId,
      subject: 'Playbook Created',
      message: `Your playbook (${playbookId}) has been created successfully.`,
      metadata: { playbookId, creatorId },
    })
  }

  async notifyPlaybookPublished(playbookId: string, subscribers: string[]): Promise<void> {
    await this.send({
      recipient: subscribers,
      subject: 'New Playbook Published',
      message: `A new playbook (${playbookId}) has been published.`,
      metadata: { playbookId, subscriberCount: subscribers.length },
    })
  }

  async notifySessionStarting(sessionId: string, facilitatorId: string, minutesUntilStart: number): Promise<void> {
    await this.send({
      recipient: facilitatorId,
      subject: 'Session Starting Soon',
      message: `Your session (${sessionId}) starts in ${minutesUntilStart} minutes.`,
      metadata: { sessionId, minutesUntilStart },
    })
  }

  async notifyFeedbackReceived(sessionId: string, facilitatorId: string): Promise<void> {
    await this.send({
      recipient: facilitatorId,
      subject: 'New Session Feedback',
      message: `You've received new feedback for session ${sessionId}.`,
      metadata: { sessionId },
    })
  }
}

// Singleton instance - can be swapped with different implementations
let notificationAdapter: INotificationAdapter = new ConsoleNotificationAdapter()

export function setNotificationAdapter(adapter: INotificationAdapter): void {
  notificationAdapter = adapter
}

export function getNotificationAdapter(): INotificationAdapter {
  return notificationAdapter
}
