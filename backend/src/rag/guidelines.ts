export interface IGuidelineDocument {
  id: string;
  organization: 'ACC/AHA' | 'ESC' | 'HFSA' | 'ADA' | 'KDIGO' | 'Source document' | 'CARDIA-X medication dataset';
  title: string;
  topic: string;
  keywords: string[];
  recommendationText: string;
  levelOfEvidence: string;
  actionableSummary: string;
  sourceType?: 'guideline' | 'source_document' | 'reference_dataset';
  source?: string;
  sourcePage?: number;
}

export const CARDIOVASCULAR_GUIDELINES: IGuidelineDocument[] = [
  {
    id: 'GUIDE-ACS-001',
    organization: 'ACC/AHA',
    title: '2023 ACC/AHA Guideline for the Management of Patients with NSTE-ACS',
    topic: 'Acute Coronary Syndrome & Chest Pain Biomarkers',
    keywords: ['troponin', 'chest pain', 'nste-acs', 'biomarker', 'ecg', 'ischemia', 'angina'],
    recommendationText: 'In patients presenting with symptoms suggestive of acute coronary syndrome, serial measurement of high-sensitivity cardiac troponin (hs-cTnI or hs-cTnT) at presentation (0h) and 1 to 3 hours later is recommended to rule in or rule out myocardial injury.',
    levelOfEvidence: 'Class I (Level A)',
    actionableSummary: 'Immediate 12-lead ECG within 10 minutes plus serial hs-Troponin drawn at 0h and 1-3h intervals.',
  },
  {
    id: 'GUIDE-HF-002',
    organization: 'ACC/AHA',
    title: '2022 AHA/ACC/HFSA Guideline for the Management of Heart Failure',
    topic: 'Guideline-Directed Medical Therapy (GDMT) 4 Pillars',
    keywords: ['heart failure', 'gdmt', 'arni', 'entresto', 'beta blocker', 'sglt2', 'spironolactone', 'bnp', 'ejection fraction'],
    recommendationText: 'In patients with HFrEF (LVEF <= 40%), GDMT comprising 4 medication classes: ARNI (Sacubitril/Valsartan), Beta-blocker (Metoprolol Succinate, Carvedilol, or Bisoprolol), MRA (Spironolactone/Eplerenone), and SGLT2 inhibitor (Dapagliflozin/Empagliflozin) is recommended to reduce cardiovascular mortality and heart failure hospitalizations.',
    levelOfEvidence: 'Class I (Level A)',
    actionableSummary: 'Titrate 4-pillar GDMT to target doses while monitoring blood pressure, serum creatinine, and potassium.',
  },
  {
    id: 'GUIDE-HTN-003',
    organization: 'ESC',
    title: '2024 ESC Guidelines for the Management of Elevated Blood Pressure and Hypertension',
    topic: 'Hypertension Management Targets & Combination Therapy',
    keywords: ['hypertension', 'blood pressure', 'systolic', 'diastolic', 'ramipril', 'amlodipine', 'lisinopril', 'target bp'],
    recommendationText: 'In adult patients receiving antihypertensive therapy, treatment to a systolic BP target range of 120-129 mmHg is recommended if well tolerated. Initial therapy with a 2-drug combination (ACEi or ARB + DHP-CCB or thiazide/thiazide-like diuretic) preferably in a single-pill combination is recommended.',
    levelOfEvidence: 'Class I (Level A)',
    actionableSummary: 'Strive for BP < 130/80 mmHg; initiate single-pill dual combination for stage 2 hypertension.',
  },
  {
    id: 'GUIDE-LIPID-004',
    organization: 'ACC/AHA',
    title: '2023 ACC/AHA Multisociety Guideline on the Management of Blood Cholesterol',
    topic: 'Lipid Lowering & Statin Optimization for Atherosclerotic Cardiovascular Disease (ASCVD)',
    keywords: ['cholesterol', 'ldl', 'statin', 'atorvastatin', 'rosuvastatin', 'ezetimibe', 'pcsk9', 'ascvd', 'lipid profile'],
    recommendationText: 'In patients with clinical ASCVD or very high cardiovascular risk, high-intensity statin therapy (Atorvastatin 40-80mg or Rosuvastatin 20-40mg) aiming for a >= 50% reduction in LDL-C and target LDL-C < 55 mg/dL (< 1.4 mmol/L) is strongly recommended.',
    levelOfEvidence: 'Class I (Level A)',
    actionableSummary: 'High-intensity statin; if LDL-C remains >= 55 mg/dL on maximum tolerated statin, add Ezetimibe 10mg.',
  },
  {
    id: 'GUIDE-AFIB-005',
    organization: 'ACC/AHA',
    title: '2023 ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation',
    topic: 'Atrial Fibrillation Anticoagulation & Holter Monitoring',
    keywords: ['atrial fibrillation', 'afib', 'anticoagulation', 'apixaban', 'eliquis', 'rivaroxaban', 'cha2ds2-vasc', 'holter', 'palpitations'],
    recommendationText: 'For patients with AF and an elevated risk of stroke (CHA2DS2-VASc score >= 2 in men, >= 3 in women), oral anticoagulation with Direct Oral Anticoagulants (DOACs: Apixaban, Rivaroxaban, Dabigatran, Edoxaban) is recommended over Warfarin.',
    levelOfEvidence: 'Class I (Level A)',
    actionableSummary: 'Calculate stroke risk score; initiate DOAC for indicated scores; order Holter if intermittent palpitations.',
  },
  {
    id: 'GUIDE-ECHO-006',
    organization: 'ACC/AHA',
    title: '2020 ACC/AHA Guideline for the Management of Patients with Valvular Heart Disease',
    topic: 'Echocardiography Surveillance & Valvular Assessment',
    keywords: ['echocardiography', 'echo', 'ejection fraction', 'aortic stenosis', 'mitral regurgitation', 'valve', 'murmur'],
    recommendationText: 'Transthoracic echocardiography (TTE) is recommended for initial evaluation of patients with known or suspected valvular heart disease to confirm diagnosis, assess severity, and determine baseline LV size and systolic function.',
    levelOfEvidence: 'Class I (Level B)',
    actionableSummary: 'Periodic TTE every 1-2 years for moderate valve disease, and annually or upon clinical change for severe disease.',
  },
  {
    id: 'GUIDE-ECG-007',
    organization: 'ESC',
    title: '2023 ESC Consensus on Standardization of ECG Interpretation and Long QT Evaluation',
    topic: 'Longitudinal ECG Interval Comparison & Arrhythmia Risk',
    keywords: ['ecg', 'qt interval', 'qtc', 'pr interval', 'qrs duration', 'arrhythmia', 'st elevation', 't wave'],
    recommendationText: 'Bazett-corrected QT interval (QTc) > 460ms in women and > 450ms in men indicates prolonged repolarization, with QTc > 500ms carrying elevated Torsades de Pointes risk. Serial comparison against prior baseline ECG is mandatory when initiating QT-prolonging or antiarrhythmic medications.',
    levelOfEvidence: 'Class I (Level B)',
    actionableSummary: 'Compare current QTc and ST segments to baseline ECG; flag any delta > 30ms or new ST deviation.',
  }
];

