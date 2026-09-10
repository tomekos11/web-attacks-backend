import type { Request, Response, NextFunction } from 'express';
import { browserCorsMiddleware } from './browserCors';
import { originAllowlistMiddleware } from './originAllowlist';

export { allowedOrigins, isAllowedOrigin } from './allowedOrigins';
export { browserCorsMiddleware } from './browserCors';
export { originAllowlistMiddleware } from './originAllowlist';

/** Najpierw CORS (nagłówki + preflight), potem opcjonalna blokada originów. */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  browserCorsMiddleware(req, res, (err?: unknown) => {
    if (err) return next(err);
    originAllowlistMiddleware(req, res, next);
  });
}
