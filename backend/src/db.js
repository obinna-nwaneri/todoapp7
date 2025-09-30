const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

const db = new sqlite3.Database(DB_PATH);

const ensureAdmin = () => {
  const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
  const defaultPassword = process.env.ADMIN_PASSWORD || 'password123';
  const passwordHash = bcrypt.hashSync(defaultPassword, 10);

  db.get('SELECT id FROM admins WHERE username = ?', [defaultUsername], (err, row) => {
    if (err) {
      console.error('Failed checking default admin', err);
      return;
    }
    if (!row) {
      const insert = db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)');
      insert.run(defaultUsername, passwordHash, (insertErr) => {
        if (insertErr) {
          console.error('Failed inserting default admin', insertErr);
        } else {
          console.log('Default admin created with username:', defaultUsername);
        }
      });
      insert.finalize();
    }
  });
};

const seedContacts = () => {
  const sampleContacts = [
    ['Alice Johnson', 'alice.johnson@example.com', '(555) 123-4567', '742 Evergreen Terrace, Springfield'],
    ['Benjamin Lee', 'ben.lee@example.com', '(555) 234-5678', '88 Elm Street, Capital City'],
    ['Carla Mendes', 'carla.mendes@example.com', '(555) 345-6789', '1200 Sunset Blvd, Los Angeles'],
    ['Daniel Kim', 'daniel.kim@example.com', '(555) 456-7890', '15 Beacon St, Boston'],
    ['Ella Fitzgerald', 'ella.fitzgerald@example.com', '(555) 567-8901', '500 Jazz Ave, New Orleans'],
    ['Felix Turner', 'felix.turner@example.com', '(555) 678-9012', '321 Tech Rd, San Francisco'],
    ['Grace Hopper', 'grace.hopper@example.com', '(555) 789-0123', '410 Code St, Arlington'],
    ['Hassan Malik', 'hassan.malik@example.com', '(555) 890-1234', '230 Market St, Philadelphia'],
    ['Isabella Rossi', 'isabella.rossi@example.com', '(555) 901-2345', '23 Piazza Navona, Rome'],
    ['Jamal Carter', 'jamal.carter@example.com', '(555) 012-3456', '77 Music Ln, Memphis'],
    ['Karen Wu', 'karen.wu@example.com', '(555) 543-2109', '99 Innovation Dr, Seattle'],
    ['Luis Alvarez', 'luis.alvarez@example.com', '(555) 654-3210', '5 Ocean View, Miami'],
    ['Maya Patel', 'maya.patel@example.com', '(555) 765-4321', '450 Lakeside Dr, Chicago'],
    ['Noah Smith', 'noah.smith@example.com', '(555) 876-5432', '89 Hilltop Rd, Denver'],
    ['Olivia Brown', 'olivia.brown@example.com', '(555) 987-6543', '200 River Rd, Portland']
  ];

  db.get('SELECT COUNT(*) as count FROM contacts', (err, row) => {
    if (err) {
      console.error('Failed checking contacts count', err);
      return;
    }
    if (row.count === 0) {
      const insert = db.prepare(
        'INSERT INTO contacts (name, email, phone, address, created_at) VALUES (?, ?, ?, ?, ?)' 
      );
      const now = new Date();
      sampleContacts.forEach((contact, index) => {
        const createdAt = new Date(now.getTime() - index * 86400000).toISOString();
        insert.run([...contact, createdAt]);
      });
      insert.finalize();
      console.log('Seeded contacts table with sample data.');
    }
  });
};

const initDb = () => {
  db.serialize(() => {
    db.run(
      `CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`
    );

    ensureAdmin();
    seedContacts();
  });
};

module.exports = { db, initDb };
