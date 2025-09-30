const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user'
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        due_date TEXT,
        priority TEXT CHECK(priority IN ('Low','Medium','High')) NOT NULL DEFAULT 'Low',
        status TEXT CHECK(status IN ('Pending','In Progress','Completed')) NOT NULL DEFAULT 'Pending',
        user_id INTEGER NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        console.error('Error counting users', err);
        return;
      }

      if (row.count === 0) {
        seedData();
      }
    });
  });
};

const seedData = async () => {
  const users = [
    { username: 'admin', email: 'admin@example.com', password: 'AdminPass123!', role: 'admin' },
    { username: 'alice', email: 'alice@example.com', password: 'Password123', role: 'user' },
    { username: 'bob', email: 'bob@example.com', password: 'Password123', role: 'user' }
  ];

  const tasks = [
    { title: 'Review project plan', description: 'Check milestones and deliverables', due_date: '2024-03-20', priority: 'High', status: 'In Progress', user: 'alice' },
    { title: 'Write documentation', description: 'Add setup instructions', due_date: '2024-03-25', priority: 'Medium', status: 'Pending', user: 'alice' },
    { title: 'Fix login bug', description: 'Resolve JWT expiration issue', due_date: '2024-03-22', priority: 'High', status: 'Pending', user: 'bob' },
    { title: 'Team sync meeting', description: 'Prepare slides for sync', due_date: '2024-03-18', priority: 'Low', status: 'Completed', user: 'bob' },
    { title: 'Database backup', description: 'Schedule weekly backups', due_date: '2024-03-30', priority: 'Medium', status: 'Pending', user: 'admin' },
    { title: 'Add unit tests', description: 'Improve coverage for services', due_date: '2024-04-02', priority: 'High', status: 'In Progress', user: 'admin' }
  ];

  db.serialize(() => {
    const userStmt = db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)');
    users.forEach(user => {
      const hash = bcrypt.hashSync(user.password, 10);
      userStmt.run(user.username, user.email, hash, user.role);
    });
    userStmt.finalize(err => {
      if (err) {
        console.error('Error seeding users', err);
      }

      db.all('SELECT id, username FROM users', (userErr, rows) => {
        if (userErr) {
          console.error('Error fetching users for seeding tasks', userErr);
          return;
        }

        const userMap = rows.reduce((acc, curr) => {
          acc[curr.username] = curr.id;
          return acc;
        }, {});

        const taskStmt = db.prepare(`
          INSERT INTO tasks (title, description, due_date, priority, status, user_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `);
        tasks.forEach(task => {
          const userId = userMap[task.user];
          if (userId) {
            taskStmt.run(task.title, task.description, task.due_date, task.priority, task.status, userId);
          }
        });
        taskStmt.finalize(taskErr => {
          if (taskErr) {
            console.error('Error seeding tasks', taskErr);
          }
        });
      });
    });
  });
};

initializeDatabase();

module.exports = db;
