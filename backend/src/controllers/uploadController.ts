import { Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { AuthRequest } from '../middleware/auth.js';
import { careOrchestratorInstance } from '../agents/CareOrchestrator.js';
import { documentAgentInstance } from '../agents/DocumentAgent.js';
import { PrescriptionUpload } from '../models/PrescriptionUpload.js';

export const uploadReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const patientId = new mongoose.Types.ObjectId(req.user!.userId);
    const { originalname, mimetype, size, path: filePath, filename } = req.file;

    // Extract PDF text before classification so ECG files do not depend on their filename.
    let rawText = '';
    try {
      if (mimetype === 'application/pdf') {
        const parser = new PDFParse({ data: fs.readFileSync(filePath) });
        try {
          const result = await parser.getText();
          rawText = result.text;
        } finally {
          await parser.destroy();
        }
      } else if (mimetype.includes('text') || mimetype.includes('csv')) {
        rawText = fs.readFileSync(filePath, 'utf-8');
      } else {
        rawText = `Document: ${originalname}, Size: ${size} bytes, Type: ${mimetype}`;
      }
    } catch (e) {
      rawText = `Document: ${originalname}`;
    }

    const fileUrl = `/uploads/${filename}`;

    const result = await careOrchestratorInstance.handleNewReportUploaded(
      patientId,
      rawText,
      mimetype,
      originalname,
      fileUrl,
      size
    );

    res.status(201).json({
      success: true,
      message: 'Medical report uploaded and analyzed successfully.',
      report: result.report,
      ecg: result.createdEcg,
      riskAssessment: result.riskAssessment,
      investigationsNeeded: result.investigationsNeeded,
      workflowId: result.workflowId,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadHistoricalPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  let uploadedPath: string | undefined;
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Select a prescription image or PDF first.' });
      return;
    }

    const { originalname, mimetype, size, path: filePath } = req.file;
    uploadedPath = filePath;
    const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(mimetype)) {
      fs.unlinkSync(filePath);
      res.status(400).json({ success: false, message: 'Upload a PDF, JPG, or PNG prescription.' });
      return;
    }

    let extractedText = '';
    if (mimetype === 'application/pdf') {
      const parser = new PDFParse({ data: fs.readFileSync(filePath) });
      try {
        extractedText = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    }

    const extraction = await documentAgentInstance.extractHistoricalPrescription(
      filePath,
      mimetype,
      originalname,
      extractedText
    );
    const validDate = extraction.prescriptionDate && !Number.isNaN(Date.parse(extraction.prescriptionDate))
      ? new Date(extraction.prescriptionDate)
      : undefined;

    const prescriptionId = new mongoose.Types.ObjectId();
    const prescription = await PrescriptionUpload.create({
      _id: prescriptionId,
      patientId: new mongoose.Types.ObjectId(req.user!.userId),
      fileUrl: `/api/patient/prescriptions/${prescriptionId}/file`,
      storagePath: filePath,
      originalFileName: originalname,
      fileType: mimetype,
      fileSize: size,
      doctorName: extraction.doctorName,
      hospitalName: extraction.hospitalName,
      prescriptionDate: validDate,
      medications: extraction.medications,
      recognizedText: extraction.recognizedText,
      extractionNote: extraction.extractionNote,
      status: 'pending_review',
    });

    const responsePrescription = prescription.toObject() as unknown as Record<string, unknown>;
    delete responsePrescription.storagePath;
    res.status(201).json({ success: true, prescription: responsePrescription });
  } catch (error: any) {
    if (uploadedPath && fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
    res.status(500).json({ success: false, message: error.message || 'Could not process prescription upload.' });
  }
};

export const getHistoricalPrescriptionFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await PrescriptionUpload.findOne({
      _id: req.params.prescriptionId,
      patientId: req.user!.userId,
    }).select('+storagePath');
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription file not found.' });
      return;
    }
    res.type(prescription.fileType);
    res.sendFile(prescription.storagePath);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not open prescription file.' });
  }
};

export const getHistoricalPrescriptions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescriptions = await PrescriptionUpload.find({ patientId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const retryHistoricalPrescriptionOcr = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await PrescriptionUpload.findOne({
      _id: req.params.prescriptionId,
      patientId: req.user!.userId,
      status: 'pending_review',
    }).select('+storagePath');
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Pending prescription upload not found.' });
      return;
    }

    let extractedText = '';
    if (prescription.fileType === 'application/pdf') {
      const parser = new PDFParse({ data: fs.readFileSync(prescription.storagePath) });
      try {
        extractedText = (await parser.getText()).text;
      } finally {
        await parser.destroy();
      }
    }

    const extraction = await documentAgentInstance.extractHistoricalPrescription(
      prescription.storagePath,
      prescription.fileType,
      prescription.originalFileName,
      extractedText
    );
    prescription.doctorName = extraction.doctorName;
    prescription.hospitalName = extraction.hospitalName;
    prescription.prescriptionDate = extraction.prescriptionDate && !Number.isNaN(Date.parse(extraction.prescriptionDate))
      ? new Date(extraction.prescriptionDate)
      : undefined;
    prescription.medications = extraction.medications;
    prescription.recognizedText = extraction.recognizedText;
    prescription.extractionNote = extraction.extractionNote;
    await prescription.save();

    const responsePrescription = prescription.toObject() as unknown as Record<string, unknown>;
    delete responsePrescription.storagePath;
    res.json({ success: true, prescription: responsePrescription });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not retry prescription OCR.' });
  }
};

export const confirmHistoricalPrescription = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const prescription = await PrescriptionUpload.findOne({
      _id: req.params.prescriptionId,
      patientId: req.user!.userId,
    });
    if (!prescription) {
      res.status(404).json({ success: false, message: 'Prescription upload not found.' });
      return;
    }
    if (prescription.status === 'confirmed') {
      res.status(409).json({ success: false, message: 'This prescription has already been confirmed.' });
      return;
    }

    const medications = Array.isArray(req.body.medications) ? req.body.medications : [];
    const reviewed = medications
      .map((med: any) => ({
        name: typeof med.name === 'string' ? med.name.trim() : '',
        dosage: typeof med.dosage === 'string' ? med.dosage.trim() : '',
        frequency: typeof med.frequency === 'string' ? med.frequency.trim() : '',
        duration: typeof med.duration === 'string' ? med.duration.trim() : '',
      }))
      .filter((med: any) => med.name && med.dosage && med.frequency);

    if (reviewed.length === 0) {
      res.status(400).json({ success: false, message: 'Add at least one medication with its name, dosage, and frequency.' });
      return;
    }

    prescription.medications = reviewed;
    prescription.status = 'confirmed';
    prescription.confirmedAt = new Date();
    await prescription.save();

    res.json({ success: true, prescription, message: 'Historical prescription details verified and saved.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Could not confirm prescription details.' });
  }
};
