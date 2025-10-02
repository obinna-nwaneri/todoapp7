import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  yearsOfExperience: number;
  availabilitySchedule: Record<string, string[]>;
}

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availabilityDraft, setAvailabilityDraft] = useState('');

  const fetchDoctors = async (query?: string) => {
    const response = await api.get('/doctors', { params: { q: query } });
    setDoctors(response.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchDoctors(search);
  };

  const handleEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setAvailabilityDraft(JSON.stringify(doctor.availabilitySchedule || {}, null, 2));
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/doctors/${id}`);
    fetchDoctors(search);
  };

  const handleSave = async () => {
    if (!selectedDoctor) return;
    try {
      const parsedAvailability = JSON.parse(availabilityDraft || '{}');
      await api.patch(`/doctors/${selectedDoctor.id}`, {
        name: selectedDoctor.name,
        specialization: selectedDoctor.specialization,
        yearsOfExperience: selectedDoctor.yearsOfExperience,
        availabilitySchedule: parsedAvailability,
      });
      setOpen(false);
      fetchDoctors(search);
    } catch (error) {
      // ignore JSON error
    }
  };

  return (
    <PanelLayout title="Manage Doctors">
      <Box component="form" onSubmit={handleSearch} mb={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search doctors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1 }}
          />
          <Button type="submit" variant="contained">
            Search
          </Button>
        </Stack>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Specialization</TableCell>
            <TableCell>Experience</TableCell>
            <TableCell>Availability</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id} hover>
              <TableCell>{doctor.name}</TableCell>
              <TableCell>{doctor.specialization}</TableCell>
              <TableCell>{doctor.yearsOfExperience} years</TableCell>
              <TableCell>
                {Object.entries(doctor.availabilitySchedule || {}).map(([day, slots]) => (
                  <Typography variant="body2" key={day}>
                    <strong>{day}:</strong> {slots.join(', ')}
                  </Typography>
                ))}
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => handleEdit(doctor)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(doctor.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Doctor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={selectedDoctor?.name || ''}
              onChange={(e) => setSelectedDoctor((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
            />
            <TextField
              label="Specialization"
              value={selectedDoctor?.specialization || ''}
              onChange={(e) =>
                setSelectedDoctor((prev) => (prev ? { ...prev, specialization: e.target.value } : prev))
              }
            />
            <TextField
              label="Years of Experience"
              type="number"
              value={selectedDoctor?.yearsOfExperience || 0}
              onChange={(e) =>
                setSelectedDoctor((prev) =>
                  prev ? { ...prev, yearsOfExperience: Number(e.target.value) } : prev,
                )
              }
            />
            <TextField
              label="Availability Schedule"
              multiline
              minRows={3}
              value={availabilityDraft}
              onChange={(e) => setAvailabilityDraft(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PanelLayout>
  );
};

export default AdminDoctors;
