const WebSocket = require('ws');
const logger = require('../utils/logger');

const clients = new Set();

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    clients.add(ws);
    logger.info('New WebSocket client connected');

    ws.on('message', async (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.type === 'player_reported') {
          const { uid, reason, reporter, timestamp } = parsedMessage.data;
          logger.info('WebSocket message received:', {
            type: parsedMessage.type,
            data: parsedMessage.data
          });

          broadcastUpdate('player_reported', {
            uid,
            reason,
            reporter,
            timestamp
          });

          broadcastUpdate('dashboard_update', {});
        }
      } catch (error) {
        logger.error('Error processing WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      logger.info('WebSocket client disconnected');
    });
  });

  return wss;
}

function broadcastUpdate(type, data) {
  const message = JSON.stringify({ type, data });
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

module.exports = {
  setupWebSocket,
  broadcastUpdate
};