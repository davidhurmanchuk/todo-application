import express from 'express';
import cors from 'cors';
import todosRouter from './routes/todos';
import categoriesRouter from './routes/categories';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();

  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/todos', todosRouter);
  app.use('/categories', categoriesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
