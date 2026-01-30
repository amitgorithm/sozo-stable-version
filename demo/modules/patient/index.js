/**
 * PATIENT MODULE
 * Responsibilities:
 * - Self-registration with basic information
 * - Payment processing for registration
 * - Consent form agreement
 * - View own profile and progress
 * - View treatment plan (after payment)
 * - View session history
 */

import { AppState } from '../../state/state.js';
import { ROLES, PAYMENT_STATUS, PLAN_STATUS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';

export function renderPatientModule(container, selectedPatient) {
  // Permission check
  if (AppState.app.currentRole !== ROLES.PATIENT) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  // If no patient selected, show registration
  if (!selectedPatient) {
    renderPatientRegistration(container);
    return;
  }

  // Check payment status for access level
  const hasFullAccess = selectedPatient.payment.status === PAYMENT_STATUS.COMPLETED;

  container.innerHTML = `
    <div class="module-header">
      <h2>Patient Portal — ${selectedPatient.profile.name}</h2>
      <p class="small">Welcome to your Sozo health journey</p>
    </div>
    <div class="module-content">
      <div id="patientOverview"></div>
      <div id="paymentStatus"></div>
      <div id="treatmentProgress"></div>
    </div>
  `;

  renderPatientOverview(selectedPatient);
  renderPaymentStatus(selectedPatient);
  
  if (hasFullAccess) {
    renderTreatmentProgress(selectedPatient);
  } else {
    renderLimitedView();
  }
}

function renderPatientRegistration(container) {
  container.innerHTML = `
    <div class="card">
      <h3>Patient Registration</h3>
      <p class="small">Create your account to begin your Sozo journey</p>
      
      <form id="patientRegForm" class="form-grid">
        <div class="form-group">
          <label>Full Name *</label>
          <input type="text" id="regName" placeholder="Enter your full name" required>
        </div>
        
        <div class="form-group">
          <label>Age *</label>
          <input type="number" id="regAge" min="16" max="120" placeholder="Your age" required>
        </div>
        
        <div class="form-group">
          <label>Gender</label>
          <select id="regGender">
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
            <option value="N">Prefer not to say</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>Phone Number *</label>
          <input type="tel" id="regPhone" placeholder="Your contact number" required>
        </div>
        
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="regEmail" placeholder="your.email@example.com">
        </div>
        
        <div class="form-group full-width">
          <label>Medical History (Optional)</label>
          <textarea id="regMedHistory" placeholder="Brief medical history or current medications..."></textarea>
        </div>
        
        <div class="form-group full-width">
          <label class="checkbox-label">
            <input type="checkbox" id="regConsent" required>
            I agree to the terms and consent to treatment *
          </label>
        </div>
        
        <button type="submit" class="btn btn-primary">Register & Continue to Payment</button>
      </form>
    </div>
  `;

  // Event handler
  document.getElementById('patientRegForm').onsubmit = (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('regName').value.trim(),
      age: parseInt(document.getElementById('regAge').value),
      gender: document.getElementById('regGender').value,
      phone: document.getElementById('regPhone').value.trim(),
      email: document.getElementById('regEmail').value.trim(),
      medicalHistory: document.getElementById('regMedHistory').value.trim()
    };

    if (!formData.name || !formData.age || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (!document.getElementById('regConsent').checked) {
      alert('Please agree to the terms and consent to continue');
      return;
    }

    // Create patient and automatically set consent
    const patientId = Actions.createPatient(formData);
    Actions.toggleConsent(patientId); // Auto-consent since they checked the box
    Actions.selectPatient(patientId);
    
    alert('Registration successful! Please proceed with payment to activate your account.');
    
    // Re-render to show payment screen
    const newPatient = Actions.getPatient(patientId);
    renderPatientModule(container, newPatient);
  };
}

function renderPatientOverview(patient) {
  const container = document.getElementById('patientOverview');
  
  container.innerHTML = `
    <div class="card">
      <h3>Your Profile</h3>
      <div class="profile-details">
        <div class="detail-row">
          <label>Patient ID:</label>
          <span>${patient.profile.id}</span>
        </div>
        <div class="detail-row">
          <label>Name:</label>
          <span>${patient.profile.name}</span>
        </div>
        <div class="detail-row">
          <label>Age:</label>
          <span>${patient.profile.age} years</span>
        </div>
        <div class="detail-row">
          <label>Registration Date:</label>
          <span>${new Date(patient.profile.visitDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <label>Consent Status:</label>
          <span class="${patient.consent.status ? 'success' : 'warning'}">
            ${patient.consent.status ? '✓ Provided' : '✗ Pending'}
          </span>
        </div>
      </div>
    </div>
  `;
}

function renderPaymentStatus(patient) {
  const container = document.getElementById('paymentStatus');
  
  const isPaid = patient.payment.status === PAYMENT_STATUS.COMPLETED;
  const isPayLater = patient.payment.status === PAYMENT_STATUS.PAY_LATER;

  container.innerHTML = `
    <div class="card ${isPaid ? 'success' : 'warning'}">
      <h3>Payment Status</h3>
      
      ${isPaid ? `
        <div class="success-banner">
          ✓ Payment completed successfully
          <div class="small">Paid on: ${new Date(patient.payment.paymentDate).toLocaleDateString()}</div>
          <div class="small">Full access to treatment plan and progress tracking enabled.</div>
        </div>
      ` : isPayLater ? `
        <div class="warning-banner">
          ⏳ Payment scheduled for later
          <div class="small">You can proceed with limited access. Complete payment anytime to unlock full features.</div>
        </div>
        <button id="payNow" class="btn btn-primary">Complete Payment Now</button>
      ` : `
        <div class="warning-banner">
          💳 Payment required to activate your account
          <div class="small">Complete payment to unlock your treatment plan and start your journey.</div>
        </div>
        <div class="payment-options">
          <button id="payNow" class="btn btn-primary">Pay Now</button>
          <button id="payLater" class="btn btn-ghost">Schedule Payment</button>
        </div>
      `}
    </div>
  `;

  // Event handlers
  const payNowBtn = document.getElementById('payNow');
  if (payNowBtn) {
    payNowBtn.onclick = () => {
      Actions.patientMarkPaid(patient.profile.id);
      alert('Payment completed successfully! Welcome to Sozo.');
      
      // Re-render to show full access
      const updatedPatient = Actions.getPatient(patient.profile.id);
      renderPaymentStatus(updatedPatient);
      renderTreatmentProgress(updatedPatient);
    };
  }

  const payLaterBtn = document.getElementById('payLater');
  if (payLaterBtn) {
    payLaterBtn.onclick = () => {
      Actions.setPayLater(patient.profile.id);
      alert('Payment scheduled for later. You can now proceed with limited access.');
      
      // Re-render to show pay later status
      const updatedPatient = Actions.getPatient(patient.profile.id);
      renderPaymentStatus(updatedPatient);
    };
  }
}

function renderTreatmentProgress(patient) {
  const container = document.getElementById('treatmentProgress');
  
  const assessmentSummary = Actions.getAssessmentSummary(patient.profile.id);
  const hasTreatmentPlan = patient.treatmentPlan.status !== PLAN_STATUS.NOT_CREATED;

  container.innerHTML = `
    <div class="card">
      <h3>Your Treatment Journey</h3>
      
      <div class="progress-section">
        <h4>Assessment Progress</h4>
        <div class="assessment-status">
          ${Object.entries(assessmentSummary).map(([key, value]) => `
            <div class="status-item">
              <span class="status-icon">${value.includes('✔') ? '✓' : '○'}</span>
              <span>${value.replace('✔ ', '').replace('• ', '')}</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${hasTreatmentPlan ? `
        <div class="progress-section">
          <h4>Your Treatment Plan</h4>
          <div class="treatment-details">
            <div class="treatment-item">
              <label>Condition:</label>
              <span>${patient.treatmentPlan.disease || 'Not specified'}</span>
            </div>
            <div class="treatment-item">
              <label>Device:</label>
              <span>${patient.treatmentPlan.device}</span>
            </div>
            <div class="treatment-item">
              <label>Total Sessions:</label>
              <span>${patient.treatmentPlan.sessionsPlanned}</span>
            </div>
            <div class="treatment-item">
              <label>Completed Sessions:</label>
              <span>${patient.sessions.length}</span>
            </div>
            <div class="treatment-item">
              <label>Progress:</label>
              <span>${Math.round((patient.sessions.length / patient.treatmentPlan.sessionsPlanned) * 100)}%</span>
            </div>
          </div>
        </div>

        ${patient.sessions.length > 0 ? `
          <div class="progress-section">
            <h4>Recent Sessions</h4>
            <div class="session-history">
              ${patient.sessions.slice(-3).map((session, index) => `
                <div class="session-summary">
                  <div class="session-header">
                    <strong>Session ${session.sessionNumber}</strong>
                    <span>${new Date(session.date).toLocaleDateString()}</span>
                  </div>
                  <div class="session-info">
                    Duration: ${session.duration} minutes | Device: ${session.device}
                  </div>
                  ${session.patientFeedback ? `
                    <div class="feedback">Your feedback: "${session.patientFeedback}"</div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      ` : `
        <div class="progress-section">
          <h4>Treatment Plan</h4>
          <p class="small">Your treatment plan will be available once all assessments are completed by the medical team.</p>
        </div>
      `}
    </div>
  `;
}

function renderLimitedView() {
  const container = document.getElementById('treatmentProgress');
  
  container.innerHTML = `
    <div class="card limited">
      <h3>Limited Access</h3>
      <div class="limited-banner">
        <div class="limited-icon">🔒</div>
        <div class="limited-content">
          <h4>Complete Payment to Unlock</h4>
          <p>Your treatment plan and progress tracking will be available after payment completion.</p>
          <p class="small">You can complete payment anytime to gain full access to your health journey.</p>
        </div>
      </div>
    </div>
  `;
}