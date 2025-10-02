import { Box } from '@mui/material';
import Router from './router/Router';

const App = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Router />
    </Box>
  );
};

export default App;
