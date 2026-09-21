import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorProfile extends Document {
  userId: mongoose.Types.ObjectId;
  medicalRegNumber: string;
  hospitalName: string;
  specialization: string;
  yearsOfExperience: number;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  bio?: string;
  assignedPatients: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const DoctorProfileSchema = new Schema<IDoctorProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    medicalRegNumber: { type: String, required: true, trim: true },
    hospitalName: { type: String, required: true, trim: true },
    specialization: { type: String, default: 'Cardiologist', trim: true },
    yearsOfExperience: { type: Number, required: true, default: 5 },
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    bio: { type: String },
    assignedPatients: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

export const DoctorProfile = mongoose.model<IDoctorProfile>('DoctorProfile', DoctorProfileSchema);

