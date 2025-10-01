import app from '@adonisjs/core/services/app'

export const appKey = app.env.get('APP_KEY')
export const http = {
  cookie: {
    domain: '',
    path: '/',
  },
}
