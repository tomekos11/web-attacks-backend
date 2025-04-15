// const sqlite3 = require('sqlite3');
// const { open } = require('sqlite');
// const bcrypt = require('bcryptjs');

import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from 'bcryptjs'

let db;

export const initDb = async () => {
  if (db) return db;

  db = await open({
    filename: './database.db',
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

  return db;
};

// module.exports = initDb;