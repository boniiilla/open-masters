import 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      alias: string
      firstName: string
      lastName: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    alias: string
    firstName: string
    lastName: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    alias: string
    firstName: string
    lastName: string
  }
}
