import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { generateKeyBetween } from 'fractional-indexing'
import { db } from './db'
import * as schema from './db/schema'
import { folders, notes } from './db/schema'

const allowedEmails = (process.env.ALLOWED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean)

const github =
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
    ? {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }
    : undefined

const welcome = `Dette er det første notatet ditt.

Notater skrives i **markdown**. Lag mapper i sidepanelet, og trykk på et kort for å åpne notatet.`

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 10 },
  socialProviders: github,
  account: {
    accountLinking: { trustedProviders: ['github'] },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 60,
    updateAge: 60 * 60 * 24,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (allowedEmails.length && !allowedEmails.includes(user.email.toLowerCase())) {
            throw new APIError('FORBIDDEN', { message: 'Registreringen er stengt.' })
          }
        },
        after: async (user) => {
          const position = generateKeyBetween(null, null)
          const [folder] = await db
            .insert(folders)
            .values({ userId: user.id, parentId: null, name: 'Notater', position })
            .returning({ id: folders.id })
          await db.insert(notes).values({
            userId: user.id,
            folderId: folder.id,
            title: 'Velkommen',
            content: welcome,
            position,
          })
        },
      },
    },
  },
})
