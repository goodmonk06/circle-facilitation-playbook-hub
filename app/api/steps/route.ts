import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stringifyJsonField } from '@/lib/json-utils'
import { CreateStepInput } from '@/lib/types'

// POST /api/steps - Create a new step
export async function POST(request: NextRequest) {
  try {
    const body: CreateStepInput = await request.json()

    const step = await prisma.playbookStep.create({
      data: {
        phaseId: body.phaseId,
        orderIndex: body.orderIndex,
        instructionMarkdown: body.instructionMarkdown,
        promptQuestionsMarkdown: body.promptQuestionsMarkdown,
        facilitatorNotesMarkdown: body.facilitatorNotesMarkdown,
        durationMinutes: body.durationMinutes,
        metaJson: stringifyJsonField(body.meta),
      },
    })

    return NextResponse.json(step, { status: 201 })
  } catch (error) {
    console.error('Error creating step:', error)
    return NextResponse.json(
      { error: 'Failed to create step' },
      { status: 500 }
    )
  }
}
