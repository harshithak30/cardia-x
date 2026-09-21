import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorNote extends Document {
  doctorId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  noteDate: Date;
  title: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  clinicalImpressions: string[];
  followUpDate?: Date;
  sharedWithPatient: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorNoteSchema = new Schema<IDoctorNote>(
  {
    doctorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    noteDate: { type: Date, default: Date.now },
    title: { type: String, default: 'Cardiology Progress Note' },
    soap: {
      subjective: { type: String, default: '' },
      objective: { type: String, default: '' },
      assessment: { type: String, default: '' },
      plan: { type: String, default: '' },
    },
    clinicalImpressions: { type: [String], default: [] },
    followUpDate: { type: Date },
    sharedWithPatient: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const DoctorNote = mongoose.model<IDoctorNote>('DoctorNote', DoctorNoteSchema);

