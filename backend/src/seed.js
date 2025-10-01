import db from './db.js';
import './setup.js';

const clearStmt = db.prepare('DELETE FROM todos');
clearStmt.run();
db.prepare('DELETE FROM users').run();

db.prepare('DELETE FROM sqlite_sequence WHERE name IN (\'users\', \'todos\')').run();

const insertUser = db.prepare(`
  INSERT INTO users (name, email, role)
  VALUES (@name, @email, @role)
`);

const users = [
  { name: 'Alice Admin', email: 'alice@example.com', role: 'admin' },
  { name: 'Bob Builder', email: 'bob@example.com', role: 'user' },
  { name: 'Charlie Checker', email: 'charlie@example.com', role: 'user' }
];

const insertedUsers = users.map((user) => ({
  ...user,
  id: insertUser.run(user).lastInsertRowid
}));

const insertTodo = db.prepare(`
  INSERT INTO todos (title, description, completed, priority, due_date, owner_id)
  VALUES (@title, @description, @completed, @priority, @dueDate, @ownerId)
`);

const todos = [
  {
    title: 'Review onboarding documents',
    description: 'Ensure all policies are up to date for new hires.',
    completed: 0,
    priority: 'high',
    dueDate: '2024-06-30',
    ownerId: insertedUsers[0].id
  },
  {
    title: 'Build UI prototype',
    description: 'Create the initial React component structure.',
    completed: 0,
    priority: 'medium',
    dueDate: '2024-07-05',
    ownerId: insertedUsers[1].id
  },
  {
    title: 'QA smoke tests',
    description: 'Run automated tests across main flows.',
    completed: 0,
    priority: 'low',
    dueDate: '2024-07-10',
    ownerId: insertedUsers[2].id
  },
  {
    title: 'Prepare admin dashboard',
    description: 'Add metrics and charts for administrators.',
    completed: 1,
    priority: 'high',
    dueDate: '2024-06-20',
    ownerId: insertedUsers[0].id
  }
];

db.transaction(() => {
  todos.forEach((todo) => insertTodo.run(todo));
})();

console.log('Seed data inserted');
