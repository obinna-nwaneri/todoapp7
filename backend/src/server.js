require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

initDb();

app.use(cors());
app.use(express.json());

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  db.get('SELECT * FROM admins WHERE username = ?', [username], (err, admin) => {
    if (err) {
      console.error('Login error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isValid = bcrypt.compareSync(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, {
      expiresIn: '1h'
    });
    res.json({ token, user: { id: admin.id, username: admin.username } });
  });
});

app.get('/api/contacts', authenticateToken, (req, res) => {
  const { search } = req.query;
  let query = 'SELECT * FROM contacts';
  const params = [];
  if (search) {
    const like = `%${search}%`;
    query +=
      ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR address LIKE ?';
    params.push(like, like, like, like);
  }
  query += ' ORDER BY datetime(created_at) DESC';
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Failed fetching contacts', err);
      return res.status(500).json({ message: 'Failed to fetch contacts' });
    }
    res.json(rows);
  });
});

app.get('/api/contacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Failed fetching contact', err);
      return res.status(500).json({ message: 'Failed to fetch contact' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(row);
  });
});

app.post('/api/contacts', authenticateToken, (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    'INSERT INTO contacts (name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone, address || '', createdAt],
    function (err) {
      if (err) {
        console.error('Failed creating contact', err);
        return res.status(500).json({ message: 'Failed to create contact' });
      }
      db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (selectErr, row) => {
        if (selectErr) {
          return res.status(201).json({ id: this.lastID, name, email, phone, address, created_at: createdAt });
        }
        res.status(201).json(row);
      });
    }
  );
});

app.put('/api/contacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required' });
  }
  db.run(
    'UPDATE contacts SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
    [name, email, phone, address || '', id],
    function (err) {
      if (err) {
        console.error('Failed updating contact', err);
        return res.status(500).json({ message: 'Failed to update contact' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      db.get('SELECT * FROM contacts WHERE id = ?', [id], (selectErr, row) => {
        if (selectErr) {
          console.error('Failed retrieving contact after update', selectErr);
          return res.json({ id: Number(id), name, email, phone, address });
        }
        res.json(row);
      });
    }
  );
});

app.delete('/api/contacts/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Failed deleting contact', err);
      return res.status(500).json({ message: 'Failed to delete contact' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.status(204).send();
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
