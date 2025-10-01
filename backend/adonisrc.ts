import { defineConfig } from '@adonisjs/core/adonisrc'

export default defineConfig({
  providers: [
    () => import('@adonisjs/core/provider'),
    () => import('@adonisjs/bodyparser/provider'),
    () => import('@adonisjs/auth/provider'),
    () => import('@adonisjs/lucid/provider'),
  ],
  commands: [() => import('@adonisjs/lucid/commands')],
  preload: [
    {
      file: '#start/kernel',
    },
    {
      file: '#start/routes',
    },
  ],
})
