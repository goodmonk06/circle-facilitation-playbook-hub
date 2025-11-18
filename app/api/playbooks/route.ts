import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJsonField, stringifyJsonField } from '@/lib/json-utils'
import { CreatePlaybookInput } from '@/lib/types'

// GET /api/playbooks - List all playbooks with optional filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tag = searchParams.get('tag')
    const communityId = searchParams.get('communityId')

    const playbooks = await prisma.playbook.findMany({
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

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching playbooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playbooks' },
      { status: 500 }
    )
  }
}

// POST /api/playbooks - Create a new playbook
export async function POST(request: NextRequest) {
  try {
    const body: CreatePlaybookInput = await request.json()

    const playbook = await prisma.playbook.create({
      data: {
        communityId: body.communityId,
        key: body.key,
        title: body.title,
        descriptionMarkdown: body.descriptionMarkdown,
        intendedGroupSizeRangeJson: stringifyJsonField(body.intendedGroupSizeRange),
        tagsJson: stringifyJsonField(body.tags),
      },
    })

    return NextResponse.json(
      {
        ...playbook,
        intendedGroupSizeRange: parseJsonField(playbook.intendedGroupSizeRangeJson),
        tags: parseJsonField(playbook.tagsJson),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating playbook:', error)
    return NextResponse.json(
      { error: 'Failed to create playbook' },
      { status: 500 }
    )
  }
}
