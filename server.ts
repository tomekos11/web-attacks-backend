import { initDb } from "./config/db.js"
import { webSocketManager } from "./services/webSocketManager.js"
import http from 'http'
import { app } from './app.js'
// import fs from 'fs'

// const http = require('http')
// const app = require('./app.ts')
// const fs = require('fs')

// const server = https.createServer({
//     key: fs.readFileSync('./cert/key.pem'),
//     cert: fs.readFileSync('./cert/cert.pem')
// }, app)

const server = http.createServer(app)

const start = async () => {
  initDb().then((db) => {
    console.log('Baza danych została zainicjowana!', db);
  }).catch((err) => {
    console.error('Błąd podczas inicjalizacji bazy danych:', err);
  });

  server.listen(5000, () => {
    console.log('Serwer działa na http://localhost:5000')
  })

  webSocketManager.init(server);
}

start()
