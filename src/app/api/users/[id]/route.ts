import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bufferToBase64, parseBase64Image } from '@/lib/auth'
import { updateUserSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        alias: true,
        profilePhoto: true,
        photoMimeType: true,
        createdAt: true,
        teamsAsPlayer1: {
          include: {
            player2: {
              select: { id: true, firstName: true, lastName: true, alias: true },
            },
          },
        },
        teamsAsPlayer2: {
          include: {
            player1: {
              select: { id: true, firstName: true, lastName: true, alias: true },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const userWithPhoto = {
      ...user,
      profilePhoto: user.profilePhoto && user.photoMimeType
        ? bufferToBase64(user.profilePhoto, user.photoMimeType)
        : null,
      photoMimeType: undefined,
    }

    return NextResponse.json({ success: true, data: userWithPhoto })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener el usuario' },
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

    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { firstName, lastName, alias, profilePhoto } = validation.data

    // Verificar si el alias ya existe (si se está actualizando)
    if (alias) {
      const existingAlias = await prisma.user.findFirst({
        where: { alias, NOT: { id } },
      })
      if (existingAlias) {
        return NextResponse.json(
          { success: false, error: 'El alias ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Procesar foto de perfil si existe
    let photoData: { profilePhoto?: Buffer; photoMimeType?: string } = {}
    if (profilePhoto) {
      const parsed = parseBase64Image(profilePhoto)
      if (parsed) {
        photoData = {
          profilePhoto: parsed.buffer,
          photoMimeType: parsed.mimeType,
        }
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(alias && { alias }),
        ...photoData,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        alias: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el usuario' },
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

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Usuario eliminado' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el usuario' },
      { status: 500 }
    )
  }
}
