import mongoose, { Schema, Document } from 'mongoose';

export interface IPrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
}

export interface IPrescriptionUpload extends Document {
  patientId: mongoose.Types.ObjectId;
  fileUrl: string;
  storagePath: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  doctorName?: string;
  hospitalName?: string;
  prescriptionDate?: Date;
  medications: IPrescriptionMedication[];
  recognizedText?: string;
  extractionNote?: string;
  status: 'pending_review' | 'confirmed';
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PrescriptionUploadSchema = new Schema<IPrescriptionUpload>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fileUrl: { type: String, required: true },
    storagePath: { type: String, required: true, select: false },
    originalFileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    doctorName: { type: String, trim: true },
    hospitalName: { type: String, trim: true },
    prescriptionDate: { type: Date },
    medications: [
      {
        name: { type: String, required: true, trim: true },
        dosage: { type: String, trim: true, default: '' },
        frequency: { type: String, trim: true, default: '' },
        duration: { type: String, trim: true },
      },
    ],
    recognizedText: { type: String, trim: true },
    extractionNote: { type: String },
    status: { type: String, enum: ['pending_review', 'confirmed'], default: 'pending_review' },
    confirmedAt: { type: Date },
  },
  { timestamps: true }
);

export const PrescriptionUpload = mongoose.model<IPrescriptionUpload>('PrescriptionUpload', PrescriptionUploadSchema);