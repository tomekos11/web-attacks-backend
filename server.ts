import { initDb } from "./config/db.js"
import { httpsEnabled, initEnabled } from "controllers/securityController.js"
import { startServer } from "services/server.js";

const start = async () => {
  initDb().then((db) => {
    console.log('Baza danych została zainicjowana!', db)
  }).catch((err) => {
    console.error('Błąd podczas inicjalizacji bazy danych:', err);
  });

  await initEnabled();

  startServer(httpsEnabled);
}

start()
