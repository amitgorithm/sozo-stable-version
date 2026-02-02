# STATE MANAGEMENT CONTRACT
## Role-Based Prototype Application

This document defines the **mandatory state structure and rules** for the Sozo Demo Flow application. All developers must adhere to this contract strictly.

---

## 1. SINGLE SOURCE OF TRUTH

- All application data lives in `AppState` (defined in `state/state.js`)
- No screen, component, or file may duplicate business data
- UI renders only from state
- No local state for business data (patients, assessments, treatment plans, sessions)

---

## 2. ROLE-BASED DATA OWNERSHIP & PERMISSIONS

| Role | Can Read | Can Modify |
|------|----------|-----------|
| **Receptionist** | Patient profile, payment, consent | Patient profile, payment toggle, consent toggle |
| **Doctor** | Patient profile, assessments | Assessments, treatment plan |
| **Clinical Assistant** | Patient profile, assessments, treatment plan | Sessions, clinical notes |
| **Patient** | Own profile, assessments, treatment plan, sessions | Payment status only (mark as paid) |

---

## 3. STATE STRUCTURE (READ-ONLY)

```javascript
AppState = {
  app: {
    currentRole,          // ROLES.RECEPTIONIST | DOCTOR | CLINICAL_ASSISTANT | PATIENT
    currentScreen,        // e.g., "dashboard", "patientDetails"
    selectedPatientId     // null or patientId string
  },

  patients: {
    [patientId]: {
      profile: {
        id, name, age, gender, visitDate, createdAt
      },
      assessments: {
        prs: { score, completedBy, completedAt },
        fnon: { score, completedBy, completedAt },
        eeg: { score, completedBy, completedAt },
        brainMapping: { score, completedBy, completedAt }
      },
      payment: {
        status: "pending" | "completed" | "payLater",
        paymentDate
      },
      consent: {
        status: boolean,
        consentDate
      },
      treatmentPlan: {
        id, createdBy, createdAt, disease, device, montage,
        sessionsPlanned, status: "not_created" | "active" | "completed"
      },
      sessions: [ { sessionNumber, date, device, montage, ... } ],
      notes: [ { author, text, createdAt } ]
    }
  },

  ui: {
    loading: boolean,
    modal: null | string,
    error: null | string
  }
}
```

---

## 4. MUTATION RULES

### ❌ NEVER DO THIS

```javascript
// Direct mutation outside actions.js
AppState.patients[id].profile.name = "X";
AppState.patients[id].payment.status = "completed";
let state = { ...AppState.patients[id] }; // Don't copy state

// Hardcoded strings for roles or assessments
if (role === "doctor") { }  // WRONG
if (type === "prs") { }     // WRONG
```

### ✅ ALWAYS DO THIS

```javascript
// Import actions and constants
import * as Actions from "./state/actions.js";
import { ROLES, ASSESSMENTS, PAYMENT_STATUS } from "./state/roles.js";

// Use actions
Actions.createPatient({ name: "X", age: 30 });
Actions.updateAssessment(patientId, ASSESSMENTS.PRS, { score: 18 });

// Use role constants
if (currentRole === ROLES.DOCTOR) { }
if (type === ASSESSMENTS.PRS) { }

// Actions handle saveState() automatically
// You do NOT need to call saveState() yourself
```

---

## 5. PERSISTENCE

### Save Points

- Every action in `actions.js` calls `saveState()` automatically
- You must **never** call `saveState()` from outside `actions.js`
- All mutations are automatically persisted to `localStorage` with key `sozoDemoState_v2`

### Load Points

- On app startup: `import { loadState } from "./state/state.js"`; `loadState();`
- For testing: `resetState()` clears localStorage and reinitializes

---

## 6. UI RENDERING RULES

### Render Based On

- `AppState.app.currentRole` (never local variables)
- `AppState.app.selectedPatientId` (never local variables)
- Patient data from `AppState.patients[id]` (never copies)

### Local State Allowed For

- Form input values (before submission)
- Loading flags
- UI animation states
- Modal open/close toggles

### Local State NOT Allowed For

- Patient profile
- Assessments
- Treatment plans
- Sessions
- Payment or consent status
- Any business data

---

## 7. SCREEN BEHAVIOR

Each screen must declare:

1. **Role requirement** (who can see it)
2. **Data dependency** (what from AppState it reads)
3. **Mutations** (what actions it calls)

Example:

```javascript
// Screen: Doctor Treatment Plan
// Role: DOCTOR only
// Read: AppState.patients[selectedPatientId].assessments
// Write: Actions.createTreatmentPlan()

function renderDoctorTreatmentPlan(container) {
  const patient = AppState.patients[AppState.app.selectedPatientId];
  
  // Read from state
  const assessmentsSummary = getAssessmentSummary(patient.id);
  
  // Render UI with event handlers that call actions
  button.onclick = () => {
    Actions.createTreatmentPlan(patient.id, { device, montage, sessions });
    render(); // Re-render after mutation
  };
}
```

---

## 8. ASSESSMENT & TREATMENT WORKFLOWS

### Receptionist Workflow

1. Create patient → `Actions.createPatient()`
2. Get consent → `Actions.toggleConsent()`
3. Collect payment → `Actions.togglePayment()`
4. Patient activated ✓

### Doctor Workflow

1. View assessments (all completed by assistant)
2. Create treatment plan → `Actions.createTreatmentPlan()`
3. Plan is now active

### Clinical Assistant Workflow

1. Perform PRS → `Actions.performPRS()`
2. Add sessions → `Actions.addSession()`
3. Add notes → `Actions.addNote()`

### Patient Workflow

1. View limited info (until payment)
2. After payment: view full plan and sessions
3. Mark paid if pay-later → `Actions.patientMarkPaid()`

---

## 9. NO HARDCODING

### ❌ Wrong

```javascript
select.innerHTML = `
  <option value="receptionist">Receptionist</option>
  <option value="doctor">Doctor</option>
`;
```

### ✅ Right

```javascript
import { ROLE_LIST, ROLE_LABELS } from "./state/roles.js";

select.innerHTML = ROLE_LIST
  .map(role => `<option value="${role}">${ROLE_LABELS[role]}</option>`)
  .join('');
```

---

## 10. TREATMENT PLAN & MONTAGES

- Montages **MUST** come from state
- UI must read: `AppState.patients[patientId].treatmentPlan.montage`
- Never hardcode device logic in UI layer
- Device selection → `Actions.createTreatmentPlan()`

---

## 11. DEBUGGING & TESTING

### Browser Console

```javascript
// Check state
console.log(AppState);

// Reset state
import { resetState } from "./state/state.js";
resetState();

// Get a patient
import * as Actions from "./state/actions.js";
console.log(Actions.getPatient("P001"));

// Add a test note
Actions.addNote("P001", "tester", "Test note");
```

---

## 12. FINAL RULE

> **If the UI works without referencing state, the code is wrong.**

Every render function must read from `AppState`.  
Every user action must call an action function.  
Every action function must update `AppState`.  
Every update is automatically saved.

---

## ✅ QUICK CHECKLIST

- [ ] All mutations go through `actions.js`
- [ ] All role checks use `ROLES` constants
- [ ] All assessment types use `ASSESSMENTS` constants
- [ ] No hardcoded role or assessment strings
- [ ] Screen always reads fresh from `AppState`
- [ ] Screen calls actions, not direct mutations
- [ ] Local state used only for UI transient state
- [ ] Treatment plan read from state, not hardcoded
- [ ] Save state is never called outside actions.js
- [ ] Roles match the contract permissions table

---

## Support

For questions or additions to this contract:  
- Check [roles.js](./roles.js) for available constants
- Check [actions.js](./actions.js) for available mutations
- Check [state.js](./state.js) for state structure
