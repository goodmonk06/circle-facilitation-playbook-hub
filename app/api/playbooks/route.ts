import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJsonField, stringifyJsonField } from '@/lib/json-utils'
import { createPlaybookSchema } from '@/lib/validation'
import { handleApiError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { metrics, MetricNames } from '@/lib/metrics'

// GET /api/playbooks - List all playbooks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const communityId = searchParams.get('communityId')

    logger.info('Fetching playbooks', { tag, communityId })

    const playbooks = await metrics.time('db_query_playbooks', async () =>
      prisma.playbook.findMany({
        where: {
          ...(communityId && { communityId }),
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          phases: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      })
    )

    // Filter by tag if provided (since tagsJson is stored as string)
    let filteredPlaybooks = playbooks
    if (tag) {
      filteredPlaybooks = playbooks.filter((playbook) => {
        const tags = parseJsonField<string[]>(playbook.tagsJson)
        return tags?.includes(tag)
      })
    }

    // Transform to include parsed JSON fields
    const result = filteredPlaybooks.map((playbook) => ({
      ...playbook,
      intendedGroupSizeRange: parseJsonField(playbook.intendedGroupSizeRangeJson),
      tags: parseJsonField(playbook.tagsJson),
    }))

    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/playbooks',
      method: 'GET',
    })

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error fetching playbooks', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/playbooks',
      method: 'GET',
    })
    return handleApiError(error)
  }
}

// POST /api/playbooks - Create a new playbook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = createPlaybookSchema.parse(body)

    logger.info('Creating playbook', { key: validatedData.key })

    const playbook = await prisma.playbook.create({
      data: {
        communityId: validatedData.communityId,
        key: validatedData.key,
        title: validatedData.title,
        descriptionMarkdown: validatedData.descriptionMarkdown,
        intendedGroupSizeRangeJson: stringifyJsonField(validatedData.intendedGroupSizeRange),
        tagsJson: stringifyJsonField(validatedData.tags),
      },
    })

    metrics.recordCounter(MetricNames.PLAYBOOK_CREATED)
    metrics.recordCounter(MetricNames.API_REQUEST, 1, {
      endpoint: '/api/playbooks',
      method: 'POST',
    })

    logger.info('Playbook created successfully', { id: playbook.id, key: playbook.key })

    return NextResponse.json(
      {
        ...playbook,
        intendedGroupSizeRange: parseJsonField(playbook.intendedGroupSizeRangeJson),
        tags: parseJsonField(playbook.tagsJson),
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Error creating playbook', error)
    metrics.recordCounter(MetricNames.API_ERROR, 1, {
      endpoint: '/api/playbooks',
      method: 'POST',
    })
    return handleApiError(error)
  }
}
