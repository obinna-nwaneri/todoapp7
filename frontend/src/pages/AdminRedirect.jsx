import { useEffect } from 'react';
import { ADMIN_PANEL_URL } from '../utils.js';

const AdminRedirect = () => {
  useEffect(() => {
    window.location.assign(ADMIN_PANEL_URL);
  }, []);

  return (
    <div className="card">
      <h2>Redirecting to Admin Panel…</h2>
      <p>
        If you are not redirected automatically,{' '}
        <a href={ADMIN_PANEL_URL}>click here to open the AdminJS dashboard.</a>
      </p>
    </div>
  );
};

export default AdminRedirect;
