import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        player1: {
          select: { id: true, firstName: true, lastName: true, alias: true, email: true },
        },
        player2: {
          select: { id: true, firstName: true, lastName: true, alias: true, email: true },
        },
        tournamentTeams: {
          include: {
            tournament: {
              select: { id: true, name: true, status: true, hasGroupStage: true, knockoutFormat: true, modality: true },
            },
          },
        },
        matchesAsTeam1: {
          include: {
            team2: true,
            round: { include: { tournament: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        matchesAsTeam2: {
          include: {
            team1: true,
            round: { include: { tournament: { select: { name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        matchesWon: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Equipo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: team })
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el equipo' },
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
    const { name } = body

    const team = await prisma.team.update({
      where: { id },
      data: { name },
      include: {
        player1: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
        player2: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: team })
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el equipo' },
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

    // Verificar si el equipo está en algún torneo activo
    const activeInTournament = await prisma.tournamentTeam.findFirst({
      where: {
        teamId: id,
        tournament: {
          status: { in: ['OPEN', 'IN_PROGRESS'] },
        },
      },
    })

    if (activeInTournament) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar un equipo inscrito en un torneo activo' },
        { status: 400 }
      )
    }

    await prisma.team.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Equipo eliminado' })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el equipo' },
      { status: 500 }
    )
  }
}
