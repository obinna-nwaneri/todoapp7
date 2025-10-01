import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { status: 'Doctor appointment API running' }
})

Route.group(() => {
  Route.post('auth/register/patient', 'AuthController.registerPatient')
  Route.post('auth/register/doctor', 'AuthController.registerDoctor')
  Route.post('auth/login', 'AuthController.login')
  Route.post('auth/logout', 'AuthController.logout')
  Route.get('auth/me', 'AuthController.me')

  Route.get('doctors', 'DoctorsController.index')
  Route.get('doctors/:id', 'DoctorsController.show')
  Route.put('doctors/:id', 'DoctorsController.updateProfile')
  Route.put('doctors/:id/availability', 'DoctorsController.syncAvailability')
  Route.get('doctors/:id/appointments', 'DoctorsController.appointments')

  Route.get('patients/:id/appointments', 'PatientsController.appointments')
  Route.get('patients/:id/history', 'PatientsController.history')
  Route.get('patients/:id/records', 'PatientsController.records')

  Route.get('appointments', 'AppointmentsController.index')
  Route.post('appointments', 'AppointmentsController.store')
  Route.put('appointments/:id/status', 'AppointmentsController.updateStatus')
  Route.put('appointments/:id/reschedule', 'AppointmentsController.reschedule')
  Route.delete('appointments/:id', 'AppointmentsController.destroy')

  Route.get('medical-records', 'MedicalRecordsController.index')
  Route.post('medical-records', 'MedicalRecordsController.store')

  Route.get('notifications', 'NotificationsController.index')
  Route.post('notifications', 'NotificationsController.store')
  Route.put('notifications/:id', 'NotificationsController.update')

  Route.get('admin/dashboard', 'AdminController.dashboard')
  Route.get('admin/users', 'AdminController.users')
  Route.put('admin/users/:id', 'AdminController.updateUserStatus')
  Route.get('admin/reports', 'AdminController.reports')
}).prefix('api')
