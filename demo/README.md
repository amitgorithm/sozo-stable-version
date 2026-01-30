Sozo Demo Flow — README

Files created:
- demo/index.html  — Minimal stakeholder-facing prototype UI
- demo/style.css  — Simple clean styling
- demo/app.js     — Vanilla JS state manager using localStorage key `sozoDemoState_v1`

How to run locally:
1. Open `c:\Users\Amit-Work-PCS\SOZO-Master\Sozo-Prototype-App\demo\index.html` in your browser.
2. Use the left sidebar to select a Role (Receptionist / Doctor / Clinical Assistant / Patient).
3. Create/select a patient from the left (Receptionist can add patients). Toggle consent and payment to activate flows.

LocalStorage demo state:
- Key: `sozoDemoState_v1`
- Structure (example):
  {
    patients: [ { id, name, age, gender, visitDate, consent, payment, assessments: {FNON,PRS,EEG,brainMapping}, devices: [], sessions: [], treatmentPlan, assignedTo, notes } ],
    nextPatientNumber: 2
  }

Developer notes:
- `app.js` exposes `demo_save()` and `demo_reset()` on `window` for quick testing.
- This prototype is intentionally minimal and uses plain HTML/CSS/JS so stakeholders can view straightforward flows.
