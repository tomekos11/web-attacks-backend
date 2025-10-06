import { initDb } from "./config/db.js"
import { webSocketManager } from "./services/webSocketManager.js"
import http from 'http'
import { app } from './app.js'
import { initEnabled } from "controllers/securityController.js"

const server = http.createServer(app)

const start = async () => {
  initDb().then((db) => {
    console.log('Baza danych została zainicjowana!', db)
  }).catch((err) => {
    console.error('Błąd podczas inicjalizacji bazy danych:', err);
  });

  await initEnabled();

  server.listen(5000, () => {
    console.log('Serwer działa na http://localhost:5000 (backend.wa.local)')
  })

  webSocketManager.init(server);
}

start()
