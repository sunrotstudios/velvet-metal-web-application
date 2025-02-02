import { createServer } from 'http';
import { parse } from 'url';
import { WebSocketServer } from 'ws';
import { verifyToken } from '../lib/auth/token';

const server = createServer();
const wss = new WebSocketServer({ server });

const clients = new Map();

wss.on('connection', async (ws, req) => {
  const { query } = parse(req.url!, true);
  const token = query.token as string;

  try {
    const user = await verifyToken(token);
    if (!user) {
      ws.close();
      return;
    }

    clients.set(user.id, ws);

    ws.on('close', () => {
      clients.delete(user.id);
    });
  } catch (error) {
    ws.close();
  }
});

export function notifyUserLibraryUpdate(
  userId: string,
  service: 'spotify' | 'apple-music'
) {
  const ws = clients.get(userId);
  if (ws) {
    ws.send(
      JSON.stringify({
        type: 'library_update',
        service,
        timestamp: new Date().toISOString(),
      })
    );
  }
}

const PORT = process.env.WEBSOCKET_PORT || 8080;
server.listen(PORT, () => {});
