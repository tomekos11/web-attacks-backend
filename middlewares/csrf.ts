import csurf from 'csurf';
import type { Request, Response, NextFunction } from 'express';
import { csrfSecurityEnabled } from 'controllers/securityController';

export const csrfProtectionMiddleware = csurf({
  cookie: true,
  value: (req: Request) => req.headers['x-csrf-token'] as string | undefined,
});

export function csrfMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (csrfSecurityEnabled) {
    return csrfProtectionMiddleware(req, res, next);
  }
  next();
}

export function sendCsrfToken(req: Request, res: Response): void {
  const token = req.csrfToken();
  res.json({ csrfToken: token });
}