import NextAuth, { type NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import { z } from 'zod'

const MONGODB_URI = process.env.MONGODB_URI

const globalForMongo = global as unknown as { __mongoClient?: Promise<MongoClient> }
const clientPromise: Promise<MongoClient> =
  globalForMongo.__mongoClient ??
  (MONGODB_URI ? new MongoClient(MONGODB_URI).connect() : Promise.reject(new Error('MONGODB_URI missing')))
if (MONGODB_URI) globalForMongo.__mongoClient = clientPromise

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const authConfig: NextAuthConfig = {
  adapter: MongoDBAdapter(clientPromise),
  session: { strategy: 'jwt' },
  pages: { signIn: '/account/sign-in' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        const parsed = credentialsSchema.safeParse(creds)
        if (!parsed.success) return null
        // Actual verify wired in Phase 4 — placeholder until User model lands.
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token?.sub && session.user) session.user.id = token.sub
      if (token?.role && session.user) (session.user as { role?: string }).role = token.role as string
      return session
    },
    async jwt({ token, user }) {
      if (user && 'role' in user) token.role = (user as { role?: string }).role
      return token
    },
  },
  trustHost: true,
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: 'customer' | 'admin'
    }
  }
}
