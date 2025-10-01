import { AuthenticatorsConfig } from '@adonisjs/auth/types'

const authConfig: AuthenticatorsConfig = {
  default: 'api',
  authenticators: {
    api: {
      driver: 'oat',
      tokenProvider: {
        driver: 'database',
        table: 'api_tokens',
      },
      provider: {
        driver: 'lucid',
        identifierKey: 'id',
        uids: ['email'],
        model: () => import('#models/user'),
      },
    },
  },
}

export default authConfig
