import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-options'
import { createTournamentSchema } from '@/lib/validations'
import { parseBase64Image, bufferToBase64 } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const modality = searchParams.get('modality')
    const hasGroupStage = searchParams.get('hasGroupStage')

    const tournaments = await prisma.tournament.findMany({
      where: {
        ...(status && { status: status as never }),
        ...(modality && { modality: modality as never }),
        ...(hasGroupStage !== null && { hasGroupStage: hasGroupStage === 'true' }),
      },
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
        _count: {
          select: { teams: true, rounds: true, groups: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Convertir fotos a base64
    const tournamentsWithPhotos = tournaments.map(tournament => ({
      ...tournament,
      photo: tournament.photo && tournament.photoMimeType
        ? bufferToBase64(tournament.photo, tournament.photoMimeType)
        : null,
      photoMimeType: undefined,
    }))

    return NextResponse.json({ success: true, data: tournamentsWithPhotos })
  } catch (error) {
    console.error('Error fetching tournaments:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener torneos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar sesión
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Debes iniciar sesión para crear un torneo' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const validation = createTournamentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const {
      name,
      description,
      modality,
      hasGroupStage,
      knockoutFormat,
      teamsPerGroup,
      teamsAdvancing,
      maxTeams,
      locationName,
      locationAddress,
      latitude,
      longitude,
      photo,
      startDate,
      endDate,
    } = validation.data

    // Procesar foto si existe
    let photoBuffer: Buffer | null = null
    let photoMimeType: string | null = null
    if (photo) {
      const parsed = parseBase64Image(photo)
      if (parsed) {
        photoBuffer = parsed.buffer
        photoMimeType = parsed.mimeType
      }
    }

    const tournament = await prisma.tournament.create({
      data: {
        name,
        description,
        modality,
        hasGroupStage,
        knockoutFormat,
        teamsPerGroup,
        teamsAdvancing,
        maxTeams,
        locationName,
        locationAddress,
        latitude,
        longitude,
        photo: photoBuffer,
        photoMimeType,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        creatorId: session.user.id,
      },
      include: {
        creator: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: tournament }, { status: 201 })
  } catch (error) {
    console.error('Error creating tournament:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el torneo' },
      { status: 500 }
    )
  }
}
