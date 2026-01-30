/**
 * GLOBAL APPLICATION STATE
 * Single Source of Truth
 * DO NOT mutate directly outside actions.js
 */

export const AppState = {
  app: {
    currentRole: null, // receptionist | doctor | clinicalAssistant | patient
    currentScreen: 'dashboard',
    selectedPatientId: null
  },

  patients: {
    /*
    patientId: {
      profile: {
        id,
        name,
        age,
        gender,
        visitDate,
        createdAt
      },
      assessments: {
        prs: { score, completedBy, completedAt },
        fnon: { score, completedBy, completedAt },
        eeg: { score, completedBy, completedAt },
        brainMapping: { score, completedBy, completedAt }
      },
      payment: {
        status: "pending" | "completed",
        paymentDate: null
      },
      consent: {
        status: false,
        consentDate: null
      },
      treatmentPlan: {
        id,
        createdBy,
        createdAt,
        disease,
        device,
        montage,
        sessionsPlanned,
        status: "not_created" | "active" | "completed"
      },
      sessions: [],
      notes: []
    }
    */
  },

  ui: {
    loading: false,
    modal: null,
    error: null
  }
};

const STORAGE_KEY = 'sozoDemoState_v2';

/**
 * Load state from localStorage
 */
export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      Object.assign(AppState, saved);
    } catch (e) {
      console.error('Failed to load state:', e);
      initializeSampleData();
    }
  } else {
    initializeSampleData();
  }
}

/**
 * Save state to localStorage
 */
export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
}

/**
 * Initialize sample data for demo
 */
function initializeSampleData() {
  AppState.patients = {
    P001: {
      profile: {
        id: 'P001',
        name: 'John Doe',
        age: 35,
        gender: 'M',
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
        status: 'pending',
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
        status: 'not_created'
      },
      sessions: [],
      notes: []
    }
  };
  saveState();
}

/**
 * Helper: get today's date as YYYY-MM-DD
 */
export function today() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

/**
 * Reset state (for development)
 */
export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  AppState.app = {
    currentRole: null,
    currentScreen: 'dashboard',
    selectedPatientId: null
  };
  AppState.patients = {};
  AppState.ui = {
    loading: false,
    modal: null,
    error: null
  };
  initializeSampleData();
}
