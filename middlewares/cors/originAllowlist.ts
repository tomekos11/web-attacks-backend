import type { Request, Response, NextFunction } from 'express';
import { originAllowlistSecurityEnabled } from 'controllers/securityController';
import { isAllowedOrigin } from './allowedOrigins';

export function originAllowlistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!originAllowlistSecurityEnabled) {
    return next();
  }

  const origin = req.headers.origin as string | undefined;

  if (!origin) {
    return next();
  }

  if (!isAllowedOrigin(origin)) {
    return res.status(403).json({
      error: `Origin nie jest dozwolony — ${origin}`,
    });
  }

  return next();
}
