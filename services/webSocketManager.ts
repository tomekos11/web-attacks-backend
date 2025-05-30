// const WebSocket = require('ws');
import { WebSocket, WebSocketServer } from 'ws';
import type { Server } from 'http';

class WebSocketManager {

  private wss: WebSocketServer | null = null;

  constructor() {
    this.wss = null;
  }

  init(server: Server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        this.wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });
    });

    console.log('WebSocket został uruchomiony!');
  }

  broadcastNewPost(post) {
    if (!this.wss) {
      console.warn('WebSocket nie został jeszcze zainicjalizowany!');
      return;
    }

    this.wss.clients.forEach((client) => {
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
  }
}

// module.exports = new WebSocketManager();

export const webSocketManager = new WebSocketManager();