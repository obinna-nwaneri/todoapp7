import hash from '@adonisjs/core/services/hash'
import type { CurrentAdmin } from 'adminjs'
import { DefaultAuthProvider, DefaultAuthenticatePayload } from 'adminjs'

import User from '#models/user'

import componentLoader from './component_loader.js'

const authenticate = async ({ email, password }: DefaultAuthenticatePayload): Promise<CurrentAdmin | null> => {
  const adminUser = await User.query().where('email', email).where('is_admin', true).first()
  if (!adminUser) {
    return null
  }

  const passwordOk = await hash.verify(adminUser.password, password)
  if (!passwordOk) {
    return null
  }

  return {
    id: String(adminUser.id),
    email: adminUser.email,
    title: adminUser.fullName ?? adminUser.email,
    isAdmin: true,
  }
}

const authProvider = new DefaultAuthProvider({
  componentLoader,
  authenticate,
})

export default authProvider
