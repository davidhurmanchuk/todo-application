import fs from 'fs';
import path from 'path';
import { initDb } from './db/database';
import { createApp } from './app';

const PORT = process.env.PORT || 4000;

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

initDb().then(() => {
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to init DB:', err);
  process.exit(1);
});
