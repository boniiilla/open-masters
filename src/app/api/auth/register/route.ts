import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, parseBase64Image } from '@/lib/auth'
import { createUserSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validation = createUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, alias, profilePhoto } = validation.data

    // Verificar si el email ya existe
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Verificar si el alias ya existe
    const existingAlias = await prisma.user.findUnique({
      where: { alias },
    })
    if (existingAlias) {
      return NextResponse.json(
        { success: false, error: 'El alias ya está en uso' },
        { status: 400 }
      )
    }

    // Procesar foto de perfil si existe
    let photoBuffer: Buffer | null = null
    let photoMimeType: string | null = null
    if (profilePhoto) {
      const parsed = parseBase64Image(profilePhoto)
      if (parsed) {
        photoBuffer = parsed.buffer
        photoMimeType = parsed.mimeType
      }
    }

    // Hash de la contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        alias,
        profilePhoto: photoBuffer,
        photoMimeType,
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

    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
}
