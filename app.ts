const express = require('express')
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session)
const cors = require('cors')
const cookieParser = require('cookie-parser')
const sessionMiddleware = require('./middlewares/sessionsMiddleware.ts')
const adminMiddleware = require('./middlewares/adminMiddleware.ts')
const authController = require('./controllers/authController.ts')
const postsController = require('./controllers/postsController.ts')

const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(
  cors({
    // origin: 'https://localhost:9000',
    origin: 'http://localhost:9000',
    credentials: true,
  }),
)

app.use(
  // secure: true,
  // sameSite: 'None',
  session({
    store: new SQLiteStore({ db: 'database.db', dir: './' }),
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

app.post('/login', authController.login);
app.get('/check-admin', authController.checkAdmin);

app.get('/posts', postsController.getAllPosts);
app.post('/posts', adminMiddleware, postsController.addPost);
app.delete('/posts/:id', adminMiddleware, postsController.deletePost);

module.exports = app
