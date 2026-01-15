# MCS MVP – QA Strategy (Prescription Clarity)

> _This document describes the quality assurance approach for the Prescription Clarity MVP (MCS MVP) – a web/mobile app for medication adherence._

---

## 1. Purpose & Scope

The goal of this strategy is to define the QA approach for **MCS MVP (Prescription Clarity)** within the capstone project:

- Describe **test levels and types**.
- Define **roles and responsibilities**.
- Align on **tools, environments, processes**, and **quality criteria**.

**Functional scope:**

- Auth & Profile:
  - Registration / login / logout.
  - User profile (basic settings).
- Medications CRUD:
  - Create, edit, delete medication records.
  - Basic validations (name, dose, schedule, etc.).
- Schedule & Calendar:
  - Schedule generation.
  - Calendar display.
  - Marking taken / skipped.
- Rewards (MVP level):
  - Basic progress/points rules.

---

## 2. QA Objectives & Quality Goals

Primary QA goals:

1. **Reliable core MVP flow:**  
   Create account → add medication → configure schedule → receive reminder → mark intake → see progress.
2. **Minimize critical/major defects** in the core flow.
3. Ensure **process transparency**:
   - Tests and results in TMS (Qase).
   - QA artifacts stored in the repo.
4. Support **rapid iteration**:
   - Tests in parallel with dev (unit/API).
   - Automation runs in CI.
5. Provide **evidence for the capstone**:
   - QA Strategy, reports, metrics, sample tests.

---

## 3. Roles & Responsibilities

**QA Engineer (Vladyslav):**

- Own QA Strategy.
- Create/maintain:
  - Unit tests (backend/frontend).
  - API tests.
  - Integration / e2e tests.
  - Manual tests in Qase.
- Plan and run smoke/regression.
- Analyze CI, collaborate with devs.
- QA summary before demos.

**Frontend Developers (FE1, FE2):**

- UI and API integration.
- Unit/UI tests.
- Fix defects.

**Backend Developers (BE1, BE2):**

- API and business logic.
- Server-side unit tests.
- Support CI.
- Fix defects.

**UX Designer:**

- Accessibility/usability review.
- Prototype validation.

---

## 4. Test Levels & Types

### 4.1 Unit Testing

- Owners: QA + Dev.
- Target: logic, validation, components.
- Tools: Jest.

### 4.2 API Testing

- Owner: QA.
- Positive, negative, edge cases.
- Tools: Postman.

### 4.3 Integration Testing

- API + DB, UI + API.
- Examples: create medication → DB → UI.

### 4.4 End-to-End (E2E) Testing

- Critical scenarios.
- Registration → Medication → Schedule → Progress.
- Tools: Jest.

### 4.5 Manual Functional Testing

- Qase suites: Auth, CRUD, Calendar, Rewards.
- Smoke + Regression.

---

## 5. Test Approach

### 5.1 Principles

- Risk-based testing.
- Iterative & incremental.
- Automation-first where it pays off.

### 5.2 Alignment with Sprints

- **Sprints 1–2:** Auth, architecture → unit/API + smoke.
- **Sprints 2–3:** CRUD → more API/unit, manual functional.
- **Sprints 3–4:** Calendar, Rewards → e2e, regression.

---

## 6. Environments & Test Data

### 6.1 Environments

- Local Dev
- QA env (Vercel/Render)
- Demo env

### 6.2 Test Data

- Sets of test users.
- Medications with various schedules.

---

## 7. CI/CD & Regression

- GitHub Actions.
- Lint + unit/API tests on every push/PR.
- Smoke before demos.

---

## 8. Defect Management & Reporting

- Bug tracking: Trello/Quase.
- Fields: Summary, Steps, Expected/Actual, Severity/Priority.

---

## 9. Communication & Rituals

- Daily Stand-up (weekdays).
- Telegram chat: async updates.
- Sprint Planning / Retro.

---

## 10. Risks & Mitigation

1. Limited time → prioritization.
2. Limited automation → focus on API/e2e.
3. Free-tier infrastructure → warm-up before demos.
4. Changing requirements

---

## 11. Metrics & Continuous Improvement

Metrics (closer to weeks 7–8):

- Total/Pass/Fail/Blocked (Qase).
- Defects by severity.
- Automation coverage.

Continuous improvement:

- Defect analysis.
- Strengthen automation.
- Update Strategy.
