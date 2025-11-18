import { logger } from './logger'

interface MetricLabels {
  [key: string]: string | number
}

interface Metric {
  name: string
  value: number
  labels?: MetricLabels
  timestamp: number
}

class MetricsCollector {
  private metrics: Metric[] = []
  private counters: Map<string, number> = new Map()

  /**
   * Record a counter metric
   */
  recordCounter(name: string, value: number = 1, labels?: MetricLabels): void {
    const key = this.generateKey(name, labels)
    const currentValue = this.counters.get(key) || 0
    this.counters.set(key, currentValue + value)

    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now(),
    })

    logger.debug('Metric recorded', { name, value, labels })
  }

  /**
   * Record a gauge metric (point-in-time value)
   */
  recordGauge(name: string, value: number, labels?: MetricLabels): void {
    this.metrics.push({
      name,
      value,
      labels,
      timestamp: Date.now(),
    })

    logger.debug('Gauge recorded', { name, value, labels })
  }

  /**
   * Record a timing metric (in milliseconds)
   */
  recordTiming(name: string, durationMs: number, labels?: MetricLabels): void {
    this.metrics.push({
      name: `${name}_ms`,
      value: durationMs,
      labels,
      timestamp: Date.now(),
    })

    logger.debug('Timing recorded', { name, duration: durationMs, labels })
  }

  /**
   * Helper to time an async function
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: MetricLabels
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      this.recordTiming(name, Date.now() - start, labels)
      return result
    } catch (error) {
      this.recordTiming(name, Date.now() - start, {
        ...labels,
        error: 'true',
      })
      throw error
    }
  }

  /**
   * Get counter value
   */
  getCounter(name: string, labels?: MetricLabels): number {
    const key = this.generateKey(name, labels)
    return this.counters.get(key) || 0
  }

  /**
   * Get all metrics (for debugging/export)
   */
  getAllMetrics(): Metric[] {
    return [...this.metrics]
  }

  /**
   * Clear all metrics (useful for testing)
   */
  clear(): void {
    this.metrics = []
    this.counters.clear()
  }

  private generateKey(name: string, labels?: MetricLabels): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',')

    return `${name}{${labelStr}}`
  }
}

// Singleton instance
export const metrics = new MetricsCollector()

// Common metric names
export const MetricNames = {
  // API metrics
  API_REQUEST: 'api_request',
  API_ERROR: 'api_error',
  API_DURATION: 'api_duration',

  // Database metrics
  DB_QUERY: 'db_query',
  DB_ERROR: 'db_error',
  DB_DURATION: 'db_duration',

  // Business metrics
  PLAYBOOK_CREATED: 'playbook_created',
  PLAYBOOK_VIEWED: 'playbook_viewed',
  PLAYBOOK_UPDATED: 'playbook_updated',
  PLAYBOOK_DELETED: 'playbook_deleted',

  PHASE_CREATED: 'phase_created',
  STEP_CREATED: 'step_created',
} as const
