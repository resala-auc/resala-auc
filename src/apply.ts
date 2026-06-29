import {
  fetchInterviewSlots,
  roles,
  submitApplication,
  type ApplicationPayload,
  type InterviewSlotOption,
  type RoleOption
} from "./apply-config.js";

type FormErrors = Record<string, string>;
type SlotsByDate = Map<string, InterviewSlotOption[]>;

const form = document.querySelector<HTMLFormElement>("[data-application-form]");
const successState = document.querySelector<HTMLElement>("[data-success-state]");
const successSlot = document.querySelector<HTMLElement>("[data-success-slot]");
const successProcessing = document.querySelector<HTMLElement>("[data-success-processing]");
const errorSummary = document.querySelector<HTMLElement>("[data-error-summary]");
const submitButton = document.querySelector<HTMLButtonElement>("[data-submit-button]");
const roleDescriptionTitle = document.querySelector<HTMLElement>("[data-role-description-title]");
const roleDescriptionCopy = document.querySelector<HTMLElement>("[data-role-description-copy]");
const selectedRoleDetailsButton = document.querySelector<HTMLButtonElement>("[data-selected-role-details]");
const roleDetailsDialog = document.querySelector<HTMLElement>("[data-role-details-dialog]");
const roleDetailsPanel = document.querySelector<HTMLElement>(".role-details-panel");
const roleDetailsContent = document.querySelector<HTMLElement>("[data-role-details-content]");
const whyChooseHelper = document.querySelector<HTMLElement>("#whyChooseYourself-helper");
const slotOptions = document.querySelector<HTMLElement>("[data-slot-options]");

let slotsReady = false;

function getInput(id: string): HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null {
  return document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
}

function getValue(id: string): string {
  return getInput(id)?.value.trim() ?? "";
}

function getSelectedRole(): RoleOption | null {
  const selected = form?.querySelector<HTMLInputElement>('input[name="roleAppliedFor"]:checked');
  return roles.find((role) => role.id === selected?.value) ?? null;
}

function getSecondPreferenceRole(): RoleOption | null {
  const selectedRoleId = getValue("secondPreference");
  return roles.find((role) => role.id === selectedRoleId) ?? null;
}

function getSelectedInterviewSlot(): { id: string; label: string } | null {
  const selected = form?.querySelector<HTMLInputElement>('input[name="interviewSlot"]:checked');

  if (!selected) return null;

  return {
    id: selected.value,
    label: selected.dataset.slotLabel ?? selected.value
  };
}

function setFieldError(fieldName: string, message: string): void {
  const error = document.querySelector<HTMLElement>(`[data-error-for="${fieldName}"]`);
  const field = document.querySelector<HTMLElement>(`[data-field="${fieldName}"]`);
  const control = getInput(fieldName);

  if (error) {
    error.textContent = message;
  }

  field?.classList.toggle("has-error", Boolean(message));

  if (control) {
    control.setAttribute("aria-invalid", message ? "true" : "false");
    control.setAttribute("aria-describedby", message ? `${fieldName}-error` : "");
  }
}

function setRadioGroupError(fieldName: string, message: string): void {
  const error = document.querySelector<HTMLElement>(`[data-error-for="${fieldName}"]`);
  if (error) {
    error.textContent = message;
  }
}

function isValidEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@aucegypt\.edu$/i.test(value);
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function listItems(items: string[]): string {
  return items.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function validateForm(): FormErrors {
  const errors: FormErrors = {};

  if (!getValue("fullName")) errors.fullName = "Full name is required.";
  if (!getValue("aucEmail")) {
    errors.aucEmail = "AUC email is required.";
  } else if (!isValidEmail(getValue("aucEmail"))) {
    errors.aucEmail = "Enter a valid AUC email address.";
  }
  if (!getValue("studentId")) errors.studentId = "Student ID is required.";
  if (!getValue("major")) errors.major = "Major is required.";
  if (!getValue("yearLevel")) errors.yearLevel = "Year / level is required.";
  if (!getValue("phone")) errors.phone = "Phone number / WhatsApp is required.";
  const selectedRole = getSelectedRole();
  const secondPreferenceRole = getSecondPreferenceRole();
  if (!selectedRole) errors.roleAppliedFor = "Choose the role you are applying for.";
  if (!secondPreferenceRole) {
    errors.secondPreference = "Choose your second preference.";
  } else if (selectedRole && secondPreferenceRole.id === selectedRole.id) {
    errors.secondPreference = "Choose a different role for your second preference.";
  }
  if (!getValue("whyThisRole")) errors.whyThisRole = "Tell us why you are applying for this role.";
  if (!getValue("whyChooseYourself")) errors.whyChooseYourself = "Tell us why you would choose yourself for this role.";
  if (!getSelectedInterviewSlot()) errors.interviewSlot = "Choose one interview slot.";

  [
    "fullName",
    "aucEmail",
    "studentId",
    "major",
    "yearLevel",
    "phone",
    "secondPreference",
    "whyThisRole",
    "whyChooseYourself"
  ].forEach((fieldName) => setFieldError(fieldName, errors[fieldName] ?? ""));

  setRadioGroupError("roleAppliedFor", errors.roleAppliedFor ?? "");
  setRadioGroupError("interviewSlot", errors.interviewSlot ?? "");

  return errors;
}

function updateRoleDescription(): void {
  const role = getSelectedRole();

  if (!role) {
    if (roleDescriptionTitle) roleDescriptionTitle.textContent = "Choose a role to see its step.";
    if (roleDescriptionCopy) {
      roleDescriptionCopy.textContent =
        "Your selected role description will appear here to help you answer the application questions with focus.";
    }
    if (whyChooseHelper) {
      whyChooseHelper.textContent = "Choose a role above to see more specific guidance for this question.";
    }
    if (selectedRoleDetailsButton) {
      selectedRoleDetailsButton.hidden = true;
    }
    return;
  }

  if (roleDescriptionTitle) roleDescriptionTitle.textContent = `${role.name} - ${role.stepTitle}`;
  if (roleDescriptionCopy) roleDescriptionCopy.textContent = role.description;
  if (selectedRoleDetailsButton) {
    selectedRoleDetailsButton.hidden = false;
    selectedRoleDetailsButton.dataset.roleDetails = role.id;
  }

  if (whyChooseHelper) {
    whyChooseHelper.textContent =
      role.id === "treasurer"
        ? "If you were choosing Resala's Treasurer, what would make you trust yourself with budgets, receipts, reimbursements, and financial details?"
        : `If you were choosing someone for ${role.name}, what habits, strengths, or experience would make you trust yourself with ${role.stepTitle.toLowerCase()}?`;
  }
}

function renderRoleDetails(role: RoleOption): string {
  return `
    <header class="role-details-header">
      <span>${escapeHtml(role.stepTitle)}</span>
      <h2 id="role-details-title">${escapeHtml(role.name)}</h2>
      <p>${escapeHtml(role.whyChoose)}</p>
    </header>
    <div class="role-details-body">
      <section class="role-details-section role-details-section-wide">
        <h3>What you will actually do</h3>
        <ul>${listItems(role.actualWork)}</ul>
      </section>
      <section class="role-details-section">
        <h3>Leadership requirement</h3>
        <p>${escapeHtml(role.leadershipRequirement)}</p>
      </section>
      <section class="role-details-section">
        <h3>Ownership requirement</h3>
        <p>${escapeHtml(role.ownershipRequirement)}</p>
      </section>
      <section class="role-details-section">
        <h3>Skills requirement</h3>
        <ul>${listItems(role.skillsRequirement)}</ul>
      </section>
      <section class="role-details-section">
        <h3>Preferred experiences or passions</h3>
        <ul>${listItems(role.preferredExperiences)}</ul>
      </section>
      <section class="role-details-question role-details-section-wide">
        <span>Guiding question</span>
        <p>${escapeHtml(role.guidingQuestion)}</p>
      </section>
      <section class="role-details-task role-details-section-wide">
        <span>Interview task direction</span>
        <p>${escapeHtml(role.taskPrompt)}</p>
      </section>
    </div>
  `;
}

function openRoleDetails(roleId: string): void {
  const role = roles.find((item) => item.id === roleId);
  if (!role || !roleDetailsDialog || !roleDetailsContent || !roleDetailsPanel) return;

  roleDetailsContent.innerHTML = renderRoleDetails(role);
  roleDetailsDialog.hidden = false;
  document.body.classList.add("dialog-open");
  roleDetailsPanel.focus();
}

function closeRoleDetails(): void {
  if (!roleDetailsDialog) return;

  roleDetailsDialog.hidden = true;
  document.body.classList.remove("dialog-open");
}

function updateSecondPreferenceOptions(): void {
  const selectedRole = getSelectedRole();
  const secondPreferenceSelect = getInput("secondPreference") as HTMLSelectElement | null;
  if (!secondPreferenceSelect) return;

  for (const option of secondPreferenceSelect.options) {
    option.disabled = Boolean(selectedRole && option.value === selectedRole.id);
  }

  if (selectedRole && secondPreferenceSelect.value === selectedRole.id) {
    secondPreferenceSelect.value = "";
  }
}

function buildPayload(role: RoleOption): ApplicationPayload {
  const now = new Date().toISOString();
  const interviewSlot = getSelectedInterviewSlot();
  const secondPreference = getSecondPreferenceRole();

  if (!interviewSlot) {
    throw new Error("Choose one interview slot.");
  }
  if (!secondPreference || secondPreference.id === role.id) {
    throw new Error("Choose a different role for your second preference.");
  }

  return {
    timestamp: now,
    fullName: getValue("fullName"),
    aucEmail: getValue("aucEmail"),
    studentId: getValue("studentId"),
    major: getValue("major"),
    yearLevel: getValue("yearLevel"),
    phone: getValue("phone"),
    roleAppliedFor: role.name,
    roleStepTitle: role.stepTitle,
    roleDescription: role.description,
    secondPreference: secondPreference.name,
    whyThisRole: getValue("whyThisRole"),
    whyChooseYourself: getValue("whyChooseYourself"),
    hopeToLearn: getValue("hopeToLearn"),
    previousResalaExperience: getValue("previousResalaExperience"),
    interviewSlot: interviewSlot.label,
    interviewSlotId: interviewSlot.id,
    interviewSlotLabel: interviewSlot.label,
    createdAt: now
  };
}

function showErrorSummary(errors: FormErrors): void {
  if (!errorSummary) return;

  const messages = Object.values(errors);
  errorSummary.hidden = messages.length === 0;
  errorSummary.textContent = messages.length
    ? `Please fix ${messages.length} field${messages.length === 1 ? "" : "s"} before submitting.`
    : "";
}

form?.addEventListener("change", (event) => {
  if (event.target instanceof HTMLInputElement && event.target.name === "roleAppliedFor") {
    updateRoleDescription();
    updateSecondPreferenceOptions();
    setRadioGroupError("roleAppliedFor", "");
    setFieldError("secondPreference", "");
  }

  if (event.target instanceof HTMLSelectElement && event.target.name === "secondPreference") {
    setFieldError("secondPreference", "");
  }

  if (event.target instanceof HTMLInputElement && event.target.name === "interviewSlot") {
    setRadioGroupError("interviewSlot", "");
  }
});

document.addEventListener("click", (event) => {
  const detailsButton = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-role-details]") : null;
  if (detailsButton) {
    event.preventDefault();
    event.stopPropagation();
    openRoleDetails(detailsButton.dataset.roleDetails ?? "");
    return;
  }

  if (event.target instanceof Element && event.target.closest("[data-role-details-close]")) {
    closeRoleDetails();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && roleDetailsDialog && !roleDetailsDialog.hidden) {
    closeRoleDetails();
  }
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const errors = validateForm();
  showErrorSummary(errors);

  if (Object.keys(errors).length > 0) {
    const firstError = Object.keys(errors)[0];
    const firstControl =
      getInput(firstError) ??
      form.querySelector<HTMLInputElement>(`input[name="${firstError}"]`) ??
      form.querySelector<HTMLElement>(`[data-error-for="${firstError}"]`);

    firstControl?.focus();
    return;
  }

  const role = getSelectedRole();
  if (!role || !submitButton) return;

  if (!slotsReady) {
    if (errorSummary) {
      errorSummary.hidden = false;
      errorSummary.textContent = "Interview slots are still loading. Please wait a moment and try again.";
    }
    return;
  }

  let payload: ApplicationPayload;

  try {
    payload = buildPayload(role);
    form.hidden = true;
    if (successSlot) successSlot.textContent = payload.interviewSlot;
    if (successProcessing) {
      successProcessing.textContent = "Your confirmation email and calendar invite are being prepared in the background.";
      successProcessing.classList.remove("success-processing-error");
    }
    if (successState) {
      successState.hidden = false;
      successState.focus();
      successState.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    await submitApplication(payload);

    if (successProcessing) {
      successProcessing.textContent = "Your confirmation email and calendar invite are on their way.";
    }
  } catch (error) {
    if (successState && successState.hidden && errorSummary) {
      errorSummary.hidden = false;
      errorSummary.textContent =
        error instanceof Error ? error.message : "We could not submit the form right now. Please try again.";
      submitButton.disabled = false;
      submitButton.textContent = "Submit application";
      return;
    }

    if (successProcessing) {
      successProcessing.textContent =
        error instanceof Error
          ? `We could not finish the backend submission: ${error.message}`
          : "We could not finish the backend submission. Please contact the team.";
      successProcessing.classList.add("success-processing-error");
    }
  }
});

async function renderInterviewSlots(): Promise<void> {
  if (!slotOptions) return;

  try {
    const slots = await fetchInterviewSlots();
    const availableSlots = slots.filter((slot) => slot.active && !slot.full);

    if (!availableSlots.length) {
      slotOptions.innerHTML = `<p class="slot-loading">No interview slots are available right now. Please check back later.</p>`;
      return;
    }

    const slotsByDate = groupSlotsByDate(availableSlots);
    const dates = [...slotsByDate.keys()];
    const selectedDate = dates[0];

    slotOptions.innerHTML = renderSlotCalendar(slotsByDate, selectedDate);
    bindSlotDateButtons(slotsByDate);

    slotsReady = true;
  } catch (error) {
    slotOptions.innerHTML = `<p class="slot-loading">We could not load available slots right now. Please refresh in a moment.</p>`;
    if (submitButton) submitButton.disabled = true;
    if (errorSummary) {
      errorSummary.hidden = false;
      errorSummary.textContent = error instanceof Error ? error.message : "We could not load interview slots.";
    }
  }
}

function groupSlotsByDate(slots: InterviewSlotOption[]): SlotsByDate {
  return slots.reduce<SlotsByDate>((groupedSlots, slot) => {
    if (!slot.date) return groupedSlots;

    const dateSlots = groupedSlots.get(slot.date) ?? [];
    dateSlots.push(slot);
    groupedSlots.set(slot.date, dateSlots);
    return groupedSlots;
  }, new Map());
}

function renderSlotCalendar(slotsByDate: SlotsByDate, selectedDate: string): string {
  const dates = [...slotsByDate.keys()];

  return `
    <div class="slot-calendar-shell">
      <div class="slot-calendar-header">
        <div>
          <span class="slot-calendar-kicker">Available dates</span>
          <strong>Choose your interview day</strong>
        </div>
        <span>${dates.length} days</span>
      </div>
      ${renderCalendarMonthBlocks(slotsByDate, selectedDate)}
    </div>
    <div class="slot-time-panel" data-slot-time-panel>
      ${renderSlotTimes(slotsByDate.get(selectedDate) ?? [], selectedDate)}
    </div>
  `;
}

function renderCalendarMonthBlocks(slotsByDate: SlotsByDate, selectedDate: string): string {
  const availableDates = [...slotsByDate.keys()];
  const monthGroups = groupDatesByMonth(buildDateRange(availableDates[0], availableDates[availableDates.length - 1]));

  return [...monthGroups.entries()]
    .map(
      ([monthKey, dates]) => `
        <section class="slot-calendar-month" aria-label="${formatMonthKey(monthKey)}">
          <h3>${formatMonthKey(monthKey)}</h3>
          <div class="slot-weekday-row" aria-hidden="true">
            ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => `<span>${day}</span>`).join("")}
          </div>
          <div class="slot-date-grid">
            ${renderCalendarDateButtons(dates, slotsByDate, selectedDate)}
          </div>
        </section>
      `
    )
    .join("");
}

function renderCalendarDateButtons(dates: string[], slotsByDate: SlotsByDate, selectedDate: string): string {
  const firstDate = dates[0] ?? selectedDate;
  const offset = getMondayOffset(firstDate);
  const blanks = Array.from({ length: offset }, () => `<span class="slot-date-empty"></span>`).join("");
  const buttons = dates
    .map((date) => {
      const dayNumber = Number(date.slice(-2));
      const slotCount = slotsByDate.get(date)?.length ?? 0;
      const slotsLabel = `${slotCount} slot${slotCount === 1 ? "" : "s"}`;
      const disabled = slotCount === 0;

      return `
        <button class="slot-date-button${date === selectedDate ? " is-selected" : ""}${disabled ? " is-unavailable" : ""}" type="button" data-slot-date="${date}" aria-pressed="${date === selectedDate}" ${disabled ? "disabled" : ""}>
          <span>${dayNumber}</span>
          <small>${disabled ? "Full" : slotsLabel}</small>
        </button>
      `;
    })
    .join("");

  return blanks + buttons;
}

function groupDatesByMonth(dates: string[]): Map<string, string[]> {
  return dates.reduce<Map<string, string[]>>((groups, date) => {
    const monthKey = date.slice(0, 7);
    const monthDates = groups.get(monthKey) ?? [];
    monthDates.push(date);
    groups.set(monthKey, monthDates);
    return groups;
  }, new Map());
}

function renderSlotTimes(slots: InterviewSlotOption[], selectedDate: string): string {
  return `
    <div class="slot-time-heading">
      <span>Available times</span>
      <strong>${formatLongDate(selectedDate)}</strong>
    </div>
    <div class="slot-option-grid" role="radiogroup" aria-label="Available interview times">
      ${slots
        .map(
          (slot: InterviewSlotOption) => `
            <label class="slot-option-card">
              <input class="choice-radio" type="radio" name="interviewSlot" value="${slot.id}" data-slot-label="${slot.label}" required>
              <span>${slot.startTime}</span>
              <strong>${slot.startTime} - ${slot.endTime}</strong>
              <small>${slot.remaining} available</small>
            </label>
          `
        )
        .join("")}
    </div>
  `;
}

function bindSlotDateButtons(slotsByDate: SlotsByDate): void {
  if (!slotOptions) return;

  const timePanel = slotOptions.querySelector<HTMLElement>("[data-slot-time-panel]");
  const dateButtons = [...slotOptions.querySelectorAll<HTMLButtonElement>("[data-slot-date]")];

  for (const button of dateButtons) {
    button.addEventListener("click", () => {
      const selectedDate = button.dataset.slotDate ?? "";
      if (!selectedDate || !timePanel) return;

      for (const dateButton of dateButtons) {
        const isSelected = dateButton === button;
        dateButton.classList.toggle("is-selected", isSelected);
        dateButton.setAttribute("aria-pressed", String(isSelected));
      }

      timePanel.innerHTML = renderSlotTimes(slotsByDate.get(selectedDate) ?? [], selectedDate);
    });
  }
}

function getMondayOffset(date: string): number {
  const parsedDate = parseLocalDate(date);
  if (!parsedDate) return 0;

  return (parsedDate.getDay() + 6) % 7;
}

function parseLocalDate(date: string): Date | null {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function buildDateRange(startDate: string, endDate: string): string[] {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (!start || !end) return [];

  const dates: string[] = [];

  for (let date = start; date <= end; date = addLocalDays(date, 1)) {
    dates.push(formatDateValue(date));
  }

  return dates;
}

function addLocalDays(date: Date, daysToAdd: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysToAdd);
}

function formatDateValue(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatMonthKey(monthKey: string): string {
  const parsedDate = parseLocalDate(`${monthKey}-01`);
  if (!parsedDate) return monthKey;

  return parsedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatLongDate(date: string): string {
  const parsedDate = parseLocalDate(date);
  if (!parsedDate) return date;

  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function preselectRoleFromUrl(): void {
  const selectedRoleId = new URLSearchParams(window.location.search).get("role");
  if (!selectedRoleId || !form) return;

  const roleInput = form.querySelector<HTMLInputElement>(
    `input[name="roleAppliedFor"][value="${CSS.escape(selectedRoleId)}"]`
  );

  if (roleInput) {
    roleInput.checked = true;
  }
}

preselectRoleFromUrl();
updateRoleDescription();
updateSecondPreferenceOptions();
renderInterviewSlots().catch(() => {
  slotsReady = false;
});
