const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/summary', (req, res) => {
  db.serialize(() => {
    db.get('SELECT COUNT(*) AS totalUsers FROM users', (userErr, userRow) => {
      if (userErr) {
        return res.status(500).json({ message: 'Failed to fetch user summary' });
      }

      db.get('SELECT COUNT(*) AS totalTasks FROM tasks', (taskErr, taskRow) => {
        if (taskErr) {
          return res.status(500).json({ message: 'Failed to fetch task summary' });
        }

        db.all(`
          SELECT status, COUNT(*) as count
          FROM tasks
          GROUP BY status
        `, (statusErr, statusRows) => {
          if (statusErr) {
            return res.status(500).json({ message: 'Failed to fetch status breakdown' });
          }

          res.json({
            totalUsers: userRow.totalUsers,
            totalTasks: taskRow.totalTasks,
            taskBreakdown: statusRows
          });
        });
      });
    });
  });
});

router.get('/users', (req, res) => {
  db.all('SELECT id, username, email, role FROM users', (err, users) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }

    const userIds = users.map(u => u.id);
    if (userIds.length === 0) {
      return res.json([]);
    }

    db.all(`
      SELECT tasks.*, users.username
      FROM tasks
      JOIN users ON users.id = tasks.user_id
      WHERE user_id IN (${userIds.map(() => '?').join(',')})
    `, userIds, (taskErr, tasks) => {
      if (taskErr) {
        return res.status(500).json({ message: 'Failed to fetch user tasks' });
      }

      const taskMap = tasks.reduce((acc, task) => {
        if (!acc[task.user_id]) acc[task.user_id] = [];
        acc[task.user_id].push(task);
        return acc;
      }, {});

      const data = users.map(user => ({
        ...user,
        tasks: taskMap[user.id] || []
      }));

      res.json(data);
    });
  });
});

router.post('/users', (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email.toLowerCase(), hashed, role], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to create user' });
    }
    res.status(201).json({ id: this.lastID, username, email: email.toLowerCase(), role });
  });
});

router.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update user' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatedUsername = username || user.username;
    const updatedEmail = email ? email.toLowerCase() : user.email;
    const updatedRole = role || user.role;
    const updatedPassword = password ? bcrypt.hashSync(password, 10) : user.password;

    db.run(`
      UPDATE users
      SET username = ?, email = ?, password = ?, role = ?
      WHERE id = ?
    `, [updatedUsername, updatedEmail, updatedPassword, updatedRole, id], function (updateErr) {
      if (updateErr) {
        return res.status(500).json({ message: 'Failed to update user' });
      }
      res.json({ id: Number(id), username: updatedUsername, email: updatedEmail, role: updatedRole });
    });
  });
});

router.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete user' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
});

router.get('/tasks', (req, res) => {
  db.all(`
    SELECT tasks.*, users.username
    FROM tasks
    JOIN users ON users.id = tasks.user_id
    ORDER BY due_date
  `, (err, tasks) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
    res.json(tasks);
  });
});

router.post('/tasks', (req, res) => {
  const { title, description, due_date, priority, status, user_id } = req.body;
  if (!title || !user_id) {
    return res.status(400).json({ message: 'Title and user_id are required' });
  }

  db.run(`
    INSERT INTO tasks (title, description, due_date, priority, status, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [title, description || null, due_date || null, priority || 'Low', status || 'Pending', user_id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to create task' });
    }
    res.status(201).json({ id: this.lastID, title, description, due_date, priority: priority || 'Low', status: status || 'Pending', user_id });
  });
});

router.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, priority, status, user_id } = req.body;

  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, task) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update task' });
    }
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    db.run(`
      UPDATE tasks
      SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, user_id = ?
      WHERE id = ?
    `, [
      title || task.title,
      description || task.description,
      due_date || task.due_date,
      priority || task.priority,
      status || task.status,
      user_id || task.user_id,
      id
    ], function (updateErr) {
      if (updateErr) {
        return res.status(500).json({ message: 'Failed to update task' });
      }
      res.json({ id: Number(id), title: title || task.title, description: description || task.description, due_date: due_date || task.due_date, priority: priority || task.priority, status: status || task.status, user_id: user_id || task.user_id });
    });
  });
});

router.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete task' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  });
});

module.exports = router;
