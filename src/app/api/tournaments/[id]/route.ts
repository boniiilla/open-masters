import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateTournamentSchema } from '@/lib/validations'
import { parseBase64Image, bufferToBase64 } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
        teams: {
          include: {
            team: {
              include: {
                player1: {
                  select: { id: true, firstName: true, lastName: true, alias: true },
                },
                player2: {
                  select: { id: true, firstName: true, lastName: true, alias: true },
                },
              },
            },
          },
        },
        tables: {
          include: {
            table: true,
          },
        },
        groups: {
          include: {
            groupTeams: true,
          },
          orderBy: { name: 'asc' },
        },
        rounds: {
          include: {
            matches: {
              include: {
                team1: {
                  include: {
                    player1: { select: { alias: true } },
                    player2: { select: { alias: true } },
                  },
                },
                team2: {
                  include: {
                    player1: { select: { alias: true } },
                    player2: { select: { alias: true } },
                  },
                },
                winner: true,
                table: true,
              },
            },
          },
          orderBy: { roundNumber: 'asc' },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'Torneo no encontrado' },
        { status: 404 }
      )
    }

    // Convertir foto a base64
    const tournamentWithPhoto = {
      ...tournament,
      photo: tournament.photo && tournament.photoMimeType
        ? bufferToBase64(tournament.photo, tournament.photoMimeType)
        : null,
      photoMimeType: undefined,
    }

    return NextResponse.json({ success: true, data: tournamentWithPhoto })
  } catch (error) {
    console.error('Error fetching tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el torneo' },
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

    const validation = updateTournamentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { photo, startDate, endDate, ...restData } = validation.data

    // Procesar foto si existe
    let photoData: { photo?: Buffer; photoMimeType?: string } = {}
    if (photo) {
      const parsed = parseBase64Image(photo)
      if (parsed) {
        photoData = {
          photo: parsed.buffer,
          photoMimeType: parsed.mimeType,
        }
      }
    }

    const tournament = await prisma.tournament.update({
      where: { id },
      data: {
        ...restData,
        ...photoData,
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: tournament })
  } catch (error) {
    console.error('Error updating tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el torneo' },
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

    await prisma.tournament.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Torneo eliminado' })
  } catch (error) {
    console.error('Error deleting tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el torneo' },
      { status: 500 }
    )
  }
}
