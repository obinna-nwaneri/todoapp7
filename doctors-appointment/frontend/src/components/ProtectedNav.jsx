import { Fragment } from 'react'
import { Link } from 'react-router-dom'

const linksByRole = {
  PATIENT: [
    { to: '/', label: 'Dashboard' },
    { to: '/me/appointments', label: 'My Appointments' },
  ],
  DOCTOR: [
    { to: '/', label: 'Dashboard' },
    { to: '/doctor/schedule', label: 'My Schedule' },
  ],
  ADMIN: [
    { to: '/', label: 'Dashboard' },
    { to: '/admin', label: 'Admin Panel' },
  ],
}

const sharedLinks = [
  { to: '/doctors', label: 'Find Doctors' },
]

export default function ProtectedNav({ role }) {
  const roleLinks = role ? linksByRole[role] ?? [] : []
  return (
    <Fragment>
      {sharedLinks.map((link) => (
        <Link key={link.to} to={link.to}>
          {link.label}
        </Link>
      ))}
      {roleLinks.map((link) => (
        <Link key={link.to} to={link.to}>
          {link.label}
        </Link>
      ))}
    </Fragment>
  )
}
