import { submitTasks, type TaskSubmissionPayload } from "./apply-config.js";

type FormErrors = Record<string, string>;

const form = document.querySelector<HTMLFormElement>("[data-task-submission-form]");
const successState = document.querySelector<HTMLElement>("[data-success-state]");
const errorSummary = document.querySelector<HTMLElement>("[data-error-summary]");
const submitButton = document.querySelector<HTMLButtonElement>("[data-submit-button]");

function getInput(id: string): HTMLInputElement | HTMLTextAreaElement | null {
  return document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null;
}

function getValue(id: string): string {
  return getInput(id)?.value.trim() ?? "";
}

function isValidEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@aucegypt\.edu$/i.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
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

function validateForm(): FormErrors {
  const errors: FormErrors = {};

  if (!getValue("aucEmail")) {
    errors.aucEmail = "AUC email is required.";
  } else if (!isValidEmail(getValue("aucEmail"))) {
    errors.aucEmail = "Enter a valid AUC email address.";
  }

  if (!getValue("studentId")) {
    errors.studentId = "Student ID is required.";
  }

  if (!getValue("firstPreferenceTaskLink")) {
    errors.firstPreferenceTaskLink = "First preference task link is required.";
  } else if (!isValidUrl(getValue("firstPreferenceTaskLink"))) {
    errors.firstPreferenceTaskLink = "Enter a valid task link.";
  }

  if (!getValue("secondPreferenceTaskLink")) {
    errors.secondPreferenceTaskLink = "Second preference task link is required.";
  } else if (!isValidUrl(getValue("secondPreferenceTaskLink"))) {
    errors.secondPreferenceTaskLink = "Enter a valid task link.";
  }

  ["aucEmail", "studentId", "firstPreferenceTaskLink", "secondPreferenceTaskLink", "taskNotes"].forEach((fieldName) =>
    setFieldError(fieldName, errors[fieldName] ?? "")
  );

  return errors;
}

function showErrorSummary(errors: FormErrors): void {
  if (!errorSummary) return;

  const messages = Object.values(errors);
  errorSummary.hidden = messages.length === 0;
  errorSummary.textContent = messages.length
    ? `Please fix ${messages.length} field${messages.length === 1 ? "" : "s"} before submitting.`
    : "";
}

function buildPayload(): TaskSubmissionPayload {
  return {
    mode: "task-submission",
    aucEmail: getValue("aucEmail"),
    studentId: getValue("studentId"),
    firstPreferenceTaskLink: getValue("firstPreferenceTaskLink"),
    secondPreferenceTaskLink: getValue("secondPreferenceTaskLink"),
    taskNotes: getValue("taskNotes"),
    submittedAt: new Date().toISOString()
  };
}

form?.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) return;
  setFieldError(event.target.name, "");
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const errors = validateForm();
  showErrorSummary(errors);

  if (Object.keys(errors).length > 0) {
    const firstControl = getInput(Object.keys(errors)[0]);
    firstControl?.focus();
    return;
  }

  if (!submitButton) return;

  const originalButtonText = submitButton.textContent ?? "Submit tasks";
  submitButton.disabled = true;
  submitButton.textContent = "Submitting...";

  try {
    await submitTasks(buildPayload());

    form.hidden = true;
    if (successState) {
      successState.hidden = false;
      successState.focus();
      successState.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    if (errorSummary) {
      errorSummary.hidden = false;
      errorSummary.textContent =
        error instanceof Error ? error.message : "We could not submit your tasks right now. Please try again.";
    }

    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
  }
});
