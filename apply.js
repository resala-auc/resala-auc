import {
  fetchInterviewSlots,
  roles,
  submitApplication,
                          
                           
                 
} from "./apply-config.js";

                                         
                                                      

const form = document.querySelector                 ("[data-application-form]");
const successState = document.querySelector             ("[data-success-state]");
const successSlot = document.querySelector             ("[data-success-slot]");
const errorSummary = document.querySelector             ("[data-error-summary]");
const submitButton = document.querySelector                   ("[data-submit-button]");
const roleDescriptionTitle = document.querySelector             ("[data-role-description-title]");
const roleDescriptionCopy = document.querySelector             ("[data-role-description-copy]");
const whyChooseHelper = document.querySelector             ("#whyChooseYourself-helper");
const slotOptions = document.querySelector             ("[data-slot-options]");

let slotsReady = false;

function getInput(id        )                                                                    {
  return document.getElementById(id)                                                                     ;
}

function getValue(id        )         {
  return getInput(id)?.value.trim() ?? "";
}

function getSelectedRole()                    {
  const selected = form?.querySelector                  ('input[name="roleAppliedFor"]:checked');
  return roles.find((role) => role.id === selected?.value) ?? null;
}

function getSelectedInterviewSlot()                                       {
  const selected = form?.querySelector                  ('input[name="interviewSlot"]:checked');

  if (!selected) return null;

  return {
    id: selected.value,
    label: selected.dataset.slotLabel ?? selected.value
  };
}

function setFieldError(fieldName        , message        )       {
  const error = document.querySelector             (`[data-error-for="${fieldName}"]`);
  const field = document.querySelector             (`[data-field="${fieldName}"]`);
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

function setRadioGroupError(fieldName        , message        )       {
  const error = document.querySelector             (`[data-error-for="${fieldName}"]`);
  if (error) {
    error.textContent = message;
  }
}

function isValidEmail(value        )          {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateForm()             {
  const errors             = {};

  if (!getValue("fullName")) errors.fullName = "Full name is required.";
  if (!getValue("aucEmail")) {
    errors.aucEmail = "AUC email is required.";
  } else if (!isValidEmail(getValue("aucEmail"))) {
    errors.aucEmail = "Enter a valid email address.";
  }
  if (!getValue("studentId")) errors.studentId = "Student ID is required.";
  if (!getValue("major")) errors.major = "Major is required.";
  if (!getValue("yearLevel")) errors.yearLevel = "Year / level is required.";
  if (!getValue("phone")) errors.phone = "Phone number / WhatsApp is required.";
  if (!getSelectedRole()) errors.roleAppliedFor = "Choose the role you are applying for.";
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
    "whyThisRole",
    "whyChooseYourself"
  ].forEach((fieldName) => setFieldError(fieldName, errors[fieldName] ?? ""));

  setRadioGroupError("roleAppliedFor", errors.roleAppliedFor ?? "");
  setRadioGroupError("interviewSlot", errors.interviewSlot ?? "");

  return errors;
}

function updateRoleDescription()       {
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
    return;
  }

  if (roleDescriptionTitle) roleDescriptionTitle.textContent = `${role.name} - ${role.stepTitle}`;
  if (roleDescriptionCopy) roleDescriptionCopy.textContent = role.description;

  if (whyChooseHelper) {
    whyChooseHelper.textContent =
      role.id === "treasurer"
        ? "If you were choosing Resala's Treasurer, what would make you trust yourself with budgets, receipts, reimbursements, and financial details?"
        : `If you were choosing someone for ${role.name}, what habits, strengths, or experience would make you trust yourself with ${role.stepTitle.toLowerCase()}?`;
  }
}

function buildPayload(role            )                     {
  const now = new Date().toISOString();
  const interviewSlot = getSelectedInterviewSlot();

  if (!interviewSlot) {
    throw new Error("Choose one interview slot.");
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

function showErrorSummary(errors            )       {
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
    setRadioGroupError("roleAppliedFor", "");
  }

  if (event.target instanceof HTMLInputElement && event.target.name === "interviewSlot") {
    setRadioGroupError("interviewSlot", "");
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
      form.querySelector                  (`input[name="${firstError}"]`) ??
      form.querySelector             (`[data-error-for="${firstError}"]`);

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

  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    const payload = buildPayload(role);
    await submitApplication(payload);

    form.hidden = true;
    if (successSlot) successSlot.textContent = payload.interviewSlot;
    if (successState) {
      successState.hidden = false;
      successState.focus();
      successState.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    if (errorSummary) {
      errorSummary.hidden = false;
      errorSummary.textContent =
        error instanceof Error ? error.message : "We could not submit the form right now. Please try again.";
    }
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Submit application";
  }
});

async function renderInterviewSlots()                {
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

function groupSlotsByDate(slots                       )              {
  return slots.reduce             ((groupedSlots, slot) => {
    if (!slot.date) return groupedSlots;

    const dateSlots = groupedSlots.get(slot.date) ?? [];
    dateSlots.push(slot);
    groupedSlots.set(slot.date, dateSlots);
    return groupedSlots;
  }, new Map());
}

function renderSlotCalendar(slotsByDate             , selectedDate        )         {
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

function renderCalendarMonthBlocks(slotsByDate             , selectedDate        )         {
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

function renderCalendarDateButtons(dates          , slotsByDate             , selectedDate        )         {
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

function groupDatesByMonth(dates          )                        {
  return dates.reduce                       ((groups, date) => {
    const monthKey = date.slice(0, 7);
    const monthDates = groups.get(monthKey) ?? [];
    monthDates.push(date);
    groups.set(monthKey, monthDates);
    return groups;
  }, new Map());
}

function renderSlotTimes(slots                       , selectedDate        )         {
  return `
    <div class="slot-time-heading">
      <span>Available times</span>
      <strong>${formatLongDate(selectedDate)}</strong>
    </div>
    <div class="slot-option-grid" role="radiogroup" aria-label="Available interview times">
      ${slots
        .map(
          (slot                     ) => `
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

function bindSlotDateButtons(slotsByDate             )       {
  if (!slotOptions) return;

  const timePanel = slotOptions.querySelector             ("[data-slot-time-panel]");
  const dateButtons = [...slotOptions.querySelectorAll                   ("[data-slot-date]")];

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

function getMondayOffset(date        )         {
  const parsedDate = parseLocalDate(date);
  if (!parsedDate) return 0;

  return (parsedDate.getDay() + 6) % 7;
}

function parseLocalDate(date        )              {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function buildDateRange(startDate        , endDate        )           {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  if (!start || !end) return [];

  const dates           = [];

  for (let date = start; date <= end; date = addLocalDays(date, 1)) {
    dates.push(formatDateValue(date));
  }

  return dates;
}

function addLocalDays(date      , daysToAdd        )       {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysToAdd);
}

function formatDateValue(date      )         {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function formatMonthKey(monthKey        )         {
  const parsedDate = parseLocalDate(`${monthKey}-01`);
  if (!parsedDate) return monthKey;

  return parsedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function formatLongDate(date        )         {
  const parsedDate = parseLocalDate(date);
  if (!parsedDate) return date;

  return parsedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

function preselectRoleFromUrl()       {
  const selectedRoleId = new URLSearchParams(window.location.search).get("role");
  if (!selectedRoleId || !form) return;

  const roleInput = form.querySelector                  (
    `input[name="roleAppliedFor"][value="${CSS.escape(selectedRoleId)}"]`
  );

  if (roleInput) {
    roleInput.checked = true;
  }
}

preselectRoleFromUrl();
updateRoleDescription();
renderInterviewSlots().catch(() => {
  slotsReady = false;
});
