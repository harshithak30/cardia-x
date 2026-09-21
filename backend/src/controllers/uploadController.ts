import { Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { AuthRequest } from '../middleware/auth.js';
import { careOrchestratorInstance } from '../agents/CareOrchestrator.js';

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

