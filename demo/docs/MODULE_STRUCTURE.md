# Module Structure Guidelines

## Overview
This document defines the standard structure for all role-based modules in the Sozo demo prototype.

---

## Standard Module Structure

```
modules/[role-name]/
├── index.js                     (Required - Entry point)
├── style.css                    (Optional - Module styles)
├── README.md                    (Required - Documentation)
├── components/                  (Optional - Sub-components)
│   ├── component1.js
│   ├── component2.js
│   └── utils.js
└── assets/                      (Optional - Images, icons)
    ├── images/
    └── icons/
```

---

## Required Files

### 1. index.js (Entry Point)
**Purpose**: Main module controller that exports the render function

**Template**:
```javascript
/**
 * [ROLE_NAME] MODULE
 * Responsibilities:
 * - [List key responsibilities]
 */

import { AppState } from '../../state/state.js';
import { ROLES, ASSESSMENTS } from '../../state/roles.js';
import * as Actions from '../../state/actions.js';

export function render[RoleName]Module(container, selectedPatient) {
  // Implementation
}
```

**Requirements**:
- Must export exactly one function: `render[RoleName]Module`
- Function signature: `(container, selectedPatient) => void`
- Must include permission checks
- Must handle null/undefined patient gracefully
- Must use Actions.* for state mutations

### 2. README.md (Documentation)
**Purpose**: Document module-specific functionality and developer notes

**Template**:
```markdown
# [Role Name] Module

## Responsibilities
- [List what this module does]

## Permissions
- [List what this role can/cannot do]

## Key Components
- [List main components]

## State Dependencies
- [List what from AppState this module reads]

## Actions Used
- [List Actions.* functions this module calls]

## Testing Notes
- [How to test this module]

## Known Issues
- [Any current limitations]
```

---

## Optional Files

### style.css (Module Styles)
**Purpose**: Module-specific CSS that doesn't conflict with global styles

**Guidelines**:
- Use module-specific class prefixes: `.receptionist-`, `.doctor-`, etc.
- Import global variables from shared styles
- Don't override global component styles

**Template**:
```css
/* [ROLE_NAME] MODULE STYLES */

.role-name-container {
  /* Module-specific styles */
}

.role-name-card {
  /* Custom card styling for this role */
}

.role-name-button {
  /* Custom button styling */
}
```

### components/ (Sub-components)
**Purpose**: Break down complex UI into manageable pieces

**Guidelines**:
- Each component should have a single responsibility
- Export functions that return HTML strings or DOM elements
- Use consistent naming: `render[ComponentName]()`

**Example**:
```javascript
// components/assessmentGrid.js
export function renderAssessmentGrid(assessments) {
  return `
    <div class="assessment-grid">
      ${Object.entries(assessments).map(([key, value]) => 
        `<div class="assessment-item">${key}: ${value.score}</div>`
      ).join('')}
    </div>
  `;
}
```

---

## Role-Specific Requirements

### Receptionist Module
**Key Screens**:
- Patient registration form
- Patient activation (consent + payment)
- Patient list management

**Required Components**:
- New patient form
- Payment processing UI
- Consent collection

### Doctor Module
**Key Screens**:
- Assessment dashboard
- Assessment performance (FNON, PRS, Brain Mapping)
- Treatment plan builder
- Montage configuration

**Required Components**:
- Assessment cards
- Treatment plan form
- Device/montage selectors

### Clinical Assistant Module
**Key Screens**:
- Assessment checklist (PRS only)
- Treatment plan viewer
- Session management
- Media upload

**Required Components**:
- PRS assessment form
- Session recorder
- Media uploader
- Notes editor

### Patient Module
**Key Screens**:
- Self-registration
- Payment processing
- Progress dashboard
- Treatment plan viewer

**Required Components**:
- Registration form
- Payment interface
- Progress tracker
- Report viewer

---

## State Integration Patterns

### Reading State
```javascript
// Get current patient
const patient = AppState.patients[AppState.app.selectedPatientId];

// Check role permissions
if (AppState.app.currentRole === ROLES.DOCTOR) {
  // Doctor-specific logic
}

// Get assessment summary
const summary = Actions.getAssessmentSummary(patient.profile.id);
```

### Updating State
```javascript
// Use Actions.* functions
Actions.createPatient({ name, age, gender });
Actions.updateAssessment(patientId, ASSESSMENTS.PRS, { score: 85 });
Actions.addNote(patientId, 'Clinical Assistant', 'Session notes');

// State automatically saves via Actions
```

### Error Handling
```javascript
// Always check for patient existence
if (!selectedPatient) {
  container.innerHTML = '<div class="warning">No patient selected</div>';
  return;
}

// Check permissions
if (AppState.app.currentRole !== ROLES.EXPECTED_ROLE) {
  container.innerHTML = '<div class="error">Access denied</div>';
  return;
}

// Check payment status if required
if (selectedPatient.payment.status === PAYMENT_STATUS.PENDING) {
  container.innerHTML = '<div class="warning">Payment required</div>';
  return;
}
```

---

## UI Consistency Guidelines

### Use Shared Components
```javascript
import { createCard, createButton, createForm } from '../../shared/components/ui-components.js';

// Consistent card creation
const card = createCard('Title', content, 'custom-class');

// Consistent button creation
const button = createButton('Action', 'btn btn-primary', () => handleClick());
```

### Standard CSS Classes
- `.card` - Main content containers
- `.btn`, `.btn-primary`, `.btn-ghost` - Buttons
- `.form-grid` - Form layouts
- `.status-badge` - Status indicators
- `.module-header` - Module title area
- `.module-content` - Main content area

### Standard Status Indicators
```javascript
import { createStatusBadge } from '../../shared/components/ui-components.js';

// Consistent status display
const badge = createStatusBadge('success', 'Completed');
const badge2 = createStatusBadge('warning', 'Pending');
```

---

## Testing Guidelines

### Manual Testing Checklist
- [ ] Module loads without errors
- [ ] Permission checks work correctly
- [ ] All user interactions work
- [ ] State updates correctly after actions
- [ ] UI re-renders after state changes
- [ ] Error states display properly
- [ ] Responsive design works on mobile

### Browser Console Testing
```javascript
// Test state access
console.log(AppState);

// Test action calls
Actions.createPatient({ name: 'Test', age: 25 });

// Check module exports
import('./modules/your-role/index.js').then(module => {
  console.log(module); // Should show your render function
});
```

---

## Performance Guidelines

### Efficient Rendering
- Minimize DOM manipulations
- Use `innerHTML` for bulk updates
- Cache DOM queries in variables
- Debounce rapid user interactions

### Memory Management
- Remove event listeners when re-rendering
- Clear intervals/timeouts
- Avoid memory leaks in closures

### Example Efficient Pattern
```javascript
export function renderYourModule(container, patient) {
  // Clear previous listeners
  container.innerHTML = '';
  
  // Render new content
  container.innerHTML = createUI(patient);
  
  // Add new listeners
  container.querySelector('#submitBtn').onclick = handleSubmit;
  container.querySelector('#cancelBtn').onclick = handleCancel;
}
```

---

## Code Quality Standards

### ESLint Rules
- Use `const` for constants, `let` for variables
- Use template literals for string interpolation
- Use arrow functions for short functions
- Use destructuring for object/array access

### Documentation
- Comment complex logic
- Use JSDoc for function documentation
- Include examples for reusable components

### Error Handling
- Always handle null/undefined cases
- Provide meaningful error messages
- Log errors for debugging

---

## Deployment Checklist

Before submitting your module:

- [ ] All required files created
- [ ] Entry point exports correct function
- [ ] Permission checks implemented
- [ ] Error handling added
- [ ] State integration follows patterns
- [ ] UI uses shared components
- [ ] Testing completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Code follows style guidelines