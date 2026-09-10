/** Originy frontendów uprawnione do żądań cross-origin z credentials. */
export const allowedOrigins = [
  // 'http://localhost:3000',
  'http://localhost:9000',
  'http://localhost:9100',
  'http://localhost:9500',

  // 'http://192.168.0.204:9000',
  // 'http://192.168.0.204:9100',
  // 'http://192.168.0.204:9500',

  'https://frontend.wa.local:9100',
  'https://frontend.wa.local',
  'http://frontend.wa.local:9100',
  'http://frontend.wa.local',
];

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}
