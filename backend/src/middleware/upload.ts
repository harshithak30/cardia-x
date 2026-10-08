import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const privatePrescriptionDir = path.join(process.cwd(), 'private_uploads', 'prescriptions');
if (!fs.existsSync(privatePrescriptionDir)) {
  fs.mkdirSync(privatePrescriptionDir, { recursive: true });
}

const prescriptionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, privatePrescriptionDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `prescription-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|dicom|txt|csv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error('Invalid file format. Only PDF, JPEG, PNG, CSV, and TXT files are supported.'));
  },
});

export const uploadPrescription = multer({
  storage: prescriptionStorage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF, JPEG, and PNG prescription scans are supported.'));
  },
});

