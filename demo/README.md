# Sozo Medical Demo Prototype

A modular, state-driven medical application prototype demonstrating role-based workflows for stakeholder presentation.

## 🚀 Quick Start

1. **Open the demo**: Double-click `index.html` to run in browser
2. **Switch roles**: Use the dropdown in the top-left to experience different user flows
3. **Follow the patient journey**: Create → Assess → Treat → Track

## 🏗️ Team Development Structure

### Module Ownership
- **You**: State management (`state/`) + Main orchestration (`app.js`, `index.html`)
- **Developer 1**: `modules/receptionist/` + `modules/patient/`
- **Developer 2**: `modules/doctor/`
- **Developer 3**: `modules/clinical-assistant/`

### Folder Structure
```
demo/
├── index.html              (main entry point)
├── app.js                  (orchestrator - loads modules)
├── style.css               (global styles)
│
├── state/                  (YOU manage this)
│   ├── state.js            (AppState definition)
│   ├── roles.js            (constants & enums)
│   └── actions.js          (all state mutations)
│
├── modules/                (role-specific code)
│   ├── receptionist/       (Dev 1)
│   ├── doctor/             (Dev 2) 
│   ├── clinical-assistant/ (Dev 3)
│   └── patient/            (Dev 1)
│
├── shared/                 (common utilities)
│   ├── components/
│   ├── utils/
│   └── styles/
│
└── docs/                   (guides & references)
    ├── DEVELOPER_GUIDE.md
    ├── MODULE_STRUCTURE.md
    └── API_REFERENCE.md
```

## 📋 Role Flow Summary

### 1. **Receptionist** (Entry Point)
- Create patient profiles
- Manage consent & payment gateway
- Activate patients for clinical flow

### 2. **Patient** (Self-Service)
- Self-register and provide consent
- Complete payment (Pay Now or Pay Later)
- View treatment progress (after payment)

### 3. **Doctor** (Assessment & Planning) 
- Review completed assessments (PRS, FNON, Brain Mapping)
- Create treatment plans based on findings
- Assign patients to Clinical Assistants

### 4. **Clinical Assistant** (Execution)
- Perform PRS assessments
- Execute treatment sessions
- Track patient progress and observations

## 🔗 State Management Contract

### Key Rules for All Developers:
1. **Never modify AppState directly** - Use actions from `actions.js`
2. **Import state properly**: `import { AppState, Actions } from '../state/actions.js'`
3. **Check permissions**: Verify role access before showing features
4. **Render pattern**: Module exports `render[Role]Module(container)` function
5. **Persistence**: All state changes auto-save to localStorage

### Example Module Pattern:
```javascript
// modules/your-role/index.js
import { AppState, Actions } from '../../state/actions.js';
import { ROLES } from '../../state/roles.js';

export function renderYourRoleModule(container) {
  // 1. Check permissions
  if (AppState.app.currentRole !== ROLES.YOUR_ROLE) {
    container.innerHTML = '<div class="error">Access denied</div>';
    return;
  }

  // 2. Get current patient (if needed)
  const patient = AppState.app.selectedPatientId 
    ? Actions.getPatient(AppState.app.selectedPatientId)
    : null;

  // 3. Build UI
  container.innerHTML = `<div class="card">Your content here</div>`;

  // 4. Wire events using Actions
  container.querySelector('#someButton').onclick = () => {
    Actions.someAction(param);
    // Re-render will happen automatically via main app
  };
}
```

## 🛠️ Development Workflow

1. **Pick up your module(s)** from the `modules/` folder
2. **Read the module docs** in `docs/MODULE_STRUCTURE.md`
3. **Test your changes** by opening `index.html` and switching to your role
4. **Use shared utilities** from `shared/` for common UI patterns
5. **Ask questions** about state management - that's centrally managed

## ⚠️ Important Notes

- **ES6 Modules**: All files use `import/export` - serve via HTTP if needed
- **No Build Process**: Plain vanilla JavaScript for simplicity
- **Browser Compatibility**: Modern browsers only (ES2020+)
- **State Debugging**: Use `demo_save()` and `demo_reset()` in browser console

## 📚 Next Steps

1. Review `docs/DEVELOPER_GUIDE.md` for detailed technical specs
2. Check out `shared/components/` for reusable UI patterns  
3. See `docs/API_REFERENCE.md` for state action documentation
4. Test the integrated system with all role flows

---

**Ready to demo stakeholder-ready medical workflows with clean, maintainable code!** 🎯

Developer notes:
- `app.js` exposes `demo_save()` and `demo_reset()` on `window` for quick testing.
- This prototype is intentionally minimal and uses plain HTML/CSS/JS so stakeholders can view straightforward flows.
