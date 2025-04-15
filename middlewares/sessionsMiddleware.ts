// const crypto = require('crypto')
// const dbService = require('../services/dbService.ts')

import crypto from 'crypto'
import { dbService } from '../services/dbService.js'

// 🛠 Generowanie losowego imienia
function generateRandomName() {
  return crypto.randomBytes(6).toString('hex')
}

// 🛠 Generowanie losowej liczby (1-6)
function generateRandomInteger() {
  return Math.floor(Math.random() * 6) + 1
}

export const sessionMiddleware = async (req, res, next) => {
  const { session } = req;

  if (session.userId) {
    return next();
  }

  if (session.userId && !session.userId.startsWith('guest_')) {

    const user = await dbService.get('SELECT * FROM users WHERE id = ?', [session.userId]);

    if (user) {
      session.username = user.username;
      session.userNumber = user.userNumber;
      session.isAdmin = user.role === 'admin';

      return next();
    }
  }

  if (req.session.userId) {
    console.log('pobieram cos z bazy');

    // Pobierz użytkownika z bazy danych przy użyciu dbService
    const user = await dbService.get('SELECT * FROM users WHERE id = ?', [req.session.userId]);

    if (user) {
      console.log('poprawnie pobrany z bazy');
      req.session.username = user.username;
      req.session.userNumber = user.userNumber;
      req.session.isAdmin = user.role === 'admin';
    }

    return next();
  }

  session.userId = `guest_${Math.random().toString(36).substr(2, 9)}`;
  session.username = generateRandomName();
  session.userNumber = generateRandomInteger();
  session.isAdmin = false;

  return next();
};

// module.exports = sessionMiddleware