import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bufferToBase64 } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { alias: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        alias: true,
        role: true,
        profilePhoto: true,
        photoMimeType: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Convertir fotos a base64 para enviar al cliente
    const usersWithPhotos = users.map(user => ({
      ...user,
      profilePhoto: user.profilePhoto && user.photoMimeType
        ? bufferToBase64(user.profilePhoto, user.photoMimeType)
        : null,
      photoMimeType: undefined,
    }))

    return NextResponse.json({ success: true, data: usersWithPhotos })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios' },
      { status: 500 }
    )
  }
}
