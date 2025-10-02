import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';

import { AppRoutes } from './routes/AppRoutes';
import { LogoutButton } from './components/LogoutButton';
import { useAuth } from './context/AuthContext';

function App() {
  const { role } = useAuth();
  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            DocApp Enterprise
          </Typography>
          {role && <LogoutButton />}
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ py: 4 }}>
        <Container maxWidth="xl">
          <AppRoutes />
        </Container>
      </Box>
    </>
  );
}

export default App;
