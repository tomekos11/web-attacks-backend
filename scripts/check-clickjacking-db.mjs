import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const db = await open({ filename: 'database.db', driver: sqlite3.Database });
const rows = await db.all(
  "SELECT name, isActive FROM security_settings WHERE name IN ('x-frame-options', 'csp-frame-ancestors')",
);
console.log(rows);
await db.close();
