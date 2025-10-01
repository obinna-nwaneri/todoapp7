'use strict'

const User = use('App/Models/User')
const { validate } = use('Validator')

class AuthController {
  async register ({ request, auth, response }) {
    const data = request.only(['email', 'password'])

    const validation = await validate(data, {
      email: 'required|email|unique:users,email',
      password: 'required|min:6'
    })

    if (validation.fails()) {
      return response.status(422).json({ errors: validation.messages() })
    }

    const user = await User.create({ ...data, role: 'user' })
    const token = await auth.generate(user)

    return response.status(201).json({
      message: 'Registration successful.',
      user,
      token
    })
  }

  async login ({ request, auth, response }) {
    const { email, password } = request.only(['email', 'password'])

    try {
      const token = await auth.attempt(email, password)
      const user = await User.findBy('email', email)
      return {
        message: 'Login successful.',
        token,
        user
      }
    } catch (error) {
      return response.status(401).json({
        message: 'Invalid email or password.'
      })
    }
  }
}

module.exports = AuthController
