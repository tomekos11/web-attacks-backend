import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import bcrypt from 'bcryptjs'

let db;

export const securityGroups = [
  'csrf',
  'clickjacking',
  'sql-injection',
  'xss',
  'command-injection',
  'path-traversal',
  'cookies',
  'api-security',
] as const;

interface webAttack {
  name: string;
  groups: typeof securityGroups[number][];
  description?: string;
}

export const webAttacks: webAttack[] = [
  // clickjacking && csrf
  {
    name: 'cookie-lax',
    groups: ['cookies'],
    description: 'Ustawia flagę SameSite na Lax dla ciasteczek sesyjnych, co pomaga chronić przed atakami CSRF i clickjacking.',
  },
  {
    name: 'cookie-secure',
    groups: ['cookies'],
    description: 'Ustawia flagę Secure dla ciasteczek sesyjnych, co zapewnia, że są one przesyłane tylko przez bezpieczne połączenia HTTPS.',
  },
  {
    name: 'cookie-http-only',
    groups: ['cookies'],
    description: 'Ustawia flagę HttpOnly dla ciasteczek sesyjnych, co zapobiega dostępowi do nich przez skrypty po stronie klienta (np. w przypadku ataków XSS).',
  },

  {
    name: 'csrf-token',
    groups: ['csrf'],
    description: 'Włącza ochronę przed atakami CSRF poprzez generowanie i weryfikację tokenów CSRF dla formularzy i żądań.',
  },
  {
    name: 'csp-connect-src',
    groups: ['csrf', 'xss'],
    description: 'Ogranicza źródła, do których mogą być wykonywane połączenia (np. AJAX, WebSocket), co pomaga zapobiegać atakom CSRF.',
  },

  {
    name: 'csp-frame-ancestors',
    groups: ['clickjacking'],
    description: 'Zapobiega osadzaniu strony w ramkach (iframe) na innych domenach, co chroni przed atakami clickjacking.',
  },

  {
    name: 'csp-script-src',
    groups: ['xss'],
    description: 'Ogranicza źródła, z których mogą być ładowane skrypty JavaScript, co pomaga zapobiegać atakom XSS.',
  },
  {
    name: 'dom-purify',
    groups: ['xss'],
    description: 'Używa biblioteki DOMPurify do oczyszczania danych wejściowych od użytkowników, co pomaga zapobiegać atakom XSS poprzez usuwanie złośliwego kodu.',
  },

  {
    name: 'https',
    groups: ['api-security'],
    description: 'Wymusza użycie HTTPS dla wszystkich połączeń, co zapewnia bezpieczną transmisję danych i chroni przed podsłuchiwaniem',
  },
  {
    name: 'reject-unknown-hostnames',
    groups: ['api-security'],
    description: 'Odrzuca żądania przychodzące z nieznanych lub nieautoryzowanych nazw hostów',
  },
  {
    name: 'cors',
    groups: ['api-security'],
    description: 'Włącza i konfiguruje CORS (Cross-Origin Resource Sharing), co pozwala kontrolować, które domeny mogą uzyskiwać dostęp do zasobów API.',
  },

]

// export const webAttacks = [
//   'csrf',
//   'clickjacking',
//   'sql-injection',
//   'xss',
//   'command-injection',
//   'path-traversal',
//   'cookie-lax',
//   'cookie-secure',
//   'cookie-http-only',
//   'https',
// ];

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

  await db.exec(`CREATE TABLE IF NOT EXISTS security_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  )`);

  for (const groupName of securityGroups) {
    await db.run(
      `INSERT OR IGNORE INTO security_groups (name) VALUES (?)`,
      [groupName]
    );
  }

  await db.exec(`CREATE TABLE IF NOT EXISTS security_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    description TEXT,
    isActive INTEGER NOT NULL DEFAULT 0
  )`);
  
  for (const { name, description } of webAttacks) {
    await db.run(
      `INSERT OR IGNORE INTO security_settings (name, description) VALUES (?, ?)`,
      [name, description]
    );
  }

  await db.exec(`CREATE TABLE IF NOT EXISTS security_groups_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    securityGroupId INTEGER,
    securitySettingId INTEGER,
    FOREIGN KEY (securityGroupId) REFERENCES security_groups(id),
    FOREIGN KEY (securitySettingId) REFERENCES security_settings(id)
  )`);

  for (const { name, groups } of webAttacks) {
    // Pobierz id grupy
    for (const group of groups) {
      const groupRow = await db.get(`SELECT id FROM security_groups WHERE name = ?`, [group]);

      // Pobierz id ustawienia bezpieczeństwa
      const settingRow = await db.get(`SELECT id FROM security_settings WHERE name = ?`, [name]);
      
      if (groupRow && settingRow) {
        await db.run(
          `INSERT OR IGNORE INTO security_groups_settings (securityGroupId, securitySettingId) VALUES (?, ?)`,
          [groupRow.id, settingRow.id]
        );
      } else {
        console.warn(`Brak danych do powiązania: grupa "${group}" lub ustawienie "${name}"`);
      }
    }
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