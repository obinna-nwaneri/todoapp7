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

interface DoctorForm {
  id?: string;
  name: string;
  specialization: string;
  yearsOfExperience: number;
  availabilitySchedule?: string;
  userId?: string;
}

export const AdminDoctorsPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<DoctorForm>({ name: '', specialization: '', yearsOfExperience: 0 });

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/doctors', { params: query ? { q: query } : undefined });
      setDoctors(data);
      setError(null);
    } catch (err) {
      setError('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async () => {
    try {
      const payload: any = {
        name: form.name,
        specialization: form.specialization,
        yearsOfExperience: form.yearsOfExperience,
        availabilitySchedule: form.availabilitySchedule ? JSON.parse(form.availabilitySchedule) : undefined,
        userId: form.userId || undefined
      };
      if (form.id) {
        await apiClient.put(`/doctors/${form.id}`, payload);
      } else {
        await apiClient.post('/doctors', payload);
      }
      setDialogOpen(false);
      await loadDoctors();
    } catch (err) {
      setError('Failed to save doctor. Ensure availability schedule is valid JSON.');
    }
  };

  const handleEdit = (doctor: any) => {
    setForm({
      id: doctor.id,
      name: doctor.name,
      specialization: doctor.specialization,
      yearsOfExperience: doctor.yearsOfExperience,
      availabilitySchedule: doctor.availabilitySchedule ? JSON.stringify(doctor.availabilitySchedule) : '',
      userId: doctor.user?.id
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/doctors/${id}`);
      loadDoctors();
    } catch (err) {
      setError('Failed to delete doctor');
    }
  };

  const actions = (
    <Stack direction="row" spacing={2}>
      <TextField
        size="small"
        placeholder="Search doctors"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <Button variant="outlined" onClick={loadDoctors}>
        Search
      </Button>
      <Button variant="contained" onClick={() => {
        setForm({ name: '', specialization: '', yearsOfExperience: 0 });
        setDialogOpen(true);
      }}>
        New Doctor
      </Button>
    </Stack>
  );

  return (
    <>
      <PageHeader title="Manage Doctors" subtitle="Search, add, and update doctors" actions={actions} />
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <SimpleTable
        title="Doctors"
        columns={[
          { key: 'name', label: 'Name' },
          { key: 'specialization', label: 'Specialization' },
          { key: 'yearsOfExperience', label: 'Experience (Years)' },
          { key: 'actions', label: 'Actions' }
        ]}
        data={doctors.map((doctor) => ({
          name: doctor.name,
          specialization: doctor.specialization,
          yearsOfExperience: doctor.yearsOfExperience,
          actions: (
            <Stack direction="row" spacing={1}>
              <IconButton onClick={() => handleEdit(doctor)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => handleDelete(doctor.id)} size="small" color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          )
        }))}
      />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{form.id ? 'Edit Doctor' : 'Create Doctor'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            <TextField
              label="Specialization"
              value={form.specialization}
              onChange={(e) => setForm((prev) => ({ ...prev, specialization: e.target.value }))}
            />
            <TextField
              label="Years of Experience"
              type="number"
              value={form.yearsOfExperience}
              onChange={(e) => setForm((prev) => ({ ...prev, yearsOfExperience: Number(e.target.value) }))}
            />
            <TextField
              label="Availability Schedule (JSON)"
              value={form.availabilitySchedule ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, availabilitySchedule: e.target.value }))}
              multiline
              minRows={2}
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
