import { roleGuide, roleGuides } from "./role-guide-data.mjs";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function listItems(items) {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function shortList(items, limit = 3) {
  return listItems(items.slice(0, limit));
}

function GuideShell({ title, description, stylesheetHref, logoHref, homeHref, body }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} | Resala AUC Recruitment</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Noto+Sans:wght@400;500;600;700;800&family=Roboto+Slab:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${stylesheetHref}">
  </head>
  <body class="guide-page-body">
    <main class="guide-page">
      <header class="guide-topbar">
        <a class="apply-logo-link" href="${homeHref}" aria-label="Back to Resala AUC recruitment home">
          <span class="brand-logo-frame">
            <img src="${logoHref}" alt="Resala AUC logo" width="420" height="236">
          </span>
        </a>
        <div class="task-topbar-actions">
          <a class="button button-secondary" href="${homeHref}apply/">Apply</a>
          <a class="button button-primary" href="${homeHref}guides/">How to choose your role</a>
        </div>
      </header>
      ${body}
    </main>
  </body>
</html>`;
}

function RoleCard(role, basePath) {
  return `
    <article class="guide-role-card">
      <div class="guide-role-card-head">
        <span>${escapeHtml(role.stepTitle)}</span>
        <h3>${escapeHtml(role.name)}</h3>
      </div>
      <p>${escapeHtml(role.shortDescription)}</p>
      <div class="guide-role-signal">
        <strong>Fits you if</strong>
        <span>${escapeHtml(role.fit)}</span>
      </div>
      <ul class="guide-mini-list">${shortList(role.actualWork, 2)}</ul>
      <div class="guide-role-actions">
        <a class="role-guide-link" href="${basePath}guides/${role.id}/">View details</a>
        <a class="role-apply-link" href="${basePath}apply/?role=${role.id}">Apply</a>
      </div>
    </article>
  `;
}

function ExpectationCard(expectation) {
  return `
    <section class="guide-panel">
      <h3>${escapeHtml(expectation.title)}</h3>
      <p>${escapeHtml(expectation.body)}</p>
      <ul class="guide-mini-list">${shortList(expectation.points, 3)}</ul>
    </section>
  `;
}

function ChoosingStep(step, index) {
  return `
    <section class="guide-step-panel">
      <span>${String(index + 1).padStart(2, "0")}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <ul class="guide-mini-list">${shortList(step.points, 3)}</ul>
    </section>
  `;
}

export function renderRoleGuideIndexPage() {
  const body = `
    <section class="guide-hero">
      <div class="container guide-hero-grid">
        <div>
          <p class="eyebrow">${escapeHtml(roleGuide.subtitle)}</p>
          <h1>${escapeHtml(roleGuide.title)}</h1>
          <p>${escapeHtml(roleGuide.opening[0])}</p>
          <p>${escapeHtml(roleGuide.opening[2])}</p>
          <div class="guide-hero-actions">
            <a class="button button-primary" href="#roles">Explore roles</a>
            <a class="button button-secondary" href="../apply/">Apply now</a>
          </div>
        </div>
        <aside class="guide-contact-panel">
          <span>Start here</span>
          <strong>Pick the role where your energy can become ownership.</strong>
          <ol class="guide-checklist">
            <li>Read the director standard.</li>
            <li>Compare role cards.</li>
            <li>Open the details for your top two.</li>
          </ol>
        </aside>
      </div>
    </section>
    <section class="guide-section guide-section-compact">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Decision path</p>
          <h2>Choose in this order</h2>
        </div>
        <div class="guide-flow">
          <article>
            <span>01</span>
            <h3>Can I lead?</h3>
            <p>Directors build teams and divide responsibility. The work should not depend on one person.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Can I own?</h3>
            <p>Ownership means noticing problems early, following up, and protecting Resala's people and impact.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Can I commit?</h3>
            <p>Choose the role whose real work you can repeat consistently, not only the title you like.</p>
          </article>
        </div>
      </div>
    </section>
    <section class="guide-section guide-section-soft">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Director standard</p>
          <h2>What every director must carry</h2>
        </div>
        <div class="guide-panel-grid">
          ${roleGuide.directorExpectations.map(ExpectationCard).join("")}
        </div>
      </div>
    </section>
    <section class="guide-section" id="roles">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Available roles</p>
          <h2>Scan first. Open details second.</h2>
          <p>Each card gives you the role's main responsibility, who it fits, and two examples of the work. Open only the roles that feel close to you.</p>
        </div>
        <div class="guide-role-grid">
          ${roleGuides.map((role) => RoleCard(role, "../")).join("")}
        </div>
      </div>
    </section>
    <section class="guide-section guide-section-soft">
      <div class="container guide-final-test">
        <div class="section-heading">
          <p class="eyebrow">Final test</p>
          <h2>Before you submit your preferences</h2>
        </div>
        <div class="guide-final-grid">
          <section class="guide-panel guide-panel-wide">
            <h3>Ask these five questions</h3>
            <ol class="guide-question-list">${roleGuide.finalTest.questions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}</ol>
          </section>
          <section class="guide-panel">
            <h3>Strong fit</h3>
            <ul>${listItems(roleGuide.finalTest.strongFit)}</ul>
          </section>
          <section class="guide-panel">
            <h3>Reconsider if</h3>
            <ul>${listItems(roleGuide.finalTest.weakFit)}</ul>
          </section>
        </div>
      </div>
    </section>
  `;

  return GuideShell({
    title: roleGuide.title,
    description: "A Resala AUC recruitment guide for choosing the director role that fits your skills, passion, and ownership.",
    stylesheetHref: "../styles.css",
    logoHref: "../The brand System/logos/Resala Logo - source.svg",
    homeHref: "../",
    body
  });
}

export function renderRoleGuidePage(role) {
  const body = `
    <section class="guide-hero role-guide-hero">
      <div class="container guide-hero-grid">
        <div>
          <p class="eyebrow">${escapeHtml(role.stepTitle)}</p>
          <h1>${escapeHtml(role.name)}</h1>
          <p>${escapeHtml(role.shortDescription)}</p>
          <div class="guide-hero-actions">
            <a class="button button-primary" href="../../apply/?role=${role.id}">Apply for this role</a>
            <a class="button button-secondary" href="../">Compare all roles</a>
          </div>
        </div>
        <aside class="guide-contact-panel">
          <span>Best fit signal</span>
          <strong>${escapeHtml(role.fit)}</strong>
        </aside>
      </div>
    </section>
    <section class="guide-section guide-section-compact">
      <div class="container">
        <div class="guide-role-summary">
          <article>
            <span>Why choose it</span>
            <p>${escapeHtml(role.whyChoose)}</p>
          </article>
          <article>
            <span>Guiding question</span>
            <p>${escapeHtml(role.guidingQuestion)}</p>
          </article>
          <article>
            <span>Interview task direction</span>
            <p>${escapeHtml(role.taskPrompt)}</p>
          </article>
        </div>
      </div>
    </section>
    <section class="guide-section guide-section-soft">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Role requirements</p>
          <h2>Read this as a checklist</h2>
        </div>
        <div class="guide-detail-layout">
          <section class="guide-panel">
            <h3>Leadership requirement</h3>
            <p>${escapeHtml(role.leadershipRequirement)}</p>
          </section>
          <section class="guide-panel">
            <h3>Ownership requirement</h3>
            <p>${escapeHtml(role.ownershipRequirement)}</p>
          </section>
          <section class="guide-panel">
            <h3>Skills requirement</h3>
            <ul>${listItems(role.skillsRequirement)}</ul>
          </section>
          <section class="guide-panel">
            <h3>Preferred experiences or passions</h3>
            <ul>${listItems(role.preferredExperiences)}</ul>
          </section>
        </div>
      </div>
    </section>
    <section class="guide-section">
      <div class="container">
        <div class="section-heading">
          <p class="eyebrow">Actual work</p>
          <h2>What your week-to-week responsibility can include</h2>
        </div>
        <ol class="guide-work-list">
          ${role.actualWork.map((item, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${escapeHtml(item)}</p></li>`).join("")}
        </ol>
        <div class="guide-next-actions">
          <a class="button button-primary" href="../../apply/?role=${role.id}">Apply for ${escapeHtml(role.name)}</a>
          <a class="button button-secondary" href="../">Back to all roles</a>
        </div>
      </div>
    </section>
  `;

  return GuideShell({
    title: role.name,
    description: `${role.name} details for Resala AUC board recruitment.`,
    stylesheetHref: "../../styles.css",
    logoHref: "../../The brand System/logos/Resala Logo - source.svg",
    homeHref: "../../",
    body
  });
}
