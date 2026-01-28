import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function parseBase64Image(base64String: string): { buffer: Buffer; mimeType: string } | null {
  const matches = base64String.match(/^data:(.+);base64,(.+)$/)
  if (!matches) return null

  const mimeType = matches[1]
  const data = matches[2]
  const buffer = Buffer.from(data, 'base64')

  return { buffer, mimeType }
}

export function bufferToBase64(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`
}
