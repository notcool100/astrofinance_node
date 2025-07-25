import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import prisma from './config/database';
import logger from './config/logger';
import { errorHandler, notFound } from './common/middleware/error.middleware';

// Import routes
import adminRoutes from './modules/admin/routes';
import userRoutes from './modules/user/routes';
import usersRoutes from './modules/user/routes/users.routes'; // Import the new users routes
import accountsRoutes from './modules/user/routes/accounts.routes'; // Import the accounts routes
import staffRoutes from './modules/staff/routes';
import officeRoutes from './modules/office/routes';
import loanRoutes from './modules/loan/routes';
import accountingRoutes from './modules/accounting/routes';
import expenseRoutes from './modules/expense/routes';
import taxRoutes from './modules/tax/routes';
import notificationRoutes from './modules/notification/routes';
import reportRoutes from './modules/report/routes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
const corsOptions = process.env.NODE_ENV === 'production' 
  ? {
      origin: 'http://62.171.175.112:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true
    }
  : {};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to AstroFinance API' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', usersRoutes); // Add the new users route
app.use('/api/accounts', accountsRoutes); // Add the accounts route
app.use('/api/staff', staffRoutes);
app.use('/api/office', officeRoutes); // New unified office routes
app.use('/api/loan', loanRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/expense', expenseRoutes);
app.use('/api/tax', taxRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/report', reportRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Handle shutdown gracefully
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from database');
  process.exit(0);
});

export default app;