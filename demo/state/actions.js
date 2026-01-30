/**
 * STATE MUTATION LAYER
 * The ONLY place allowed to update AppState
 * All functions must call saveState() after mutation
 */

import { AppState, saveState, today } from './state.js';
import { ROLES, ASSESSMENTS, PAYMENT_STATUS, PLAN_STATUS } from './roles.js';

let patientCounter = 2; // for generating patient IDs

/* =============================
   APP LEVEL ACTIONS
============================= */

export function selectRole(role) {
  AppState.app.currentRole = role;
  AppState.app.currentScreen = 'dashboard';
  AppState.app.selectedPatientId = null;
}

export function selectPatient(patientId) {
  if (!AppState.patients[patientId]) {
    console.error(`Patient ${patientId} not found`);
    return;
  }
  AppState.app.selectedPatientId = patientId;
  AppState.app.currentScreen = 'patientDetails';
  saveState();
}

/* =============================
   RECEPTIONIST ACTIONS
============================= */

/**
 * Create a new patient with profile data
 * @param {Object} profileData - { name, age, gender }
 * @returns {string} patientId
 */
export function createPatient(profileData) {
  const id = 'P' + String(patientCounter).padStart(3, '0');
  patientCounter++;

  AppState.patients[id] = {
    profile: {
      id,
      name: profileData.name || 'New Patient',
      age: profileData.age || 30,
      gender: profileData.gender || '-',
      visitDate: today(),
      createdAt: new Date().toISOString()
    },

    assessments: {
      prs: { score: null, completedBy: null, completedAt: null },
      fnon: { score: null, completedBy: null, completedAt: null },
      eeg: { score: null, completedBy: null, completedAt: null },
      brainMapping: { score: null, completedBy: null, completedAt: null }
    },

    payment: {
      status: PAYMENT_STATUS.PENDING,
      paymentDate: null
    },

    consent: {
      status: false,
      consentDate: null
    },

    treatmentPlan: {
      id: null,
      createdBy: null,
      createdAt: null,
      disease: null,
      device: null,
      montage: null,
      sessionsPlanned: 0,
      status: PLAN_STATUS.NOT_CREATED
    },

    sessions: [],
    notes: []
  };

  saveState();
  return id;
}

/**
 * Toggle patient consent
 */
export function toggleConsent(patientId) {
  if (!AppState.patients[patientId]) return;

  const patient = AppState.patients[patientId];
  patient.consent.status = !patient.consent.status;
  if (patient.consent.status) {
    patient.consent.consentDate = new Date().toISOString();
  }
  saveState();
}

/**
 * Toggle patient payment
 */
export function togglePayment(patientId) {
  if (!AppState.patients[patientId]) return;

  const patient = AppState.patients[patientId];
  if (patient.consent.status === false) {
    console.error('Consent required before payment');
    return false;
  }

  const newStatus = patient.payment.status === PAYMENT_STATUS.PENDING
    ? PAYMENT_STATUS.COMPLETED
    : PAYMENT_STATUS.PENDING;

  patient.payment.status = newStatus;
  if (newStatus === PAYMENT_STATUS.COMPLETED) {
    patient.payment.paymentDate = new Date().toISOString();
  }
  saveState();
  return true;
}

/**
 * Set payment to "pay later" mode
 */
export function setPayLater(patientId) {
  if (!AppState.patients[patientId]) return;
  AppState.patients[patientId].payment.status = PAYMENT_STATUS.PAY_LATER;
  saveState();
}

/* =============================
   DOCTOR ACTIONS
============================= */

/**
 * Update an assessment with score and metadata
 */
export function updateAssessment(patientId, assessmentType, data) {
  if (!AppState.patients[patientId]) return;

  const patient = AppState.patients[patientId];
  if (!patient.assessments[assessmentType]) {
    console.error(`Assessment type ${assessmentType} not found`);
    return;
  }

  patient.assessments[assessmentType] = {
    ...patient.assessments[assessmentType],
    ...data,
    completedAt: new Date().toISOString()
  };

  saveState();
}

/**
 * Create or update treatment plan
 */
export function createTreatmentPlan(patientId, planData) {
  if (!AppState.patients[patientId]) return;

  const patient = AppState.patients[patientId];

  patient.treatmentPlan = {
    id: `tp_${Date.now()}`,
    createdBy: ROLES.DOCTOR,
    createdAt: new Date().toISOString(),
    disease: planData.disease || null,
    device: planData.device || null,
    montage: planData.montage || null,
    sessionsPlanned: planData.sessionsPlanned || 6,
    status: PLAN_STATUS.ACTIVE
  };

  saveState();
}

/* =============================
   CLINICAL ASSISTANT ACTIONS
============================= */

/**
 * Perform PRS assessment
 */
export function performPRS(patientId, assistantName = 'assistant') {
  if (!AppState.patients[patientId]) return;

  updateAssessment(patientId, ASSESSMENTS.PRS, {
    score: Math.floor(Math.random() * 40) + 10, // demo: random 10-50
    completedBy: assistantName
  });

  addNote(patientId, assistantName, 'PRS assessment completed');
}

/**
 * Add a session record
 */
export function addSession(patientId, sessionData) {
  if (!AppState.patients[patientId]) return;

  const patient = AppState.patients[patientId];
  const sessionNumber = patient.sessions.length + 1;

  patient.sessions.push({
    sessionNumber,
    date: new Date().toISOString(),
    device: sessionData.device || null,
    montage: sessionData.montage || null,
    duration: sessionData.duration || 0,
    notes: sessionData.notes || '',
    completedBy: sessionData.completedBy || null,
    status: 'completed'
  });

  saveState();
}

/**
 * Add a clinical note
 */
export function addNote(patientId, author, text) {
  if (!AppState.patients[patientId]) return;

  AppState.patients[patientId].notes.push({
    author,
    text,
    createdAt: new Date().toISOString()
  });

  saveState();
}

/**
 * Update a note by index
 */
export function updateNote(patientId, noteIndex, text) {
  if (!AppState.patients[patientId]) return;
  if (!AppState.patients[patientId].notes[noteIndex]) return;

  AppState.patients[patientId].notes[noteIndex].text = text;
  AppState.patients[patientId].notes[noteIndex].updatedAt = new Date().toISOString();

  saveState();
}

/* =============================
   PATIENT ACTIONS
============================= */

/**
 * Patient marks payment as completed
 */
export function patientMarkPaid(patientId) {
  if (!AppState.patients[patientId]) return;
  AppState.patients[patientId].payment.status = PAYMENT_STATUS.COMPLETED;
  AppState.patients[patientId].payment.paymentDate = new Date().toISOString();
  saveState();
}

/* =============================
   UTILITY / DEBUG ACTIONS
============================= */

/**
 * Get all patients
 */
export function getAllPatients() {
  return Object.values(AppState.patients);
}

/**
 * Get patient by ID
 */
export function getPatient(patientId) {
  return AppState.patients[patientId] || null;
}

/**
 * Get patient assessment summary
 */
export function getAssessmentSummary(patientId) {
  const patient = AppState.patients[patientId];
  if (!patient) return {};

  return {
    prs: patient.assessments.prs.score !== null ? '✔ PRS' : '• PRS',
    fnon: patient.assessments.fnon.score !== null ? '✔ FNON' : '• FNON',
    eeg: patient.assessments.eeg.score !== null ? '✔ EEG' : '• EEG',
    brainMapping: patient.assessments.brainMapping.score !== null ? '✔ Brain Mapping' : '• Brain Mapping'
  };
}

/**
 * Check if patient can proceed to next step
 */
export function canProceed(patientId) {
  const patient = AppState.patients[patientId];
  if (!patient) return false;

  // Must have consent
  if (!patient.consent.status) return false;

  // Must have payment or be in pay-later mode
  if (patient.payment.status === PAYMENT_STATUS.PENDING) return false;

  return true;
}
