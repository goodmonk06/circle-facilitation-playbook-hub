import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreatePhaseInput } from '@/lib/types'

// POST /api/phases - Create a new phase
export async function POST(request: NextRequest) {
  try {
    const body: CreatePhaseInput = await request.json()

    const phase = await prisma.playbookPhase.create({
      data: {
        playbookId: body.playbookId,
        orderIndex: body.orderIndex,
        name: body.name,
        goalMarkdown: body.goalMarkdown,
        durationMinutes: body.durationMinutes,
      },
      include: {
        steps: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    return NextResponse.json(phase, { status: 201 })
  } catch (error) {
    console.error('Error creating phase:', error)
    return NextResponse.json(
      { error: 'Failed to create phase' },
      { status: 500 }
    )
  }
}
