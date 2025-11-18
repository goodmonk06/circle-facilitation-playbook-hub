import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { UpdatePhaseInput } from '@/lib/types'

// GET /api/phases/[id] - Get a single phase with steps
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const phase = await prisma.playbookPhase.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    })

    if (!phase) {
      return NextResponse.json(
        { error: 'Phase not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(phase)
  } catch (error) {
    console.error('Error fetching phase:', error)
    return NextResponse.json(
      { error: 'Failed to fetch phase' },
      { status: 500 }
    )
  }
}

// PUT /api/phases/[id] - Update a phase
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: UpdatePhaseInput = await request.json()

    const phase = await prisma.playbookPhase.update({
      where: { id },
      data: {
        ...(body.orderIndex !== undefined && { orderIndex: body.orderIndex }),
        ...(body.name && { name: body.name }),
        ...(body.goalMarkdown !== undefined && { goalMarkdown: body.goalMarkdown }),
        ...(body.durationMinutes !== undefined && { durationMinutes: body.durationMinutes }),
      },
    })

    return NextResponse.json(phase)
  } catch (error) {
    console.error('Error updating phase:', error)
    return NextResponse.json(
      { error: 'Failed to update phase' },
      { status: 500 }
    )
  }
}

// DELETE /api/phases/[id] - Delete a phase (cascades to steps)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.playbookPhase.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting phase:', error)
    return NextResponse.json(
      { error: 'Failed to delete phase' },
      { status: 500 }
    )
  }
}
