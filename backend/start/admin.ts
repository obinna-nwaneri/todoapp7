import AdminJS from 'adminjs'
import * as AdminJSSQL from '@adminjs/sql'
import { buildAuthenticatedRouter } from '@adminjs/express'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Request, RequestHandler, Response } from 'express'
import env from '#start/env'
import User from '#models/user'

const connectionOptions = {
  host: env.get('PG_HOST'),
  port: env.get('PG_PORT'),
  user: env.get('PG_USER'),
  password: env.get('PG_PASSWORD'),
  database: env.get('PG_DB_NAME'),
}

export const adminRootPath = '/admin'

AdminJS.registerAdapter({
  Database: AdminJSSQL.Database,
  Resource: AdminJSSQL.Resource,
})

let adminHandler: RequestHandler | null = null

async function createAdminHandler() {
  const adapter = new AdminJSSQL.default('postgresql', connectionOptions)
  const metadata = await adapter.init()

  const userResource = new AdminJSSQL.Resource(metadata.table('users'))
  const todoResource = new AdminJSSQL.Resource(metadata.table('todos'))

  const admin = new AdminJS({
    rootPath: adminRootPath,
    branding: {
      companyName: 'Enterprise Todo Admin',
      logo: undefined,
    },
    resources: [
      {
        resource: userResource,
        options: {
          navigation: 'Management',
          properties: {
            password: {
              isVisible: { list: false, edit: false, show: false, filter: false },
            },
            role: {
              availableValues: [
                { value: 'admin', label: 'Admin' },
                { value: 'user', label: 'User' },
              ],
            },
          },
          actions: {
            new: { isAccessible: false },
            delete: { isAccessible: false },
          },
        },
      },
      {
        resource: todoResource,
        options: {
          navigation: 'Management',
          properties: {
            description: { type: 'textarea' },
            due_date: { type: 'date' },
          },
        },
      },
    ],
  })

  const adminRouter = buildAuthenticatedRouter(
    admin,
    {
      authenticate: async (email, password) => {
        try {
          const user = await User.verifyCredentials(email, password)
          if (!user.isAdmin()) {
            return null
          }

          return { email: user.email, id: user.id, role: user.role }
        } catch {
          return null
        }
      },
      cookieName: 'adminjs',
      cookiePassword: env.get('ADMIN_COOKIE_SECRET'),
    },
    undefined,
    {
      secret: env.get('ADMIN_COOKIE_SECRET'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: 'lax',
        httpOnly: true,
      },
    }
  )

  return adminRouter
}

async function ensureAdminHandler() {
  if (!adminHandler) {
    adminHandler = await createAdminHandler()
  }

  return adminHandler
}

export async function handleAdminRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  const handler = await ensureAdminHandler()
  const expressReq = req as unknown as Request
  const expressRes = res as unknown as Response

  await new Promise<void>((resolve, reject) => {
    handler(expressReq, expressRes, (error?: unknown) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })

  return expressRes.writableEnded || expressRes.headersSent
}
