import 'reflect-metadata'
import { Ignitor } from '@adonisjs/core/ignitor'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const appRoot = dirname(fileURLToPath(import.meta.url))

new Ignitor(appRoot).ace().handle(process.argv.slice(2))
