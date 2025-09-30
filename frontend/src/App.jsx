import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ContactsList from './pages/ContactsList.jsx';
import AddContact from './pages/AddContact.jsx';
import EditContact from './pages/EditContact.jsx';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="contacts" element={<ContactsList />} />
          <Route path="contacts/new" element={<AddContact />} />
          <Route path="contacts/:id/edit" element={<EditContact />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
