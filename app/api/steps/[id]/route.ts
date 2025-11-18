import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseJsonField, stringifyJsonField } from '@/lib/json-utils'
import { UpdateStepInput } from '@/lib/types'

// GET /api/steps/[id] - Get a single step
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const step = await prisma.playbookStep.findUnique({
      where: { id },
    })

    if (!step) {
      return NextResponse.json(
        { error: 'Step not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ...step,
      meta: parseJsonField(step.metaJson),
    })
  } catch (error) {
    console.error('Error fetching step:', error)
    return NextResponse.json(
      { error: 'Failed to fetch step' },
      { status: 500 }
    )
  }
}

// PUT /api/steps/[id] - Update a step
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdateStepInput = await request.json()

    const step = await prisma.playbookStep.update({
      where: { id },
      data: {
        ...(body.orderIndex !== undefined && { orderIndex: body.orderIndex }),
        ...(body.instructionMarkdown !== undefined && {
          instructionMarkdown: body.instructionMarkdown,
        }),
        ...(body.promptQuestionsMarkdown !== undefined && {
          promptQuestionsMarkdown: body.promptQuestionsMarkdown,
        }),
        ...(body.facilitatorNotesMarkdown !== undefined && {
          facilitatorNotesMarkdown: body.facilitatorNotesMarkdown,
        }),
        ...(body.durationMinutes !== undefined && {
          durationMinutes: body.durationMinutes,
        }),
        ...(body.meta !== undefined && {
          metaJson: stringifyJsonField(body.meta),
        }),
      },
    })

    return NextResponse.json({
      ...step,
      meta: parseJsonField(step.metaJson),
    })
  } catch (error) {
    console.error('Error updating step:', error)
    return NextResponse.json(
      { error: 'Failed to update step' },
      { status: 500 }
    )
  }
}

// DELETE /api/steps/[id] - Delete a step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.playbookStep.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting step:', error)
    return NextResponse.json(
      { error: 'Failed to delete step' },
      { status: 500 }
    )
  }
}
