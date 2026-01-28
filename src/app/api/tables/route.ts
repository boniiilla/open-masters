import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createTableSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const available = searchParams.get('available')

    const tables = await prisma.table.findMany({
      where: available === 'true' ? { isAvailable: true } : undefined,
      include: {
        _count: {
          select: { matches: true, tournamentTables: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: tables })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener las mesas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = createTableSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, location } = validation.data

    const table = await prisma.table.create({
      data: {
        name,
        location,
      },
    })

    return NextResponse.json({ success: true, data: table }, { status: 201 })
  } catch (error) {
    console.error('Error creating table:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear la mesa' },
      { status: 500 }
    )
  }
}
