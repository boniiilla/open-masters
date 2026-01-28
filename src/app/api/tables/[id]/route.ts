import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTableSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const table = await prisma.table.findUnique({
      where: { id },
      include: {
        matches: {
          include: {
            team1: true,
            team2: true,
            round: {
              include: {
                tournament: { select: { name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        tournamentTables: {
          include: {
            tournament: {
              select: { id: true, name: true, status: true },
            },
          },
        },
      },
    })

    if (!table) {
      return NextResponse.json(
        { success: false, error: 'Mesa no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    console.error('Error fetching table:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener la mesa' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const validation = updateTableSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const table = await prisma.table.update({
      where: { id },
      data: {
        ...validation.data,
        ...(body.isAvailable !== undefined && { isAvailable: body.isAvailable }),
      },
    })

    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    console.error('Error updating table:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar la mesa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar si la mesa está en uso en algún partido en curso
    const activeMatch = await prisma.match.findFirst({
      where: {
        tableId: id,
        status: 'IN_PROGRESS',
      },
    })

    if (activeMatch) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar una mesa con un partido en curso' },
        { status: 400 }
      )
    }

    await prisma.table.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Mesa eliminada' })
  } catch (error) {
    console.error('Error deleting table:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la mesa' },
      { status: 500 }
    )
  }
}
