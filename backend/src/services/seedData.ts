import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { DoctorProfile } from '../models/DoctorProfile.js';
import { PatientProfile } from '../models/PatientProfile.js';

const adminEmail = 'harshithakothapalli789@gmail.com';

export const seedDatabase = async () => {
  const passwordHash = await bcrypt.hash('@Something78901', 10);

  await DoctorProfile.deleteMany({});
  await User.deleteMany({ role: 'doctor' });
  await PatientProfile.updateMany({}, { $unset: { assignedDoctorId: 1 } });

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    existingAdmin.fullName = 'Harshitha';
    existingAdmin.email = adminEmail;
    existingAdmin.passwordHash = passwordHash;
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    return;
  }

  await User.deleteMany({});

  await User.create({
    fullName: 'Harshitha',
    email: adminEmail,
    passwordHash,
    role: 'admin',
  });
};
