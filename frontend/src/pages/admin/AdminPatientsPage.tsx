import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

import { PageHeader } from '../../components/PageHeader';
import { SimpleTable } from '../../components/SimpleTable';
import { apiClient } from '../../services/api';

interface PatientForm {
  id?: string;
  name: string;
  age: number;
  gender: string;
  contactInfo: string;
  userId?: string;
}

export const AdminPatientsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PatientForm>({ name: '', age: 0, gender: '', contactInfo: '' });

  const loadPatients = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/patients', { params: query ? { q: query } : undefined });
      setPatients(data);
      setError(null);
    } catch (err) {
      setError('Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      const payload: any = {
        name: form.name,
        age: form.age,
        gender: form.gender,
        contactInfo: form.contactInfo,
        userId: form.userId || undefined
      };
      if (form.id) {
        await apiClient.put(`/patients/${form.id}`, payload);
      } else {
        await apiClient.post('/patients', payload);
      }
      setDialogOpen(false);
      await loadPatients();
    } catch (err) {
      setError('Failed to save patient');
    }
  };

  const handleEdit = (patient: any) => {
    setForm({
      id: patient.id,
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      contactInfo: patient.contactInfo,
      userId: patient.user?.id
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/patients/${id}`);
      loadPatients();
    } catch (err) {
      setError('Failed to delete patient');
    }
  };

  const actions = (
    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        placeholder="Search patients"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant="outlined" onClick={loadPatients}>
        Search
      </Button>
      <Button variant="contained" onClick={() => {
        setForm({ name: '', age: 0, gender: '', contactInfo: '' });
        setDialogOpen(true);
      }}>
        New Patient
      </Button>
    </Stack>
  );

  return (
    <>
      <PageHeader title="Manage Patients" subtitle="Search, add, and update patients" actions={actions} />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Patients"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'age', label: 'Age' },
          { key: 'gender', label: 'Gender' },
          { key: 'contactInfo', label: 'Contact' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={patients.map((patient) => ({
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          contactInfo: patient.contactInfo,
          actions: (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => handleEdit(patient)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleDelete(patient.id)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )
        }))}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit Patient' : 'Create Patient'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <TextField
              label="Age"
              type="number"
              value={form.age}
              onChange={(e) => setForm((prev) => ({ ...prev, age: Number(e.target.value) }))}
            />
            <TextField label="Gender" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} />
            <TextField
              label="Contact Info"
              value={form.contactInfo}
              onChange={(e) => setForm((prev) => ({ ...prev, contactInfo: e.target.value }))}
            />
            <TextField
              label="User ID (optional)"
              value={form.userId ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
