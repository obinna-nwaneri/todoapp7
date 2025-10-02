import { Card, CardContent, Typography } from '@mui/material';

interface DashboardCardProps {
  title: string;
  value: number;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, value }) => (
  <Card>
    <CardContent>
      <Typography color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);
