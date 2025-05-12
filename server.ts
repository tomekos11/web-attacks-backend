import { initDb } from "./config/db.js"
import { webSocketManager } from "./services/webSocketManager.js"
import http from 'http'
import { app } from './app.js'

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
