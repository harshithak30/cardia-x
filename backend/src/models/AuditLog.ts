import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  userRole?: 'patient' | 'doctor' | 'admin' | 'system';
  action: string;
  targetResourceId?: string;
  targetResourceType?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    userEmail: { type: String },
    userRole: { type: String, enum: ['patient', 'doctor', 'admin', 'system'], default: 'system' },
    action: { type: String, required: true },
    targetResourceId: { type: String },
    targetResourceType: { type: String },
    ipAddress: { type: String, default: '127.0.0.1' },
    userAgent: { type: String },
    status: { type: String, enum: ['SUCCESS', 'DENIED', 'FAILED'], default: 'SUCCESS' },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

