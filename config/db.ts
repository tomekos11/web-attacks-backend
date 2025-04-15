const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcryptjs');

let db;

const initDb = async () => {
  if (db) return db; // Jeśli już zainicjowano, zwróć istniejącą instancję

  db = await open({
    filename: './database.db',  // Upewnij się, że ścieżka jest prawidłowa
    driver: sqlite3.Database,
  });

  // Tabela sesji (opcjonalnie - connect-sqlite3 też tworzy)
  await db.exec(`CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    userName TEXT,
    userNumber TEXT,
    title TEXT,
    content TEXT,
    createdAt TEXT
  )`);

  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    userNumber TEXT,
    role TEXT NOT NULL
  )`);

  // Dodaj admina, jeśli go nie ma
  const existingAdmin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('adminpassword', 10);
    await db.run('INSERT INTO users (username, password, role, userNumber) VALUES (?, ?, ?, ?)', [
      'admin',
      hashedPassword,
      'admin',
      '1',
    ]);
  }

  return db;
};

// Eksportowanie funkcji initDb za pomocą CommonJS
module.exports = initDb;
