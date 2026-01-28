import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const body = await request.json()
    const { tableId } = body

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'El ID de la mesa es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el torneo existe
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si la mesa ya está asignada
    const existingTable = await prisma.tournamentTable.findUnique({
      where: {
        tournamentId_tableId: { tournamentId, tableId },
      },
    })

    if (existingTable) {
      return NextResponse.json(
        { success: false, error: 'La mesa ya está asignada a este torneo' },
        { status: 400 }
      )
    }

    const tournamentTable = await prisma.tournamentTable.create({
      data: {
        tournamentId,
        tableId,
      },
      include: {
        table: true,
      },
    })

    return NextResponse.json({ success: true, data: tournamentTable }, { status: 201 })
  } catch (error) {
    console.error('Error adding table to tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al añadir la mesa al torneo' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const { searchParams } = new URL(request.url)
    const tableId = searchParams.get('tableId')

    if (!tableId) {
      return NextResponse.json(
        { success: false, error: 'El ID de la mesa es requerido' },
        { status: 400 }
      )
    }

    await prisma.tournamentTable.delete({
      where: {
        tournamentId_tableId: { tournamentId, tableId },
      },
    })

    return NextResponse.json({ success: true, message: 'Mesa eliminada del torneo' })
  } catch (error) {
    console.error('Error removing table from tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar la mesa del torneo' },
      { status: 500 }
    )
  }
}
