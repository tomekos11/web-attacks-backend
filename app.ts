// const express = require('express')
// const session = require('express-session')
// const SQLiteStore = require('connect-sqlite3')(session)
// const cors = require('cors')
// const cookieParser = require('cookie-parser')
// const sessionMiddleware = require('./middlewares/sessionsMiddleware.ts')
// const adminMiddleware = require('./middlewares/adminMiddleware.ts')
// const authController = require('./controllers/authController.ts')
// const postsController = require('./controllers/postsController.ts')

import { sessionMiddleware } from 'middlewares/sessionsMiddleware'
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express'
import { login, userData } from 'controllers/authController';
import { addPost, deletePost, getAllPosts } from 'controllers/postsController';
import { adminMiddleware } from 'middlewares/adminMiddleware';

import { loginUnsafe } from 'controllers/authController.js';


export const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    origin: 'http://localhost:9000',
    // origin: ['http://localhost:9000', 'http://localhost:3000'],
    credentials: true,
  }),
)

app.use(express.urlencoded({ extended: true }));

app.use(
  // secure: true,
  // sameSite: 'None',
  session({
    store: new connectSqlite3(session)({ db: 'database.db', dir: './' }),
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