import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/services/session-service'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { metrics, MetricNames } from '@/lib/metrics'

// GET /api/sessions/[id] - Get session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    logger.info('Getting session', { id })

    const session = await sessionService.getById(id)

    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions/:id',
      method: 'GET',
    })

    return NextResponse.json(session)
  } catch (error) {
    logger.error('Error getting session', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions/:id',
      method: 'GET',
    })
    return handleApiError(error)
  }
}

// DELETE /api/sessions/[id] - Cancel a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    logger.info('Cancelling session', { id })

    const session = await sessionService.cancel(id)

    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions/:id',
      method: 'DELETE',
    })

    return NextResponse.json(session)
  } catch (error) {
    logger.error('Error cancelling session', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions/:id',
      method: 'DELETE',
    })
    return handleApiError(error)
  }
}
