import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { PORT } from './config/constants.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './services/seedData.js';
import { errorHandler } from './middleware/errorHandler.js';
import { indexClinicalDatasets } from './rag/datasetIndexer.js';

import authRoutes from './routes/authRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();

// Middlewares
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
    credentials: true,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure uploads folder exists and serve static
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'CARDIA-X Longitudinal Cardiovascular AI Care Platform',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handler
app.use(errorHandler);

// Start Server
const start = async () => {
  try {
    await connectDB();
    await seedDatabase();
    await indexClinicalDatasets();

    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 CARDIA-X Backend Running on http://localhost:${PORT}`);
      console.log(`🔬 Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`🛡️  Role-Based Access: Patient, Doctor, Admin Portals`);
      console.log(`🤖 Multi-Agent Care Orchestrator & RAG Guidelines Active`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Fatal initialization error:', error);
    process.exit(1);
  }
};

start();

