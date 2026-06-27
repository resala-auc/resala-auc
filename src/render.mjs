import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { faqs, impactStats, navItems, processSteps, roles, values, yearlyGoals } from "./site-data.mjs";

const logoPath = "The brand System/logos/Resala Logo - source.svg";
const instagramHtmlPath = "The brand System/Instagram.html";
const instagramFilesDir = "The brand System/Instagram_files";
const brandAssets = {
  puzzleGraphic: "The brand System/assets/Puzzle Graphic - source.png",
  puzzleIcon: "The brand System/assets/Puzzle Icon - source.png",
  puzzleIconAlt: "The brand System/assets/Puzzle Icon - source (1).png"
};

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function stripHtmlEntities(value) {
  return String(value)
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", "\"")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
}

function getInstagramPhotos() {
  if (!existsSync(instagramHtmlPath) || !existsSync(instagramFilesDir)) {
    return [];
  }

  const html = readFileSync(instagramHtmlPath, "utf8");
  const matches = [...html.matchAll(/<img\b[^>]*>/gi)];
  const seen = new Set();
  const photos = [];

  for (const match of matches) {
    const tag = match[0];
    const src = (tag.match(/\bsrc="([^"]*)"/i) || [])[1] || "";
    const alt = stripHtmlEntities((tag.match(/\balt="([^"]*)"/i) || [])[1] || "Resala AUC activity photo");
    const width = (tag.match(/\bwidth="?([^"\s>]*)/i) || [])[1] || "";
    const height = (tag.match(/\bheight="?([^"\s>]*)/i) || [])[1] || "";
    const fileName = basename(src);
    const localPath = `${instagramFilesDir}/${fileName}`;
    const lowerAlt = alt.toLowerCase();

    if (!fileName || seen.has(fileName) || !existsSync(localPath)) continue;
    if (width === "72" || height === "72" || width === "24" || height === "24") continue;
    if (lowerAlt.includes("profile picture") || lowerAlt.includes("highlight story") || lowerAlt.includes("avatar")) continue;

    seen.add(fileName);
    photos.push({
      src: localPath,
      alt: alt || "Resala AUC activity photo"
    });
  }

  return photos.slice(0, 8);
}

const instagramPhotos = getInstagramPhotos();

const navLinks = navItems
  .map((item) => `<a class="nav-link" href="${item.href}">${item.label}</a>`)
  .join("");

function roleApplyHref(roleName) {
  const roleId = roleName
    .toLowerCase()
    .replaceAll("/", "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `./apply/?role=${roleId}`;
}

function PhotoFrame({ photo, className, fallbackLabel }) {
  if (!photo) {
    return `
      <div class="${className} photo-placeholder" aria-hidden="true">
        <span>${fallbackLabel}</span>
      </div>
    `;
  }

  return `
    <figure class="${className}">
      <img src="${escapeAttr(photo.src)}" alt="${escapeAttr(photo.alt)}" loading="lazy">
    </figure>
  `;
}

function BrandBackgroundAccent({ className = "", asset = brandAssets.puzzleGraphic }) {
  return `
    <span class="${className}" aria-hidden="true">
      <img src="${asset}" alt="">
    </span>
  `;
}

function SectionPattern({ className = "" } = {}) {
  return `
    <div class="section-pattern ${className}" aria-hidden="true">
      ${BrandBackgroundAccent({ className: "section-pattern-piece section-pattern-piece-primary", asset: brandAssets.puzzleGraphic })}
      ${BrandBackgroundAccent({ className: "section-pattern-piece section-pattern-piece-secondary", asset: brandAssets.puzzleIcon })}
    </div>
  `;
}

function Header() {
  return `
    <header class="site-header" data-header>
      <a class="brand-mark" href="#top" aria-label="Resala AUC recruitment home">
        <span class="brand-logo-frame">
          <img src="${logoPath}" alt="Resala AUC logo" width="420" height="236">
        </span>
      </a>
      <button class="menu-toggle" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="site-navigation" data-menu-toggle>
        <span></span>
        <span></span>
      </button>
      <nav class="site-nav" id="site-navigation" aria-label="Primary navigation" data-site-nav>
        ${navLinks}
      </nav>
      <a class="button button-primary header-cta" href="./apply/">Apply Now</a>
    </header>
  `;
}

function HeroBackgroundAnimation() {
  return `
    <div class="hero-background-animation stair-build-bg" aria-hidden="true">
      <div class="stair-aura"></div>
      <div class="stair-guide">
        <span class="stair-guide-base"></span>
        <span class="stair-guide-shimmer"></span>
        <span class="stair-guide-traveler"></span>
      </div>
      <span class="stair-step stair-step-1" data-label="Trust"></span>
      <span class="stair-step stair-step-2" data-label="System"></span>
      <span class="stair-step stair-step-3" data-label="Voice"></span>
      <span class="stair-step stair-step-4" data-label="People"></span>
      <span class="stair-step stair-step-5" data-label="Movement"></span>
      <span class="stair-step stair-step-6"></span>
      <span class="stair-step stair-step-7"></span>
      <span class="stair-landing"></span>
      <span class="stair-puzzle stair-puzzle-1"><img src="${brandAssets.puzzleIcon}" alt=""></span>
      <span class="stair-puzzle stair-puzzle-2"><img src="${brandAssets.puzzleIconAlt}" alt=""></span>
      <span class="stair-puzzle stair-puzzle-3"><img src="${brandAssets.puzzleGraphic}" alt=""></span>
    </div>
  `;
}

function Hero() {
  const hasPhotos = instagramPhotos.length >= 3;
  const heroStyle = hasPhotos ? ` style="--hero-photo: url('${escapeAttr(instagramPhotos[0].src)}');"` : "";

  return `
    <section class="hero issue-hero ${hasPhotos ? "issue-hero-photo" : "issue-hero-fallback"}" id="top" aria-labelledby="hero-title"${heroStyle}>
      <div class="container issue-topline" aria-label="Campaign metadata">
        <span>Vol. 01 · Recruitment</span>
        <span>Build the First Step</span>
        <span>Resala AUC · 2026</span>
      </div>
      ${HeroBackgroundAnimation()}
      <div class="container hero-grid">
        <div class="hero-copy reveal">
          <p class="eyebrow hero-kicker">Resala AUC Recruitment</p>
          <h1 class="hero-title" id="hero-title">Build the first step toward a better life.</h1>
          <p class="arabic-line hero-arabic" lang="ar" dir="rtl">ابني اول خطوة في حياتهم</p>
          <p class="hero-subtitle hero-copy-line">AUC students serving children, families, and community access through visits, logistics, fundraising, media, HR, tech, events, and operations.</p>
          <div class="hero-actions hero-actions-line" aria-label="Campaign actions">
            <a class="button button-primary" href="./apply/">Start Application</a>
            <a class="button button-secondary" href="#roles">Explore Roles</a>
          </div>
        </div>
      </div>
      <div class="container hero-proof-strip" aria-label="Resala service proof">
        ${impactStats
          .slice(0, 3)
          .map((stat) => `<span><strong>${stat.value}</strong>${stat.label}</span>`)
          .join("")}
      </div>
    </section>
  `;
}

function PhotoStory() {
  if (!instagramPhotos.length) {
    return "";
  }

  const photoCells = instagramPhotos
    .slice(3, 8)
    .map((photo, index) => PhotoFrame({ photo, className: `story-photo story-photo-${index + 1}`, fallbackLabel: "Resala" }))
    .join("");

  return `
    <section class="section-band photo-story" aria-labelledby="photo-story-title">
      <div class="container photo-story-grid">
        <div class="section-heading reveal">
          <p class="eyebrow">What service looks like</p>
          <h2 id="photo-story-title">The first step is built in real rooms, with real people.</h2>
          <p>These moments from Resala's feed show the work behind recruitment: preparation, gatherings, children's activities, field visits, and the teams who make service feel present.</p>
        </div>
        <div class="photo-strip reveal">
          ${photoCells}
        </div>
      </div>
    </section>
  `;
}

function ImpactStats() {
  const stats = impactStats
    .map(
      (stat) => `
        <article class="impact-card reveal">
          <strong>${stat.value}</strong>
          <span>${stat.label}</span>
          <p>${stat.description}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section-band impact" id="impact" aria-labelledby="impact-title">
      <div class="container impact-grid">
        <div class="section-heading reveal">
          <p class="eyebrow">Impact at a glance</p>
          <h2 id="impact-title">Proof that the staircase is already being built.</h2>
          <p>Applicants should see the scale and texture of the work before choosing a role. Every number, visit, and initiative is supported by people who organize carefully.</p>
        </div>
        <div class="impact-card-grid">
          ${stats}
        </div>
      </div>
    </section>
  `;
}

function ValueCards() {
  const cards = values
    .map(
      (value, index) => `
        <article class="value-card reveal">
          <span class="value-marker" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <h3>${value.name}</h3>
          <p>${value.description}</p>
        </article>
      `
    )
    .join("");

  return `
    <section class="section-band story" id="campaign" aria-labelledby="story-title">
      <div class="container">
        <div class="section-heading reveal">
          <p class="eyebrow">Campaign story</p>
          <h2 id="story-title">A better life is built from more than one side.</h2>
          <p>For a child, it can start with a day that makes learning feel possible. For a family, it can be a packed box, a blood drive, an initiative, a visit, or someone who makes a hard week easier. Resala recruits people who understand that 6000 packs can be a milestone and still not be enough, because service is not a number we finish. It is a step we keep building.</p>
        </div>
        <div class="value-grid">
          ${cards}
        </div>
        <div class="discipline-track" aria-hidden="true">
          <span>Education · Relief · Presence · Access · Education · Relief · Presence · Access ·</span>
          <span>Education · Relief · Presence · Access · Education · Relief · Presence · Access ·</span>
        </div>
      </div>
    </section>
  `;
}

function GoalCard(goal) {
  return `
    <article class="goal-card reveal">
      <div class="goal-card-topline">
        <span class="goal-category">${goal.category}</span>
        ${goal.target ? `<strong class="goal-target">${goal.target}</strong>` : ""}
      </div>
      <div class="goal-card-body">
        <h3>${goal.title}</h3>
        <p>${goal.description}</p>
      </div>
    </article>
  `;
}

function GoalsSection() {
  const cards = yearlyGoals.map((goal) => GoalCard(goal)).join("");

  return `
    <section class="section-band yearly-goals" id="goals" aria-labelledby="yearly-goals-title">
      ${SectionPattern({ className: "goals-section-pattern" })}
      <div class="container">
        <div class="goals-heading reveal">
          <h2 id="yearly-goals-title">The Steps We're Building This Year</h2>
          <p>This year, Resala AUC is building organized steps of support across food security, clothing, children's development, employment access, health awareness, education, and community visits. Each goal needs people behind it - planning, fundraising, organizing, documenting, designing, communicating, and showing up.</p>
        </div>
        <!-- TODO: Confirm all target numbers and official program names before final publishing. -->
        <div class="goal-card-grid">
          ${cards}
        </div>
      </div>
    </section>
  `;
}

function RolePreviewCards() {
  const rows = roles
    .map(
      (role, index) => `
        <article class="role-row reveal">
          <span class="role-badge role-badge-${(index % 9) + 1}" aria-hidden="true">
            <span class="role-badge-count">${String(index + 1).padStart(2, "0")}</span>
          </span>
          <div class="role-title-group">
          <h3>${role.name}</h3>
          <dl class="role-details">
            <div>
              <dt>Role focus</dt>
              <dd>${role.description}</dd>
            </div>
          </dl>
        </div>
          <p class="role-step">${role.step}</p>
          <a class="role-apply-link" href="${roleApplyHref(role.name)}" aria-label="Apply for ${role.name}">Apply</a>
        </article>
      `
    )
    .join("");

  return `
    <section class="section-band roles" id="roles" aria-labelledby="roles-title">
      <div class="container">
        <div class="section-heading reveal">
          <p class="eyebrow">Roles preview</p>
          <h2 id="roles-title">Find the step you can build.</h2>
          <p>Each role strengthens the same mission from a different angle. Use the preparation prompt to choose where you can think clearly and contribute.</p>
        </div>
        <div class="contents-strip reveal">
          <span>Contents</span>
          <p>Eleven roles · this recruitment issue</p>
        </div>
        <div class="role-index-list">
          ${rows}
        </div>
      </div>
    </section>
  `;
}

function RecruitmentProcess() {
  const steps = processSteps
    .map(
      (step, index) => `
        <li class="process-step reveal">
          <span class="step-badge step-badge-${index + 1}" aria-hidden="true">
            <span class="step-number">${String(index + 1).padStart(2, "0")}</span>
          </span>
          <span>${step}</span>
        </li>
      `
    )
    .join("");

  return `
    <section class="section-band process" id="process" aria-labelledby="process-title">
      <div class="container process-grid">
        <div class="section-heading reveal">
          <p class="eyebrow">Recruitment process</p>
          <h2 id="process-title">How recruitment will work</h2>
          <p>A simple path from understanding the campaign to meeting the team.</p>
        </div>
        <ol class="process-list">
          ${steps}
        </ol>
      </div>
    </section>
  `;
}

function ComingSoonCTA() {
  return `
    <section class="section-band applications" id="applications" aria-labelledby="applications-title">
      <div class="container">
        <div class="applications-panel reveal">
          <p class="eyebrow">Applications are open</p>
          <h2 id="applications-title">The application form is ready.</h2>
          <p>Choose the role you want to apply for, answer the application questions clearly, and select the interview slot that works best for you.</p>
          <div class="application-actions" aria-label="Application actions">
            <a class="button button-primary" href="./apply/">Open application form</a>
            <a class="button button-secondary" href="./tasks/">Submit task links</a>
            <a class="button button-secondary" href="#roles">Review roles first</a>
          </div>
        </div>
      </div>
    </section>
  `;
}

function FAQ() {
  const items = faqs
    .map(
      (item) => `
        <details class="faq-item reveal">
          <summary>${item.question}</summary>
          <p>${item.answer}</p>
        </details>
      `
    )
    .join("");

  return `
    <section class="section-band faq" id="faq" aria-labelledby="faq-title">
      <div class="container faq-grid">
        <div class="section-heading reveal">
          <p class="eyebrow">FAQ</p>
          <h2 id="faq-title">Before you apply</h2>
        </div>
        <div class="faq-list">
          ${items}
        </div>
      </div>
    </section>
  `;
}

function Footer() {
  return `
    <footer class="site-footer">
      <div class="container footer-grid">
        <a class="footer-logo" href="#top" aria-label="Back to top">
          <span class="brand-logo-frame brand-logo-frame-large">
            <img src="${logoPath}" alt="Resala AUC logo" width="480" height="270">
          </span>
        </a>
        <p>Be the first step in their lives.</p>
        <small>Resala AUC Recruitment</small>
      </div>
    </footer>
  `;
}

export function renderPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Build the First Step | Resala AUC Recruitment</title>
    <meta name="description" content="Resala AUC recruitment landing page for the Build the First Step campaign. Explore roles and apply online.">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka+One&family=Noto+Sans:wght@400;500;600;700;800&family=Roboto+Slab:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
      ${Header()}
    <main>
      ${Hero()}
      ${PhotoStory()}
      ${ImpactStats()}
      ${ValueCards()}
      ${GoalsSection()}
      ${RolePreviewCards()}
      ${RecruitmentProcess()}
      ${ComingSoonCTA()}
      ${FAQ()}
    </main>
    ${Footer()}
    <script type="module" src="./app.js"></script>
  </body>
</html>`;
}
