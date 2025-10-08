import cors from 'cors';

const allowedOrigins = [
  'http://localhost:9000',
  'http://localhost:9100',
  'http://localhost:9500',

  // 'http://192.168.0.204:9000',
  // 'http://192.168.0.204:9100',
  // 'http://192.168.0.204:9500',

  'http://frontend.wa.local',
];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    return callback(null, true);
    if(!origin) {
      callback(new Error('Zapytanie bez originu'));
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin nie jest dozwolony przez CORS - ${origin}`));
    }
  },
  credentials: true,
});