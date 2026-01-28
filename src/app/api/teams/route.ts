import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTeamSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const teams = await prisma.team.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { player1: { alias: { contains: search, mode: 'insensitive' } } },
              { player2: { alias: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : undefined,
      include: {
        player1: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
        player2: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
        _count: {
          select: { tournamentTeams: true, matchesWon: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: teams })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener equipos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = createTeamSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, player1Id, player2Id } = validation.data

    // Verificar que ambos jugadores existen
    const player1 = await prisma.user.findUnique({ where: { id: player1Id } })
    const player2 = await prisma.user.findUnique({ where: { id: player2Id } })

    if (!player1 || !player2) {
      return NextResponse.json(
        { success: false, error: 'Uno o ambos jugadores no existen' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un equipo con estos jugadores
    const existingTeam = await prisma.team.findFirst({
      where: {
        OR: [
          { player1Id, player2Id },
          { player1Id: player2Id, player2Id: player1Id },
        ],
      },
    })

    if (existingTeam) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un equipo con estos jugadores' },
        { status: 400 }
      )
    }

    const team = await prisma.team.create({
      data: {
        name: name || `${player1.alias} & ${player2.alias}`,
        player1Id,
        player2Id,
      },
      include: {
        player1: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
        player2: {
          select: { id: true, firstName: true, lastName: true, alias: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: team }, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el equipo' },
      { status: 500 }
    )
  }
}
