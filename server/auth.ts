import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { generateKeyBetween } from 'fractional-indexing'
import { db } from './db'
import * as schema from './db/schema'
import { folders, notes } from './db/schema'
import { sendMail } from './mail'

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

const welcome = `This is your first note.

Notes are written in **markdown**. Create folders in the sidebar, and click a card to open a note.`

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 10,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: ({ user, url }) =>
      sendMail({
        to: user.email,
        subject: 'Reset your password',
        intro: 'Someone asked to reset the password for your mart.notes account.',
        action: 'Choose a new password',
        url,
        outro: "The link works for one hour. If it wasn't you, you can ignore this email.",
      }),
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: ({ user, url }) =>
      sendMail({
        to: user.email,
        subject: 'Confirm your email',
        intro: `Hi ${user.name}, confirm your email to start using mart.notes.`,
        action: 'Confirm email',
        url,
        outro: "If you didn't sign up, you can ignore this email.",
      }),
  },
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
            throw new APIError('FORBIDDEN', { message: 'Sign-ups are closed.' })
          }
        },
        after: async (user) => {
          const position = generateKeyBetween(null, null)
          const [folder] = await db
            .insert(folders)
            .values({ userId: user.id, parentId: null, name: 'Notes', position })
            .returning({ id: folders.id })
          await db.insert(notes).values({
            userId: user.id,
            folderId: folder.id,
            title: 'Welcome',
            content: welcome,
            position,
          })
        },
      },
    },
  },
})
