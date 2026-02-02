/**
 * SOZO DEMO — UI & RENDERING LAYER
 * 
 * This file handles ONLY UI orchestration and module coordination.
 * Individual modules handle their own rendering.
 * All state mutations go through actions.js
 * All state reads come from AppState
 */

import { AppState, loadState, saveState } from './state/state.js';
import { ROLES, ROLE_LABELS, ROLE_LIST, ASSESSMENTS, DEVICES, PAYMENT_STATUS, PLAN_STATUS } from './state/roles.js';
import * as Actions from './state/actions.js';

// Module imports - each module handles its own UI
import { renderReceptionistModule } from './modules/receptionist/index.js';
import { renderDoctorModule } from './modules/doctor/index.js';
import { renderClinicalAssistantModule } from './modules/clinical-assistant/index.js';
import { renderPatientModule } from './modules/patient/index.js';

// Shared utilities
import { createNotification, showModal } from './shared/utils/ui-helpers.js';

/* =============================
   GLOBAL SCOPE FOR DEBUGGING
============================= */

window.AppState = AppState;
window.Actions = Actions;
window.ROLES = ROLES;

/* =============================
   UI HELPERS
============================= */

const $ = (id) => document.getElementById(id);

/**
 * Main render loop
 * Called whenever state changes
 */
function render() {
  renderSidebar();
  renderHeader();
  renderMainContent();
}

/**
 * Render left sidebar
 */
function renderSidebar() {
  const patientList = $('patientList');
  patientList.innerHTML = '';

  const allPatients = Actions.getAllPatients();
  allPatients.forEach(patient => {
    const div = document.createElement('div');
    div.className = 'patient-item' + (patient.profile.id === AppState.app.selectedPatientId ? ' active' : '');
    div.innerHTML = `
      <div>
        <strong>${patient.profile.name}</strong>
        <div class="small">${patient.profile.id} • ${patient.profile.age}y • ${patient.profile.visitDate}</div>
      </div>
    `;
    div.onclick = () => {
      Actions.selectPatient(patient.profile.id);
      render();
    };
    patientList.appendChild(div);
  });

  // Render patient metadata
  renderPatientMeta();
}

/**
 * Render patient metadata panel
 */
function renderPatientMeta() {
  const meta = $('patientMeta');

  if (!AppState.app.selectedPatientId) {
    meta.innerHTML = '<div class="small">No patient selected</div>';
    return;
  }

  const patient = Actions.getPatient(AppState.app.selectedPatientId);
  if (!patient) {
    meta.innerHTML = '<div class="small">Patient not found</div>';
    return;
  }

  const summary = Actions.getAssessmentSummary(patient.profile.id);
  const paymentStatus = patient.payment.status === PAYMENT_STATUS.COMPLETED
    ? '<span class="success">Paid</span>'
    : '<span class="warning">Pending</span>';

  meta.innerHTML = `
    <div><strong>${patient.profile.name}</strong></div>
    <div class="small">ID: ${patient.profile.id} • Visit: ${patient.profile.visitDate}</div>
    <div style="margin-top:8px">Payment: ${paymentStatus}</div>
    <div style="margin-top:6px">Consent: ${patient.consent.status ? 'Yes' : 'No'}</div>
    <div style="margin-top:6px">Assessments:</div>
    <div style="margin-top:4px;font-size:11px;line-height:1.4">
      ${summary.prs} | ${summary.fnon} | ${summary.eeg} | ${summary.brainMapping}
    </div>
  `;
}

/**
 * Render main header
 */
function renderHeader() {
  const title = $('mainHeaderTitle');
  const visitState = $('visitState');

  const roleLabel = ROLE_LABELS[AppState.app.currentRole] || 'Unknown Role';
  title.textContent = roleLabel + ' — Demo';

  if (AppState.app.selectedPatientId) {
    const patient = Actions.getPatient(AppState.app.selectedPatientId);
    visitState.textContent = patient ? `Patient: ${patient.profile.name} • Visit: ${patient.profile.visitDate}` : 'No patient selected';
  } else {
    visitState.textContent = 'No patient selected';
  }
}

/**
 * Render main content area based on current role
 * Delegates to individual modules
 */
function renderMainContent() {
  const el = $('mainContent');
  el.innerHTML = '';

  if (!AppState.app.currentRole) {
    el.innerHTML = '<div class="card"><h3>Welcome to Sozo Demo</h3><p class="small">Select a role from the sidebar to begin.</p></div>';
    return;
  }

  const patientId = AppState.app.selectedPatientId;
  const patient = patientId ? Actions.getPatient(patientId) : null;

  // Route to role-specific modules
  switch (AppState.app.currentRole) {
    case ROLES.RECEPTIONIST:
      renderReceptionistModule(el, patient);
      break;
    case ROLES.DOCTOR:
      renderDoctorModule(el, patient);
      break;
    case ROLES.CLINICAL_ASSISTANT:
      renderClinicalAssistantModule(el, patient);
      break;
    case ROLES.PATIENT:
      renderPatientModule(el, patient);
      break;
    default:
      el.innerHTML = '<div class="card">Unknown role</div>';
  }
}

/* =============================
   INITIALIZATION
============================= */

window.addEventListener('load', () => {
  loadState();

  // Wire role selector
  const roleSelector = $('roleSelect');
  roleSelector.innerHTML = ROLE_LIST
    .map(role => `<option value="${role}">${ROLE_LABELS[role]}</option>`)
    .join('');

  roleSelector.onchange = (e) => {
    Actions.selectRole(e.target.value);
    render();
  };

  // Wire new patient button
  $('newPatientBtn').onclick = () => {
    if (AppState.app.currentRole !== ROLES.RECEPTIONIST) {
      createNotification('Switch to Receptionist role to create new patients', 'warning');
    } else {
      const nameInput = document.querySelector('#patientName');
      if (nameInput) {
        nameInput.focus();
      }
    }
  };

  // Debug helpers on window for development
  window.demo_save = () => {
    saveState();
    createNotification('State manually saved to localStorage', 'info');
  };

  window.demo_reset = () => {
    if (confirm('Reset all demo data? This cannot be undone.')) {
      import('./state/state.js').then(mod => {
        mod.resetState();
        AppState.app.selectedPatientId = null;
        render();
        createNotification('Demo state reset successfully', 'success');
      });
    }
  };

  // Initial render
  render();
});

