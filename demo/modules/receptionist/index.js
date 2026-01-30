/**
 * RECEPTIONIST MODULE
 * Responsibilities:
 * - Create new patients
 * - Manage patient registration
 * - Handle payment processing
 * - Manage consent collection
 * - View patient details
 */

import { AppState } from '../../state/state.js';
import { ROLES, PAYMENT_STATUS, PLAN_STATUS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';
import { createCard, createForm, createButton } from '../../shared/components/ui-components.js';

export function renderReceptionistModule(container, selectedPatient) {
  // Permission check
  if (AppState.app.currentRole !== ROLES.RECEPTIONIST) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  container.innerHTML = `
    <div class="module-header">
      <h2>Reception Desk</h2>
      <p class="small">Patient registration and activation</p>
    </div>
    <div class="module-content">
      <div id="patientRegistration"></div>
      <div id="patientActivation"></div>
    </div>
  `;

  renderPatientRegistration();
  renderPatientActivation(selectedPatient);
}

function renderPatientRegistration() {
  const container = document.getElementById('patientRegistration');
  
  container.innerHTML = `
    <div class="card">
      <h3>New Patient Registration</h3>
      <form id="newPatientForm" class="form-grid">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="patientName" placeholder="Enter patient name" required>
        </div>
        <div class="form-group">
          <label>Age *</label>
          <input type="number" id="patientAge" min="1" max="120" placeholder="Age" required>
        </div>
        <div class="form-group">
          <label>Gender</label>
          <select id="patientGender">
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" id="patientPhone" placeholder="Phone number">
        </div>
        <button type="submit" class="btn btn-primary">Create Patient</button>
      </form>
    </div>
  `;

  // Event handling
  document.getElementById('newPatientForm').onsubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('patientName').value.trim(),
      age: parseInt(document.getElementById('patientAge').value),
      gender: document.getElementById('patientGender').value,
      phone: document.getElementById('patientPhone').value.trim()
    };

    if (!formData.name || !formData.age) {
      alert('Name and age are required');
      return;
    }

    const patientId = Actions.createPatient(formData);
    Actions.selectPatient(patientId);
    
    // Clear form
    document.getElementById('newPatientForm').reset();
    
    // Re-render to show new patient
    renderPatientActivation(Actions.getPatient(patientId));
    
    alert(`Patient ${formData.name} created successfully!`);
  };
}

function renderPatientActivation(patient) {
  const container = document.getElementById('patientActivation');

  if (!patient) {
    container.innerHTML = `
      <div class="card">
        <h3>Patient Activation</h3>
        <p class="small">Select or create a patient to manage activation</p>
      </div>
    `;
    return;
  }

  const consentStatus = patient.consent.status ? 'success' : 'warning';
  const paymentStatus = patient.payment.status === PAYMENT_STATUS.COMPLETED ? 'success' : 'warning';
  const canActivate = patient.consent.status && patient.payment.status === PAYMENT_STATUS.COMPLETED;

  container.innerHTML = `
    <div class="card">
      <h3>Activate Patient: ${patient.profile.name}</h3>
      
      <div class="activation-checklist">
        <div class="checklist-item ${consentStatus}">
          <div class="status-indicator"></div>
          <div class="item-content">
            <strong>Consent Collection</strong>
            <p class="small">${patient.consent.status ? 'Consent provided' : 'Consent required'}</p>
          </div>
          <button id="toggleConsent" class="btn btn-ghost">
            ${patient.consent.status ? 'Revoke' : 'Collect'} Consent
          </button>
        </div>

        <div class="checklist-item ${paymentStatus}">
          <div class="status-indicator"></div>
          <div class="item-content">
            <strong>Payment Processing</strong>
            <p class="small">${getPaymentStatusText(patient.payment.status)}</p>
          </div>
          <button id="togglePayment" class="btn btn-ghost" ${!patient.consent.status ? 'disabled' : ''}>
            ${patient.payment.status === PAYMENT_STATUS.COMPLETED ? 'Refund' : 'Process Payment'}
          </button>
        </div>
      </div>

      <div class="activation-actions">
        <button id="activatePatient" class="btn btn-primary" ${!canActivate ? 'disabled' : ''}>
          ${canActivate ? 'Activate for Clinical Flow' : 'Complete Requirements First'}
        </button>
      </div>
    </div>
  `;

  // Event handlers
  document.getElementById('toggleConsent').onclick = () => {
    Actions.toggleConsent(patient.profile.id);
    renderPatientActivation(Actions.getPatient(patient.profile.id));
  };

  document.getElementById('togglePayment').onclick = () => {
    if (!patient.consent.status) {
      alert('Consent required before payment processing');
      return;
    }
    
    Actions.togglePayment(patient.profile.id);
    renderPatientActivation(Actions.getPatient(patient.profile.id));
  };

  document.getElementById('activatePatient').onclick = () => {
    if (!canActivate) {
      alert('Please complete consent and payment first');
      return;
    }
    
    alert(`✓ Patient ${patient.profile.name} activated successfully!\\nPatient can now proceed to assessments.`);
  };
}

function getPaymentStatusText(status) {
  switch (status) {
    case PAYMENT_STATUS.COMPLETED:
      return 'Payment completed';
    case PAYMENT_STATUS.PAY_LATER:
      return 'Scheduled for later payment';
    default:
      return 'Payment pending';
  }
}