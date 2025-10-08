import http from 'http';
import https from 'https';
import fs from 'fs';
import { webSocketManager } from './webSocketManager';
import { app } from 'app';

let server;

export function startServer(useHttps: boolean) {
  if (server) {

    webSocketManager.reset();

    server.close(() => {
      console.log('Poprzedni serwer zatrzymany.');
      launchNewServer(useHttps);
    });
  } else {
    launchNewServer(useHttps);
  }
}

function launchNewServer(useHttps: boolean) {
  if (useHttps) {

    let options;

    try {
        options = {
            key: fs.readFileSync('../certs/server.key'),
            cert: fs.readFileSync('../certs/server.cert'),
        };

    } catch (error) {
        console.error('Błąd podczas wczytywania plików certyfikatu lub klucza:', error);
        throw error;
    }

    server = https.createServer(options, app);

    server.listen(5000, () => {
      console.log('Serwer działa na https://localhost:5000 / backend.wa.local');
    });
  } else {
    server = http.createServer(app);

    server.listen(5000, () => {
      console.log('Serwer działa na http://localhost:5000 / backend.wa.local');
    });
  }

  webSocketManager.init(server);
}
