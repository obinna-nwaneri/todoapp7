import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

const DoctorDashboard = () => {
  const [upcoming, setUpcoming] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const response = await api.get('/appointments');
      const appointments = response.data;
      setUpcoming(appointments.filter((a: any) => a.status === 'PENDING' || a.status === 'APPROVED').length);
      setCompleted(appointments.filter((a: any) => a.status === 'COMPLETED').length);
    };
    loadStats();
  }, []);

  return (
    <PanelLayout title="Doctor Dashboard">
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Upcoming Appointments</Typography>
              <Typography variant="h4">{upcoming}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Completed Appointments</Typography>
              <Typography variant="h4">{completed}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PanelLayout>
  );
};

export default DoctorDashboard;
