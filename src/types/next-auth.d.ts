import 'next-auth'

export type UserRole = 'PLAYER' | 'ADMIN' | 'SUPERADMIN'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      alias: string
      firstName: string
      lastName: string
      role: UserRole
    }
  }

  interface User {
    id: string
    email: string
    name: string
    alias: string
    firstName: string
    lastName: string
    role: UserRole
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    alias: string
    firstName: string
    lastName: string
    role: UserRole
  }
}
