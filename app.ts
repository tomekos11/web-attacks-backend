import { sessionMiddleware } from 'middlewares/session'
import cookieParser from 'cookie-parser';
import express from 'express'
import { login, userData } from 'controllers/authController';
import { addPost, deletePost, getAllPosts } from 'controllers/postsController';
import { adminMiddleware } from 'middlewares/adminMiddleware';

import { loginUnsafe } from 'controllers/authController';
import { getFile, pingHost, uploadFile } from 'controllers/utilsController';
import { checkEnabledSecurity, getSecurities, setSecurities } from 'controllers/securityController';
import { getPostById } from 'controllers/postsController';
import { corsMiddleware } from 'middlewares/cors';
import { csrfMiddleware, csrfProtectionMiddleware, sendCsrfToken } from 'middlewares/csrf';

export const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(corsMiddleware);

app.use(express.urlencoded({ extended: true }));

app.use(csrfMiddleware);

app.get('/csrf-token', csrfProtectionMiddleware, sendCsrfToken);

app.use(sessionMiddleware)

app.post('/login', login);
app.get('/user-data', userData);

app.get('/posts', getAllPosts);
app.post('/posts', addPost);
app.get('/post', getPostById);
app.delete('/posts/:id', adminMiddleware, deletePost);

//sql injection
app.post('/login-unsafe', loginUnsafe);

app.get('/ping', pingHost)
app.get('/file', getFile)

app.get('/security', getSecurities)
app.post('/security', setSecurities)

app.get('/check-enabled', checkEnabledSecurity)

app.post('/write-file', uploadFile)
