import { defineConfig } from '@adonisjs/auth'
import app from '@adonisjs/core/services/app'
import { InferAuthEvents } from '@adonisjs/auth/types'

const guard = app.env.get('AUTH_GUARD', 'api')

declare module '@adonisjs/auth/types' {
  interface Authenticators extends InferAuthEvents<typeof authConfig> {}
}

export const authConfig = defineConfig({
  default: guard,
  guards: {
    api: {
      driver: 'oat',
      tokenProvider: {
        type: 'database',
        table: 'api_tokens',
      },
      provider: {
        driver: 'lucid',
        model: () => import('#app/Models/User'),
      },
    },
  },
})

export default authConfig
