const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', (req, res) => {
  const { role, id } = req.user;
  const targetUserId = role === 'admin' && req.query.userId ? req.query.userId : id;

  let query = `
    SELECT tasks.*, users.username
    FROM tasks
    JOIN users ON users.id = tasks.user_id
  `;
  const params = [];

  if (role === 'admin' && !req.query.userId) {
    // Admin requesting all tasks
    query += ' ORDER BY due_date';
  } else {
    query += ' WHERE user_id = ? ORDER BY due_date';
    params.push(targetUserId);
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  const taskId = req.params.id;
  const { role, id } = req.user;

  const query = 'SELECT * FROM tasks WHERE id = ?';
  db.get(query, [taskId], (err, task) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to fetch task' });
    }
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (role !== 'admin' && task.user_id !== id) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  });
});

router.post('/', (req, res) => {
  const { title, description, due_date, priority, status, user_id } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const { role, id } = req.user;
  const ownerId = role === 'admin' && user_id ? user_id : id;

  const query = `
    INSERT INTO tasks (title, description, due_date, priority, status, user_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const params = [title, description || null, due_date || null, priority || 'Low', status || 'Pending', ownerId];

  db.run(query, params, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Failed to create task' });
    }
    res.status(201).json({ id: this.lastID, title, description, due_date, priority: priority || 'Low', status: status || 'Pending', user_id: ownerId });
  });
});

router.put('/:id', (req, res) => {
  const taskId = req.params.id;
  const { title, description, due_date, priority, status, user_id } = req.body;
  const { role, id } = req.user;

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update task' });
    }
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (role !== 'admin' && task.user_id !== id) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const ownerId = role === 'admin' && user_id ? user_id : task.user_id;
    const query = `
      UPDATE tasks
      SET title = ?, description = ?, due_date = ?, priority = ?, status = ?, user_id = ?
      WHERE id = ?
    `;
    const params = [
      title || task.title,
      description || task.description,
      due_date || task.due_date,
      priority || task.priority,
      status || task.status,
      ownerId,
      taskId
    ];

    db.run(query, params, function (updateErr) {
      if (updateErr) {
        return res.status(500).json({ message: 'Failed to update task' });
      }
      res.json({ id: taskId, title: params[0], description: params[1], due_date: params[2], priority: params[3], status: params[4], user_id: params[5] });
    });
  });
});

router.delete('/:id', (req, res) => {
  const taskId = req.params.id;
  const { role, id } = req.user;

  db.get('SELECT * FROM tasks WHERE id = ?', [taskId], (err, task) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to delete task' });
    }
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (role !== 'admin' && task.user_id !== id) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    db.run('DELETE FROM tasks WHERE id = ?', [taskId], function (deleteErr) {
      if (deleteErr) {
        return res.status(500).json({ message: 'Failed to delete task' });
      }
      res.json({ message: 'Task deleted' });
    });
  });
});

module.exports = router;
