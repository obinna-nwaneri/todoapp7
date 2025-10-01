import { IgnitorFactory } from '@adonisjs/core/factories'
import { fileURLToPath } from 'node:url'
import express from 'express'
import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import User from '../app/Models/User.js'
import Todo from '../app/Models/Todo.js'

const BASE_URL = new URL('..', import.meta.url)
const ignitor = IgnitorFactory.create(fileURLToPath(BASE_URL))
const httpServer = await ignitor.httpServer()
const app = httpServer.getInstance()

const admin = new AdminJS({
  resources: [
    { resource: User, options: { navigation: 'Directory' } },
    { resource: Todo, options: { navigation: 'Operations' } },
  ],
  rootPath: '/admin',
})

const adminRouter = AdminJSExpress.buildRouter(admin)
app.use(admin.options.rootPath, adminRouter)

app.use('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' })
})
