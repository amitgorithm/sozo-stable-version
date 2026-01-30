/**
 * CLINICAL ASSISTANT MODULE
 * Responsibilities:
 * - View patient assessment checklist
 * - Perform ONLY PRS assessments (cannot do FNON or Brain Mapping)
 * - View treatment plans created by doctors
 * - Add clinical observations per session
 * - Attach patient images/videos
 * - Record patient feedback per session
 */

import { AppState } from '../../state/state.js';
import { ROLES, ASSESSMENTS, PAYMENT_STATUS, PLAN_STATUS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';

export function renderClinicalAssistantModule(container, selectedPatient) {
  // Permission check
  if (AppState.app.currentRole !== ROLES.CLINICAL_ASSISTANT) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  if (!selectedPatient) {
    container.innerHTML = `
      <div class="card">
        <h3>Clinical Assistant Portal</h3>
        <p class="small">Select a patient from the sidebar to begin</p>
      </div>
    `;
    return;
  }

  // Check if patient is activated
  if (selectedPatient.payment.status === PAYMENT_STATUS.PENDING) {
    container.innerHTML = `
      <div class="card warning">
        <h3>Patient Not Activated</h3>
        <p>Patient ${selectedPatient.profile.name} requires activation before clinical procedures.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="module-header">
      <h2>Clinical Assistant — ${selectedPatient.profile.name}</h2>
      <p class="small">Patient ID: ${selectedPatient.profile.id}</p>
    </div>
    <div class="module-content">
      <div id="assessmentChecklist"></div>
      <div id="treatmentPlanView"></div>
      <div id="sessionManagement"></div>
    </div>
  `;

  renderAssessmentChecklist(selectedPatient);
  renderTreatmentPlanView(selectedPatient);
  renderSessionManagement(selectedPatient);
}

function renderAssessmentChecklist(patient) {
  const container = document.getElementById('assessmentChecklist');
  
  const assessments = patient.assessments;
  const prsCompleted = assessments.prs.score !== null;
  const fnonCompleted = assessments.fnon.score !== null;
  const brainMappingCompleted = assessments.brainMapping.score !== null;

  container.innerHTML = `
    <div class="card">
      <h3>Assessment Checklist</h3>
      <p class="small">Clinical Assistant can only perform PRS assessments</p>
      
      <div class="checklist">
        <div class="checklist-item ${prsCompleted ? 'completed' : 'pending'}">
          <div class="status-icon">${prsCompleted ? '✓' : '○'}</div>
          <div class="item-content">
            <strong>PRS Assessment</strong>
            <p class="small">Performed by Clinical Assistant</p>
            ${prsCompleted ? `
              <div class="result">Score: ${assessments.prs.score} | By: ${assessments.prs.completedBy}</div>
            ` : ''}
          </div>
          <div class="item-actions">
            ${!prsCompleted ? `
              <button id="performPRS" class="btn btn-primary">Perform PRS</button>
            ` : `
              <span class="status-badge success">Complete</span>
            `}
          </div>
        </div>

        <div class="checklist-item ${fnonCompleted ? 'completed' : 'pending'} disabled">
          <div class="status-icon">${fnonCompleted ? '✓' : '○'}</div>
          <div class="item-content">
            <strong>FNON Assessment</strong>
            <p class="small">Doctor only - No access</p>
            ${fnonCompleted ? `
              <div class="result">Score: ${assessments.fnon.score} | By: ${assessments.fnon.completedBy}</div>
            ` : ''}
          </div>
          <div class="item-actions">
            <span class="status-badge ${fnonCompleted ? 'success' : 'pending'}">
              ${fnonCompleted ? 'Complete' : 'Doctor Required'}
            </span>
          </div>
        </div>

        <div class="checklist-item ${brainMappingCompleted ? 'completed' : 'pending'} disabled">
          <div class="status-icon">${brainMappingCompleted ? '✓' : '○'}</div>
          <div class="item-content">
            <strong>Brain Mapping (EEG)</strong>
            <p class="small">Doctor only - No access</p>
            ${brainMappingCompleted ? `
              <div class="result">Score: ${assessments.brainMapping.score} | By: ${assessments.brainMapping.completedBy}</div>
            ` : ''}
          </div>
          <div class="item-actions">
            <span class="status-badge ${brainMappingCompleted ? 'success' : 'pending'}">
              ${brainMappingCompleted ? 'Complete' : 'Doctor Required'}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event handlers
  if (!prsCompleted) {
    document.getElementById('performPRS').onclick = () => {
      performPRS(patient.profile.id);
    };
  }
}

function performPRS(patientId) {
  // Simulate PRS assessment
  const score = Math.floor(Math.random() * 40) + 10; // Random 10-50
  
  Actions.updateAssessment(patientId, ASSESSMENTS.PRS, {
    score,
    completedBy: 'Clinical Assistant',
    notes: 'PRS assessment completed successfully via clinical assistant protocol'
  });

  Actions.addNote(patientId, 'Clinical Assistant', `PRS assessment completed with score: ${score}`);
  
  alert('PRS assessment completed successfully!');
  
  // Re-render to show updates
  const patient = Actions.getPatient(patientId);
  renderAssessmentChecklist(patient);
  renderTreatmentPlanView(patient);
}

function renderTreatmentPlanView(patient) {
  const container = document.getElementById('treatmentPlanView');
  
  const hasTreatmentPlan = patient.treatmentPlan.status !== PLAN_STATUS.NOT_CREATED;
  const allAssessmentsComplete = patient.assessments.prs.score !== null &&
                                patient.assessments.fnon.score !== null &&
                                patient.assessments.brainMapping.score !== null;

  if (!allAssessmentsComplete) {
    container.innerHTML = `
      <div class="card disabled">
        <h3>Treatment Plan</h3>
        <p class="small">All assessments must be completed before treatment plan is available</p>
      </div>
    `;
    return;
  }

  if (!hasTreatmentPlan) {
    container.innerHTML = `
      <div class="card warning">
        <h3>Treatment Plan</h3>
        <p>All assessments complete. Waiting for doctor to create treatment plan.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <h3>Active Treatment Plan</h3>
      <div class="treatment-summary">
        <div class="plan-details">
          <div class="detail-item">
            <label>Disease Category:</label>
            <span>${patient.treatmentPlan.disease}</span>
          </div>
          <div class="detail-item">
            <label>Primary Device:</label>
            <span>${patient.treatmentPlan.device}</span>
          </div>
          <div class="detail-item">
            <label>Montage:</label>
            <span>${patient.treatmentPlan.montage}</span>
          </div>
          <div class="detail-item">
            <label>Planned Sessions:</label>
            <span>${patient.treatmentPlan.sessionsPlanned}</span>
          </div>
          <div class="detail-item">
            <label>Sessions Completed:</label>
            <span>${patient.sessions.length}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderSessionManagement(patient) {
  const container = document.getElementById('sessionManagement');
  
  const hasTreatmentPlan = patient.treatmentPlan.status !== PLAN_STATUS.NOT_CREATED;

  if (!hasTreatmentPlan) {
    container.innerHTML = `
      <div class="card disabled">
        <h3>Session Management</h3>
        <p class="small">Treatment plan required for session management</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card">
      <h3>Session Management</h3>
      
      <div id="sessionList">
        ${renderSessionList(patient)}
      </div>
      
      <div id="newSessionForm">
        <h4>Add New Session</h4>
        <div class="form-grid">
          <div class="form-group">
            <label>Session Duration (minutes)</label>
            <input type="number" id="sessionDuration" value="30" min="10" max="120">
          </div>
          <div class="form-group">
            <label>Clinical Observations</label>
            <textarea id="clinicalObservations" placeholder="Patient response, side effects, observations..."></textarea>
          </div>
          <div class="form-group">
            <label>Patient Feedback</label>
            <textarea id="patientFeedback" placeholder="Patient's reported experience, comfort level..."></textarea>
          </div>
          <div class="form-group">
            <label>Attach Media</label>
            <input type="file" id="sessionMedia" accept="image/*,video/*" multiple>
            <p class="small">Upload patient images or videos for this session</p>
          </div>
        </div>
        <button id="addSession" class="btn btn-primary">Add Session Record</button>
      </div>
    </div>
  `;

  // Event handlers
  document.getElementById('addSession').onclick = () => {
    addSessionRecord(patient.profile.id);
  };
}

function renderSessionList(patient) {
  if (patient.sessions.length === 0) {
    return '<p class="small">No sessions recorded yet</p>';
  }

  return `
    <div class="session-list">
      ${patient.sessions.map((session, index) => `
        <div class="session-item">
          <div class="session-header">
            <strong>Session ${session.sessionNumber}</strong>
            <span class="session-date">${new Date(session.date).toLocaleDateString()}</span>
          </div>
          <div class="session-details">
            <div>Duration: ${session.duration} minutes</div>
            <div>Device: ${session.device}</div>
            ${session.notes ? `<div>Notes: ${session.notes}</div>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function addSessionRecord(patientId) {
  const duration = parseInt(document.getElementById('sessionDuration').value);
  const observations = document.getElementById('clinicalObservations').value;
  const feedback = document.getElementById('patientFeedback').value;
  const mediaFiles = document.getElementById('sessionMedia').files;

  if (!duration || duration < 10) {
    alert('Please enter a valid session duration (minimum 10 minutes)');
    return;
  }

  const patient = Actions.getPatient(patientId);
  
  const sessionData = {
    device: patient.treatmentPlan.device,
    montage: patient.treatmentPlan.montage,
    duration,
    observations,
    patientFeedback: feedback,
    completedBy: 'Clinical Assistant',
    mediaAttached: mediaFiles.length > 0
  };

  Actions.addSession(patientId, sessionData);
  
  // Add a note about the session
  Actions.addNote(patientId, 'Clinical Assistant', 
    `Session ${patient.sessions.length + 1} completed. Duration: ${duration} min. ${observations ? 'Observations recorded.' : ''}`);
  
  alert('Session record added successfully!');
  
  // Clear form
  document.getElementById('sessionDuration').value = '30';
  document.getElementById('clinicalObservations').value = '';
  document.getElementById('patientFeedback').value = '';
  document.getElementById('sessionMedia').value = '';
  
  // Re-render to show new session
  const updatedPatient = Actions.getPatient(patientId);
  renderSessionManagement(updatedPatient);
}