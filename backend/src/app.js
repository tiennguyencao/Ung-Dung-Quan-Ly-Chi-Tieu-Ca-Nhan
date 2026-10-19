import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import transactionRoutes from './modules/transactions/transaction.routes.js';
import categoryRoutes from './modules/categories/category.routes.js';
import budgetRoutes from './modules/budgets/budget.routes.js';
import statsRoutes from './modules/stats/stats.routes.js';
import errorHandler from './middleware/errorHandler.middleware.js';
import express5QueryCompatibility from './middleware/express5-query-compat.middleware.js';
import AppError from './utils/AppError.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173',
    credentials: true,
  })
);
// No legitimate request body here exceeds a few hundred bytes (the largest
// field anywhere is a 500-char note) — capping well above that stops an
// oversized payload from being fully buffered into memory before validation
// even runs.
app.use(express.json({ limit: '20kb' }));
// Express 5 makes req.query a getter; this compatibility bridge lets the
// installed express-mongo-sanitize 2.2.0 replace it with sanitized data.
app.use(express5QueryCompatibility);
app.use(mongoSanitize()); // strips NoSQL-injection-style operators from req.body/query/params
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// /auth already has its own stricter limiter (20/15min, guarding against
// credential guessing). This one covers every other endpoint, which had no
// ceiling at all — a leaked token could otherwise hit transactions/budgets/
// stats without limit. Production is capped at 300/15min; local development
// uses a higher but still finite cap to avoid throttling ordinary manual QA.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  // Local demo flows revisit pages and fetch multiple summary endpoints. Keep a
  // finite limit in development, but avoid throttling ordinary manual QA.
  // Production remains at 300 requests per 15 minutes.
  limit: process.env.NODE_ENV === 'development' ? 1000 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.', errors: [] },
});
app.use('/api', apiLimiter);

app.get('/health', (req, res) => res.status(200).json({ success: true, data: { status: 'ok' } }));

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/stats', statsRoutes);

app.use((req, res, next) => next(new AppError(`Route ${req.originalUrl} not found`, 404)));

app.use(errorHandler); // must be registered last

export default app;
