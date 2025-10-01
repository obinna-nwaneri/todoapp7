import app from '@adonisjs/core/services/app'
import env from '@adonisjs/core/services/env'

declare module '@adonisjs/core/types' {
  interface AppConfig {
    appKey: string
    http: {
      allowMethodSpoofing: boolean
      generateRequestId: boolean
      jsonpCallbackName: string
      allowJsonp: boolean
      cookie: {
        domain: string
        path: string
        maxAge: string | number | undefined
        httpOnly: boolean
        secure: boolean
        sameSite: boolean | 'lax' | 'strict' | 'none'
      }
    }
    logger: {
      name: string
      level: string
      enabled: boolean
    }
  }
}

const appConfig = {
  appKey: env.get('APP_KEY'),
  http: {
    allowMethodSpoofing: false,
    generateRequestId: true,
    jsonpCallbackName: 'callback',
    allowJsonp: false,
    cookie: {
      domain: '',
      path: '/',
      maxAge: '1h',
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
    },
  },
  logger: {
    name: app.appName,
    level: env.get('LOG_LEVEL', 'info'),
    enabled: true,
  },
}

export default appConfig
