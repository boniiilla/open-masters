import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params
    const body = await request.json()
    const { teamId, seedNumber } = body

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'El ID del equipo es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el torneo existe y está en estado válido
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    if (tournament.status !== 'DRAFT' && tournament.status !== 'OPEN') {
      return NextResponse.json(
        { success: false, error: 'No se pueden añadir equipos a un torneo en curso o finalizado' },
        { status: 400 }
      )
    }

    // Verificar si el equipo ya está inscrito
    const existingTeam = await prisma.tournamentTeam.findUnique({
      where: {
        tournamentId_teamId: { tournamentId, teamId },
      },
    })

    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: 'El equipo ya está inscrito en este torneo' },
        { status: 400 }
      )
    }

    // Verificar límite de equipos
    if (tournament.maxTeams) {
      const currentTeams = await prisma.tournamentTeam.count({
        where: { tournamentId },
      })
      if (currentTeams >= tournament.maxTeams) {
        return NextResponse.json(
          { success: false, error: 'El torneo ha alcanzado el máximo de equipos' },
          { status: 400 }
        )
      }
    }

    const tournamentTeam = await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId,
        seedNumber,
      },
      include: {
        team: {
          include: {
            player1: { select: { id: true, firstName: true, lastName: true, alias: true } },
            player2: { select: { id: true, firstName: true, lastName: true, alias: true } },
          },
        },
      },
    })

    return NextResponse.json({ success: true, data: tournamentTeam }, { status: 201 })
  } catch (error) {
    console.error('Error adding team to tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al añadir el equipo al torneo' },
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
    const teamId = searchParams.get('teamId')

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: 'El ID del equipo es requerido' },
        { status: 400 }
      )
    }

    await prisma.tournamentTeam.delete({
      where: {
        tournamentId_teamId: { tournamentId, teamId },
      },
    })

    return NextResponse.json({ success: true, message: 'Equipo eliminado del torneo' })
  } catch (error) {
    console.error('Error removing team from tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el equipo del torneo' },
      { status: 500 }
    )
  }
}
