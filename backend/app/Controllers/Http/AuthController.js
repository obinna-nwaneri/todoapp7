'use strict'

const { validate } = use('Validator')
const User = use('App/Models/User')

class AuthController {
  async register ({ request, auth, response }) {
    const rules = {
      full_name: 'required',
      email: 'required|email|unique:users,email',
      password: 'required|min:6'
    }

    const validation = await validate(request.all(), rules)

    if (validation.fails()) {
      return response.status(422).send({ errors: validation.messages() })
    }

    const data = request.only(['full_name', 'email', 'password'])
    const user = await User.create({ ...data, role: 'user', is_active: true })
    const token = await auth.generate(user)

    return {
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    }
  }

  async login ({ request, auth, response }) {
    const rules = {
      email: 'required|email',
      password: 'required'
    }

    const validation = await validate(request.all(), rules)

    if (validation.fails()) {
      return response.status(422).send({ errors: validation.messages() })
    }

    const { email, password } = request.only(['email', 'password'])
    const user = await User.query().where('email', email).first()

    if (!user) {
      return response.status(400).send({ message: 'Invalid credentials' })
    }

    if (!user.is_active) {
      return response.status(403).send({ message: 'Account disabled. Please contact an administrator.' })
    }

    const token = await auth.attempt(email, password)

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    }
  }

  async me ({ auth }) {
    const user = await auth.getUser()
    return user
  }

  async logout () {
    return { message: 'Logout successful. Please discard the token on the client.' }
  }
}

module.exports = AuthController
