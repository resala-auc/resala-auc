const SHEET_ID = Deno.env.get("SHEET_ID") ?? "";
const SHEET_NAME = Deno.env.get("SHEET_NAME") ?? "Applications";
const SLOT_SHEET_NAME = Deno.env.get("SLOT_SHEET_NAME") ?? "Interview Slots";
const RESERVATION_SHEET_NAME = Deno.env.get("RESERVATION_SHEET_NAME") ?? "Interview Reservations";
const GOOGLE_SERVICE_ACCOUNT_KEY = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") ?? "";
const GOOGLE_CLIENT_EMAIL = Deno.env.get("GOOGLE_CLIENT_EMAIL") ?? "";
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY") ?? "";
const GMAIL_CLIENT_ID = Deno.env.get("GMAIL_CLIENT_ID") ?? "";
const GMAIL_CLIENT_SECRET = Deno.env.get("GMAIL_CLIENT_SECRET") ?? "";
const GMAIL_REFRESH_TOKEN = Deno.env.get("GMAIL_REFRESH_TOKEN") ?? "";
const GMAIL_SENDER_EMAIL = Deno.env.get("GMAIL_SENDER_EMAIL") ?? "";
const GMAIL_SENDER_NAME = Deno.env.get("GMAIL_SENDER_NAME") ?? "Resala AUC";
const EMAIL_LOGO_URL =
  Deno.env.get("EMAIL_LOGO_URL") ?? "https://upnmxdgqdkvgzfwqaicb.supabase.co/storage/v1/object/public/resala-logo/Resala%20Logo%20-%20source.png";
const TASK_SUBMISSION_URL = Deno.env.get("TASK_SUBMISSION_URL") ?? "";
const ROLE_GUIDE_BASE_URL = (Deno.env.get("ROLE_GUIDE_BASE_URL") ?? "https://resala-auc.github.io/guides").replace(/\/+$/, "");
const CALENDAR_ID = Deno.env.get("CALENDAR_ID") ?? GMAIL_SENDER_EMAIL;
const CALENDAR_TIME_ZONE = Deno.env.get("CALENDAR_TIME_ZONE") ?? "Africa/Cairo";
const ADMIN_RESET_SECRET = Deno.env.get("ADMIN_RESET_SECRET") ?? "";
const INTERVIEW_SLOT_DURATION_MINUTES = 60;
const INTERVIEW_REMINDER_MINUTES = 30;

const APPLICATION_BASE_HEADERS = [
  "Timestamp",
  "Full Name",
  "AUC Email",
  "Student ID",
  "Major",
  "Year / Level",
  "Phone",
  "Role Applied For",
  "Role Step Title",
  "Role Description",
  "Why This Role",
  "Why Choose Yourself",
  "Hope To Learn",
  "Previous Resala Experience",
  "Interview Slot",
  "Created At",
  "Status",
  "Second Preference"
];

const APPLICATION_TASK_HEADERS = [
  "Task Submitted At",
  "First Preference Task Link",
  "Second Preference Task Link",
  "Task Notes",
  "Task Submission Status"
];

const HEADERS = [...APPLICATION_BASE_HEADERS, ...APPLICATION_TASK_HEADERS];

const INTERVIEW_SCORE_HEADERS = [
  "Interview Notes URL",
  "First Preference Score",
  "Second Preference Score"
];

const SLOT_HEADERS = [
  "Slot ID",
  "Date",
  "Start Time",
  "End Time",
  "Slot Label",
  "Capacity",
  "Active",
  "Calendar Event ID",
  "Meet Link"
];
const RESERVATION_HEADERS = [
  "Timestamp",
  "Slot ID",
  "Slot Label",
  "Full Name",
  "AUC Email",
  "Student ID",
  "Calendar Event ID",
  "Meet Link",
  "Interview Status",
  "Reminder Send At",
  "Reminder Sent At",
  "Reminder Status",
  "Role Applied For",
  "Second Preference"
];
const RECRUITMENT_START_DATE = "2026-06-22";
const RECRUITMENT_END_DATE = "2026-07-15";
const DAILY_SLOT_TIMES = [
  { code: "1500", startTime: "3:00 PM" },
  { code: "1900", startTime: "7:00 PM" },
  { code: "2000", startTime: "8:00 PM" }
];
const SAME_DAY_SLOT_CUTOFF_HOUR = 11;
const REMOVED_OVERLAPPING_DEFAULT_SLOT_CODES = new Set(["1530", "1930", "2030"]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-reset-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

type ApplicationPayload = {
  timestamp: string;
  fullName: string;
  aucEmail: string;
  studentId: string;
  major: string;
  yearLevel: string;
  phone: string;
  roleAppliedFor: string;
  roleStepTitle: string;
  roleDescription: string;
  secondPreference: string;
  whyThisRole: string;
  whyChooseYourself: string;
  hopeToLearn?: string;
  previousResalaExperience?: string;
  interviewSlot: string;
  interviewSlotId?: string;
  interviewSlotLabel?: string;
  createdAt: string;
};

type TaskSubmissionPayload = {
  mode: "task-submission";
  aucEmail: string;
  studentId: string;
  firstPreferenceTaskLink: string;
  secondPreferenceTaskLink: string;
  taskNotes?: string;
  submittedAt: string;
};

type AdminResetPayload = {
  mode: "admin-reset-test";
  aucEmail: string;
  studentId?: string;
};

type AdminAddTestSlotPayload = {
  mode: "admin-add-test-slot";
  date: string;
  startTime: string;
  endTime?: string;
  label?: string;
};

type AdminLoadPayload = {
  mode: "admin-load";
};

type AdminReschedulePayload = {
  mode: "admin-reschedule";
  reservationRowIndex: number;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:MM 24h
  endTime?: string;  // HH:MM 24h, optional; defaults to the configured slot duration.
};

type AdminUpdateInterviewStatusPayload = {
  mode: "admin-update-interview-status";
  reservationRowIndex: number;
  interviewStatus: string;
};

type AdminExtendInterviewDurationsPayload = {
  mode: "admin-extend-interview-durations";
};

type AdminLoadApplicantsPayload = {
  mode: "admin-load-applicants";
};

type AdminUpdateScorePayload = {
  mode: "admin-update-score";
  aucEmail: string;
  notesUrl: string;
  firstPreferenceScore: string;
  secondPreferenceScore: string;
};

type SubmissionPayload =
  | ApplicationPayload
  | TaskSubmissionPayload
  | AdminResetPayload
  | AdminAddTestSlotPayload
  | AdminLoadPayload
  | AdminReschedulePayload
  | AdminUpdateInterviewStatusPayload
  | AdminExtendInterviewDurationsPayload
  | AdminLoadApplicantsPayload
  | AdminUpdateScorePayload;

type ConfirmationEmailTemplate = {
  subject: string;
  body: string;
  html: string;
};

type TaskDocument = {
  documentId: string;
  roleName: string;
  title: string;
  documentUrl: string;
  pdfUrl: string;
  fileName: string;
};

type ApplicantTaskDocument = TaskDocument & {
  preferenceLabel: string;
};

type RoleGuideLink = {
  preferenceLabel: string;
  roleName: string;
  url: string;
};

type EmailAttachment = {
  filename: string;
  contentType: string;
  contentBytes: Uint8Array;
};

type InterviewSlotOption = {
  id: string;
  label: string;
  date: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  capacity: number;
  active: boolean;
  reservedCount: number;
  remaining: number;
  full: boolean;
  calendarEventId?: string;
  meetLink?: string;
  rowIndex?: number;
};

type ReservationDetails = {
  slot: InterviewSlotOption;
  calendarEventId: string;
  meetLink: string;
};

let resolvedSheetName: string | null = null;
let resolvedSheetTitles: Set<string> | null = null;

const TASK_DOCUMENTS: Record<string, TaskDocument> = {
  treasurer: taskDocument("Treasurer", "12cWr1oQfAuNmnLRUtR9ekHyE7uu716-VhAdcdYpffl4", "Final Task - Treasurer - Resala Board Recruitment"),
  "tech director": taskDocument("Tech Director", "1jWXLeGeN4yIrq6q_Dutdm4Dqz3jtWgjIzpGHfuaXji0", "Final Task - Tech Director - Resala Board Recruitment"),
  "branding media": taskDocument("Branding / Media", "1kflQQAValfaoEpOO1r-mEaPRVl3loUeYd3XofPQivwY", "Final Task - Branding Media - Resala Board Recruitment"),
  "pr fundraising": taskDocument("PR / Fundraising", "127fH4iEaKGpc7s5qiRI-5Z9-jdgqwXtQeGIVGvHvaHw", "Final Task - PR Fundraising - Resala Board Recruitment"),
  pr: taskDocument("PR", "127fH4iEaKGpc7s5qiRI-5Z9-jdgqwXtQeGIVGvHvaHw", "Final Task - PR Fundraising - Resala Board Recruitment"),
  fundraising: taskDocument("Fundraising", "127fH4iEaKGpc7s5qiRI-5Z9-jdgqwXtQeGIVGvHvaHw", "Final Task - PR Fundraising - Resala Board Recruitment"),
  hr: taskDocument("HR", "1rYAnr0lhVyHW0GIwjHMOaMWxiGxZI3AOp6t5qY8imus", "Final Task - HR - Resala Board Recruitment"),
  operations: taskDocument("Operations", "1tvyaQDhCHnb9E4HiiVmB6ZNXpTVpunsti9ECwxw8f30", "Final Task - Operations - Resala Board Recruitment"),
  visits: taskDocument("Visits", "1ELC6nP7FQN33enuHbUamCvNYTlP8i3DNnA2NCuhPDF0", "Final Task - Visits - Resala Board Recruitment"),
  "children day director": taskDocument("Children Day Director", "1-6nfB5GaSSgE7gL046oIOA9R7caiCmuf04hdHtnHYjM", "Resala Task Children Day"),
  "initiatives director": taskDocument("Initiatives Director", "1tW2YFctINtnKQalTywtI8ZHWyI5AyuvTRf5OIHgcOgA", "Final Task - Initiatives Director - Resala Board Recruitment")
};

const ROLE_GUIDE_SLUGS: Record<string, string> = {
  treasurer: "treasurer",
  "tech director": "tech-director",
  operations: "operations",
  "branding media": "branding-media",
  hr: "hr",
  "pr fundraising": "pr-fundraising",
  pr: "pr-fundraising",
  fundraising: "pr-fundraising",
  visits: "visits",
  "children day director": "children-day-director",
  "initiatives director": "initiatives-director"
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method === "GET") {
    try {
      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const slots = await getInterviewSlots(token);
      return jsonResponse({ ok: true, slots });
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Could not load interview slots."
        },
        400
      );
    }
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  try {
    const payload = await parsePayload(request);

    if (isAdminResetPayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const sheetName = await getSheetName(token);
      const result = await resetTestApplicant(token, payload, sheetName);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminAddTestSlotPayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await addTestInterviewSlot(token, payload);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminLoadPayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await loadAdminDashboard(token);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminReschedulePayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await rescheduleInterview(token, payload);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminUpdateInterviewStatusPayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await updateReservationInterviewStatus(token, payload);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminExtendInterviewDurationsPayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await extendReservedInterviewDurations(token);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminLoadApplicantsPayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await loadAdminApplicants(token);

      return jsonResponse({ ok: true, ...result });
    }

    if (isAdminUpdateScorePayload(payload)) {
      authorizeAdminReset(request);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const result = await updateApplicantScore(token, payload);

      return jsonResponse({ ok: true, ...result });
    }

    if (isTaskSubmissionPayload(payload)) {
      validateTaskSubmission(payload);

      if (!SHEET_ID) {
        throw new Error("SHEET_ID is not configured.");
      }

      const token = await getGoogleAccessToken();
      const sheetName = await getSheetName(token);
      await ensureHeaders(token, sheetName);
      await updateTaskSubmission(token, payload, sheetName);

      return jsonResponse({ ok: true });
    }

    validateApplication(payload);

    if (!SHEET_ID) {
      throw new Error("SHEET_ID is not configured.");
    }

    const token = await getGoogleAccessToken();
    const sheetName = await getSheetName(token);
    await ensureSlotSheets(token);
    await ensureHeaders(token, sheetName);
    await ensureNotDuplicate(token, payload, sheetName);
    const reservation = await reserveInterviewSlot(token, payload);
    payload.interviewSlot = reservation.slot.label;
    payload.interviewSlotLabel = reservation.slot.label;
    await appendApplication(token, payload, sheetName);
    const emailSent = await trySendConfirmationEmail(payload, reservation);

    return jsonResponse({ ok: true, emailSent });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Submission failed."
      },
      400
    );
  }
});

async function parsePayload(
  request: Request
): Promise<SubmissionPayload> {
  const text = await request.text();
  if (!text.trim()) {
    throw new Error("Missing submission body.");
  }

  return JSON.parse(text) as SubmissionPayload;
}

function isTaskSubmissionPayload(payload: SubmissionPayload): payload is TaskSubmissionPayload {
  return (payload as TaskSubmissionPayload).mode === "task-submission";
}

function isAdminResetPayload(payload: SubmissionPayload): payload is AdminResetPayload {
  return (payload as AdminResetPayload).mode === "admin-reset-test";
}

function isAdminAddTestSlotPayload(payload: SubmissionPayload): payload is AdminAddTestSlotPayload {
  return (payload as AdminAddTestSlotPayload).mode === "admin-add-test-slot";
}

function isAdminLoadPayload(payload: SubmissionPayload): payload is AdminLoadPayload {
  return (payload as AdminLoadPayload).mode === "admin-load";
}

function isAdminReschedulePayload(payload: SubmissionPayload): payload is AdminReschedulePayload {
  return (payload as AdminReschedulePayload).mode === "admin-reschedule";
}

function isAdminUpdateInterviewStatusPayload(payload: SubmissionPayload): payload is AdminUpdateInterviewStatusPayload {
  return (payload as AdminUpdateInterviewStatusPayload).mode === "admin-update-interview-status";
}

function isAdminExtendInterviewDurationsPayload(payload: SubmissionPayload): payload is AdminExtendInterviewDurationsPayload {
  return (payload as AdminExtendInterviewDurationsPayload).mode === "admin-extend-interview-durations";
}

function isAdminLoadApplicantsPayload(payload: SubmissionPayload): payload is AdminLoadApplicantsPayload {
  return (payload as AdminLoadApplicantsPayload).mode === "admin-load-applicants";
}

function isAdminUpdateScorePayload(payload: SubmissionPayload): payload is AdminUpdateScorePayload {
  return (payload as AdminUpdateScorePayload).mode === "admin-update-score";
}

function authorizeAdminReset(request: Request): void {
  if (!ADMIN_RESET_SECRET || request.headers.get("x-admin-reset-secret") !== ADMIN_RESET_SECRET) {
    throw new Error("Unauthorized admin reset request.");
  }
}

function isValidAucEmail(value: unknown): boolean {
  return /^[A-Za-z0-9._%+-]+@aucegypt\.edu$/i.test(String(value ?? "").trim());
}

function validateApplication(payload: ApplicationPayload): void {
  const requiredFields: Array<keyof ApplicationPayload> = [
    "timestamp",
    "fullName",
    "aucEmail",
    "studentId",
    "major",
    "yearLevel",
    "phone",
    "roleAppliedFor",
    "roleStepTitle",
    "roleDescription",
    "secondPreference",
    "whyThisRole",
    "whyChooseYourself",
    "interviewSlot",
    "createdAt"
  ];

  const missing = requiredFields.filter((field) => !String(payload[field] ?? "").trim());
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}.`);
  }

  if (!isValidAucEmail(payload.aucEmail)) {
    throw new Error("Invalid AUC email.");
  }

  if (!String(payload.interviewSlotId ?? "").trim()) {
    throw new Error("Missing required fields: interviewSlotId.");
  }

  if (normalizeRole(payload.secondPreference) === normalizeRole(payload.roleAppliedFor)) {
    throw new Error("Second preference must be different from the first role preference.");
  }
}

function validateTaskSubmission(payload: TaskSubmissionPayload): void {
  const requiredFields: Array<keyof TaskSubmissionPayload> = [
    "aucEmail",
    "studentId",
    "firstPreferenceTaskLink",
    "secondPreferenceTaskLink",
    "submittedAt"
  ];
  const missing = requiredFields.filter((field) => !String(payload[field] ?? "").trim());

  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}.`);
  }

  if (!isValidAucEmail(payload.aucEmail)) {
    throw new Error("Invalid AUC email.");
  }

  if (!isLikelyUrl(payload.firstPreferenceTaskLink) || !isLikelyUrl(payload.secondPreferenceTaskLink)) {
    throw new Error("Both task submissions must be valid links.");
  }
}

async function ensureHeaders(token: string, sheetName: string): Promise<void> {
  const headerRange = `A1:${columnLetter(HEADERS.length)}1`;
  const response = await sheetsFetch(token, "GET", `${sheetRange(sheetName, headerRange)}`);
  const currentValues = (await response.json()).values?.[0] ?? [];

  if (currentValues.length === 0) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, headerRange)}?valueInputOption=RAW`, {
      values: [HEADERS]
    });
    return;
  }

  const baseHeadersMatch = APPLICATION_BASE_HEADERS.every((header, index) => currentValues[index] === header);
  if (baseHeadersMatch && currentValues.length < HEADERS.length) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, headerRange)}?valueInputOption=RAW`, {
      values: [HEADERS]
    });
    return;
  }

  const preSecondPreferenceHeadersMatch = APPLICATION_BASE_HEADERS.slice(0, -1).every(
    (header, index) => currentValues[index] === header
  );
  if (preSecondPreferenceHeadersMatch && currentValues.length < HEADERS.length) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, headerRange)}?valueInputOption=RAW`, {
      values: [HEADERS]
    });
    return;
  }

  const headersMatch = HEADERS.every((header, index) => currentValues[index] === header);
  if (!headersMatch) {
    throw new Error("Applications sheet headers do not match the expected schema.");
  }
}

async function ensureNotDuplicate(token: string, payload: ApplicationPayload, sheetName: string): Promise<void> {
  const response = await sheetsFetch(token, "GET", sheetRange(sheetName, "A2:R"));
  const rows = (await response.json()).values ?? [];
  const submittedEmail = normalize(payload.aucEmail);
  const submittedStudentId = normalize(payload.studentId);

  const duplicate = rows.some((row: string[]) => {
    const email = normalize(row[2]);
    const studentId = normalize(row[3]);
    return email === submittedEmail || studentId === submittedStudentId;
  });

  if (duplicate) {
    throw new Error("An application with this AUC email or Student ID already exists.");
  }
}

async function appendApplication(token: string, payload: ApplicationPayload, sheetName: string): Promise<void> {
  await sheetsFetch(token, "POST", `${sheetRange(sheetName, `A:${columnLetter(HEADERS.length)}`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    values: [
      [
        payload.timestamp,
        payload.fullName,
        payload.aucEmail,
        payload.studentId,
        payload.major,
        payload.yearLevel,
        payload.phone,
        payload.roleAppliedFor,
        payload.roleStepTitle,
        payload.roleDescription,
        payload.whyThisRole,
        payload.whyChooseYourself,
        payload.hopeToLearn ?? "",
        payload.previousResalaExperience ?? "",
        payload.interviewSlot,
        payload.createdAt,
        "Pending",
        payload.secondPreference,
        "",
        "",
        "",
        "",
        "Not Submitted"
      ]
    ]
  });
}

async function updateTaskSubmission(token: string, payload: TaskSubmissionPayload, sheetName: string): Promise<void> {
  const response = await sheetsFetch(token, "GET", sheetRange(sheetName, `A2:${columnLetter(HEADERS.length)}`));
  const rows = (await response.json()).values ?? [];
  const submittedEmail = normalize(payload.aucEmail);
  const submittedStudentId = normalize(payload.studentId);
  const rowIndex = rows.findIndex((row: string[]) => {
    const email = normalize(row[2]);
    const studentId = normalize(row[3]);
    return email === submittedEmail && studentId === submittedStudentId;
  });

  if (rowIndex === -1) {
    throw new Error("Could not find an application with this AUC email and Student ID.");
  }

  const sheetRow = rowIndex + 2;
  await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `S${sheetRow}:W${sheetRow}`)}?valueInputOption=RAW`, {
    values: [
      [
        new Date().toISOString(),
        payload.firstPreferenceTaskLink,
        payload.secondPreferenceTaskLink,
        payload.taskNotes ?? "",
        "Submitted"
      ]
    ]
  });
}

async function sendConfirmationEmail(payload: ApplicationPayload, reservation: ReservationDetails): Promise<void> {
  if (!gmailConfigured()) {
    return;
  }

  const tasks = getApplicantTaskDocuments(payload.roleAppliedFor, payload.secondPreference);
  const roleGuideLinks = getApplicantRoleGuideLinks(payload.roleAppliedFor, payload.secondPreference);
  const template = buildConfirmationEmailTemplate(payload, reservation, tasks, roleGuideLinks);
  const attachments = await getTaskPdfAttachments(tasks);
  const accessToken = await getGmailAccessToken();
  const rawMessage = buildRawEmailMessage({
    from: `${GMAIL_SENDER_NAME} <${GMAIL_SENDER_EMAIL}>`,
    to: payload.aucEmail,
    subject: template.subject,
    text: template.body,
    html: template.html,
    attachments
  });

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      raw: rawMessage
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail send failed: ${errorText}`);
  }
}

async function trySendConfirmationEmail(payload: ApplicationPayload, reservation: ReservationDetails): Promise<boolean> {
  try {
    await sendConfirmationEmail(payload, reservation);
    return gmailConfigured();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Confirmation email failed.");
    return false;
  }
}

function gmailConfigured(): boolean {
  return Boolean(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && GMAIL_SENDER_EMAIL);
}

function buildConfirmationEmailTemplate(
  payload: ApplicationPayload,
  reservation: ReservationDetails,
  tasks: ApplicantTaskDocument[],
  roleGuideLinks: RoleGuideLink[]
): ConfirmationEmailTemplate {
  const slot = payload.interviewSlotLabel ?? payload.interviewSlot;
  const taskDeadline = formatLocalDateTimeLabel(
    subtractMinutesFromLocalDateTime(reservation.slot.startDateTime, INTERVIEW_REMINDER_MINUTES)
  );
  const submissionLine = getTaskSubmissionLine();
  const subject = "Resala AUC Application Confirmation";
  const body = [
    `Hi ${payload.fullName},`,
    "",
    `Thanks for applying to Resala AUC. Your first preference is ${payload.roleAppliedFor}, and your second preference is ${payload.secondPreference}.`,
    "",
    `Your interview slot is: ${slot}.`,
    `Google Meet link: ${reservation.meetLink}`,
    "You will receive a Google Calendar invitation and a reminder email 30 minutes before the interview.",
    "",
    "Please complete two pre-interview tasks, one for each preference:",
    "",
    ...formatTaskDocumentTextLines(tasks),
    "",
    "Role guide:",
    `${ROLE_GUIDE_BASE_URL}/`,
    ...formatRoleGuideTextLines(roleGuideLinks),
    "",
    `Task deadline: ${taskDeadline || "30 minutes before your interview"}.`,
    submissionLine,
    "",
    "The task PDFs are attached when Drive export is available. The Google Doc links above are included as a backup.",
    "If anything feels unclear, just reply to this email and we will help.",
    "",
    "Best,",
    "Resala AUC"
  ].join("\n");

  return {
    subject,
    body,
    html: buildConfirmationEmailHtml({
      fullName: payload.fullName,
      roleAppliedFor: payload.roleAppliedFor,
      secondPreference: payload.secondPreference,
      slot,
      taskDeadline,
      meetLink: reservation.meetLink,
      tasks,
      roleGuideLinks
    })
  };
}

function buildConfirmationEmailHtml({
  fullName,
  roleAppliedFor,
  secondPreference,
  slot,
  taskDeadline,
  meetLink,
  tasks,
  roleGuideLinks
}: {
  fullName: string;
  roleAppliedFor: string;
  secondPreference: string;
  slot: string;
  taskDeadline: string;
  meetLink: string;
  tasks: ApplicantTaskDocument[];
  roleGuideLinks: RoleGuideLink[];
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f3ea;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your Resala AUC interview slot is reserved.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f3ea;margin:0;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfca;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#0d2b45;padding:24px 28px 30px;text-align:center;color:#ffffff;">
                <img src="${escapeHtml(EMAIL_LOGO_URL)}" alt="Resala AUC" width="128" style="display:block;width:128px;max-width:128px;height:auto;border:0;outline:none;text-decoration:none;margin:0 auto;">
                <div style="font-size:25px;line-height:1.15;color:#ffffff;font-weight:bold;margin-top:14px;">Beyond Ana Maly</div>
                <div style="font-size:14px;line-height:1.5;color:#f5c46b;margin-top:6px;font-weight:bold;letter-spacing:0.5px;">Build the First Step</div>
                <div style="font-size:28px;line-height:1.15;color:#ffffff;font-weight:bold;margin-top:22px;">Your Interview Slot Is Reserved</div>
                <div style="font-size:15px;line-height:1.5;color:#dbe7ef;margin-top:10px;">Thanks for applying. Here is everything you need before the interview.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 8px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(fullName)},</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Thanks for applying to <strong>Resala AUC</strong>. Your first preference is <strong>${escapeHtml(roleAppliedFor)}</strong>, and your second preference is <strong>${escapeHtml(secondPreference)}</strong>. We received your application and reserved your interview slot.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background:#fff7e8;border:1px solid #f0d7a5;border-left:5px solid #f5a623;border-radius:14px;padding:18px;">
                      <div style="font-size:13px;color:#8a4706;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:7px;">Your interview slot</div>
                      <div style="font-size:22px;line-height:1.3;font-weight:bold;color:#0d2b45;">${escapeHtml(slot)}</div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background:#f8fafc;border:1px solid #e6edf2;border-radius:14px;padding:16px;">
                      <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:8px;">Google Meet</div>
                      <a href="${escapeHtml(meetLink)}" style="color:#0d2b45;font-size:16px;font-weight:bold;text-decoration:underline;">Join the interview meeting</a>
                      <div style="font-size:14px;line-height:1.55;color:#4b5563;margin-top:8px;">You will receive a Google Calendar invitation and a reminder email 30 minutes before the interview.</div>
                    </td>
                  </tr>
                </table>
                ${buildTaskDocumentsHtml(tasks)}
                ${buildRoleGuideHtml(roleGuideLinks)}
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 22px;">
                  <tr>
                    <td style="background:#0d2b45;border-radius:14px;padding:16px 18px;color:#ffffff;">
                      <div style="font-size:14px;color:#f5c46b;font-weight:bold;letter-spacing:.8px;text-transform:uppercase;">Task deadline</div>
                      <div style="font-size:15px;line-height:1.7;color:#ffffff;margin-top:8px;">Submit both tasks by ${escapeHtml(taskDeadline || "30 minutes before your interview")}.</div>
                      ${buildSubmissionActionHtml()}
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">The task PDFs are attached when Drive export is available. The Google Doc buttons above are included as a backup.</p>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4b5563;">If anything feels unclear, just reply to this email and we will help.</p>
                <p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:#172033;font-weight:bold;">Be the first step toward someone's better life.</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Best,<br>Resala AUC</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f3efe5;padding:16px 28px;text-align:center;border-top:1px solid #eadfca;">
                <div style="font-size:12px;line-height:1.5;color:#667085;">Resala AUC · Build the First Step</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function getApplicantRoleGuideLinks(firstPreference: string, secondPreference: string): RoleGuideLink[] {
  return [
    { preferenceLabel: "First preference", roleName: firstPreference },
    { preferenceLabel: "Second preference", roleName: secondPreference }
  ].map(({ preferenceLabel, roleName }) => ({
    preferenceLabel,
    roleName,
    url: getRoleGuideUrl(roleName)
  }));
}

function getRoleGuideUrl(roleName: string): string {
  const slug = ROLE_GUIDE_SLUGS[normalizeRole(roleName)];
  return slug ? `${ROLE_GUIDE_BASE_URL}/${slug}/` : `${ROLE_GUIDE_BASE_URL}/`;
}

function formatRoleGuideTextLines(roleGuideLinks: RoleGuideLink[]): string[] {
  return roleGuideLinks.flatMap((link) => [
    `- ${link.preferenceLabel} role details: ${link.roleName}`,
    `  ${link.url}`
  ]);
}

function buildRoleGuideHtml(roleGuideLinks: RoleGuideLink[]): string {
  const roleRows = roleGuideLinks
    .map(
      (link) => `<tr>
        <td style="padding:12px 0;border-top:1px solid rgba(245,196,107,.35);">
          <div style="font-size:12px;color:#f5c46b;text-transform:uppercase;letter-spacing:.8px;font-weight:bold;margin-bottom:5px;">${escapeHtml(link.preferenceLabel)}</div>
          <div style="font-size:16px;line-height:1.35;color:#ffffff;font-weight:bold;margin-bottom:9px;">${escapeHtml(link.roleName)}</div>
          <a href="${escapeHtml(link.url)}" style="display:inline-block;background:#ffffff;color:#0d2b45;font-size:13px;font-weight:bold;text-decoration:none;border-radius:10px;padding:9px 13px;">View role details</a>
        </td>
      </tr>`
    )
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0d2b45;border-radius:14px;padding:0 16px;margin:0 0 20px;">
    <tr>
      <td style="padding:16px 0 4px;">
        <div style="font-size:13px;color:#f5c46b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:6px;">Role guide</div>
        <div style="font-size:15px;line-height:1.55;color:#dbe7ef;margin-bottom:12px;">Review the full guide, then revisit the details for both preferences before your interview.</div>
        <a href="${escapeHtml(`${ROLE_GUIDE_BASE_URL}/`)}" style="display:inline-block;background:#f5c46b;color:#0d2b45;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;padding:11px 16px;">How to choose your role</a>
      </td>
    </tr>
    ${roleRows}
  </table>`;
}

function taskDocument(roleName: string, documentId: string, title: string): TaskDocument {
  return {
    documentId,
    roleName,
    title,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`,
    pdfUrl: `https://docs.google.com/document/d/${documentId}/export?format=pdf`,
    fileName: `${title.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}.pdf`
  };
}

function getApplicantTaskDocuments(firstPreference: string, secondPreference: string): ApplicantTaskDocument[] {
  const preferences = [
    { preferenceLabel: "First preference", roleName: firstPreference },
    { preferenceLabel: "Second preference", roleName: secondPreference }
  ];

  return preferences.map(({ preferenceLabel, roleName }) => {
    const task = TASK_DOCUMENTS[normalizeRole(roleName)] ?? {
      documentId: "",
      roleName,
      title: `${roleName} pre-interview task`,
      documentUrl: "",
      pdfUrl: "",
      fileName: `${String(roleName || "role").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "")}-task.pdf`
    };

    return {
      ...task,
      roleName: task.roleName || roleName,
      preferenceLabel
    };
  });
}

function formatTaskDocumentTextLines(tasks: ApplicantTaskDocument[]): string[] {
  return tasks.flatMap((task) => [
    `- ${task.preferenceLabel}: ${task.roleName}`,
    `  Google Doc: ${task.documentUrl || "Task document link is not configured."}`
  ]);
}

function buildTaskDocumentsHtml(tasks: ApplicantTaskDocument[]): string {
  const rows = tasks
    .map((task) => {
      const docLink = task.documentUrl
        ? `<a href="${escapeHtml(task.documentUrl)}" style="display:inline-block;background:#0d2b45;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;padding:10px 14px;">Open Google Doc</a>`
        : `<span style="color:#64748b;font-size:15px;">Google Doc link is not configured.</span>`;

      return `<tr>
        <td style="padding:14px 0;border-top:1px solid #e6edf2;">
          <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.8px;font-weight:bold;margin-bottom:5px;">${escapeHtml(task.preferenceLabel)}</div>
          <div style="font-size:17px;line-height:1.35;color:#172033;font-weight:bold;margin-bottom:8px;">${escapeHtml(task.roleName)}</div>
          <div>${docLink}</div>
        </td>
      </tr>`;
    })
    .join("");

  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f8fafc;border:1px solid #e6edf2;border-radius:14px;padding:0 16px;margin:0 0 20px;">
    <tr>
      <td style="padding:16px 0 2px;">
        <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:6px;">Pre-interview tasks</div>
        <div style="font-size:15px;line-height:1.55;color:#4b5563;">Complete both tasks: one for your first preference and one for your second preference.</div>
      </td>
    </tr>
    ${rows}
  </table>`;
}

function getTaskSubmissionLine(): string {
  const submissionUrl = TASK_SUBMISSION_URL.trim();
  if (submissionUrl) {
    return `Submit both completed tasks here: ${submissionUrl}`;
  }

  return "Submit both completed tasks by replying to this email with your files or links.";
}

function buildSubmissionActionHtml(): string {
  const submissionUrl = TASK_SUBMISSION_URL.trim();
  if (!submissionUrl) {
    return `<div style="font-size:14px;line-height:1.55;color:#dbe7ef;margin-top:8px;">Submit both completed tasks by replying to this email with your files or links.</div>`;
  }

  return `<div style="margin-top:14px;">
    <a href="${escapeHtml(submissionUrl)}" style="display:inline-block;background:#f5c46b;color:#0d2b45;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;padding:11px 16px;">Submit tasks</a>
  </div>`;
}

async function getTaskPdfAttachments(tasks: ApplicantTaskDocument[]): Promise<EmailAttachment[]> {
  const attachments: EmailAttachment[] = [];
  let driveToken = "";

  for (const task of tasks) {
    if (!task.pdfUrl) continue;

    try {
      attachments.push({
        filename: task.fileName,
        contentType: "application/pdf",
        contentBytes: await fetchTaskPdfBytes(task, driveToken)
      });
    } catch (error) {
      if (!driveToken) {
        try {
          driveToken = await getGoogleAccessToken();
          attachments.push({
            filename: task.fileName,
            contentType: "application/pdf",
            contentBytes: await fetchTaskPdfBytes(task, driveToken)
          });
          continue;
        } catch (fallbackError) {
          console.error(
            `Task PDF attachment failed for ${task.roleName}: ${
              fallbackError instanceof Error ? fallbackError.message : error instanceof Error ? error.message : "unknown error"
            }`
          );
          continue;
        }
      }

      console.error(`Task PDF attachment failed for ${task.roleName}: ${error instanceof Error ? error.message : "unknown error"}`);
    }
  }

  return attachments;
}

async function fetchTaskPdfBytes(task: ApplicantTaskDocument, driveToken: string): Promise<Uint8Array> {
  const response =
    driveToken && task.documentId
      ? await fetch(
          `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(task.documentId)}/export?mimeType=${encodeURIComponent(
            "application/pdf"
          )}`,
          {
            headers: {
              Authorization: `Bearer ${driveToken}`
            }
          }
        )
      : await fetch(task.pdfUrl);
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok || !contentType.toLowerCase().includes("pdf")) {
    throw new Error(`PDF export failed with status ${response.status}.`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

async function getGmailAccessToken(): Promise<string> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GMAIL_CLIENT_ID,
      client_secret: GMAIL_CLIENT_SECRET,
      refresh_token: GMAIL_REFRESH_TOKEN,
      grant_type: "refresh_token"
    })
  });

  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Gmail token refresh failed: ${JSON.stringify(body)}`);
  }

  return body.access_token;
}

function buildRawEmailMessage({
  from,
  to,
  subject,
  text,
  html,
  attachments = []
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: EmailAttachment[];
}): string {
  const alternativeBoundary = `resala-alt-${crypto.randomUUID()}`;
  const alternativePart = [
    `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
    "",
    `--${alternativeBoundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
    "",
    `--${alternativeBoundary}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
    "",
    `--${alternativeBoundary}--`
  ].join("\r\n");

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    "MIME-Version: 1.0",
    `Subject: ${subject}`
  ];

  if (!attachments.length) {
    return base64UrlEncode([
      ...headers,
      `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
      "",
      `--${alternativeBoundary}`,
      "Content-Type: text/plain; charset=utf-8",
      "",
      text,
      "",
      `--${alternativeBoundary}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      html,
      "",
      `--${alternativeBoundary}--`
    ].join("\r\n"));
  }

  const mixedBoundary = `resala-mixed-${crypto.randomUUID()}`;
  const attachmentParts = attachments.map((attachment) =>
    [
      `--${mixedBoundary}`,
      `Content-Type: ${attachment.contentType}; name="${escapeMimeHeader(attachment.filename)}"`,
      "Content-Transfer-Encoding: base64",
      `Content-Disposition: attachment; filename="${escapeMimeHeader(attachment.filename)}"`,
      "",
      foldBase64(bytesToBase64(attachment.contentBytes))
    ].join("\r\n")
  );

  const message = [
    ...headers,
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    "",
    `--${mixedBoundary}`,
    alternativePart,
    "",
    ...attachmentParts,
    `--${mixedBoundary}--`
  ].join("\r\n");

  return base64UrlEncode(message);
}

async function getSheetName(token: string): Promise<string> {
  if (resolvedSheetName) return resolvedSheetName;

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets metadata request failed: ${errorText}`);
  }

  const body = await response.json();
  const title = body?.sheets?.[0]?.properties?.title;

  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Could not determine the active sheet tab name.");
  }

  resolvedSheetName = title.trim();
  return resolvedSheetName;
}

async function getSpreadsheetSheetTitles(token: string): Promise<Set<string>> {
  if (resolvedSheetTitles) return resolvedSheetTitles;

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties.title`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets metadata request failed: ${errorText}`);
  }

  const body = await response.json();
  const titles = new Set<string>();

  for (const sheet of body?.sheets ?? []) {
    const title = sheet?.properties?.title;
    if (typeof title === "string" && title.trim()) {
      titles.add(title.trim());
    }
  }

  resolvedSheetTitles = titles;
  return resolvedSheetTitles;
}

async function ensureSlotSheets(token: string): Promise<void> {
  await ensureSheetTab(token, SLOT_SHEET_NAME);
  await ensureSheetTab(token, RESERVATION_SHEET_NAME);
  await ensureSheetSeed(
    token,
    SLOT_SHEET_NAME,
    SLOT_HEADERS,
    buildRecruitmentSlotRows()
  );
  await ensureSheetHeaders(token, RESERVATION_SHEET_NAME, RESERVATION_HEADERS);
}

async function normalizeSlotDurations(token: string): Promise<number> {
  const response = await sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`);
  const rows = (await response.json()).values ?? [];
  const updates: Array<{ range: string; values: string[][] }> = [];

  for (const [index, row] of rows.entries()) {
    const startTime = String(row[2] ?? "").trim();
    const currentEndTime = String(row[3] ?? "").trim();
    const expectedEndTime = addMinutesToTime(startTime, INTERVIEW_SLOT_DURATION_MINUTES);

    if (!startTime || !expectedEndTime || currentEndTime === expectedEndTime) {
      continue;
    }

    const rowIndex = index + 2;
    updates.push({
      range: sheetA1Range(SLOT_SHEET_NAME, `D${rowIndex}`),
      values: [[expectedEndTime]]
    });
  }

  await sheetsBatchUpdateValues(token, updates);
  return updates.length;
}

async function ensureSheetTab(token: string, tabName: string): Promise<void> {
  const titles = await getSpreadsheetSheetTitles(token);
  if (titles.has(tabName)) return;

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      requests: [
        {
          addSheet: {
            properties: {
              title: tabName
            }
          }
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (!String(errorText).includes("already exists")) {
      throw new Error(`Could not create sheet tab ${tabName}: ${errorText}`);
    }
  }

  titles.add(tabName);
}

async function ensureSheetHeaders(token: string, sheetName: string, headers: string[]): Promise<void> {
  const width = headers.length;
  const range = `${sheetRange(sheetName, `A1:${columnLetter(width)}1`)}`;
  const response = await sheetsFetch(token, "GET", range);
  const currentValues = (await response.json()).values?.[0] ?? [];

  if (currentValues.length === 0) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `A1:${columnLetter(width)}1`)}?valueInputOption=RAW`, {
      values: [headers]
    });
    return;
  }

  const headersMatch = headers.every((header, index) => currentValues[index] === header);
  if (!headersMatch) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `A1:${columnLetter(width)}1`)}?valueInputOption=RAW`, {
      values: [headers]
    });
  }
}

async function resetTestApplicant(token: string, payload: AdminResetPayload, applicationSheetName: string): Promise<{
  deletedReservations: number;
  deletedApplications: number;
  clearedSlots: number;
  deletedCalendarEvents: number;
}> {
  const email = String(payload.aucEmail ?? "").trim().toLowerCase();
  const studentId = String(payload.studentId ?? "").trim();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!hasValidEmail && !studentId) {
    throw new Error("Provide a valid AUC email or Student ID.");
  }

  await ensureSlotSheets(token);
  await ensureHeaders(token, applicationSheetName);

  const reservationResponse = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:N")}`);
  const reservationRows = ((await reservationResponse.json()).values ?? []) as string[][];
  const reservationMatches = reservationRows
    .map((row: string[], index: number) => ({ row, rowIndex: index + 2 }))
    .filter(({ row }) => {
      const rowEmail = normalize(row[4]);
      const rowStudentId = normalize(row[5]);
      return (hasValidEmail && rowEmail === normalize(email)) || (studentId && rowStudentId === normalize(studentId));
    });

  const slotIdsToReview = new Set(reservationMatches.map(({ row }) => String(row[1] ?? "").trim()).filter(Boolean));
  const calendarEventIds = [
    ...new Set(reservationMatches.map(({ row }) => String(row[6] ?? "").trim()).filter(Boolean))
  ];

  const applicationWidth = columnLetter(HEADERS.length);
  const applicationResponse = await sheetsFetch(token, "GET", `${sheetRange(applicationSheetName, `A2:${applicationWidth}`)}`);
  const applicationRows = ((await applicationResponse.json()).values ?? []) as string[][];
  const applicationMatches = applicationRows
    .map((row: string[], index: number) => ({ row, rowIndex: index + 2 }))
    .filter(({ row }) => {
      const rowEmail = normalize(row[2]);
      const rowStudentId = normalize(row[3]);
      return (hasValidEmail && rowEmail === normalize(email)) || (studentId && rowStudentId === normalize(studentId));
    });

  const sheetIds = await getSpreadsheetSheetIds(token);
  const reservationSheetId = sheetIds.get(RESERVATION_SHEET_NAME);
  const applicationSheetId = sheetIds.get(applicationSheetName);

  if (reservationMatches.length && reservationSheetId === undefined) {
    throw new Error(`Could not find sheet ID for ${RESERVATION_SHEET_NAME}.`);
  }

  if (applicationMatches.length && applicationSheetId === undefined) {
    throw new Error(`Could not find sheet ID for ${applicationSheetName}.`);
  }

  const deleteRequests = [
    ...buildDeleteRowRequests(reservationSheetId, reservationMatches.map((match) => match.rowIndex)),
    ...buildDeleteRowRequests(applicationSheetId, applicationMatches.map((match) => match.rowIndex))
  ];

  if (deleteRequests.length) {
    await batchUpdateSpreadsheet(token, deleteRequests);
  }

  let clearedSlots = 0;
  if (slotIdsToReview.size) {
    clearedSlots = await clearFreedSlotCalendarFields(token, slotIdsToReview);
  }

  let deletedCalendarEvents = 0;
  for (const eventId of calendarEventIds) {
    if (await deleteCalendarEvent(eventId)) {
      deletedCalendarEvents += 1;
    }
  }

  return {
    deletedReservations: reservationMatches.length,
    deletedApplications: applicationMatches.length,
    clearedSlots,
    deletedCalendarEvents
  };
}

async function addTestInterviewSlot(
  token: string,
  payload: AdminAddTestSlotPayload
): Promise<{ slotId: string; label: string; rowIndex: number }> {
  const date = String(payload.date ?? "").trim();
  const startTime = String(payload.startTime ?? "").trim();
  const endTime = String(payload.endTime ?? "").trim() || addMinutesToTime(startTime, INTERVIEW_SLOT_DURATION_MINUTES);
  const label = String(payload.label ?? "").trim() || buildSlotLabel(date, startTime);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid slot date.");
  }

  if (!startTime) {
    throw new Error("Invalid slot start time.");
  }

  await ensureSlotSheets(token);

  const slotId = `test-slot-${date}-${startTime.replace(/[^0-9A-Za-z]/g, "").toLowerCase()}`;
  const row = [slotId, date, startTime, endTime, label, 1, "TRUE", "", ""];
  await sheetsFetch(token, "POST", `${sheetRange(SLOT_SHEET_NAME, "A:I")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    values: [row]
  });

  const slotResponse = await sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`);
  const slotRows = ((await slotResponse.json()).values ?? []) as string[][];
  const rowIndex = slotRows.findIndex((sheetRow: string[]) => normalize(sheetRow[0]) === normalize(slotId)) + 2;

  if (rowIndex < 2) {
    throw new Error("Could not confirm inserted test slot.");
  }

  return {
    slotId,
    label,
    rowIndex
  };
}

async function loadAdminDashboard(token: string): Promise<{
  reservations: Array<Record<string, string | number>>;
  slots: InterviewSlotOption[];
}> {
  await ensureSlotSheets(token);
  const sheetName = await getSheetName(token);

  const [reservationResponse, applicationResponse] = await Promise.all([
    sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:N")}`),
    sheetsFetch(token, "GET", `${sheetRange(sheetName, "A2:W")}`)
  ]);

  const reservationRows = (await reservationResponse.json()).values ?? [];
  const applicationRows = (await applicationResponse.json()).values ?? [];

  const appByEmail = new Map<string, string[]>();
  for (const row of applicationRows) {
    const email = normalize(String(row[2] ?? ""));
    if (email) appByEmail.set(email, row);
  }

  const reservations = reservationRows.map((row: string[], index: number) => {
    const aucEmail = String(row[4] ?? "").trim();
    const app = appByEmail.get(normalize(aucEmail)) ?? [];
    const roleAppliedFor = String(row[12] ?? "").trim() || String(app[7] ?? "").trim();
    const secondPreference = String(row[13] ?? "").trim() || String(app[17] ?? "").trim();
    const taskSubmission = getTaskSubmissionState(app);
    return {
      rowIndex: index + 2,
      timestamp: row[0] ?? "",
      slotId: row[1] ?? "",
      slotLabel: row[2] ?? "",
      fullName: row[3] ?? "",
      aucEmail,
      studentId: row[5] ?? "",
      calendarEventId: row[6] ?? "",
      meetLink: row[7] ?? "",
      interviewStatus: row[8] ?? "",
      reminderSendAt: row[9] ?? "",
      reminderSentAt: row[10] ?? "",
      reminderStatus: row[11] ?? "",
      roleAppliedFor,
      secondPreference,
      major: app[4] ?? "",
      yearLevel: app[5] ?? "",
      phone: app[6] ?? "",
      whyThisRole: app[10] ?? "",
      whyChooseYourself: app[11] ?? "",
      hopeToLearn: app[12] ?? "",
      previousResalaExperience: app[13] ?? "",
      ...taskSubmission
    };
  });

  const slots = await getInterviewSlots(token);

  return { reservations, slots };
}

async function updateReservationInterviewStatus(
  token: string,
  payload: AdminUpdateInterviewStatusPayload
): Promise<{ updatedReservation: boolean; updatedApplication: boolean; interviewStatus: string }> {
  const rowIndex = Number(payload.reservationRowIndex);
  const interviewStatus = normalizeInterviewStatus(payload.interviewStatus);

  if (!Number.isInteger(rowIndex) || rowIndex < 2) {
    throw new Error("Invalid reservation row.");
  }

  if (!interviewStatus) {
    throw new Error("Invalid interview status.");
  }

  const reservationResponse = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, `A${rowIndex}:N${rowIndex}`)}`);
  const reservationValues = (await reservationResponse.json()).values?.[0] ?? [];

  if (!reservationValues.length) {
    throw new Error(`No reservation found at row ${rowIndex}.`);
  }

  const aucEmail = String(reservationValues[4] ?? "").trim();

  await sheetsFetch(token, "PUT", `${sheetRange(RESERVATION_SHEET_NAME, `I${rowIndex}`)}?valueInputOption=RAW`, {
    values: [[interviewStatus]]
  });

  let updatedApplication = false;
  if (aucEmail) {
    const sheetName = await getSheetName(token);
    const applicationWidth = columnLetter(HEADERS.length);
    const applicationResponse = await sheetsFetch(token, "GET", `${sheetRange(sheetName, `A2:${applicationWidth}`)}`);
    const applicationRows = (await applicationResponse.json()).values ?? [];
    const appRowIndex = applicationRows.findIndex((row: string[]) => normalize(row[2]) === normalize(aucEmail));

    if (appRowIndex !== -1) {
      const sheetRow = appRowIndex + 2;
      await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `Q${sheetRow}`)}?valueInputOption=RAW`, {
        values: [[interviewStatus]]
      });
      updatedApplication = true;
    }
  }

  return { updatedReservation: true, updatedApplication, interviewStatus };
}

async function extendReservedInterviewDurations(token: string): Promise<{
  normalizedSlots: number;
  checkedReservations: number;
  updatedCalendarEvents: number;
  skippedReservations: number;
}> {
  if (!CALENDAR_ID || !gmailConfigured()) {
    throw new Error("Google Calendar event updates are not configured.");
  }

  await ensureSlotSheets(token);
  const normalizedSlots = await normalizeSlotDurations(token);

  const [slotResponse, reservationResponse] = await Promise.all([
    sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`),
    sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:N")}`)
  ]);
  const slotRows = (await slotResponse.json()).values ?? [];
  const reservationRows = ((await reservationResponse.json()).values ?? []) as string[][];
  const slotById = new Map<string, { startDateTime: string; endDateTime: string }>();

  for (const row of slotRows) {
    const id = String(row[0] ?? "").trim();
    const date = String(row[1] ?? "").trim();
    const startTime = String(row[2] ?? "").trim();
    const endTime = addMinutesToTime(startTime, INTERVIEW_SLOT_DURATION_MINUTES);
    const startDateTime = buildLocalDateTime(date, startTime);
    const endDateTime = buildLocalDateTime(date, endTime);

    if (id && startDateTime && endDateTime) {
      slotById.set(normalize(id), { startDateTime, endDateTime });
    }
  }

  const calendarToken = await getGmailAccessToken();
  let updatedCalendarEvents = 0;
  let skippedReservations = 0;

  for (const row of reservationRows) {
    const slotId = String(row[1] ?? "").trim();
    const calendarEventId = String(row[6] ?? "").trim();
    const slot = slotById.get(normalize(slotId));

    if (!calendarEventId || !slot) {
      skippedReservations += 1;
      continue;
    }

    await updateCalendarEventEnd(calendarToken, calendarEventId, slot.endDateTime);
    updatedCalendarEvents += 1;
  }

  return {
    normalizedSlots,
    checkedReservations: reservationRows.length,
    updatedCalendarEvents,
    skippedReservations
  };
}

async function updateCalendarEventEnd(token: string, eventId: string, endDateTime: string): Promise<void> {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        end: {
          dateTime: endDateTime,
          timeZone: CALENDAR_TIME_ZONE
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar event update failed: ${errorText}`);
  }
}

function normalizeInterviewStatus(value: unknown): string {
  const status = String(value ?? "").trim();
  const allowedStatuses = new Set(["Not Done", "Done", "No Show", "Pending"]);
  return allowedStatuses.has(status) ? status : "";
}

async function ensureInterviewScoreHeaders(token: string, sheetName: string): Promise<void> {
  const startCol = columnLetter(HEADERS.length + 1);
  const endCol = columnLetter(HEADERS.length + INTERVIEW_SCORE_HEADERS.length);
  const response = await sheetsFetch(token, "GET", `${sheetRange(sheetName, `${startCol}1:${endCol}1`)}`);
  const current = (await response.json()).values?.[0] ?? [];
  const match = INTERVIEW_SCORE_HEADERS.every((h, i) => current[i] === h);
  if (!match) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `${startCol}1:${endCol}1`)}?valueInputOption=RAW`, {
      values: [INTERVIEW_SCORE_HEADERS]
    });
  }
}

async function loadAdminApplicants(token: string): Promise<{
  applicants: Array<Record<string, string | number>>;
}> {
  const sheetName = await getSheetName(token);
  await ensureInterviewScoreHeaders(token, sheetName);

  const totalCols = HEADERS.length + INTERVIEW_SCORE_HEADERS.length;
  const width = columnLetter(totalCols);
  const response = await sheetsFetch(token, "GET", `${sheetRange(sheetName, `A2:${width}`)}`);
  const rows = (await response.json()).values ?? [];

  const applicants = rows.map((row: string[], index: number) => ({
    rowIndex: index + 2,
    fullName: row[1] ?? "",
    aucEmail: row[2] ?? "",
    studentId: row[3] ?? "",
    phone: row[6] ?? "",
    roleAppliedFor: row[7] ?? "",
    secondPreference: row[17] ?? "",
    interviewSlot: row[14] ?? "",
    status: row[16] ?? "",
    ...getTaskSubmissionState(row),
    notesUrl: row[23] ?? "",
    firstPreferenceScore: row[24] ?? "",
    secondPreferenceScore: row[25] ?? ""
  }));

  return { applicants };
}

async function updateApplicantScore(
  token: string,
  payload: AdminUpdateScorePayload
): Promise<{ updated: boolean }> {
  const sheetName = await getSheetName(token);
  await ensureInterviewScoreHeaders(token, sheetName);

  const totalCols = HEADERS.length + INTERVIEW_SCORE_HEADERS.length;
  const width = columnLetter(totalCols);
  const response = await sheetsFetch(token, "GET", `${sheetRange(sheetName, `A2:${width}`)}`);
  const rows = (await response.json()).values ?? [];

  const rowIndex = rows.findIndex((row: string[]) => normalize(row[2]) === normalize(payload.aucEmail));
  if (rowIndex === -1) {
    throw new Error(`Applicant not found: ${payload.aucEmail}`);
  }

  const sheetRow = rowIndex + 2;
  const startCol = columnLetter(HEADERS.length + 1); // X
  const endCol = columnLetter(HEADERS.length + INTERVIEW_SCORE_HEADERS.length); // Z

  await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `${startCol}${sheetRow}:${endCol}${sheetRow}`)}?valueInputOption=RAW`, {
    values: [[payload.notesUrl, payload.firstPreferenceScore, payload.secondPreferenceScore]]
  });

  return { updated: true };
}

async function rescheduleInterview(
  token: string,
  payload: AdminReschedulePayload
): Promise<{
  updatedReservation: boolean;
  updatedApplication: boolean;
  deletedOldEvent: boolean;
  createdNewEvent: boolean;
  emailSent: boolean;
}> {
  const { reservationRowIndex, date, startTime: rawStartTime } = payload;
  const rawEndTime = String(payload.endTime ?? "").trim();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error("Invalid date format. Use YYYY-MM-DD.");
  }

  if (!/^\d{1,2}:\d{2}$/.test(rawStartTime)) {
    throw new Error("Invalid time format. Use HH:MM (24h).");
  }

  const reservationResponse = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, `A${reservationRowIndex}:N${reservationRowIndex}`)}`);
  const reservationValues = (await reservationResponse.json()).values?.[0] ?? [];

  if (!reservationValues.length) {
    throw new Error(`No reservation found at row ${reservationRowIndex}.`);
  }

  const fullName = String(reservationValues[3] ?? "").trim();
  const aucEmail = String(reservationValues[4] ?? "").trim();
  const studentId = String(reservationValues[5] ?? "").trim();
  const oldSlotId = String(reservationValues[1] ?? "").trim();
  const oldCalendarEventId = String(reservationValues[6] ?? "").trim();
  const roleAppliedFor = String(reservationValues[12] ?? "").trim();
  const secondPreference = String(reservationValues[13] ?? "").trim();

  if (!aucEmail) {
    throw new Error("Reservation is missing applicant email.");
  }

  const [sh, sm] = rawStartTime.split(":").map(Number);
  const startDateTime = `${date}T${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}:00`;

  const endMinutesTotal = sh * 60 + sm + INTERVIEW_SLOT_DURATION_MINUTES;
  const eh = Math.floor(endMinutesTotal / 60) % 24;
  const em = endMinutesTotal % 60;
  const resolvedEndTime = rawEndTime || `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;
  const [reh, rem] = resolvedEndTime.split(":").map(Number);
  const endDateTime = `${date}T${String(reh).padStart(2, "0")}:${String(rem).padStart(2, "0")}:00`;

  const displayHour = sh % 12 || 12;
  const meridiem = sh >= 12 ? "PM" : "AM";
  const slotLabel = `${date} at ${displayHour}:${String(sm).padStart(2, "0")} ${meridiem}`;
  const slotId = `admin-${date}-${String(sh).padStart(2, "0")}${String(sm).padStart(2, "0")}`;
  const fallbackSlot: InterviewSlotOption = {
    id: slotId,
    label: slotLabel,
    date,
    startTime: `${displayHour}:${String(sm).padStart(2, "0")} ${meridiem}`,
    endTime: `${reh % 12 || 12}:${String(rem).padStart(2, "0")} ${reh >= 12 ? "PM" : "AM"}`,
    startDateTime,
    endDateTime,
    capacity: 1,
    active: true,
    reservedCount: 0,
    remaining: 1,
    full: false
  };

  const newSlot = await resolveRescheduleSlot(token, {
    date,
    startTime24: `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`,
    currentReservationRowIndex: reservationRowIndex,
    fallbackSlot
  });

  if (newSlot.full) {
    throw new Error("That interview slot is already full. Please choose another slot.");
  }

  let deletedOldEvent = false;
  if (oldCalendarEventId) {
    try {
      deletedOldEvent = await deleteCalendarEvent(oldCalendarEventId);
    } catch {
      console.error(`Failed to delete old calendar event ${oldCalendarEventId}`);
    }
  }

  const applicantPayload: ApplicationPayload = {
    timestamp: new Date().toISOString(),
    fullName,
    aucEmail,
    studentId,
    major: "",
    yearLevel: "",
    phone: "",
    roleAppliedFor,
    roleStepTitle: "",
    roleDescription: "",
    secondPreference,
    whyThisRole: "",
    whyChooseYourself: "",
    interviewSlot: newSlot.label,
    interviewSlotId: newSlot.id,
    interviewSlotLabel: newSlot.label,
    createdAt: new Date().toISOString()
  };

  const calendarToken = await getGmailAccessToken();
  const newCalendarEvent = await createCalendarEvent(calendarToken, applicantPayload, newSlot);
  await updateSlotCalendarFields(token, newSlot, newCalendarEvent);

  const newReminderSendAt = subtractMinutesFromLocalDateTime(newSlot.startDateTime, INTERVIEW_REMINDER_MINUTES);

  await sheetsFetch(token, "PUT", `${sheetRange(RESERVATION_SHEET_NAME, `B${reservationRowIndex}:C${reservationRowIndex}`)}?valueInputOption=RAW`, {
    values: [[newSlot.id, newSlot.label]]
  });
  await sheetsFetch(token, "PUT", `${sheetRange(RESERVATION_SHEET_NAME, `G${reservationRowIndex}:H${reservationRowIndex}`)}?valueInputOption=RAW`, {
    values: [[newCalendarEvent.calendarEventId, newCalendarEvent.meetLink]]
  });
  await sheetsFetch(token, "PUT", `${sheetRange(RESERVATION_SHEET_NAME, `J${reservationRowIndex}:L${reservationRowIndex}`)}?valueInputOption=RAW`, {
    values: [[newReminderSendAt, "", "Pending"]]
  });

  if (oldSlotId && oldSlotId !== newSlot.id) {
    await clearFreedSlotCalendarFields(token, new Set([oldSlotId]));
  }

  const sheetName = await getSheetName(token);
  const applicationWidth = columnLetter(HEADERS.length);
  const applicationResponse = await sheetsFetch(token, "GET", `${sheetRange(sheetName, `A2:${applicationWidth}`)}`);
  const applicationRows = (await applicationResponse.json()).values ?? [];
  const appRowIndex = applicationRows.findIndex((row: string[]) => normalize(row[2]) === normalize(aucEmail));
  let updatedApplication = false;

  if (appRowIndex !== -1) {
    const sheetRow = appRowIndex + 2;
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `O${sheetRow}`)}?valueInputOption=RAW`, {
      values: [[newSlot.label]]
    });
    updatedApplication = true;
  }

  let emailSent = false;
  try {
    await sendRescheduleEmail(applicantPayload, {
      slot: newSlot,
      calendarEventId: newCalendarEvent.calendarEventId,
      meetLink: newCalendarEvent.meetLink
    });
    emailSent = gmailConfigured();
  } catch (error) {
    console.error(`Reschedule email failed: ${error instanceof Error ? error.message : "unknown error"}`);
  }

  return { updatedReservation: true, updatedApplication, deletedOldEvent, createdNewEvent: true, emailSent };
}

async function resolveRescheduleSlot(
  token: string,
  {
    date,
    startTime24,
    currentReservationRowIndex,
    fallbackSlot
  }: {
    date: string;
    startTime24: string;
    currentReservationRowIndex: number;
    fallbackSlot: InterviewSlotOption;
  }
): Promise<InterviewSlotOption> {
  const [slotResponse, reservationResponse] = await Promise.all([
    sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`),
    sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:B")}`)
  ]);
  const slotRows = ((await slotResponse.json()).values ?? []) as string[][];
  const reservationRows = (await reservationResponse.json()).values ?? [];

  const match = slotRows
    .map((row: string[], index: number) => ({ row, rowIndex: index + 2 }))
    .find(({ row }) => String(row[1] ?? "").trim() === date && normalizeTime24(row[2]) === startTime24);

  if (!match) {
    return fallbackSlot;
  }

  const row = match.row;
  const id = String(row[0] ?? "").trim();
  const startTime = String(row[2] ?? "").trim();
  const endTime = addMinutesToTime(startTime, INTERVIEW_SLOT_DURATION_MINUTES) || String(row[3] ?? "").trim();
  const label = String(row[4] ?? "").trim() || buildSlotLabel(date, startTime);
  const capacity = Number(row[5] ?? 1) || 1;
  const active = String(row[6] ?? "TRUE").toLowerCase() !== "false" && !isRemovedOverlappingDefaultSlot(id);
  const reservedCount = reservationRows.reduce((count: number, reservationRow: string[], index: number) => {
    const sheetRow = index + 2;
    if (sheetRow === currentReservationRowIndex) return count;
    return normalize(reservationRow[1]) === normalize(id) ? count + 1 : count;
  }, 0);
  const remaining = Math.max(capacity - reservedCount, 0);
  const startDateTime = buildLocalDateTime(date, startTime);
  const endDateTime = buildLocalDateTime(date, endTime);
  const past = isPastLocalDateTime(startDateTime, CALENDAR_TIME_ZONE);

  return {
    id,
    label,
    date,
    startTime,
    endTime,
    startDateTime,
    endDateTime,
    capacity,
    active,
    reservedCount,
    remaining,
    full: !active || !date || !startTime || !startDateTime || !endDateTime || past || remaining <= 0,
    calendarEventId: String(row[7] ?? "").trim(),
    meetLink: String(row[8] ?? "").trim(),
    rowIndex: match.rowIndex
  };
}

async function sendRescheduleEmail(payload: ApplicationPayload, reservation: ReservationDetails): Promise<void> {
  if (!gmailConfigured()) return;

  const slot = payload.interviewSlotLabel ?? payload.interviewSlot;
  const subject = "Resala AUC: Your interview has been rescheduled";
  const body = [
    `Hi ${payload.fullName},`,
    "",
    "Your Resala AUC interview has been rescheduled.",
    "",
    `New interview slot: ${slot}.`,
    `Google Meet link: ${reservation.meetLink}`,
    "You will receive a new Google Calendar invitation for this time.",
    "",
    "If you have any questions, just reply to this email.",
    "",
    "Best,",
    "Resala AUC"
  ].join("\n");

  const html = buildRescheduleEmailHtml({ fullName: payload.fullName, slot, meetLink: reservation.meetLink });
  const accessToken = await getGmailAccessToken();
  const rawMessage = buildRawEmailMessage({
    from: `${GMAIL_SENDER_NAME} <${GMAIL_SENDER_EMAIL}>`,
    to: payload.aucEmail,
    subject,
    text: body,
    html,
    attachments: []
  });

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ raw: rawMessage })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gmail send failed: ${errorText}`);
  }
}

function buildRescheduleEmailHtml({ fullName, slot, meetLink }: { fullName: string; slot: string; meetLink: string }): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f3ea;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f3ea;margin:0;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfca;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#0d2b45;padding:24px 28px 30px;text-align:center;color:#ffffff;">
                <img src="${escapeHtml(EMAIL_LOGO_URL)}" alt="Resala AUC" width="128" style="display:block;width:128px;max-width:128px;height:auto;border:0;margin:0 auto;">
                <div style="font-size:26px;line-height:1.2;color:#ffffff;font-weight:bold;margin-top:20px;">Interview Rescheduled</div>
                <div style="font-size:15px;line-height:1.5;color:#dbe7ef;margin-top:8px;">Your updated interview details are below.</div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 8px;">
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(fullName)},</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Your Resala AUC interview has been rescheduled to a new time.</p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background:#fff7e8;border:1px solid #f0d7a5;border-left:5px solid #f5a623;border-radius:14px;padding:18px;">
                      <div style="font-size:13px;color:#8a4706;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:7px;">New interview slot</div>
                      <div style="font-size:22px;line-height:1.3;font-weight:bold;color:#0d2b45;">${escapeHtml(slot)}</div>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
                  <tr>
                    <td style="background:#f8fafc;border:1px solid #e6edf2;border-radius:14px;padding:16px;">
                      <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:8px;">Google Meet</div>
                      <a href="${escapeHtml(meetLink)}" style="color:#0d2b45;font-size:16px;font-weight:bold;text-decoration:underline;">Join the interview meeting</a>
                      <div style="font-size:14px;line-height:1.55;color:#4b5563;margin-top:8px;">A new Google Calendar invitation has been sent. You will also receive a reminder 30 minutes before.</div>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4b5563;">If you have any questions, just reply to this email.</p>
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Best,<br>Resala AUC</p>
              </td>
            </tr>
            <tr>
              <td style="background:#f3efe5;padding:16px 28px;text-align:center;border-top:1px solid #eadfca;">
                <div style="font-size:12px;line-height:1.5;color:#667085;">Resala AUC · Build the First Step</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function getSpreadsheetSheetIds(token: string): Promise<Map<string, number>> {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}?fields=sheets.properties(sheetId,title)`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets metadata request failed: ${errorText}`);
  }

  const body = await response.json();
  const sheetIds = new Map<string, number>();

  for (const sheet of body?.sheets ?? []) {
    const title = sheet?.properties?.title;
    const sheetId = sheet?.properties?.sheetId;
    if (typeof title === "string" && typeof sheetId === "number") {
      sheetIds.set(title, sheetId);
    }
  }

  return sheetIds;
}

function buildDeleteRowRequests(sheetId: number | undefined, rowIndexes: number[]): Array<Record<string, unknown>> {
  if (sheetId === undefined) return [];

  return [...rowIndexes]
    .sort((a, b) => b - a)
    .map((rowIndex) => ({
      deleteDimension: {
        range: {
          sheetId,
          dimension: "ROWS",
          startIndex: rowIndex - 1,
          endIndex: rowIndex
        }
      }
    }));
}

async function batchUpdateSpreadsheet(token: string, requests: Array<Record<string, unknown>>): Promise<void> {
  if (!requests.length) return;

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requests })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets batch update failed: ${errorText}`);
  }
}

async function clearFreedSlotCalendarFields(token: string, slotIds: Set<string>): Promise<number> {
  const reservationResponse = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:B")}`);
  const remainingReservationRows = (await reservationResponse.json()).values ?? [];
  const stillReservedSlotIds = new Set(
    remainingReservationRows.map((row: string[]) => String(row[1] ?? "").trim()).filter(Boolean).map((slotId: string) => normalize(slotId))
  );

  const slotResponse = await sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`);
  const slotRows = ((await slotResponse.json()).values ?? []) as string[][];
  let cleared = 0;

  for (const [index, row] of slotRows.entries()) {
    const slotId = String(row[0] ?? "").trim();
    if (!slotIds.has(slotId) || stillReservedSlotIds.has(normalize(slotId))) continue;

    const rowIndex = index + 2;
    await sheetsFetch(token, "PUT", `${sheetRange(SLOT_SHEET_NAME, `H${rowIndex}:I${rowIndex}`)}?valueInputOption=RAW`, {
      values: [["", ""]]
    });
    cleared += 1;
  }

  return cleared;
}

async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  if (!CALENDAR_ID || !gmailConfigured()) return false;

  const token = await getGmailAccessToken();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (response.status === 404 || response.status === 410) {
    return false;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Calendar event delete failed: ${errorText}`);
  }

  return true;
}

async function ensureSheetSeed(
  token: string,
  sheetName: string,
  headers: string[],
  rows: Array<Array<string | number | boolean>>
): Promise<void> {
  await ensureSheetHeaders(token, sheetName, headers);
  const response = await sheetsFetch(token, "GET", `${sheetRange(sheetName, "A2:Z")}`);
  const existingRows = (await response.json()).values ?? [];

  if (existingRows.length === 0 || shouldResetSlotRows(sheetName, existingRows)) {
    if (existingRows.length > 0) {
      await sheetsFetch(token, "POST", `${sheetRange(sheetName, "A2:Z")}:clear`, {});
    }

    await sheetsFetch(token, "POST", `${sheetRange(sheetName, "A:Z")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
      values: rows
    });
  }
}

function shouldResetSlotRows(sheetName: string, rows: string[][]): boolean {
  if (sheetName !== SLOT_SHEET_NAME) return false;
  if (!rows.length) return false;

  const hasDatedRows = rows.some((row) => /^\d{4}-\d{2}-\d{2}$/.test(String(row[1] ?? "").trim()));

  if (hasDatedRows) {
    return false;
  }

  return rows.every((row) => {
    const date = String(row[1] ?? "").trim();
    const startTime = String(row[2] ?? "").trim();
    return !date && Boolean(startTime);
  });
}

function buildRecruitmentSlotRows(): Array<Array<string | number>> {
  const rows: Array<Array<string | number>> = [];
  const startDate = parseDateOnly(RECRUITMENT_START_DATE);
  const endDate = parseDateOnly(RECRUITMENT_END_DATE);

  if (!startDate || !endDate) {
    throw new Error("Recruitment slot date range is invalid.");
  }

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dateString = formatDateOnly(date);

    for (const slot of DAILY_SLOT_TIMES) {
      rows.push([
        `slot-${dateString}-${slot.code}`,
        dateString,
        slot.startTime,
        addMinutesToTime(slot.startTime, INTERVIEW_SLOT_DURATION_MINUTES),
        `${dateString} at ${slot.startTime}`,
        1,
        "TRUE",
        "",
        ""
      ]);
    }
  }

  return rows;
}

async function getInterviewSlots(token: string): Promise<InterviewSlotOption[]> {
  await ensureSlotSheets(token);

  const slotResponse = await sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`);
  const slotRows = ((await slotResponse.json()).values ?? []) as string[][];

  const reservationResponse = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:L")}`);
  const reservationRows = ((await reservationResponse.json()).values ?? []) as string[][];
  const reservedCounts = new Map<string, number>();

  for (const row of reservationRows) {
    const slotId = normalize(row[1]);
    if (!slotId) continue;
    reservedCounts.set(slotId, (reservedCounts.get(slotId) ?? 0) + 1);
  }

  return slotRows
    .map((row: string[], index: number) => {
      const id = String(row[0] ?? "").trim();
      const date = String(row[1] ?? "").trim();
      const startTime = String(row[2] ?? "").trim();
      const endTime = addMinutesToTime(startTime, INTERVIEW_SLOT_DURATION_MINUTES) || String(row[3] ?? "").trim();
      const label = String(row[4] ?? "").trim() || buildSlotLabel(date, startTime);
      const capacity = Number(row[5] ?? 1) || 1;
      const active = String(row[6] ?? "TRUE").toLowerCase() !== "false" && !isRemovedOverlappingDefaultSlot(id);
      const calendarEventId = String(row[7] ?? "").trim();
      const meetLink = String(row[8] ?? "").trim();
      const reservedCount = reservedCounts.get(normalize(id)) ?? 0;
      const remaining = Math.max(capacity - reservedCount, 0);
      const startDateTime = buildLocalDateTime(date, startTime);
      const endDateTime = buildLocalDateTime(date, endTime);
      const past = isPastLocalDateTime(startDateTime, CALENDAR_TIME_ZONE);
      const sameDayCutoffReached = isSameDaySlotCutoffReached(date, CALENDAR_TIME_ZONE);

      return {
        id,
        label,
        date,
        startTime,
        endTime,
        startDateTime,
        endDateTime,
        capacity,
        active,
        reservedCount,
        remaining,
        full: !active || !date || !startTime || !startDateTime || !endDateTime || past || sameDayCutoffReached || remaining <= 0,
        calendarEventId,
        meetLink,
        rowIndex: index + 2
      };
    })
    .filter((slot) => slot.active)
    .sort((a, b) => (a.startDateTime || a.label).localeCompare(b.startDateTime || b.label));
}

async function reserveInterviewSlot(token: string, payload: ApplicationPayload): Promise<ReservationDetails> {
  const slots = await getInterviewSlots(token);
  const selected = slots.find((slot) => slot.id === payload.interviewSlotId);

  if (!selected) {
    throw new Error("Selected interview slot is not available.");
  }

  if (selected.full) {
    throw new Error("That interview slot is already full. Please choose another slot.");
  }

  const calendarToken = await getGmailAccessToken();
  const calendarEvent = await createCalendarEvent(calendarToken, payload, selected);
  await updateSlotCalendarFields(token, selected, calendarEvent);

  await sheetsFetch(token, "POST", `${sheetRange(RESERVATION_SHEET_NAME, "A:N")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, {
    values: [
      [
        payload.timestamp,
        selected.id,
        selected.label,
        payload.fullName,
        payload.aucEmail,
        payload.studentId,
        calendarEvent.calendarEventId,
        calendarEvent.meetLink,
        "Not Done",
        subtractMinutesFromLocalDateTime(selected.startDateTime, INTERVIEW_REMINDER_MINUTES),
        "",
        "Pending",
        payload.roleAppliedFor,
        payload.secondPreference
      ]
    ]
  });

  return {
    slot: selected,
    calendarEventId: calendarEvent.calendarEventId,
    meetLink: calendarEvent.meetLink
  };
}

async function createCalendarEvent(
  token: string,
  payload: ApplicationPayload,
  slot: InterviewSlotOption
): Promise<{ calendarEventId: string; meetLink: string }> {
  if (!CALENDAR_ID) {
    throw new Error("CALENDAR_ID is not configured.");
  }

  const requestId = `resala-${payload.studentId}-${Date.now()}`.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 100);
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        summary: `Resala AUC Interview - ${payload.fullName}`,
        description: [
          `Applicant: ${payload.fullName}`,
          `Role: ${payload.roleAppliedFor}`,
          `Second preference: ${payload.secondPreference}`,
          `AUC Email: ${payload.aucEmail}`,
          `Student ID: ${payload.studentId}`
        ].join("\n"),
        start: {
          dateTime: slot.startDateTime,
          timeZone: CALENDAR_TIME_ZONE
        },
        end: {
          dateTime: slot.endDateTime,
          timeZone: CALENDAR_TIME_ZONE
        },
        attendees: [
          {
            email: payload.aucEmail,
            displayName: payload.fullName
          }
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: "email", minutes: INTERVIEW_REMINDER_MINUTES },
            { method: "popup", minutes: INTERVIEW_REMINDER_MINUTES }
          ]
        },
        conferenceData: {
          createRequest: {
            requestId,
            conferenceSolutionKey: {
              type: "hangoutsMeet"
            }
          }
        }
      })
    }
  );

  const body = await response.json();
  if (!response.ok) {
    throw new Error(`Google Calendar event creation failed: ${JSON.stringify(body)}`);
  }

  const meetLink =
    body.hangoutLink ??
    body.conferenceData?.entryPoints?.find((entryPoint: { entryPointType?: string; uri?: string }) => entryPoint.entryPointType === "video")
      ?.uri ??
    "";

  if (!body.id || !meetLink) {
    throw new Error("Google Calendar did not return a Meet link.");
  }

  return {
    calendarEventId: body.id,
    meetLink
  };
}

async function updateSlotCalendarFields(
  token: string,
  slot: InterviewSlotOption,
  calendarEvent: { calendarEventId: string; meetLink: string }
): Promise<void> {
  if (!slot.rowIndex) return;

  await sheetsFetch(token, "PUT", `${sheetRange(SLOT_SHEET_NAME, `H${slot.rowIndex}:I${slot.rowIndex}`)}?valueInputOption=RAW`, {
    values: [[calendarEvent.calendarEventId, calendarEvent.meetLink]]
  });
}

async function sheetsFetch(token: string, method: string, path: string, body?: unknown): Promise<Response> {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets request failed: ${errorText}`);
  }

  return response;
}

async function sheetsBatchUpdateValues(
  token: string,
  data: Array<{ range: string; values: string[][] }>
): Promise<void> {
  if (!data.length) return;

  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      valueInputOption: "RAW",
      data
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets batch values update failed: ${errorText}`);
  }
}

async function getGoogleAccessToken(): Promise<string> {
  const credentials = getGoogleCredentials();
  const now = Math.floor(Date.now() / 1000);
  const jwtHeader = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const jwtClaim = base64UrlEncode(
    JSON.stringify({
      iss: credentials.clientEmail,
      scope:
        "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now
    })
  );
  const unsignedJwt = `${jwtHeader}.${jwtClaim}`;
  const signature = await signJwt(unsignedJwt, credentials.privateKey);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsignedJwt}.${signature}`
    })
  });

  const body = await response.json();
  if (!response.ok || !body.access_token) {
    throw new Error(`Google auth failed: ${JSON.stringify(body)}`);
  }

  return body.access_token;
}

function getGoogleCredentials(): { clientEmail: string; privateKey: string } {
  if (GOOGLE_SERVICE_ACCOUNT_KEY) {
    const decoded = decodeMaybeBase64(GOOGLE_SERVICE_ACCOUNT_KEY);
    const credentials = JSON.parse(decoded);

    if (credentials.client_email && credentials.private_key) {
      return {
        clientEmail: credentials.client_email,
        privateKey: credentials.private_key
      };
    }
  }

  if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY) {
    return {
      clientEmail: GOOGLE_CLIENT_EMAIL,
      privateKey: GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    };
  }

  throw new Error("Google service account credentials are not configured.");
}

async function signJwt(unsignedJwt: string, privateKey: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(unsignedJwt));
  return base64UrlEncode(signature);
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function base64UrlEncode(value: string | ArrayBuffer): string {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : new Uint8Array(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function foldBase64(value: string): string {
  return value.match(/.{1,76}/g)?.join("\r\n") ?? value;
}

function escapeMimeHeader(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function decodeMaybeBase64(value: string): string {
  const trimmed = value.trim();

  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  return atob(trimmed);
}

function sheetRange(sheetName: string, range: string): string {
  return `${encodeURIComponent(sheetName)}!${range}`;
}

function sheetA1Range(sheetName: string, range: string): string {
  return `'${sheetName.replaceAll("'", "''")}'!${range}`;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function isRemovedOverlappingDefaultSlot(slotId: string): boolean {
  const match = String(slotId ?? "").trim().match(/^slot-\d{4}-\d{2}-\d{2}-(\d{4})$/);
  return Boolean(match && REMOVED_OVERLAPPING_DEFAULT_SLOT_CODES.has(match[1]));
}

function getTaskSubmissionState(row: string[]): Record<string, string> {
  const taskSubmittedAt = String(row[18] ?? "").trim();
  const firstPreferenceTaskLink = String(row[19] ?? "").trim();
  const secondPreferenceTaskLink = String(row[20] ?? "").trim();
  const taskNotes = String(row[21] ?? "").trim();
  const rawTaskSubmissionStatus = String(row[22] ?? "").trim();
  const hasFirstTaskLink = isLikelyUrl(firstPreferenceTaskLink);
  const hasSecondTaskLink = isLikelyUrl(secondPreferenceTaskLink);
  const isComplete = hasFirstTaskLink && hasSecondTaskLink;
  const hasAnySubmissionData = Boolean(
    taskSubmittedAt ||
      firstPreferenceTaskLink ||
      secondPreferenceTaskLink ||
      taskNotes ||
      rawTaskSubmissionStatus
  );

  let taskSubmissionIssue = "";
  if (!isComplete && hasAnySubmissionData) {
    if (!hasFirstTaskLink && !hasSecondTaskLink) {
      taskSubmissionIssue = "Missing both task links";
    } else if (!hasFirstTaskLink) {
      taskSubmissionIssue = "Missing first preference task link";
    } else {
      taskSubmissionIssue = "Missing second preference task link";
    }
  }

  return {
    taskSubmittedAt,
    firstPreferenceTaskLink,
    secondPreferenceTaskLink,
    taskNotes,
    taskSubmissionStatus: isComplete ? "Submitted" : "",
    taskSubmissionIssue
  };
}

function isLikelyUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeRole(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("/", " ")
    .replace(/\s+/g, " ");
}

function buildSlotLabel(date: string, startTime: string): string {
  if (!date || !startTime) return startTime || date || "";
  return `${date} at ${startTime}`;
}

function parseDateOnly(value: string): Date | null {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function addDays(value: Date, daysToAdd: number): Date {
  return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + daysToAdd));
}

function formatDateOnly(value: Date): string {
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function buildLocalDateTime(date: string, time: string): string {
  const parsedTime = parseTime(time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !parsedTime) {
    return "";
  }

  return `${date}T${parsedTime}:00`;
}

function normalizeTime24(value: unknown): string {
  const raw = String(value ?? "").trim();
  const twentyFourHourMatch = raw.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hour = Number(twentyFourHourMatch[1]);
    const minute = Number(twentyFourHourMatch[2]);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }
  }

  return parseTime(raw);
}

function isPastLocalDateTime(value: string, timeZone: string): boolean {
  if (!value) return false;
  return value <= getCurrentLocalDateTime(timeZone);
}

function isSameDaySlotCutoffReached(date: string, timeZone: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const currentLocalDateTime = getCurrentLocalDateTime(timeZone);
  const currentDate = currentLocalDateTime.slice(0, 10);
  if (date !== currentDate) return false;

  return currentLocalDateTime >= `${date}T${String(SAME_DAY_SLOT_CUTOFF_HOUR).padStart(2, "0")}:00:00`;
}

function parseTime(value: string): string {
  const normalizedValue = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  const match = normalizedValue.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/);

  if (!match) {
    return "";
  }

  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const meridiem = match[3] ?? "PM";

  if (minute < 0 || minute > 59 || hour < 1 || hour > 12) {
    return "";
  }

  if (meridiem === "PM" && hour !== 12) {
    hour += 12;
  }

  if (meridiem === "AM" && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function addMinutesToTime(value: string, minutesToAdd: number): string {
  const parsedTime = normalizeTime24(value);
  if (!parsedTime) return "";

  const [hours, minutes] = parsedTime.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hours, minutes + minutesToAdd));
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  const displayHour = hour % 12 || 12;
  const meridiem = hour >= 12 ? "PM" : "AM";

  return `${displayHour}:${String(minute).padStart(2, "0")} ${meridiem}`;
}

function formatLocalDateTimeLabel(value: string): string {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return "";

  const [, year, month, day, hour, minute] = match;
  const numericHour = Number(hour);
  const displayHour = numericHour % 12 || 12;
  const meridiem = numericHour >= 12 ? "PM" : "AM";

  return `${year}-${month}-${day} at ${displayHour}:${minute} ${meridiem}`;
}

function subtractMinutesFromLocalDateTime(value: string, minutesToSubtract: number): string {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return "";

  const [, year, month, day, hour, minute, second] = match.map(String);
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute) - minutesToSubtract,
      Number(second)
    )
  );

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-") + `T${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}`;
}

function getCurrentLocalDateTime(timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());
  const byType = new Map(parts.map((part) => [part.type, part.value]));

  return `${byType.get("year")}-${byType.get("month")}-${byType.get("day")}T${byType.get("hour")}:${byType.get("minute")}:${byType.get("second")}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function columnLetter(index: number): string {
  let value = index;
  let result = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
