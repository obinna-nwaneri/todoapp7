const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'changeme-admin-token';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'users.sqlite');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('frontend', 'backend', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_by TEXT
    )`
  );

  db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin'], (err, row) => {
    if (err) {
      console.error('Failed checking for admin user', err);
      return;
    }
    if (row.count === 0) {
      db.run(
        'INSERT INTO users (name, email, password, role, created_by) VALUES (?, ?, ?, ?, ?)',
        ['Default Admin', 'admin@example.com', ADMIN_TOKEN, 'admin', 'system'],
        (insertErr) => {
          if (insertErr) {
            console.error('Failed to seed default admin user', insertErr);
          } else {
            console.log('Seeded default admin user with email admin@example.com');
          }
        }
      );
    }
  });
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function validateEmail(email) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);
}

function adminAuth(req, res, next) {
  const token = req.header('x-admin-token');
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid admin token' });
  }
  next();
}

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  const stmt = db.prepare(
    'INSERT INTO users (name, email, password, role, created_by) VALUES (?, ?, ?, ?, ?)',
    (err) => {
      if (err) {
        console.error('Failed to prepare statement', err);
      }
    }
  );
  stmt.run([name.trim(), email.toLowerCase(), password, 'frontend', 'self'], (err) => {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Email already registered.' });
      }
      console.error('Failed to register user', err);
      return res.status(500).json({ error: 'Failed to register user.' });
    }
    res.status(201).json({ message: 'Registration successful.' });
  });
  stmt.finalize();
});

app.get('/api/users', adminAuth, (req, res) => {
  db.all('SELECT id, name, email, role, created_at, created_by FROM users ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Failed to list users', err);
      return res.status(500).json({ error: 'Failed to list users.' });
    }
    res.json(rows);
  });
});

app.post('/api/admin/users', adminAuth, (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, email, password, and role are required.' });
  }

  if (!['frontend', 'backend', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be frontend, backend, or admin.' });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  db.run(
    'INSERT INTO users (name, email, password, role, created_by) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), email.toLowerCase(), password, role, 'admin'],
    (err) => {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ error: 'Email already registered.' });
        }
        console.error('Failed to add user', err);
        return res.status(500).json({ error: 'Failed to add user.' });
      }
      res.status(201).json({ message: 'User added successfully.' });
    }
  );
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found.' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Use the ADMIN_TOKEN environment variable to secure admin routes.');
});
