# Sozo Demo Prototype — Developer Guide

## Team Structure & Responsibilities

### 👑 **Project Lead** (You)
- **State Management**: Manages `state/` folder (state.js, actions.js, roles.js)
- **Overall Architecture**: Controls app.js and main integration
- **Code Review**: Reviews all module contributions before merge
- **LocalStorage Management**: Handles all persistence logic

### 🏥 **Module Developers** (3 developers)
1. **Receptionist/Patient Developer**: `modules/receptionist/` + `modules/patient/`
2. **Doctor Developer**: `modules/doctor/`
3. **Clinical Assistant Developer**: `modules/clinical-assistant/`

---

## 📁 Folder Structure

```
demo/
├── index.html                    (DO NOT TOUCH - Project Lead only)
├── app.js                        (DO NOT TOUCH - Project Lead only)
├── style.css                     (Global styles - Project Lead only)
│
├── state/                        (🚫 RESTRICTED AREA - Project Lead only)
│   ├── state.js                  ▲ State structure & localStorage
│   ├── roles.js                  ▲ Constants & permissions
│   └── actions.js                ▲ All state mutations
│
├── modules/                      (✅ Developer Work Area)
│   ├── receptionist/
│   ├── doctor/
│   ├── clinical-assistant/
│   └── patient/
│
├── shared/                       (✅ Shared utilities - all can use)
│   ├── components/
│   ├── utils/
│   └── styles/
│
└── docs/                         (📚 Documentation)
```

---

## 🚫 CRITICAL RULES

### What You CANNOT Touch
- `state/state.js` - Only Project Lead
- `state/actions.js` - Only Project Lead
- `state/roles.js` - Only Project Lead  
- `app.js` - Only Project Lead
- `index.html` - Only Project Lead

### What You CAN Touch
- Your assigned `modules/` folder
- `shared/` utilities (add new ones)
- Create your own CSS files in your module

---

## 🎯 Your Module Structure

Each module must follow this exact structure:

```
modules/your-role/
├── index.js                     (REQUIRED - Main render function)
├── style.css                    (Optional - Module-specific styles)
├── components/                  (Optional - Sub-components)
│   ├── component1.js
│   └── component2.js
└── README.md                    (REQUIRED - Module documentation)
```

---

## 📋 Required Entry Point

Your `modules/your-role/index.js` MUST export this function:

```javascript
/**
 * Main render function for [ROLE] module
 * @param {HTMLElement} container - DOM container to render in
 * @param {Object|null} selectedPatient - Current patient or null
 */
export function render[Role]Module(container, selectedPatient) {
  // Your code here
}
```

**Examples:**
- `renderReceptionistModule(container, selectedPatient)`
- `renderDoctorModule(container, selectedPatient)`
- `renderClinicalAssistantModule(container, selectedPatient)`
- `renderPatientModule(container, selectedPatient)`

---

## 🔧 How to Use State System

### Import Required Modules

```javascript
// At the top of your index.js
import { AppState } from '../../state/state.js';
import { ROLES, ASSESSMENTS, DEVICES, PAYMENT_STATUS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';
```

### Read from State ✅

```javascript
// Get current role
const currentRole = AppState.app.currentRole;

// Get selected patient
const patient = AppState.patients[AppState.app.selectedPatientId];

// Check role permissions
if (AppState.app.currentRole === ROLES.DOCTOR) {
  // Show doctor features
}

// Check payment status
if (patient.payment.status === PAYMENT_STATUS.COMPLETED) {
  // Show full features
}
```

### Modify State ✅

```javascript
// Create patient (Receptionist only)
Actions.createPatient({ name: 'John Doe', age: 30 });

// Update assessment (Doctor/Clinical Assistant)
Actions.updateAssessment(patientId, ASSESSMENTS.PRS, { score: 85 });

// Toggle payment
Actions.togglePayment(patientId);

// Add session note
Actions.addNote(patientId, 'Clinical Assistant', 'Session completed successfully');
```

### DON'T Do This ❌

```javascript
// NEVER mutate AppState directly
AppState.patients[id].name = 'New Name';              // ❌ FORBIDDEN
AppState.app.currentRole = 'doctor';                  // ❌ FORBIDDEN
patient.payment.status = 'completed';                // ❌ FORBIDDEN

// NEVER use hardcoded strings
if (role === 'doctor') { }                            // ❌ Use ROLES.DOCTOR
if (assessment === 'prs') { }                         // ❌ Use ASSESSMENTS.PRS

// NEVER call localStorage directly
localStorage.setItem('patient', data);               // ❌ Use Actions.*()
```

---

## 🎨 Permission System

Each role has specific permissions:

### Receptionist
- ✅ Create patients
- ✅ Toggle consent
- ✅ Toggle payment
- ❌ Perform assessments
- ❌ Create treatment plans

### Doctor
- ✅ View all assessments
- ✅ Perform all assessments (FNON, PRS, Brain Mapping)
- ✅ Create treatment plans
- ✅ Assign to clinical assistant
- ❌ Modify patient basic info

### Clinical Assistant
- ✅ Perform PRS only (not FNON or Brain Mapping)
- ✅ View treatment plans
- ✅ Add session notes
- ✅ Upload patient media
- ❌ Create treatment plans
- ❌ Perform FNON/Brain Mapping

### Patient
- ✅ Self-register
- ✅ Make payment
- ✅ View own progress (after payment)
- ❌ View other patients
- ❌ Modify treatment plans

---

## 🔄 Development Workflow

### 1. Set Up Your Module
```bash
# Navigate to your module
cd demo/modules/your-role/

# Create required files
touch index.js
touch style.css  
touch README.md
mkdir components
```

### 2. Implement Entry Point
```javascript
// modules/your-role/index.js
import { AppState } from '../../state/state.js';
import { ROLES } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';

export function renderYourRoleModule(container, selectedPatient) {
  // Permission check
  if (AppState.app.currentRole !== ROLES.YOUR_ROLE) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  // Your UI logic here
  container.innerHTML = `
    <div class="card">
      <h3>Your Role Dashboard</h3>
      <!-- Your content -->
    </div>
  `;
}
```

### 3. Test Your Module
1. Open `demo/index.html` in browser
2. Select your role from dropdown
3. Test all features
4. Verify state updates correctly

### 4. Submit for Review
1. Create pull request
2. Include testing notes
3. Document any new state requirements

---

## 🛠 Available Utilities

### UI Components
```javascript
import { createCard, createButton, createForm } from '../../shared/components/ui-components.js';

// Use pre-built components
const card = createCard('Title', 'Content', 'css-class');
const button = createButton('Click Me', 'btn btn-primary', () => alert('Clicked!'));
```

### UI Helpers
```javascript
import { createNotification, showModal, formatDate } from '../../shared/utils/ui-helpers.js';

// Show notifications
createNotification('Success!', 'success', 3000);

// Show modals
showModal('Confirm', 'Are you sure?', [
  { text: 'Cancel', class: 'btn btn-ghost' },
  { text: 'Confirm', class: 'btn btn-primary', onClick: () => console.log('Confirmed') }
]);

// Format dates
const formatted = formatDate('2024-01-15T10:30:00Z'); // "Jan 15, 2024"
```

---

## 🐛 Debugging

### Browser Console
```javascript
// Check current state
console.log(AppState);

// Check current patient
console.log(AppState.patients[AppState.app.selectedPatientId]);

// Test actions
Actions.createPatient({ name: 'Test Patient', age: 25 });

// Reset state for testing
window.demo_reset();
```

### Common Issues
1. **"AppState is undefined"** → Check your import path
2. **"Function not found"** → Check if function is exported from actions.js
3. **"Permission denied"** → Check role constants and current role
4. **"State not saving"** → Use Actions.* functions, not direct mutations

---

## 📞 Getting Help

### Before Asking for Help
1. Check your imports
2. Check browser console for errors
3. Verify you're using Actions.* functions
4. Read this guide again

### When to Contact Project Lead
- Need new state structure
- Need new action functions
- Need role permission changes
- Integration issues

### When to Contact Other Developers
- Shared component issues
- UI/UX discussions
- Testing help

---

## ✅ Pre-Submission Checklist

- [ ] Module exports correct render function
- [ ] All imports use relative paths (`../../state/...`)
- [ ] No hardcoded role/assessment strings
- [ ] All state changes use Actions.* functions
- [ ] Permission checks implemented
- [ ] Error handling for missing patient
- [ ] Tested in browser
- [ ] README.md created with usage instructions
- [ ] No console errors
- [ ] Follows naming conventions

---

## 🚀 Example Module Template

Copy this template to start your module:

```javascript
// modules/your-role/index.js
import { AppState } from '../../state/state.js';
import { ROLES, PAYMENT_STATUS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';

export function renderYourRoleModule(container, selectedPatient) {
  // Permission check
  if (AppState.app.currentRole !== ROLES.YOUR_ROLE) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  // Patient selection check
  if (!selectedPatient) {
    container.innerHTML = `
      <div class="card">
        <h3>Your Role Portal</h3>
        <p class="small">Select a patient from the sidebar to begin</p>
      </div>
    `;
    return;
  }

  // Payment activation check (if required)
  if (selectedPatient.payment.status === PAYMENT_STATUS.PENDING) {
    container.innerHTML = `
      <div class="card warning">
        <h3>Patient Not Activated</h3>
        <p>Patient requires payment activation before proceeding.</p>
      </div>
    `;
    return;
  }

  // Main UI
  container.innerHTML = `
    <div class="module-header">
      <h2>Your Role — ${selectedPatient.profile.name}</h2>
    </div>
    <div class="module-content">
      <!-- Your content here -->
    </div>
  `;
}
```

Happy coding! 🚀