import { sessionMiddleware } from 'middlewares/sessionsMiddleware'
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express'
import { login, userData } from 'controllers/authController';
import { addPost, deletePost, getAllPosts } from 'controllers/postsController';
import { adminMiddleware } from 'middlewares/adminMiddleware';
import csurf from 'csurf'

import { loginUnsafe } from 'controllers/authController.js';
import { getFile, pingHost } from 'controllers/utilsController.js';
import path from 'path';
import { checkEnabled, csrfEnabled, getSecurities, setSecurities } from 'controllers/securityController.js';


export const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: 'http://localhost:9000',
    credentials: true,
  }),
)

app.use(express.urlencoded({ extended: true }));

const csrfProtection = csurf({
  cookie: true,
  value: (req) => req.headers['x-csrf-token']
});

app.use((req, res, next) => {
  if (csrfEnabled) {
    csrfProtection(req, res, next);
  } else {
    next();
  }
});

app.use(
  // secure: true,
  // sameSite: 'None',
  session({
    store: new connectSqlite3(session)({ db: 'database.db', dir: path.resolve('./') }),
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  }),
)

app.use(sessionMiddleware)

app.post('/login', login);
app.get('/user-data', userData);

app.get('/posts', getAllPosts);
app.post('/posts', addPost);
app.delete('/posts/:id', adminMiddleware, deletePost);

//sql injection
app.post('/login-unsafe', loginUnsafe);

app.get('/ping', pingHost)
app.get('/file', getFile)

app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.get('/security', getSecurities)
app.post('/security', setSecurities)

app.get('/check-enabled', checkEnabled)