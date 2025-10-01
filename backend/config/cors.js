'use strict'

module.exports = {
  origin: '*',
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE'],
  headers: true,
  exposeHeaders: false,
  credentials: false,
  maxAge: 90
}
