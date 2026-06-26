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
const CALENDAR_ID = Deno.env.get("CALENDAR_ID") ?? GMAIL_SENDER_EMAIL;
const CALENDAR_TIME_ZONE = Deno.env.get("CALENDAR_TIME_ZONE") ?? "Africa/Cairo";
const ADMIN_RESET_SECRET = Deno.env.get("ADMIN_RESET_SECRET") ?? "";

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
  { code: "1500", startTime: "3:00 PM", endTime: "3:30 PM" },
  { code: "1530", startTime: "3:30 PM", endTime: "4:00 PM" },
  { code: "1900", startTime: "7:00 PM", endTime: "7:30 PM" },
  { code: "1930", startTime: "7:30 PM", endTime: "8:00 PM" },
  { code: "2000", startTime: "8:00 PM", endTime: "8:30 PM" },
  { code: "2030", startTime: "8:30 PM", endTime: "9:00 PM" }
];

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
  hr: taskDocument("HR", "1rYAnr0lhVyHW0GIwjHMOaMWxiGxZI3AOp6t5qY8imus", "Final Task - HR - Resala Board Recruitment"),
  operations: taskDocument("Operations", "1tvyaQDhCHnb9E4HiiVmB6ZNXpTVpunsti9ECwxw8f30", "Final Task - Operations - Resala Board Recruitment"),
  visits: taskDocument("Visits", "1ELC6nP7FQN33enuHbUamCvNYTlP8i3DNnA2NCuhPDF0", "Final Task - Visits - Resala Board Recruitment"),
  "children day director": taskDocument("Children Day Director", "1-6nfB5GaSSgE7gL046oIOA9R7caiCmuf04hdHtnHYjM", "Resala Task Children Day"),
  "mothers day director": taskDocument("Mothers Day Director", "1we0KfCWjMg4bX2gQaEmAa8fdAp26_iVvpSt0Xe4mz_c", "Resala Task Mothers Day"),
  "initiatives director": taskDocument("Initiatives Director", "1tW2YFctINtnKQalTywtI8ZHWyI5AyuvTRf5OIHgcOgA", "Final Task - Initiatives Director - Resala Board Recruitment")
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

async function parsePayload(request: Request): Promise<ApplicationPayload | TaskSubmissionPayload | AdminResetPayload> {
  const text = await request.text();
  if (!text.trim()) {
    throw new Error("Missing submission body.");
  }

  return JSON.parse(text) as ApplicationPayload | TaskSubmissionPayload | AdminResetPayload;
}

function isTaskSubmissionPayload(payload: ApplicationPayload | TaskSubmissionPayload | AdminResetPayload): payload is TaskSubmissionPayload {
  return (payload as TaskSubmissionPayload).mode === "task-submission";
}

function isAdminResetPayload(payload: ApplicationPayload | TaskSubmissionPayload | AdminResetPayload): payload is AdminResetPayload {
  return (payload as AdminResetPayload).mode === "admin-reset-test";
}

function authorizeAdminReset(request: Request): void {
  if (!ADMIN_RESET_SECRET || request.headers.get("x-admin-reset-secret") !== ADMIN_RESET_SECRET) {
    throw new Error("Unauthorized admin reset request.");
  }
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.aucEmail)) {
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

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.aucEmail)) {
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
  const template = buildConfirmationEmailTemplate(payload, reservation, tasks);
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
  tasks: ApplicantTaskDocument[]
): ConfirmationEmailTemplate {
  const slot = payload.interviewSlotLabel ?? payload.interviewSlot;
  const taskDeadline = formatLocalDateTimeLabel(subtractMinutesFromLocalDateTime(reservation.slot.startDateTime, 30));
  const submissionLine = getTaskSubmissionLine();
  const subject = "Resala AUC: your application";
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
      tasks
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
  tasks
}: {
  fullName: string;
  roleAppliedFor: string;
  secondPreference: string;
  slot: string;
  taskDeadline: string;
  meetLink: string;
  tasks: ApplicantTaskDocument[];
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

function getRolePrepLines(roleName: string): string[] {
  const role = normalizeRole(roleName);

  switch (role) {
    case "treasurer":
      return [
        "- A simple way you would keep track of bills, reimbursements, and communication with the team."
      ];
    case "tech director":
      return [
        "- One small system idea that could make a club process easier, and how you would implement it."
      ];
    case "branding media":
      return [
        "- A short plan for reaching 5k followers through consistent content."
      ];
    case "pr fundraising":
      return [
        "- A short plan for reaching sponsors for Ramadan packs."
      ];
    case "hr":
      return [
        "- A simple plan for keeping people engaged through events, retreats, or check-ins."
      ];
    case "operations":
      return [
        "- A simple plan for managing logistics, setup, and tracking during an event."
      ];
    case "visits":
      return [
        "- A proposal for a one-day program that can be implemented in different orphanages or Dar Mosneen."
      ];
    case "children day director":
      return [
        "- A proposal for the outcome underprivileged children need based on what you know about them."
      ];
    case "mothers day director":
      return [
        "- A plan for keeping mothers aware of what children learn and helping them believe children can change."
      ];
    case "initiatives director":
      return [
        "- An initiative that supports visually impaired people across campus and makes daily life easier."
      ];
    default:
      return [
        "- One practical idea for how you would help the team move the work forward."
      ];
  }
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
  const reservationRows = (await reservationResponse.json()).values ?? [];
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
  const applicationRows = (await applicationResponse.json()).values ?? [];
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
  const slotRows = (await slotResponse.json()).values ?? [];
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
        slot.endTime,
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
  const slotRows = (await slotResponse.json()).values ?? [];

  const reservationResponse = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:L")}`);
  const reservationRows = (await reservationResponse.json()).values ?? [];
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
      const endTime = String(row[3] ?? "").trim() || addMinutesToTime(startTime, 30);
      const label = String(row[4] ?? "").trim() || buildSlotLabel(date, startTime);
      const capacity = Number(row[5] ?? 1) || 1;
      const active = String(row[6] ?? "TRUE").toLowerCase() !== "false";
      const calendarEventId = String(row[7] ?? "").trim();
      const meetLink = String(row[8] ?? "").trim();
      const reservedCount = reservedCounts.get(normalize(id)) ?? 0;
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
        subtractMinutesFromLocalDateTime(selected.startDateTime, 30),
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
            { method: "email", minutes: 30 },
            { method: "popup", minutes: 30 }
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

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
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

function isPastLocalDateTime(value: string, timeZone: string): boolean {
  if (!value) return false;
  return value <= getCurrentLocalDateTime(timeZone);
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
  const parsedTime = parseTime(value);
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
