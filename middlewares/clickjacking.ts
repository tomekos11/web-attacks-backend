import type { Request, Response, NextFunction } from 'express';
import {
  cspFrameAncestorsSecurityEnabled,
  xFrameOptionsSecurityEnabled,
} from 'controllers/securityController';

export function clickjackingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (xFrameOptionsSecurityEnabled) {
    res.setHeader('X-Frame-Options', 'DENY');
  }

  if (cspFrameAncestorsSecurityEnabled) {
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  }

  next();
}
