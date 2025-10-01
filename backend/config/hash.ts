import { defineConfig } from '@adonisjs/core/hash'

export default defineConfig({
  default: 'bcrypt',
  list: {
    bcrypt: {
      driver: 'bcrypt',
      rounds: 10,
    },
  },
})
