import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../hooks/useAuth'

const LandingPage = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="landing-grid">
        <section>
          <h2>Book smarter. Care better.</h2>
          <p>
            HealthPlus Appointments connects patients, doctors, and administrators through a unified scheduling
            platform. Manage visits, track medical records, and stay informed with automated notifications.
          </p>
          {user ? (
            <Link to="/dashboard" className="btn-primary">
              Go to dashboard
            </Link>
          ) : (
            <div className="cta-group">
              <Link to="/login" className="btn-primary">
                Log in
              </Link>
              <Link to="/register/patient" className="btn-secondary">
                Create patient account
              </Link>
            </div>
          )}
        </section>
        <aside className="info-panel">
          <h3>Platform highlights</h3>
          <ul>
            <li>Search doctors by specialty, location, and availability.</li>
            <li>Virtual and in-person appointments with automated reminders.</li>
            <li>Role-based admin panel with analytics and reports.</li>
          </ul>
        </aside>
      </div>
    </Layout>
  )
}

export default LandingPage
