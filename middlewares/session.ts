import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import path from 'path';
import crypto from 'crypto';
import { dbService } from '../services/dbService';
import type { Request, Response, NextFunction } from 'express';
import { cookieHttpOnlyEnabled, cookieLaxEnabled, cookieSecureEnabled } from 'controllers/securityController';

const SqliteStore = connectSqlite3(session);

// Narzędzia generujące losowe dane dla gościa
function generateRandomName(): string {
  return crypto.randomBytes(6).toString('hex');
}

function generateRandomInteger(): number {
  return Math.floor(Math.random() * 6) + 1;
}

const allowedDomains = [
  'localhost',
  '.wa.local',
  // '192.168.0.204',
];

function matchDomain(origin: string | undefined): string | undefined {
  if (!origin) return undefined;
  try {
    const { hostname } = new URL(origin);
    for (const domain of allowedDomains) {
      if (hostname === domain.replace(/^\./, '') || hostname.endsWith(domain.replace(/^\./, ''))) {
        return domain;
      }
    }
  } catch (e) {}
  return undefined;
}

export const sessionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin as string | undefined;
  const matchedDomain = matchDomain(origin);

  if (!matchedDomain) {
    // Jeśli nie ma dopasowania domeny, nie ustawiaj sesji ani cookie - przejdź dalej
    return next();
  }

  const sessionInstance = session({
    store: new SqliteStore({ db: 'database.db', dir: path.resolve('./') }),
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: cookieSecureEnabled,
      httpOnly: cookieHttpOnlyEnabled,
      sameSite: cookieLaxEnabled ? 'lax' : 'none',
      domain: matchedDomain,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dni
    }
  });

  sessionInstance(req, res, async () => {
    const { session } = req;

    if (session.userId) {
      if (typeof session.userId === 'string' && session.userId.startsWith('guest_')) return next();

      const user = await dbService.get('SELECT * FROM users WHERE id = ?', [session.userId]);
      if (user) {
        session.username = user.username;
        session.userNumber = user.userNumber;
        session.isAdmin = user.role === 'admin';
        return next();
      }
    }

    // Jeśli nie ma userId, przypisz dane gościa
    session.userId = `guest_${Math.random().toString(36).substr(2, 9)}`;
    session.username = generateRandomName();
    session.userNumber = generateRandomInteger();
    session.isAdmin = false;

    return next();
  });
};