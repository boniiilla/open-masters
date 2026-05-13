import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { updateUserSchema } from '@/lib/validations';
import { bufferToBase64, parseBase64Image } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        alias: true,
        profilePhoto: true,
        photoMimeType: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const userData = {
      ...user,
      profilePhoto: user.profilePhoto && user.photoMimeType
        ? bufferToBase64(user.profilePhoto, user.photoMimeType)
        : null,
      photoMimeType: undefined,
    };

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { firstName, lastName, alias, profilePhoto } = validation.data;

    // Check if alias is already taken by another user
    if (alias) {
      const existingUser = await prisma.user.findFirst({
        where: {
          alias,
          email: { not: session.user.email },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'El alias ya está en uso' },
          { status: 400 }
        );
      }
    }

    let photoData: { profilePhoto?: Buffer; photoMimeType?: string } = {};
    if (profilePhoto) {
      const parsed = parseBase64Image(profilePhoto);
      if (parsed) {
        photoData = { profilePhoto: parsed.buffer, photoMimeType: parsed.mimeType };
      }
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (alias !== undefined) updateData.alias = alias;
    Object.assign(updateData, photoData);

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        alias: true,
        profilePhoto: true,
        photoMimeType: true,
        createdAt: true,
      },
    });

    const userData = {
      ...updatedUser,
      profilePhoto: updatedUser.profilePhoto && updatedUser.photoMimeType
        ? bufferToBase64(updatedUser.profilePhoto, updatedUser.photoMimeType)
        : null,
      photoMimeType: undefined,
    };

    return NextResponse.json({
      success: true,
      data: userData,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}
