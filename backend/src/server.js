import express from 'express';
import cors from 'cors';
import db from './db.js';
import './setup.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const serializeTodo = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  completed: !!row.completed,
  priority: row.priority,
  dueDate: row.due_date,
  ownerId: row.owner_id,
  ownerName: row.owner_name,
  ownerRole: row.owner_role,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

app.get('/api/todos', (req, res) => {
  const { ownerId, completed } = req.query;
  const filters = [];
  const params = {};

  if (ownerId) {
    filters.push('t.owner_id = @ownerId');
    params.ownerId = ownerId;
  }

  if (completed !== undefined) {
    filters.push('t.completed = @completed');
    params.completed = completed === 'true' ? 1 : 0;
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

  const stmt = db.prepare(`
    SELECT t.id, t.title, t.description, t.completed, t.priority, t.due_date, t.owner_id,
           t.created_at, t.updated_at,
           u.name AS owner_name, u.role AS owner_role
    FROM todos t
    JOIN users u ON u.id = t.owner_id
    ${where}
    ORDER BY t.due_date IS NULL, t.due_date ASC
  `);

  const todos = stmt.all(params).map(serializeTodo);
  res.json(todos);
});

app.post('/api/todos', (req, res) => {
  const { title, description = '', ownerId, priority = 'medium', dueDate = null } = req.body;

  if (!title || !ownerId) {
    return res.status(400).json({ message: 'title and ownerId are required' });
  }

  const stmt = db.prepare(`
    INSERT INTO todos (title, description, owner_id, priority, due_date)
    VALUES (@title, @description, @ownerId, @priority, @dueDate)
  `);

  const result = stmt.run({ title, description, ownerId, priority, dueDate });
  const todo = db.prepare(`
    SELECT t.id, t.title, t.description, t.completed, t.priority, t.due_date, t.owner_id,
           t.created_at, t.updated_at,
           u.name AS owner_name, u.role AS owner_role
    FROM todos t
    JOIN users u ON u.id = t.owner_id
    WHERE t.id = @id
  `).get({ id: result.lastInsertRowid });

  res.status(201).json(serializeTodo(todo));
});

app.patch('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, description, completed, priority, dueDate, ownerId } = req.body;

  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(id);
  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const updateStmt = db.prepare(`
    UPDATE todos
    SET
      title = COALESCE(@title, title),
      description = COALESCE(@description, description),
      completed = COALESCE(@completed, completed),
      priority = COALESCE(@priority, priority),
      due_date = COALESCE(@dueDate, due_date),
      owner_id = COALESCE(@ownerId, owner_id)
    WHERE id = @id
  `);

  updateStmt.run({
    id,
    title,
    description,
    completed: completed === undefined ? undefined : completed ? 1 : 0,
    priority,
    dueDate,
    ownerId
  });

  const updated = db.prepare(`
    SELECT t.id, t.title, t.description, t.completed, t.priority, t.due_date, t.owner_id,
           t.created_at, t.updated_at,
           u.name AS owner_name, u.role AS owner_role
    FROM todos t
    JOIN users u ON u.id = t.owner_id
    WHERE t.id = @id
  `).get({ id });

  res.json(serializeTodo(updated));
});

app.delete('/api/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const stmt = db.prepare('DELETE FROM todos WHERE id = ?');
  const result = stmt.run(id);
  if (result.changes === 0) {
    return res.status(404).json({ message: 'Todo not found' });
  }
  res.status(204).end();
});

app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, role FROM users ORDER BY name ASC').all();
  res.json(users);
});

app.listen(PORT, () => {
  console.log(`API server listening on port ${PORT}`);
});
