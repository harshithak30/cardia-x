import { Request, Response, NextFunction } from 'express';
import { AuditLog } from '../models/AuditLog.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Error Handler]', err);

  // Log to Audit Log if critical
  try {
    AuditLog.create({
      action: 'SYSTEM_ERROR',
      status: 'FAILED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] as string,
      details: {
        path: req.originalUrl,
        method: req.method,
        errorMessage: err.message,
        stack: err.stack?.substring(0, 500),
      },
    }).catch(() => {});
  } catch (logErr) {}

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.toString(),
  });
};

