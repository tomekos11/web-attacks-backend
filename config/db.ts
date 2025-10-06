import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from 'bcryptjs'

let db;

export const webAttacks = [
  'csrf',
  'clickjacking',
  'sql-injection',
  'xss',
  'command-injection',
  'path-traversal',
  'cookie-lax'
];

export const initDb = async () => {
  if (db) return db;

  db = await open({
    filename: './database.db',
    driver: sqlite3.Database,
  });

  // Tabela sesji (opcjonalnie - connect-sqlite3 też tworzy)
  // await db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  //   sid TEXT PRIMARY KEY,
  //   sess TEXT NOT NULL,
  //   expire INTEGER NOT NULL
  // )`);

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

  const existingAdmin = await db.get('SELECT * FROM users WHERE username = ?', ['admin']);
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('password', 10);
    await db.run('INSERT INTO users (username, password, role, userNumber) VALUES (?, ?, ?, ?)', [
      'admin',
      hashedPassword,
      'admin',
      '1',
    ]);
  }

  await db.exec(`CREATE TABLE IF NOT EXISTS security_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    isActive INTEGER NOT NULL DEFAULT 0
  )`);
  
  for (const attack of webAttacks) {
    await db.run(
      `INSERT OR IGNORE INTO security_settings (name) VALUES (?)`,
      [attack]
    );
  }

  await db.exec(`CREATE TABLE IF NOT EXISTS secrets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    creditCard TEXT,
    pin TEXT,
    secretNote TEXT,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`);
  
  // Dodaj dane dla użytkownika 1 (admin) i 2 (np. test)
  const user1 = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
  let user2 = await db.get('SELECT id FROM users WHERE username = ?', ['test']);
  
  if (!user2) {
    const hashedPassword = await bcrypt.hash('1234', 10);
    const result = await db.run('INSERT INTO users (username, password, role, userNumber) VALUES (?, ?, ?, ?)', [
      'test',
      hashedPassword,
      'user',
      '2',
    ]);
    user2 = { id: result.lastID };
  }
  
  await db.run(
    `INSERT OR IGNORE INTO secrets (userId, creditCard, pin, secretNote) VALUES (?, ?, ?, ?)`,
    [user1.id, '4111 1111 1111 1111', '1234', 'Adminowy sekret']
  );
  
  await db.run(
    `INSERT OR IGNORE INTO secrets (userId, creditCard, pin, secretNote) VALUES (?, ?, ?, ?)`,
    [user2.id, '5500 0000 0000 0004', '4321', 'Użytkownik testowy']
  );

  
  return db;
};