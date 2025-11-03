import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';

const setupWebSocket = (server) => {
  const wss = new WebSocketServer({ server, path: '/ws/notifications' });
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    // Extract token from query parameters
    const token = req.url.split('token=')[1]?.split('&')[0];
    
    if (!token) {
      console.log('WebSocket connection rejected: No token provided');
      return ws.close(1008, 'Authentication required');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;

      // Store the connection
      clients.set(userId, ws);
      console.log(`WebSocket client connected: ${userId}`);

      // Handle incoming messages
      ws.on('message', (message) => {
        console.log(`Received message from ${userId}:`, message.toString());
        // Handle any incoming messages if needed
      });

      // Handle disconnection
      ws.on('close', () => {
        clients.delete(userId);
        console.log(`WebSocket client disconnected: ${userId}`);
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error(`WebSocket error for user ${userId}:`, error);
      });

    } catch (error) {
      console.error('WebSocket authentication error:', error.message);
      ws.close(1008, 'Invalid token');
    }
  });

  // Function to send notification to a specific user
  const sendNotification = (userId, notification) => {
    const client = clients.get(userId.toString());
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        client.send(JSON.stringify({
          type: 'NEW_NOTIFICATION',
          notification
        }));
        console.log(`Notification sent to user ${userId}`);
        return true;
      } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        return false;
      }
    }
    console.log(`User ${userId} is not connected via WebSocket`);
    return false;
  };

  // Function to broadcast to all connected clients
  const broadcast = (data) => {
    let sentCount = 0;
    clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(JSON.stringify(data));
          sentCount++;
        } catch (error) {
          console.error(`Error broadcasting to user ${userId}:`, error);
        }
      }
    });
    console.log(`Broadcast sent to ${sentCount} clients`);
    return sentCount;
  };

  return { wss, sendNotification, broadcast };
};

export default setupWebSocket;
