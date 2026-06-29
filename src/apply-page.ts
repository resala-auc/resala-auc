import { roles, yearLevelOptions, type RoleOption } from "./apply-config.ts";

const logoPath = "../The brand System/logos/Resala Logo - source.svg";

function escapeAttr(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function textField({
  id,
  label,
  type = "text",
  autocomplete,
  placeholder,
  required = true
}: {
  id: string;
  label: string;
  type?: string;
  autocomplete?: string;
  placeholder?: string;
  required?: boolean;
}): string {
  return `
    <div class="apply-field" data-field="${id}">
      <label for="${id}">${label}${required ? " <span aria-hidden=\"true\">*</span>" : ""}</label>
      <input id="${id}" name="${id}" type="${type}" ${autocomplete ? `autocomplete="${autocomplete}"` : ""} ${placeholder ? `placeholder="${escapeAttr(placeholder)}"` : ""} ${required ? "required" : ""}>
      <p class="field-error" id="${id}-error" data-error-for="${id}"></p>
    </div>
  `;
}

function textareaField({
  id,
  label,
  placeholder,
  required = false,
  helper
}: {
  id: string;
  label: string;
  placeholder: string;
  required?: boolean;
  helper?: string;
}): string {
  return `
    <div class="apply-field apply-field-full" data-field="${id}">
      <label for="${id}">${label}${required ? " <span aria-hidden=\"true\">*</span>" : ""}</label>
      ${helper ? `<p class="field-helper" id="${id}-helper">${helper}</p>` : ""}
      <textarea id="${id}" name="${id}" rows="5" placeholder="${escapeAttr(placeholder)}" ${required ? "required" : ""}></textarea>
      <p class="field-error" id="${id}-error" data-error-for="${id}"></p>
    </div>
  `;
}

export function RoleSelector(): string {
  const roleCards = roles
    .map(
      (role: RoleOption) => `
        <label class="role-option-card" data-role-card="${role.id}">
          <input class="choice-radio" type="radio" name="roleAppliedFor" value="${role.id}" required>
          <span class="role-option-step">${role.stepTitle}</span>
          <strong>${role.name}</strong>
          <span>${role.description}</span>
          <button class="role-details-button" type="button" data-role-details="${role.id}">View details</button>
        </label>
      `
    )
    .join("");
  const secondPreferenceOptions = roles
    .map((role) => `<option value="${role.id}">${role.name}</option>`)
    .join("");

  return `
    <section class="apply-card apply-role-section" aria-labelledby="role-section-title">
      <div class="apply-card-heading">
        <span class="apply-step-number">02</span>
        <div>
          <h2 id="role-section-title">Choose your role</h2>
          <p>Select the step you want to help build this year.</p>
        </div>
      </div>
      <div class="role-option-grid" role="radiogroup" aria-describedby="roleAppliedFor-error">
        ${roleCards}
      </div>
      <p class="field-error" id="roleAppliedFor-error" data-error-for="roleAppliedFor"></p>
      <div class="apply-field role-second-preference" data-field="secondPreference">
        <label for="secondPreference">Second preference <span aria-hidden="true">*</span></label>
        <select id="secondPreference" name="secondPreference" required>
          <option value="">Select another role</option>
          ${secondPreferenceOptions}
        </select>
        <p class="field-helper">Choose the role you would most want after your first choice.</p>
        <p class="field-error" id="secondPreference-error" data-error-for="secondPreference"></p>
      </div>
    </section>
  `;
}

export function RoleDescriptionCard(): string {
  return `
    <aside class="role-description-card" data-role-description-card aria-live="polite">
      <span class="role-description-kicker">Selected role</span>
      <h3 data-role-description-title>Choose a role to see its step.</h3>
      <p data-role-description-copy>Your selected role description will appear here to help you answer the application questions with focus.</p>
      <button class="button button-secondary role-description-action" type="button" data-selected-role-details hidden>View full details</button>
    </aside>
  `;
}

export function RoleDetailsDialog(): string {
  return `
    <div class="role-details-dialog" data-role-details-dialog hidden>
      <div class="role-details-backdrop" data-role-details-close></div>
      <section class="role-details-panel" role="dialog" aria-modal="true" aria-labelledby="role-details-title" tabindex="-1">
        <button class="role-details-close" type="button" aria-label="Close role details" data-role-details-close>&times;</button>
        <div data-role-details-content></div>
      </section>
    </div>
  `;
}

export function InterviewSlotSelector(): string {
  return `
    <section class="apply-card" aria-labelledby="interview-section-title">
      <div class="apply-card-heading">
        <span class="apply-step-number">04</span>
        <div>
          <h2 id="interview-section-title">Interview time slot</h2>
          <p>Choose an available date first, then pick one of the open interview times.</p>
        </div>
      </div>
      <div class="slot-picker" aria-describedby="interviewSlot-error" data-slot-options>
        <p class="slot-loading" data-slot-loading>Loading available interview slots...</p>
      </div>
      <p class="field-error" id="interviewSlot-error" data-error-for="interviewSlot"></p>
    </section>
  `;
}

export function SuccessState(): string {
  return `
    <section class="success-state" data-success-state hidden tabindex="-1" aria-labelledby="success-title">
      <span class="success-mark" aria-hidden="true">01</span>
      <h2 id="success-title">Thank you for taking the first step with Resala.</h2>
      <p>Your application has been received.</p>
      <div class="success-slot">
        <span>Your selected interview slot is:</span>
        <strong data-success-slot>[INTERVIEW_SLOT]</strong>
      </div>
      <p class="success-processing" data-success-processing>Your confirmation email and calendar invite are being prepared in the background.</p>
      <p>We'll contact you by email with your confirmation and what you should prepare for the interview.</p>
      <div class="success-actions">
        <a class="button button-primary" href="../tasks/">Submit task links</a>
        <a class="button button-secondary" href="../">Back to recruitment page</a>
      </div>
    </section>
  `;
}

export function ApplicationForm(): string {
  return `
    <form class="application-form" data-application-form novalidate>
      <div class="form-error-summary" data-error-summary hidden role="alert"></div>

      <aside class="application-attention-note" aria-label="Important application note">
        <span>Important before you submit</span>
        <strong>Read your confirmation email carefully after applying.</strong>
        <p>It includes the details you need before your interview, and following it closely shows us that you pay attention to what matters.</p>
      </aside>

      <section class="apply-card" aria-labelledby="basic-info-title">
        <div class="apply-card-heading">
          <span class="apply-step-number">01</span>
          <div>
            <h2 id="basic-info-title">Basic information</h2>
            <p>Tell us how to identify and contact you during recruitment.</p>
          </div>
        </div>
        <div class="apply-field-grid">
          ${textField({ id: "fullName", label: "Full name", autocomplete: "name" })}
          ${textField({ id: "aucEmail", label: "AUC email", type: "email", autocomplete: "email", placeholder: "name@aucegypt.edu" })}
          ${textField({ id: "studentId", label: "Student ID", autocomplete: "off" })}
          ${textField({ id: "major", label: "Major", autocomplete: "organization-title" })}
          <div class="apply-field" data-field="yearLevel">
            <label for="yearLevel">Year / level <span aria-hidden="true">*</span></label>
            <select id="yearLevel" name="yearLevel" required>
              <option value="">Select your level</option>
              ${yearLevelOptions.map((option) => `<option value="${option}">${option}</option>`).join("")}
            </select>
            <p class="field-error" id="yearLevel-error" data-error-for="yearLevel"></p>
          </div>
          ${textField({ id: "phone", label: "Phone number / WhatsApp", type: "tel", autocomplete: "tel" })}
        </div>
      </section>

      ${RoleSelector()}
      ${RoleDescriptionCard()}

      <section class="apply-card" aria-labelledby="questions-section-title">
        <div class="apply-card-heading">
          <span class="apply-step-number">03</span>
          <div>
            <h2 id="questions-section-title">Main application questions</h2>
            <p>Answer with enough detail for the team to understand how you think and serve.</p>
          </div>
        </div>
        <div class="apply-field-grid">
          ${textareaField({
            id: "whyThisRole",
            label: "Why are you applying for this role?",
            placeholder: "Tell us why this role feels like the right step for you.",
            required: true
          })}
          ${textareaField({
            id: "whyChooseYourself",
            label: "Imagine you are the person hiring for this role. Why would you choose yourself?",
            placeholder: "Put yourself in the reviewer's place. What would make you stand out for this role? Mention your habits, strengths, experience, mindset, or anything that proves you can handle the responsibility.",
            required: true,
            helper: "Choose a role above to see more specific guidance for this question."
          })}
          ${textareaField({
            id: "hopeToLearn",
            label: "What do you hope to learn or build through Resala this year?",
            placeholder: "Think about skills, people, impact, responsibility, or personal growth."
          })}
          ${textareaField({
            id: "previousResalaExperience",
            label: "Have you been part of Resala before?",
            placeholder: "If yes, tell us what you joined or helped with. If no, write \"No\"."
          })}
        </div>
      </section>

      ${InterviewSlotSelector()}

      <div class="apply-submit-bar">
        <p>Review your answers before submitting. The team will use your email and selected slot for follow-up.</p>
        <button class="button button-primary apply-submit-button" type="submit" data-submit-button>Submit application</button>
      </div>
    </form>
  `;
}

export function ApplyPage(): string {
  return `
    <main class="apply-page">
      <section class="apply-hero" aria-labelledby="apply-title">
        <div class="apply-hero-pattern" aria-hidden="true"></div>
        <header class="apply-topbar">
          <a class="apply-logo-link" href="../" aria-label="Back to Resala AUC recruitment home">
            <span class="brand-logo-frame">
              <img src="${logoPath}" alt="Resala AUC logo" width="420" height="236">
            </span>
          </a>
          <div class="task-topbar-actions">
            <a class="button button-secondary apply-back-link" href="../tasks/">Submit tasks</a>
            <a class="button button-secondary apply-back-link" href="../">Back to landing page</a>
          </div>
        </header>
        <div class="container apply-hero-grid">
          <div class="apply-hero-copy">
            <p class="eyebrow">Resala AUC Recruitment</p>
            <h1 id="apply-title">Build the First Step</h1>
            <p>Be the first step toward someone's better life.</p>
          </div>
          <div class="apply-hero-note" aria-label="Application guidance">
            <span>Application form</span>
            <strong>Choose your role, answer clearly, and select an interview slot.</strong>
          </div>
        </div>
      </section>

      <section class="apply-form-section" aria-label="Resala AUC application form">
        <div class="container apply-form-layout">
          <div class="apply-side-panel">
            <span class="side-panel-label">Build the First Step</span>
            <h2>Your role is one part of a bigger path.</h2>
            <p>Use this form to show where you can serve with responsibility, consistency, and care.</p>
          </div>
          <div>
            ${ApplicationForm()}
            ${SuccessState()}
          </div>
        </div>
      </section>
      ${RoleDetailsDialog()}
    </main>
  `;
}

export function renderApplyPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Apply | Resala AUC Recruitment</title>
    <meta name="description" content="Apply to Resala AUC recruitment and choose the role where you can build the first step.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Noto+Sans:wght@400;500;600;700;800&family=Roboto+Slab:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../styles.css">
  </head>
  <body class="apply-page-body">
    ${ApplyPage()}
    <script src="../spreadsheet-config.js"></script>
    <script type="module" src="../apply.js"></script>
  </body>
</html>`;
}
