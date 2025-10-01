import { IgnitorFactory } from '@adonisjs/core/factories'
import { fileURLToPath } from 'node:url'

const ignitor = IgnitorFactory.create(fileURLToPath(new URL('..', import.meta.url)))
await ignitor.httpServer().start()
