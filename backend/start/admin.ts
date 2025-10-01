import { createServer } from 'http'
import { Application } from '@adonisjs/core/app'
import AdminJS from 'adminjs'
import AdminJSAdonis from '@adminjs/adonis'
import AdminJSExpress from '@adminjs/express'
import User from '#app/Models/User'
import Todo from '#app/Models/Todo'

AdminJS.registerAdapter(AdminJSAdonis)

export async function bootAdmin(app: Application) {
  const admin = new AdminJS({
    rootPath: '/admin',
    branding: {
      companyName: 'Enterprise Todo Admin',
    },
    resources: [User, Todo],
  })

  const handler = AdminJSExpress.buildRouter(admin)
  const server = createServer(handler)

  await new Promise<void>((resolve) => server.listen({ port: 3334 }, resolve))

  app.logger.info('AdminJS started at http://localhost:3334/admin')
}
