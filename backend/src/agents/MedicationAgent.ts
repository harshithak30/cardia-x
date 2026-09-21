import { IMedication } from '../models/Medication.js';

export interface IDrugInteractionCheck {
  hasInteraction: boolean;
  severity: 'None' | 'Moderate' | 'Severe';
  description: string;
  interactingDrugs: string[];
}

export class MedicationAgent {
  private knownInteractions: Array<{ drugs: string[]; severity: 'Moderate' | 'Severe'; message: string }> = [
    {
      drugs: ['metoprolol', 'diltiazem'],
      severity: 'Severe',
      message: 'Concurrent beta-blocker (Metoprolol) and non-DHP calcium channel blocker (Diltiazem) increases risk of severe bradycardia and AV block.',
    },
    {
      drugs: ['lisinopril', 'spironolactone'],
      severity: 'Moderate',
      message: 'ACE inhibitor and Aldosterone antagonist combination increases risk of hyperkalemia. Monitor serum potassium.',
    },
    {
      drugs: ['atorvastatin', 'clarithromycin'],
      severity: 'Severe',
      message: 'Strong CYP3A4 inhibitor increases statin blood concentrations and risk of rhabdomyolysis/myopathy.',
    },
    {
      drugs: ['warfarin', 'aspirin'],
      severity: 'Moderate',
      message: 'Dual antithrombotic therapy significantly increases major bleeding risk. Requires explicit clinical indication.',
    },
    {
      drugs: ['clopidogrel', 'omeprazole'],
      severity: 'Moderate',
      message: 'Omeprazole may competitively inhibit CYP2C19, attenuating Clopidogrel antiplatelet efficacy. Consider Pantoprazole.',
    },
  ];

  public checkInteractions(medications: string[]): IDrugInteractionCheck[] {
    const results: IDrugInteractionCheck[] = [];
    const normalized = medications.map((m) => m.toLowerCase());

    for (const rule of this.knownInteractions) {
      const match = rule.drugs.filter((d) => normalized.some((name) => name.includes(d)));
      if (match.length >= 2) {
        results.push({
          hasInteraction: true,
          severity: rule.severity,
          description: rule.message,
          interactingDrugs: match,
        });
      }
    }

    return results;
  }

  public detectDuplicates(existingMeds: IMedication[], newMedName: string): string | null {
    const nameLower = newMedName.toLowerCase();
    
    // Class groupings
    const statins = ['atorvastatin', 'rosuvastatin', 'simvastatin', 'pravastatin'];
    const betaBlockers = ['metoprolol', 'carvedilol', 'bisoprolol', 'atenolol', 'nebivolol'];
    const aceiArbs = ['lisinopril', 'ramipril', 'losartan', 'valsartan', 'telmisartan', 'enalapril'];
    const sglt2i = ['empagliflozin', 'dapagliflozin', 'canagliflozin'];

    const checkClass = (group: string[], groupName: string) => {
      const isNewInGroup = group.some((g) => nameLower.includes(g));
      if (!isNewInGroup) return null;
      const existingMatch = existingMeds.find((m) => group.some((g) => m.name.toLowerCase().includes(g)));
      if (existingMatch) {
        return `Potential duplicate drug class (${groupName}): Patient is already taking "${existingMatch.name}". Adding "${newMedName}" may cause duplicate therapy.`;
      }
      return null;
    };

    return (
      checkClass(statins, 'Statin / HMG-CoA Reductase Inhibitor') ||
      checkClass(betaBlockers, 'Beta-Adrenergic Blocker') ||
      checkClass(aceiArbs, 'Renin-Angiotensin System Inhibitor (ACEi / ARB)') ||
      checkClass(sglt2i, 'SGLT2 Inhibitor')
    );
  }

  public calculateAdherence(logs: Array<{ status: string }>): number {
    if (!logs || logs.length === 0) return 100;
    const taken = logs.filter((l) => l.status === 'taken').length;
    const total = logs.filter((l) => l.status === 'taken' || l.status === 'missed').length;
    if (total === 0) return 100;
    return Math.round((taken / total) * 100);
  }
}

export const medicationAgentInstance = new MedicationAgent();

