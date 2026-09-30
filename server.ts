import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { getOrCreateUser, getUserByUid } from './src/db/users.ts';
import { getAllOrders, createOrder, updateOrderEscrow, updateOrderRating } from './src/db/orders.ts';
import { getProduceItems, getFarmClusters, seedDefaultData } from './src/db/produce.ts';
import { backendRouter, paymentController } from './src/backend/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Initialize Gemini SDK on server for Live API (gemini-3.8-live)
  const liveAi = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Attach WebSocket server for real-time Live API voice conversation
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs: WebSocket) => {
    let session: any = null;
    try {
      session = await liveAi.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction:
            'You are FarmDirect Live Voice Copilot, an AI voice assistant for conscious consumers, farmers, and cold-chain drivers. Speak concisely, clearly, and warmly about organic produce harvests, cold-chain temperature safety (<4°C), direct farmer escrow releases, and healthy farm recipes.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audio && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ audio }));
            }
            if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify({ interrupted: true }));
            }
          },
          onclose: () => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.close();
            }
          },
        },
      });

      clientWs.on('message', (data) => {
        try {
          const msg = JSON.parse(data.toString());
          if (msg.audio && session) {
            session.sendRealtimeInput({
              audio: { data: msg.audio, mimeType: 'audio/pcm;rate=16000' },
            });
          } else if (msg.text && session) {
            session.send({
              clientContent: {
                turns: [{ role: 'user', parts: [{ text: msg.text }] }],
                turnComplete: true,
              },
            });
          }
        } catch (err) {
          console.error('Error processing live audio input:', err);
        }
      });
    } catch (err: any) {
      console.error('Error connecting to Gemini Live API:', err);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ error: err?.message || 'Live API connection error' }));
      }
    }
  });

  // Seed default items and clusters if PostgreSQL is configured
  if (process.env.SQL_HOST) {
    seedDefaultData().catch((err) => console.error('Initial DB seeding check error:', err));
  }

  // --- API Endpoints ---

  // Auth synchronization route
  app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || `${uid}@farmdirect.internal`;
      const { name, photoUrl } = req.body;

      const user = await getOrCreateUser(uid, email, name, photoUrl);
      res.json({ success: true, user });
    } catch (error: any) {
      console.error('Error syncing auth user:', error);
      res.status(500).json({ error: 'Failed to sync user profile' });
    }
  });

  // Current authenticated user profile
  app.get('/api/auth/me', requireAuth, async (req: AuthRequest, res) => {
    try {
      const user = await getUserByUid(req.user!.uid);
      res.json({ user });
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  // Produce catalog
  app.get('/api/produce', async (_req, res) => {
    try {
      const items = await getProduceItems();
      res.json(items);
    } catch (error: any) {
      console.error('Error fetching produce:', error);
      res.status(500).json({ error: 'Failed to fetch produce lots' });
    }
  });

  // Regional Farm Clusters
  app.get('/api/clusters', async (_req, res) => {
    try {
      const clusters = await getFarmClusters();
      res.json(clusters);
    } catch (error: any) {
      console.error('Error fetching clusters:', error);
      res.status(500).json({ error: 'Failed to fetch clusters' });
    }
  });

  // Orders list
  app.get('/api/orders', async (_req, res) => {
    try {
      const orders = await getAllOrders();
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Create Order
  app.post('/api/orders', async (req, res) => {
    try {
      const newOrder = req.body;
      const saved = await createOrder(newOrder);
      res.status(201).json(saved);
    } catch (error: any) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  // Release Escrow
  app.post('/api/orders/:id/release-escrow', async (req, res) => {
    try {
      const { id } = req.params;
      await updateOrderEscrow(id, 'Inspected & Released');
      res.json({ success: true, orderId: id, escrowStatus: 'Inspected & Released' });
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      res.status(500).json({ error: 'Failed to release escrow' });
    }
  });

  // Rate Order
  app.post('/api/orders/:id/rate', async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      await updateOrderRating(id, Number(rating), comment);
      res.json({ success: true, orderId: id, rating });
    } catch (error: any) {
      console.error('Error rating order:', error);
      res.status(500).json({ error: 'Failed to record rating' });
    }
  });

  // Razorpay Standard Checkout Endpoints
  app.post('/api/create-order', paymentController.createOrder);
  app.post('/api/verify-payment', paymentController.verifyPayment);
  app.post('/api/generate-test-signature', paymentController.generateTestSignature);

  // Mount modular backend router for cold-chain telemetry and role panels
  app.use('/api', backendRouter);

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
