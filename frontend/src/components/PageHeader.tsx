import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
    <Box>
      <Typography variant="h4">{title}</Typography>
      {subtitle && (
        <Typography variant="subtitle1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
    {actions && <Box>{actions}</Box>}
  </Stack>
);
