import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/services/session-service'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { metrics, MetricNames } from '@/lib/metrics'
import { z } from 'zod'

const feedbackSchema = z.object({
  userId: z.string().optional(),
  rating: z.number().int().min(1).max(5).optional(),
  feedbackText: z.string().optional(),
  suggestionsText: z.string().optional(),
  wouldRecommend: z.boolean().optional(),
  metadata: z.record(z.unknown()).optional(),
})

// POST /api/sessions/[id]/feedback - Submit feedback for a session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate input
    const validated = feedbackSchema.parse(body)

    logger.info('Submitting feedback', { sessionId: id })

    const feedback = await sessionService.addFeedback(id, validated)

    metrics.recordCounter('feedback_submitted')
    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions/:id/feedback',
      method: 'POST',
    })

    return NextResponse.json(feedback, { status: 201 })
  } catch (error) {
    logger.error('Error submitting feedback', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions/:id/feedback',
      method: 'POST',
    })
    return handleApiError(error)
  }
}
