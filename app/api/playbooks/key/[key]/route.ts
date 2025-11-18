import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJsonField } from '@/lib/json-utils'
import { PlaybookExport } from '@/lib/types'

// GET /api/playbooks/key/[key] - Get a playbook by key in export format
// This endpoint is designed for integration with live-session tools
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    const playbook = await prisma.playbook.findUnique({
      where: { key },
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

    // Transform to PlaybookExport format with all nested data
    const result: PlaybookExport = {
      id: playbook.id,
      communityId: playbook.communityId,
      key: playbook.key,
      title: playbook.title,
      description: playbook.descriptionMarkdown,
      intendedGroupSize: parseJsonField(playbook.intendedGroupSizeRangeJson),
      tags: parseJsonField(playbook.tagsJson),
      phases: playbook.phases.map((phase) => ({
        id: phase.id,
        orderIndex: phase.orderIndex,
        name: phase.name,
        goal: phase.goalMarkdown,
        durationMinutes: phase.durationMinutes,
        steps: phase.steps.map((step) => ({
          id: step.id,
          orderIndex: step.orderIndex,
          instruction: step.instructionMarkdown,
          promptQuestions: step.promptQuestionsMarkdown,
          facilitatorNotes: step.facilitatorNotesMarkdown,
          durationMinutes: step.durationMinutes,
          meta: parseJsonField(step.metaJson),
        })),
      })),
      createdAt: playbook.createdAt.toISOString(),
      updatedAt: playbook.updatedAt.toISOString(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching playbook by key:', error)
    return NextResponse.json(
      { error: 'Failed to fetch playbook' },
      { status: 500 }
    )
  }
}
