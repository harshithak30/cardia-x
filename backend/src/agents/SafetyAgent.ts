export interface ISafetyValidationInput {
  actionType: 'medication_adjustment' | 'investigation_order' | 'emergency_alert' | 'routine_notification' | 'general_advice';
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';
  proposedChange: string;
  confidenceScore: number;
}

export interface ISafetyValidationOutput {
  isSafeToExecute: boolean;
  requiresDoctorApproval: boolean;
  safetyTier: 'AUTO_APPROVED' | 'DOCTOR_GATE_REQUIRED' | 'REJECTED_UNSAFE';
  safetyRationale: string;
  auditFlag: boolean;
}

export class SafetyAgent {
  public validateAction(input: ISafetyValidationInput): ISafetyValidationOutput {
    // Hard Rule 1: High Risk & Emergency actions NEVER auto-execute without physician verification
    if (input.riskTier === 'HIGH' || input.riskTier === 'EMERGENCY') {
      return {
        isSafeToExecute: false,
        requiresDoctorApproval: true,
        safetyTier: 'DOCTOR_GATE_REQUIRED',
        safetyRationale: 'CRITICAL SAFETY GUARD: High-risk or emergency actions require direct physician sign-off before changes take clinical effect.',
        auditFlag: true,
      };
    }

    // Hard Rule 2: Medication modifications always require physician oversight
    if (input.actionType === 'medication_adjustment') {
      return {
        isSafeToExecute: false,
        requiresDoctorApproval: true,
        safetyTier: 'DOCTOR_GATE_REQUIRED',
        safetyRationale: 'PHARMACOVIGILANCE GUARD: All dosage alterations and medication additions mandate registered physician authorization.',
        auditFlag: true,
      };
    }

    // Hard Rule 3: Low-confidence outputs (< 0.70) must be reviewed
    if (input.confidenceScore < 0.70) {
      return {
        isSafeToExecute: false,
        requiresDoctorApproval: true,
        safetyTier: 'DOCTOR_GATE_REQUIRED',
        safetyRationale: `CONFIDENCE GUARD: Model confidence (${(input.confidenceScore * 100).toFixed(0)}%) is below the minimum safety threshold (70%). Escalated to clinical staff.`,
        auditFlag: true,
      };
    }

    // Routine low/medium notifications and safe educational guidance can auto-execute
    return {
      isSafeToExecute: true,
      requiresDoctorApproval: false,
      safetyTier: 'AUTO_APPROVED',
      safetyRationale: 'Action is classified as safe, non-invasive, and verified against clinical safety boundaries.',
      auditFlag: false,
    };
  }
}

export const safetyAgentInstance = new SafetyAgent();

