import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJsonField, stringifyJsonField } from '@/lib/json-utils'
import { UpdatePlaybookInput } from '@/lib/types'

// GET /api/playbooks/[id] - Get a single playbook with all nested data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const playbook = await prisma.playbook.findUnique({
      where: { id },
      include: {
        phases: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            steps: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    })

    if (!playbook) {
      return NextResponse.json(
        { error: 'Playbook not found' },
        { status: 404 }
      )
    }

    // Transform to include parsed JSON fields
    const result = {
      ...playbook,
      intendedGroupSizeRange: parseJsonField(playbook.intendedGroupSizeRangeJson),
      tags: parseJsonField(playbook.tagsJson),
      phases: playbook.phases.map((phase) => ({
        ...phase,
        steps: phase.steps.map((step) => ({
          ...step,
          meta: parseJsonField(step.metaJson),
        })),
      })),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching playbook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playbook' },
      { status: 500 }
    )
  }
}

// PUT /api/playbooks/[id] - Update a playbook
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdatePlaybookInput = await request.json()

    const playbook = await prisma.playbook.update({
      where: { id },
      data: {
        ...(body.key && { key: body.key }),
        ...(body.title && { title: body.title }),
        ...(body.descriptionMarkdown !== undefined && {
          descriptionMarkdown: body.descriptionMarkdown,
        }),
        ...(body.intendedGroupSizeRange !== undefined && {
          intendedGroupSizeRangeJson: stringifyJsonField(body.intendedGroupSizeRange),
        }),
        ...(body.tags !== undefined && {
          tagsJson: stringifyJsonField(body.tags),
        }),
      },
    })

    return NextResponse.json({
      ...playbook,
      intendedGroupSizeRange: parseJsonField(playbook.intendedGroupSizeRangeJson),
      tags: parseJsonField(playbook.tagsJson),
    })
  } catch (error) {
    console.error('Error updating playbook:', error)
    return NextResponse.json(
      { error: 'Failed to update playbook' },
      { status: 500 }
    )
  }
}

// DELETE /api/playbooks/[id] - Delete a playbook (cascades to phases and steps)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.playbook.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting playbook:', error)
    return NextResponse.json(
      { error: 'Failed to delete playbook' },
      { status: 500 }
    )
  }
}
