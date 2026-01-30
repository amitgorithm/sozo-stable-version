/**
 * SOZO DEMO — UI & RENDERING LAYER
 * 
 * This file handles ONLY UI rendering and event binding.
 * All state mutations go through actions.js
 * All state reads come from AppState
 */

import { AppState, loadState, saveState } from './state/state.js';
import { ROLES, ROLE_LABELS, ROLE_LIST, ASSESSMENTS, DEVICES, PAYMENT_STATUS, PLAN_STATUS } from './state/roles.js';
import * as Actions from './state/actions.js';

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
 */
function renderMainContent() {
  const el = $('mainContent');
  el.innerHTML = '';

  if (!AppState.app.currentRole) {
    el.innerHTML = '<div class="card"><h3>Welcome to Sozo Demo</h3><p class="small">Select a role from the sidebar to begin.</p></div>';
    return;
  }

  // Route to role-specific render
  switch (AppState.app.currentRole) {
    case ROLES.RECEPTIONIST:
      renderReceptionist(el);
      break;
    case ROLES.DOCTOR:
      renderDoctor(el);
      break;
    case ROLES.CLINICAL_ASSISTANT:
      renderAssistant(el);
      break;
    case ROLES.PATIENT:
      renderPatient(el);
      break;
    default:
      el.innerHTML = '<div class="card">Unknown role</div>';
  }
}

/* =============================
   ROLE-SPECIFIC RENDERING
============================= */

/**
 * RECEPTIONIST SCREENS
 */
function renderReceptionist(container) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h3>Reception — Register & Activate Visit</h3>`;

  const form = document.createElement('div');
  form.innerHTML = `
    <div style="display:flex;gap:8px;margin-top:12px">
      <input id="recName" placeholder="Patient name" style="flex:2;padding:8px;border-radius:8px;border:1px solid #e6e9ee" />
      <input id="recAge" placeholder="Age" type="number" style="width:80px;padding:8px;border-radius:8px;border:1px solid #e6e9ee" />
      <button id="recCreate" class="btn-ghost">Create & Select</button>
    </div>
    <div style="margin-top:12px;font-size:13px;color:#374151">
      <strong>Activation Gate:</strong> Consent + Payment required before clinical access.
    </div>
    <div class="action-row">
      <button id="consentBtn" class="btn">Toggle Consent</button>
      <button id="payBtn" class="btn">Toggle Payment</button>
      <button id="nextBtn" class="btn-ghost">Activate Patient</button>
    </div>
  `;
  container.appendChild(card);
  container.appendChild(form);

  // Event bindings
  form.querySelector('#recCreate').onclick = () => {
    const name = form.querySelector('#recName').value.trim() || 'New Patient';
    const age = parseInt(form.querySelector('#recAge').value) || 30;
    Actions.createPatient({ name, age });
    render();
    form.querySelector('#recName').value = '';
    form.querySelector('#recAge').value = '';
  };

  form.querySelector('#consentBtn').onclick = () => {
    if (!AppState.app.selectedPatientId) {
      alert('Select or create a patient first');
      return;
    }
    Actions.toggleConsent(AppState.app.selectedPatientId);
    render();
  };

  form.querySelector('#payBtn').onclick = () => {
    if (!AppState.app.selectedPatientId) {
      alert('Select or create a patient first');
      return;
    }
    const success = Actions.togglePayment(AppState.app.selectedPatientId);
    if (!success) {
      alert('Consent required before payment');
    }
    render();
  };

  form.querySelector('#nextBtn').onclick = () => {
    if (!AppState.app.selectedPatientId) {
      alert('Select a patient');
      return;
    }
    const patient = Actions.getPatient(AppState.app.selectedPatientId);
    if (!patient.payment.status || patient.payment.status === PAYMENT_STATUS.PENDING) {
      alert('Payment required. Choose: Pay Now or Pay Later.');
      return;
    }
    if (!patient.consent.status) {
      alert('Consent required before activation');
      return;
    }
    alert('✓ Patient ' + patient.profile.name + ' is now activated for clinical flow.');
  };
}

/**
 * DOCTOR SCREENS
 */
function renderDoctor(container) {
  if (!AppState.app.selectedPatientId) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>Doctor — Select Patient</h3><p class="small">Choose a patient from the left sidebar.</p>';
    container.appendChild(card);
    return;
  }

  const patient = Actions.getPatient(AppState.app.selectedPatientId);
  const summary = Actions.getAssessmentSummary(patient.profile.id);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Doctor — Review & Create Treatment Plan</h3>
    <div style="margin-top:12px">
      <strong>${patient.profile.name}</strong> • ${patient.profile.id}
      <div class="small" style="margin-top:6px">Assessments: ${summary.prs} | ${summary.fnon} | ${summary.eeg} | ${summary.brainMapping}</div>
      <div style="margin-top:8px">Treatment Plan Status: <strong>${patient.treatmentPlan.status}</strong></div>
    </div>
    <div style="margin-top:14px">
      <label style="font-size:12px;color:#374151">Clinical Summary / Diagnosis</label>
      <textarea id="doctorNotes" placeholder="Enter clinical findings..." style="margin-top:6px;"></textarea>
    </div>
    <div style="margin-top:12px">
      <label style="font-size:12px;color:#374151">Disease Type</label>
      <select id="diseaseType" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e9ee;margin-top:6px">
        <option value="">— Select Disease —</option>
        <option value="depression">Depression</option>
        <option value="anxiety">Anxiety</option>
        <option value="migraine">Migraine</option>
        <option value="chronic-pain">Chronic Pain</option>
      </select>
    </div>
    <div style="margin-top:12px;display:flex;gap:12px">
      <div style="flex:1">
        <label style="font-size:12px;color:#374151">Device</label>
        <select id="deviceType" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e9ee;margin-top:6px">
          ${Object.values(DEVICES).map(d => `<option value="${d}">${d}</option>`).join('')}
        </select>
      </div>
      <div style="flex:1">
        <label style="font-size:12px;color:#374151">Sessions Planned</label>
        <input id="sessionCount" type="number" min="1" value="6" style="width:100%;padding:8px;border-radius:8px;border:1px solid #e6e9ee;margin-top:6px" />
      </div>
    </div>
    <div class="action-row">
      <button id="savePlanBtn" class="btn">Save Treatment Plan</button>
      <button id="clearBtn" class="btn-ghost">Clear</button>
    </div>
  `;
  container.appendChild(card);

  // Event bindings
  card.querySelector('#savePlanBtn').onclick = () => {
    const disease = card.querySelector('#diseaseType').value || 'unknown';
    const device = card.querySelector('#deviceType').value || 'TPS';
    const sessions = parseInt(card.querySelector('#sessionCount').value) || 6;

    Actions.createTreatmentPlan(AppState.app.selectedPatientId, {
      disease,
      device,
      sessionsPlanned: sessions
    });

    alert('✓ Treatment plan created and assigned to Clinical Assistant.');
    render();
  };

  card.querySelector('#clearBtn').onclick = () => {
    card.querySelector('#doctorNotes').value = '';
    card.querySelector('#diseaseType').value = '';
    card.querySelector('#sessionCount').value = '6';
  };
}

/**
 * CLINICAL ASSISTANT SCREENS
 */
function renderAssistant(container) {
  if (!AppState.app.selectedPatientId) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>Clinical Assistant — Select Patient</h3><p class="small">Choose a patient from the left sidebar.</p>';
    container.appendChild(card);
    return;
  }

  const patient = Actions.getPatient(AppState.app.selectedPatientId);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Clinical Assistant — Sessions & Assessments</h3>
    <div style="margin-top:12px">
      <strong>${patient.profile.name}</strong> • ${patient.profile.id}
      <div style="margin-top:8px">
        <div>Payment: ${patient.payment.status === PAYMENT_STATUS.COMPLETED ? '✓ Completed' : '✗ Pending'}</div>
        <div>Treatment Plan: ${patient.treatmentPlan.status}</div>
      </div>
    </div>

    <div style="margin-top:14px">
      <div class="panel-title">Assessments & Sessions</div>
      <div style="margin-top:8px;font-size:13px">
        <button id="doPRSBtn" class="btn-ghost" style="width:100%;text-align:left;padding:10px;border:1px solid #e6e9ee;border-radius:8px;margin-bottom:6px">
          Perform PRS Assessment
        </button>
        <button id="addSessionBtn" class="btn-ghost" style="width:100%;text-align:left;padding:10px;border:1px solid #e6e9ee;border-radius:8px;margin-bottom:6px">
          Add Session Record
        </button>
        <button id="addNoteBtn" class="btn-ghost" style="width:100%;text-align:left;padding:10px;border:1px solid #e6e9ee;border-radius:8px">
          Add Clinical Note
        </button>
      </div>
    </div>

    <div style="margin-top:14px">
      <div class="panel-title">Notes</div>
      <div id="notesList" style="margin-top:8px;max-height:200px;overflow-y:auto"></div>
    </div>
  `;
  container.appendChild(card);

  // Render notes
  const notesList = card.querySelector('#notesList');
  if (patient.notes.length === 0) {
    notesList.innerHTML = '<div class="small">No notes yet</div>';
  } else {
    patient.notes.forEach((note, idx) => {
      const noteDiv = document.createElement('div');
      noteDiv.style.cssText = 'padding:8px;border-left:3px solid #0ea5a3;background:#f9fafb;margin-bottom:6px;border-radius:4px;font-size:12px';
      noteDiv.innerHTML = `<strong>${note.author}</strong>: ${note.text}`;
      notesList.appendChild(noteDiv);
    });
  }

  // Event bindings
  card.querySelector('#doPRSBtn').onclick = () => {
    if (patient.payment.status !== PAYMENT_STATUS.COMPLETED) {
      alert('Patient payment required before assessments');
      return;
    }
    Actions.performPRS(AppState.app.selectedPatientId, 'Clinical Assistant');
    alert('✓ PRS assessment completed');
    render();
  };

  card.querySelector('#addSessionBtn').onclick = () => {
    const duration = prompt('Session duration (minutes)?', '30');
    if (duration) {
      Actions.addSession(AppState.app.selectedPatientId, {
        device: patient.treatmentPlan.device || 'TPS',
        duration: parseInt(duration),
        completedBy: 'Clinical Assistant'
      });
      alert('✓ Session recorded');
      render();
    }
  };

  card.querySelector('#addNoteBtn').onclick = () => {
    const note = prompt('Enter clinical note or observation:');
    if (note) {
      Actions.addNote(AppState.app.selectedPatientId, 'Clinical Assistant', note);
      alert('✓ Note added');
      render();
    }
  };
}

/**
 * PATIENT SCREENS
 */
function renderPatient(container) {
  if (!AppState.app.selectedPatientId) {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = '<h3>Patient Portal — Select Your Profile</h3><p class="small">Choose yourself from the left sidebar.</p>';
    container.appendChild(card);
    return;
  }

  const patient = Actions.getPatient(AppState.app.selectedPatientId);
  const canViewFull = patient.payment.status === PAYMENT_STATUS.COMPLETED;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Patient Portal — My Health Journey</h3>
    <div style="margin-top:12px">
      <strong>${patient.profile.name}</strong> • ${patient.profile.id} • ${patient.profile.age} years old
    </div>
  `;

  if (!canViewFull) {
    card.innerHTML += `
      <div style="margin-top:12px;padding:12px;background:#fff7ed;border-left:3px solid #f97316;border-radius:6px;font-size:13px">
        <strong>⚠ Limited Access</strong><br/>
        Complete your payment to unlock full treatment details.
      </div>
      <div class="action-row">
        <button id="payNowBtn" class="btn">Pay Now</button>
        <button id="payLaterBtn" class="btn-ghost">Pay Later</button>
      </div>
    `;
  } else {
    const summary = Actions.getAssessmentSummary(patient.profile.id);
    card.innerHTML += `
      <div style="margin-top:14px;padding:12px;background:#ecfdf5;border-left:3px solid #10b981;border-radius:6px">
        <strong>✓ Payment Complete</strong> — Full access to your treatment plan.
      </div>

      <div style="margin-top:14px">
        <div class="panel-title">Assessment Progress</div>
        <div style="margin-top:8px;font-size:13px">
          ${summary.prs} | ${summary.fnon} | ${summary.eeg} | ${summary.brainMapping}
        </div>
      </div>

      <div style="margin-top:14px">
        <div class="panel-title">Your Treatment Plan</div>
        <div style="margin-top:8px;font-size:13px">
          ${patient.treatmentPlan.status === PLAN_STATUS.NOT_CREATED
            ? '<em class="small">Plan not yet created by doctor</em>'
            : `
              <div>Device: <strong>${patient.treatmentPlan.device}</strong></div>
              <div>Sessions Planned: <strong>${patient.treatmentPlan.sessionsPlanned}</strong></div>
              <div>Status: <strong>${patient.treatmentPlan.status}</strong></div>
              ${patient.sessions.length > 0 ? `<div>Sessions Completed: <strong>${patient.sessions.length}</strong></div>` : ''}
            `
          }
        </div>
      </div>
    `;
  }

  container.appendChild(card);

  if (!canViewFull) {
    card.querySelector('#payNowBtn').onclick = () => {
      Actions.patientMarkPaid(AppState.app.selectedPatientId);
      alert('✓ Payment confirmed. Welcome to Sozo!');
      render();
    };
    card.querySelector('#payLaterBtn').onclick = () => {
      Actions.setPayLater(AppState.app.selectedPatientId);
      alert('Payment deferred. You can proceed with limited access.');
      render();
    };
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
    const recNameInput = document.querySelector('#recName');
    if (recNameInput) {
      recNameInput.focus();
    }
    if (AppState.app.currentRole !== ROLES.RECEPTIONIST) {
      alert('Switch to Receptionist role to create new patients');
    }
  };

  // Debug helpers on window
  window.demo_save = () => {
    saveState();
    alert('State manually saved to localStorage');
  };

  window.demo_reset = () => {
    if (confirm('Reset all demo data? This cannot be undone.')) {
      import('./state/state.js').then(mod => {
        mod.resetState();
        render();
      });
    }
  };

  // Initial render
  render();
});

