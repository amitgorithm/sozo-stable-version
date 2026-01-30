/**
 * ROLE CONSTANTS
 * Use these everywhere — no hardcoded strings
 */

export const ROLES = Object.freeze({
  RECEPTIONIST: 'receptionist',
  DOCTOR: 'doctor',
  CLINICAL_ASSISTANT: 'clinicalAssistant',
  PATIENT: 'patient'
});

/**
 * Role label mapping for UI display
 */
export const ROLE_LABELS = Object.freeze({
  [ROLES.RECEPTIONIST]: 'Receptionist',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.CLINICAL_ASSISTANT]: 'Clinical Assistant',
  [ROLES.PATIENT]: 'Patient'
});

/**
 * Role list for dropdowns
 */
export const ROLE_LIST = [
  ROLES.RECEPTIONIST,
  ROLES.DOCTOR,
  ROLES.CLINICAL_ASSISTANT,
  ROLES.PATIENT
];

/**
 * Assessment types
 */
export const ASSESSMENTS = Object.freeze({
  PRS: 'prs',
  FNON: 'fnon',
  EEG: 'eeg',
  BRAIN_MAPPING: 'brainMapping'
});

/**
 * Devices available
 */
export const DEVICES = Object.freeze({
  TPS: 'TPS',
  tDCS: 'tDCS',
  tACS: 'tACS'
});

/**
 * Payment statuses
 */
export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed',
  PAY_LATER: 'payLater'
});

/**
 * Treatment plan statuses
 */
export const PLAN_STATUS = Object.freeze({
  NOT_CREATED: 'not_created',
  ACTIVE: 'active',
  COMPLETED: 'completed'
});
