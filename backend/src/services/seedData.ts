import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { PatientProfile, createPatientNumber } from '../models/PatientProfile.js';

const adminEmail = 'harshithakothapalli789@gmail.com';

export const ensurePatientNumbers = async () => {
  const profiles = await PatientProfile.find({
    $or: [{ patientNumber: { $exists: false } }, { patientNumber: null }, { patientNumber: '' }],
  });

  for (const profile of profiles) {
    let patientNumber: string;
    do {
      patientNumber = createPatientNumber();
    } while (await PatientProfile.exists({ patientNumber }));

    await PatientProfile.collection.updateOne(
      { _id: profile._id, $or: [{ patientNumber: { $exists: false } }, { patientNumber: null }, { patientNumber: '' }] },
      { $set: { patientNumber } }
    );
  }
};

export const seedDatabase = async () => {
  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return;
  }

  const passwordHash = await bcrypt.hash('@Something78901', 10);

  await User.create({
    fullName: 'Harshitha',
    email: adminEmail,
    passwordHash,
    role: 'admin',
  });
};
