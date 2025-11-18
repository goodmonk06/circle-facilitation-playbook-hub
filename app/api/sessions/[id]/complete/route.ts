import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/services/session-service'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { metrics, MetricNames } from '@/lib/metrics'
import { z } from 'zod'

const completeSessionSchema = z.object({
  participantCount: z.number().int().positive().optional(),
  notes: z.string().optional(),
})

// POST /api/sessions/[id]/complete - Complete a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validated = completeSessionSchema.parse(body)

    logger.info('Completing session', { id })

    const session = await sessionService.complete(id, validated)

    metrics.recordCounter('session_completed')
    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions/:id/complete',
      method: 'POST',
    })

    return NextResponse.json(session)
  } catch (error) {
    logger.error('Error completing session', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions/:id/complete',
      method: 'POST',
    })
    return handleApiError(error)
  }
}
