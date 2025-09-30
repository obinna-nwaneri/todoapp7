const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

router.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  const normalizedEmail = email.toLowerCase();
  const hashedPassword = bcrypt.hashSync(password, 10);

  const query = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  db.run(query, [username, normalizedEmail, hashedPassword, 'user'], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      return res.status(500).json({ message: 'Registration failed' });
    }

    res.status(201).json({ id: this.lastID, username, email: normalizedEmail, role: 'user' });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const normalizedEmail = email.toLowerCase();
  db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  });
});

module.exports = router;
