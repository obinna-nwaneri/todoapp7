import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, Typography } from '@mui/material';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

const PatientDashboard = () => {
  const [upcoming, setUpcoming] = useState(0);
  const [past, setPast] = useState(0);

  useEffect(() => {
    const load = async () => {
      const response = await api.get('/appointments');
      const now = new Date();
      const upcomingCount = response.data.filter((a: any) => new Date(`${a.date}T${a.time}`) >= now).length;
      const pastCount = response.data.filter((a: any) => new Date(`${a.date}T${a.time}`) < now).length;
      setUpcoming(upcomingCount);
      setPast(pastCount);
    };
    load();
  }, []);

  return (
    <PanelLayout title="Patient Dashboard">
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
              <Typography variant="h6">Past Appointments</Typography>
              <Typography variant="h4">{past}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PanelLayout>
  );
};

export default PatientDashboard;
