const WebSocket = require('ws');

// Funkcja inicjalizująca WebSocket
const setupWebSocket = (server) => {
  // Inicjalizacja serwera WebSocket
  const wss = new WebSocket.Server({ server });

  // Funkcja do broadcastowania nowych postów
  const broadcastNewPost = (post) => {
    // Wysyłanie wiadomości do wszystkich połączonych klientów
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: 'post_added',
            message: 'Nowy post został dodany!',
            post: post,
          })
        );
      }
    });
  };

  // Obsługa połączenia z WebSocket
  wss.on('connection', (ws) => {

    // Nasłuch na wiadomości z klienta
    ws.on('message', (message) => {

      // Emitowanie wiadomości do wszystkich połączonych klientów
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
    
  });

  console.log('WebSocket został uruchomiony!');

  // Zwróć wss oraz broadcastNewPost
  return { wss, broadcastNewPost };
};

// Eksportowanie funkcji
module.exports = { setupWebSocket };
