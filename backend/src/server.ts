import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

import { authRouter } from './routes/auth.routes.js';
import { permitRouter } from './routes/permit.routes.js';
import { catalogRouter } from './routes/catalog.routes.js';
import { errorHandler } from './middlewares/auth.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'SafeWork Backend API is running' });
});

app.use('/api/auth', authRouter);
app.use('/api/permits', permitRouter);
app.use('/api/catalog', catalogRouter);

// Manejador de errores central (debe ir al final)
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});