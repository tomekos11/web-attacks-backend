import cors from 'cors';
import type { Request, Response, NextFunction } from 'express';
import { corsSecurityEnabled } from 'controllers/securityController';
import { allowedOrigins } from './allowedOrigins';

/** Włączone: tylko originy z listy (standard CORS w przeglądarce). */
const strictCorsHandler = cors({
  origin: allowedOrigins,
  credentials: true,
});

/**
 * Wyłączone w panelu: nagłówki CORS dla każdego originu (tryb demo — „brak restrykcji”).
 * Wcześniej middleware było pomijane → brak Allow-Origin także dla frontend.wa.local.
 */
const permissiveCorsHandler = cors({
  origin: true,
  credentials: true,
});

export function browserCorsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const handler = corsSecurityEnabled ? strictCorsHandler : permissiveCorsHandler;
  return handler(req, res, next);
}
