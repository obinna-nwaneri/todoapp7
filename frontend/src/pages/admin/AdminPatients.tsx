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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PanelLayout from '../../components/PanelLayout';
import api from '../../services/api';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contactInfo: string;
}

const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);

  const fetchPatients = async (query?: string) => {
    const response = await api.get('/patients', { params: { q: query } });
    setPatients(response.data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchPatients(search);
  };

  const handleSave = async () => {
    if (!selected) return;
    await api.patch(`/patients/${selected.id}`, {
      name: selected.name,
      age: selected.age,
      gender: selected.gender,
      contactInfo: selected.contactInfo,
    });
    setOpen(false);
    fetchPatients(search);
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/patients/${id}`);
    fetchPatients(search);
  };

  return (
    <PanelLayout title="Manage Patients">
      <Box component="form" onSubmit={handleSearch} mb={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <TextField label="Search patients" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ flexGrow: 1 }} />
          <Button type="submit" variant="contained">
            Search
          </Button>
        </Stack>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Age</TableCell>
            <TableCell>Gender</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id} hover>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>{patient.gender}</TableCell>
              <TableCell>{patient.contactInfo}</TableCell>
              <TableCell align="right">
                <IconButton onClick={() => { setSelected(patient); setOpen(true); }}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleDelete(patient.id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Edit Patient</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Name"
              value={selected?.name || ''}
              onChange={(e) => setSelected((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
            />
            <TextField
              label="Age"
              type="number"
              value={selected?.age || 0}
              onChange={(e) => setSelected((prev) => (prev ? { ...prev, age: Number(e.target.value) } : prev))}
            />
            <TextField
              label="Gender"
              value={selected?.gender || ''}
              onChange={(e) => setSelected((prev) => (prev ? { ...prev, gender: e.target.value } : prev))}
            />
            <TextField
              label="Contact"
              value={selected?.contactInfo || ''}
              onChange={(e) => setSelected((prev) => (prev ? { ...prev, contactInfo: e.target.value } : prev))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PanelLayout>
  );
};

export default AdminPatients;
