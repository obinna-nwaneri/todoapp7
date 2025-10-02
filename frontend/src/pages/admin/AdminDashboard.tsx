import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

interface DashboardStats {
  doctors: number;
  patients: number;
  appointments: number;
  pending: number;
  approved: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({ doctors: 0, patients: 0, appointments: 0, pending: 0, approved: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [doctorsRes, patientsRes, appointmentsRes, countsRes] = await Promise.all([
        api.get('/doctors'),
        api.get('/patients'),
        api.get('/appointments'),
        api.get('/appointments/admin/stats/counts'),
      ]);
      setStats({
        doctors: doctorsRes.data.length,
        patients: patientsRes.data.length,
        appointments: appointmentsRes.data.length,
        pending: countsRes.data.pending,
        approved: countsRes.data.approved,
      });
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Doctors', value: stats.doctors },
    { label: 'Patients', value: stats.patients },
    { label: 'Appointments', value: stats.appointments },
    { label: 'Pending', value: stats.pending },
    { label: 'Approved', value: stats.approved },
  ];

  return (
    <PanelLayout title="Admin Dashboard">
      <Grid container spacing={2}>
        {cards.map((card) => (
          <Grid item xs={12} md={4} key={card.label}>
            <Card>
              <CardContent>
                <Typography variant="h6">{card.label}</Typography>
                <Typography variant="h4">{card.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PanelLayout>
  );
};

export default AdminDashboard;
