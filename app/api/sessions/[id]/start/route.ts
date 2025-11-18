import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/services/session-service'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { metrics, MetricNames } from '@/lib/metrics'

// POST /api/sessions/[id]/start - Start a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    logger.info('Starting session', { id })

    const session = await sessionService.start(id)

    metrics.recordCounter('session_started')
    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions/:id/start',
      method: 'POST',
    })

    return NextResponse.json(session)
  } catch (error) {
    logger.error('Error starting session', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions/:id/start',
      method: 'POST',
    })
    return handleApiError(error)
  }
}
