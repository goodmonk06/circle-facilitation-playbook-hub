import { NextRequest, NextResponse } from 'next/server'
import { sessionService } from '@/lib/services/session-service'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { metrics, MetricNames } from '@/lib/metrics'
import { z } from 'zod'

const createSessionSchema = z.object({
  playbookId: z.string(),
  facilitatorId: z.string(),
  title: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
  participantCount: z.number().int().positive().optional(),
  context: z.record(z.unknown()).optional(),
})

// POST /api/sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validated = createSessionSchema.parse(body)

    logger.info('Creating session', { playbookId: validated.playbookId })

    const session = await sessionService.create({
      ...validated,
      scheduledAt: validated.scheduledAt ? new Date(validated.scheduledAt) : undefined,
    })

    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions',
      method: 'POST',
    })

    return NextResponse.json(session, { status: 201 })
  } catch (error) {
    logger.error('Error creating session', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions',
      method: 'POST',
    })
    return handleApiError(error)
  }
}

// GET /api/sessions - List sessions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const playbookId = searchParams.get('playbookId')
    const facilitatorId = searchParams.get('facilitatorId')

    logger.info('Listing sessions', { playbookId, facilitatorId })

    let sessions

    if (playbookId) {
      sessions = await sessionService.listByPlaybook(playbookId)
    } else if (facilitatorId) {
      sessions = await sessionService.listByFacilitator(facilitatorId)
    } else {
      return NextResponse.json(
        { error: 'Must provide either playbookId or facilitatorId' },
        { status: 400 }
      )
    }

    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/sessions',
      method: 'GET',
    })

    return NextResponse.json(sessions)
  } catch (error) {
    logger.error('Error listing sessions', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/sessions',
      method: 'GET',
    })
    return handleApiError(error)
  }
}
