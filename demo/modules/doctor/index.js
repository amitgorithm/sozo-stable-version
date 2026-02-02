/**
 * DOCTOR MODULE
 * Responsibilities:
 * - View patient assessments (FNON, PRS, Brain Mapping)
 * - Perform assessments (all three types)
 * - Create treatment plans when all assessments complete
 * - Configure montages, devices, sessions
 * - Pass treatment plans to Clinical Assistant
 */

import { AppState } from '../../state/state.js';
import { ROLES, ASSESSMENTS, DEVICES, PAYMENT_STATUS, PLAN_STATUS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';

export function renderDoctorModule(container, selectedPatient) {
  // Permission check
  if (AppState.app.currentRole !== ROLES.DOCTOR) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  if (!selectedPatient) {
    container.innerHTML = `
      <div class="card">
        <h3>Doctor Portal</h3>
        <p class="small">Select a patient from the sidebar to begin assessment</p>
      </div>
    `;
    return;
  }

  // Check if patient is activated
  if (selectedPatient.payment.status === PAYMENT_STATUS.PENDING) {
    container.innerHTML = `
      <div class="card warning">
        <h3>Patient Not Activated</h3>
        <p>Patient ${selectedPatient.profile.name} requires payment activation before assessments can begin.</p>
        <p class="small">Contact reception to complete patient activation.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="module-header">
      <h2>Doctor Portal — ${selectedPatient.profile.name}</h2>
      <p class="small">Patient ID: ${selectedPatient.profile.id} | Age: ${selectedPatient.profile.age} | Visit: ${selectedPatient.profile.visitDate}</p>
    </div>
    <div class="module-content">
      <div id="assessmentDashboard"></div>
      <div id="treatmentPlanBuilder"></div>
    </div>
  `;

  renderAssessmentDashboard(selectedPatient);
  renderTreatmentPlanBuilder(selectedPatient);
}

function renderAssessmentDashboard(patient) {
  const container = document.getElementById('assessmentDashboard');
  
  const assessments = patient.assessments;
  const allComplete = assessments.fnon.score !== null && 
                     assessments.prs.score !== null && 
                     assessments.brainMapping.score !== null;

  container.innerHTML = `
    <div class="card">
      <h3>Patient Assessments</h3>
      
      <div class="assessment-grid">
        ${renderAssessmentCard('FNON', assessments.fnon, patient.profile.id)}
        ${renderAssessmentCard('PRS', assessments.prs, patient.profile.id)}
        ${renderAssessmentCard('Brain Mapping (EEG)', assessments.brainMapping, patient.profile.id)}
      </div>

      ${allComplete ? `
        <div class="success-banner">
          ✓ All assessments completed. Treatment plan creation is now available.
        </div>
      ` : `
        <div class="info-banner">
          Complete all three assessments to unlock treatment plan creation.
        </div>
      `}
    </div>
  `;

  // Add event listeners for assessment buttons
  bindAssessmentEvents(patient);
}

function renderAssessmentCard(title, assessment, patientId) {
  const isComplete = assessment.score !== null;
  const statusClass = isComplete ? 'complete' : 'pending';
  
  return `
    <div class="assessment-card ${statusClass}">
      <div class="assessment-header">
        <h4>${title}</h4>
        ${isComplete ? '<span class="status-badge success">✓ Complete</span>' : '<span class="status-badge pending">Pending</span>'}
      </div>
      <div class="assessment-body">
        ${isComplete ? `
          <div class="result-summary">
            <div>Score: <strong>${assessment.score}</strong></div>
            <div>Completed by: ${assessment.completedBy}</div>
            <div class="small">Date: ${new Date(assessment.completedAt).toLocaleDateString()}</div>
            ${title.includes('Brain Mapping') ? '<div class="success">Brain Mapping EEG Scan Uploaded</div>' : ''}
          </div>
        ` : `
          <div class="assessment-actions">
            <button class="btn btn-primary perform-assessment" data-type="${title.toLowerCase().replace(/\s+/g, '').replace('(eeg)', '')}" data-patient="${patientId}">
              Perform ${title}
            </button>
          </div>
        `}
      </div>
    </div>
  `;
}

function bindAssessmentEvents(patient) {
  document.querySelectorAll('.perform-assessment').forEach(button => {
    button.onclick = () => {
      const type = button.dataset.type;
      const patientId = button.dataset.patient;
      
      performAssessment(type, patientId);
    };
  });
}

function performAssessment(type, patientId) {
  // Simulate assessment process
  const assessmentData = {
    score: Math.floor(Math.random() * 50) + 50, // Random score 50-100
    completedBy: 'Dr. Smith',
    notes: `${type.toUpperCase()} assessment completed successfully.`
  };

  // Map type to assessment key
  const typeMap = {
    'fnon': ASSESSMENTS.FNON,
    'prs': ASSESSMENTS.PRS,
    'brainmapping': ASSESSMENTS.BRAIN_MAPPING
  };

  Actions.updateAssessment(patientId, typeMap[type], assessmentData);
  
  let successMessage;
  if (type === 'brainmapping') {
    successMessage = 'Brain Mapping EEG Scan Uploaded successfully!';
  } else {
    successMessage = `${type.toUpperCase()} assessment completed successfully!`;
  }
  
  alert(successMessage);
  
  // Re-render the module
  const patient = Actions.getPatient(patientId);
  renderAssessmentDashboard(patient);
  renderTreatmentPlanBuilder(patient);
}

function renderTreatmentPlanBuilder(patient) {
  const container = document.getElementById('treatmentPlanBuilder');
  
  const assessments = patient.assessments;
  const allComplete = assessments.fnon.score !== null && 
                     assessments.prs.score !== null && 
                     assessments.brainMapping.score !== null;

  if (!allComplete) {
    container.innerHTML = `
      <div class="card disabled">
        <h3>Treatment Plan Builder</h3>
        <p class="small">Complete all assessments to enable treatment plan creation</p>
      </div>
    `;
    return;
  }

  const hasExistingPlan = patient.treatmentPlan.status !== PLAN_STATUS.NOT_CREATED;

  container.innerHTML = `
    <div class="card">
      <h3>Treatment Plan Builder</h3>
      
      ${hasExistingPlan ? `
        <div class="existing-plan">
          <h4>Current Treatment Plan</h4>
          <div class="plan-summary">
            <div>Disease: <strong>${patient.treatmentPlan.disease || 'Not specified'}</strong></div>
            <div>Device: <strong>${patient.treatmentPlan.device || 'Not selected'}</strong></div>
            <div>Sessions: <strong>${patient.treatmentPlan.sessionsPlanned}</strong></div>
            <div>Status: <strong>${patient.treatmentPlan.status}</strong></div>
          </div>
          <button id="editPlan" class="btn btn-ghost">Edit Plan</button>
        </div>
      ` : ''}
      
      <div id="planForm" ${hasExistingPlan ? 'style="display:none"' : ''}>
        <div class="form-grid">
          <div class="form-group">
            <label>Disease Category *</label>
            <select id="diseaseSelect" class="form-control" required>
              <option value="">-- Select Disease --</option>
              <option value="depression">Depression</option>
              <option value="anxiety">Anxiety Disorders</option>
              <option value="migraine">Migraine</option>
              <option value="chronic-pain">Chronic Pain</option>
              <option value="stroke-recovery">Stroke Recovery</option>
              <option value="adhd">ADHD</option>
            </select>
          </div>

          <div class="form-group">
            <label>Primary Device *</label>
            <select id="deviceSelect" class="form-control" required>
              ${Object.values(DEVICES).map(device => `<option value="${device}">${device}</option>`).join('')}
            </select>
          </div>

          <div class="form-group">
            <label>Montage Configuration</label>
            <select id="montageSelect" class="form-control">
              <option value="standard-depression">Standard Depression Protocol</option>
              <option value="custom-bilateral">Custom Bilateral</option>
              <option value="focal-left">Focal Left Hemisphere</option>
              <option value="focal-right">Focal Right Hemisphere</option>
              <option value="custom">Custom Configuration</option>
            </select>
          </div>

          <div class="form-group">
            <label>Number of Sessions *</label>
            <input type="number" id="sessionsInput" class="form-control" min="1" max="30" value="10" required>
          </div>

          <div class="form-group full-width">
            <label>Clinical Notes</label>
            <textarea id="clinicalNotes" class="form-control" placeholder="Additional notes for treatment plan..."></textarea>
          </div>
        </div>

        <div class="plan-actions">
          <button id="savePlan" class="btn btn-primary">Save Treatment Plan</button>
          <button id="passToClinical" class="btn btn-secondary" style="display:none">Pass to Clinical Assistant</button>
        </div>
      </div>
    </div>
  `;

  // Event handlers
  if (hasExistingPlan) {
    document.getElementById('editPlan').onclick = () => {
      document.getElementById('planForm').style.display = 'block';
    };
  }

  document.getElementById('savePlan').onclick = () => {
    const planData = {
      disease: document.getElementById('diseaseSelect').value,
      device: document.getElementById('deviceSelect').value,
      montage: document.getElementById('montageSelect').value,
      sessionsPlanned: parseInt(document.getElementById('sessionsInput').value),
      clinicalNotes: document.getElementById('clinicalNotes').value
    };

    if (!planData.disease || !planData.device || !planData.sessionsPlanned) {
      alert('Please fill in all required fields');
      return;
    }

    Actions.createTreatmentPlan(patient.profile.id, planData);
    alert('Treatment plan saved successfully!');
    
    // Show pass to clinical button
    document.getElementById('passToClinical').style.display = 'inline-block';
  };

  document.getElementById('passToClinical').onclick = () => {
    // Set assignment to clinical assistant
    Actions.assignPatientToClinical(patient.profile.id);
    alert(`Treatment plan for ${patient.profile.name} has been passed to Clinical Assistant.`);
  };
}