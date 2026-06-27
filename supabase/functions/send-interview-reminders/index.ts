const SHEET_ID = Deno.env.get("SHEET_ID") ?? "";
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
const CALENDAR_TIME_ZONE = Deno.env.get("CALENDAR_TIME_ZONE") ?? "Africa/Cairo";
const REMINDER_STALE_MINUTES = Number(Deno.env.get("REMINDER_STALE_MINUTES") ?? 90);
const REMINDER_JOB_SECRET = Deno.env.get("REMINDER_JOB_SECRET") ?? "";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reminder-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

type SlotRow = {
  id: string;
  label: string;
  startDateTime: string;
};

type ReservationRow = {
  rowIndex: number;
  timestamp: string;
  slotId: string;
  slotLabel: string;
  fullName: string;
  aucEmail: string;
  studentId: string;
  calendarEventId: string;
  meetLink: string;
  interviewStatus: string;
  reminderSendAt: string;
  reminderSentAt: string;
  reminderStatus: string;
  roleAppliedFor: string;
  secondPreference: string;
};

type TaskDocument = {
  roleName: string;
  title: string;
  documentUrl: string;
  pdfUrl: string;
};

type ApplicantTaskDocument = TaskDocument & {
  preferenceLabel: string;
};

type PreviewEmailRequest = {
  mode?: string;
  to?: string;
};

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
  "mothers day director": taskDocument("Mothers Day Director", "1we0KfCWjMg4bX2gQaEmAa8fdAp26_iVvpSt0Xe4mz_c", "Resala Task Mothers Day"),
  "initiatives director": taskDocument("Initiatives Director", "1tW2YFctINtnKQalTywtI8ZHWyI5AyuvTRf5OIHgcOgA", "Final Task - Initiatives Director - Resala Board Recruitment")
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed." }, 405);
  }

  try {
    if (!REMINDER_JOB_SECRET || request.headers.get("x-reminder-secret") !== REMINDER_JOB_SECRET) {
      return jsonResponse({ ok: false, error: "Unauthorized." }, 401);
    }

    if (!SHEET_ID) {
      throw new Error("SHEET_ID is not configured.");
    }

    if (!gmailConfigured()) {
      throw new Error("Gmail reminder sending is not configured.");
    }

    const previewRequest = await parsePreviewEmailRequest(request);
    if (previewRequest?.mode === "preview-emails") {
      const to = String(previewRequest.to ?? "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        throw new Error("Preview email address is invalid.");
      }

      await sendPreviewEmails(to);
      return jsonResponse({ ok: true, sentPreviewEmails: 2, to });
    }

    const token = await getGoogleAccessToken();
    await ensureSheetHeaders(token, RESERVATION_SHEET_NAME, RESERVATION_HEADERS);

    const slots = await getSlotMap(token);
    const reservations = await getReservations(token);
    const now = getCurrentLocalDateTime(CALENDAR_TIME_ZONE);
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const reservation of reservations) {
      if (!shouldProcessReservation(reservation)) {
        continue;
      }

      const reminderSendAt =
        reservation.reminderSendAt || getReminderSendAtFromSlot(slots.get(normalize(reservation.slotId)));

      if (!reminderSendAt) {
        continue;
      }

      if (now < reminderSendAt) {
        continue;
      }

      if (now > addMinutesToLocalDateTime(reminderSendAt, REMINDER_STALE_MINUTES)) {
        await updateReminderState(token, reservation.rowIndex, reminderSendAt, "", "Skipped");
        skipped += 1;
        continue;
      }

      try {
        await sendReminderEmail({ ...reservation, reminderSendAt });
        await updateReminderState(token, reservation.rowIndex, reminderSendAt, now, "Sent");
        sent += 1;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Reminder send failed.";
        await updateReminderState(token, reservation.rowIndex, reminderSendAt, "", `Error: ${message.slice(0, 120)}`);
      }
    }

    return jsonResponse({ ok: true, checked: reservations.length, sent, skipped, failed, now });
  } catch (error) {
    return jsonResponse(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Reminder job failed."
      },
      400
    );
  }
});

async function parsePreviewEmailRequest(request: Request): Promise<PreviewEmailRequest | null> {
  const text = await request.text();
  if (!text.trim()) return null;

  return JSON.parse(text) as PreviewEmailRequest;
}

function shouldProcessReservation(reservation: ReservationRow): boolean {
  if (!reservation.aucEmail || !reservation.fullName) return false;
  if (normalize(reservation.interviewStatus) === "done") return false;
  if (normalize(reservation.reminderStatus) === "sent") return false;
  return true;
}

function getReminderSendAtFromSlot(slot?: SlotRow): string {
  if (!slot?.startDateTime) return "";
  return addMinutesToLocalDateTime(slot.startDateTime, -30);
}

async function getSlotMap(token: string): Promise<Map<string, SlotRow>> {
  const response = await sheetsFetch(token, "GET", `${sheetRange(SLOT_SHEET_NAME, "A2:I")}`);
  const rows = (await response.json()).values ?? [];
  const slots = new Map<string, SlotRow>();

  for (const row of rows) {
    const id = String(row[0] ?? "").trim();
    const date = String(row[1] ?? "").trim();
    const startTime = String(row[2] ?? "").trim();
    const label = String(row[4] ?? "").trim() || buildSlotLabel(date, startTime);

    if (!id) continue;

    slots.set(normalize(id), {
      id,
      label,
      startDateTime: buildLocalDateTime(date, startTime)
    });
  }

  return slots;
}

async function getReservations(token: string): Promise<ReservationRow[]> {
  const response = await sheetsFetch(token, "GET", `${sheetRange(RESERVATION_SHEET_NAME, "A2:N")}`);
  const rows = (await response.json()).values ?? [];

  return rows.map((row: string[], index: number) => ({
    rowIndex: index + 2,
    timestamp: String(row[0] ?? "").trim(),
    slotId: String(row[1] ?? "").trim(),
    slotLabel: String(row[2] ?? "").trim(),
    fullName: String(row[3] ?? "").trim(),
    aucEmail: String(row[4] ?? "").trim(),
    studentId: String(row[5] ?? "").trim(),
    calendarEventId: String(row[6] ?? "").trim(),
    meetLink: String(row[7] ?? "").trim(),
    interviewStatus: String(row[8] ?? "").trim(),
    reminderSendAt: String(row[9] ?? "").trim(),
    reminderSentAt: String(row[10] ?? "").trim(),
    reminderStatus: String(row[11] ?? "").trim(),
    roleAppliedFor: String(row[12] ?? "").trim(),
    secondPreference: String(row[13] ?? "").trim()
  }));
}

async function updateReminderState(
  token: string,
  rowIndex: number,
  reminderSendAt: string,
  reminderSentAt: string,
  reminderStatus: string
): Promise<void> {
  await sheetsFetch(token, "PUT", `${sheetRange(RESERVATION_SHEET_NAME, `J${rowIndex}:L${rowIndex}`)}?valueInputOption=RAW`, {
    values: [[reminderSendAt, reminderSentAt, reminderStatus]]
  });
}

async function sendReminderEmail(reservation: ReservationRow): Promise<void> {
  const slot = reservation.slotLabel || reservation.reminderSendAt;
  const taskDeadline = formatLocalDateTimeLabel(reservation.reminderSendAt);
  const template = buildReminderEmailTemplate(
    reservation.fullName,
    slot,
    reservation.meetLink,
    reservation.roleAppliedFor,
    reservation.secondPreference,
    taskDeadline
  );
  await sendEmail(reservation.aucEmail, template.subject, template.body, template.html);
}

async function sendPreviewEmails(to: string): Promise<void> {
  const confirmation = buildPreviewConfirmationEmailTemplate();
  const reminder = buildReminderEmailTemplate(
    "Youssef",
    "2026-06-22 at 7:30 PM",
    "https://meet.google.com/resala-preview",
    "Tech Director",
    "HR",
    "2026-06-22 at 7:00 PM"
  );

  await sendEmail(to, confirmation.subject, confirmation.body, confirmation.html);
  await sendEmail(to, reminder.subject, reminder.body, reminder.html);
}

async function sendEmail(to: string, subject: string, text: string, html: string): Promise<void> {
  const accessToken = await getGmailAccessToken();
  const rawMessage = buildRawEmailMessage({
    from: `${GMAIL_SENDER_NAME} <${GMAIL_SENDER_EMAIL}>`,
    to,
    subject,
    text,
    html
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

function buildPreviewConfirmationEmailTemplate(): { subject: string; body: string; html: string } {
  const fullName = "Youssef";
  const roleAppliedFor = "Tech Director";
  const secondPreference = "HR";
  const slot = "2026-06-22 at 7:30 PM";
  const meetLink = "https://meet.google.com/resala-preview";
  const tasks = getApplicantTaskDocuments(roleAppliedFor, secondPreference);
  const taskDeadline = "2026-06-22 at 7:00 PM";
  const submissionLine = getTaskSubmissionLine();
  const subject = "Resala AUC Application Confirmation";
  const body = [
    `Hi ${fullName},`,
    "",
    `Thanks for applying to Resala AUC. Your first preference is ${roleAppliedFor}, and your second preference is ${secondPreference}.`,
    "",
    `Your interview slot is: ${slot}.`,
    `Google Meet link: ${meetLink}`,
    "You will also receive a Google Calendar reminder 30 minutes before the interview.",
    "",
    "Please complete two pre-interview tasks, one for each preference:",
    "",
    ...formatTaskDocumentTextLines(tasks),
    "",
    `Task deadline: ${taskDeadline}.`,
    submissionLine,
    "If anything feels unclear, just reply to this email and we will help.",
    "",
    "Best,",
    "Resala AUC"
  ].join("\n");

  const html = buildCenteredEmailHtml({
    preheader: "Your Resala AUC interview slot is reserved.",
    heroTitle: "Your Interview Slot Is Reserved",
    heroSubtitle: "Thanks for applying. Here is everything you need before the interview.",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(fullName)},</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Thanks for applying to <strong>Resala AUC</strong>. Your first preference is <strong>${escapeHtml(roleAppliedFor)}</strong>, and your second preference is <strong>${escapeHtml(secondPreference)}</strong>. We received your application and reserved your interview slot.</p>
      ${infoCard("Your interview slot", escapeHtml(slot))}
      ${linkCard("Google Meet", "Join the interview meeting", meetLink, "You will also receive a Google Calendar reminder 30 minutes before the interview.")}
      ${buildTaskDocumentsHtml(tasks)}
      ${darkCallout("Task deadline", `Submit both tasks by ${escapeHtml(taskDeadline)}.${buildSubmissionActionHtml()}`)}
      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4b5563;">If anything feels unclear, just reply to this email and we will help.</p>
      <p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:#172033;font-weight:bold;">Be the first step toward someone's better life.</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Best,<br>Resala AUC</p>
    `
  });

  return { subject, body, html };
}

function buildReminderEmailTemplate(
  fullName: string,
  slot: string,
  meetLink: string,
  roleAppliedFor: string,
  secondPreference: string,
  taskDeadline: string
): { subject: string; body: string; html: string } {
  const tasks = getApplicantTaskDocuments(roleAppliedFor, secondPreference);
  const submissionLine = getTaskSubmissionLine();
  const subject = "Resala AUC: your interview starts in 30 minutes";
  const body = [
    `Hi ${fullName},`,
    "",
    "This is a reminder that your Resala AUC interview starts in 30 minutes.",
    "",
    `Interview slot: ${slot}`,
    `Google Meet link: ${meetLink}`,
    "",
    "If you have not submitted your two pre-interview tasks yet, submit them now:",
    "",
    ...formatTaskDocumentTextLines(tasks),
    "",
    `Task deadline: ${taskDeadline || "30 minutes before your interview"}.`,
    submissionLine,
    "",
    "Please join from a quiet place if possible.",
    "If anything comes up, reply to this email.",
    "",
    "Best,",
    "Resala AUC"
  ].join("\n");

  const html = buildCenteredEmailHtml({
    preheader: "Your Resala AUC interview starts in 30 minutes.",
    heroTitle: "Your Interview Starts Soon",
    heroSubtitle: "Join from a quiet place and submit your tasks if you have not yet.",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hi ${escapeHtml(fullName)},</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Your <strong>Resala AUC</strong> interview starts in <strong>30 minutes</strong>.</p>
      ${infoCard("Interview slot", escapeHtml(slot))}
      ${linkCard("Google Meet", "Join the interview meeting", meetLink, "Please join from a quiet place if possible.")}
      ${buildTaskDocumentsHtml(tasks)}
      ${darkCallout("Task deadline", `If you have not submitted both tasks yet, submit them now. Deadline: ${escapeHtml(taskDeadline || "30 minutes before your interview")}.${buildSubmissionActionHtml()}`)}
      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#4b5563;">If anything comes up, reply to this email.</p>
      <p style="margin:0 0 4px;font-size:16px;line-height:1.6;color:#172033;font-weight:bold;">Be the first step toward someone's better life.</p>
      <p style="margin:0 0 18px;font-size:16px;line-height:1.6;">Best,<br>Resala AUC</p>
    `
  });

  return { subject, body, html };
}

function buildCenteredEmailHtml({
  preheader,
  heroTitle,
  heroSubtitle,
  bodyHtml
}: {
  preheader: string;
  heroTitle: string;
  heroSubtitle: string;
  bodyHtml: string;
}): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f3ea;color:#172033;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f3ea;margin:0;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;background:#ffffff;border:1px solid #eadfca;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#0d2b45;padding:24px 28px 30px;text-align:center;color:#ffffff;">
                <img src="${escapeHtml(EMAIL_LOGO_URL)}" alt="Resala AUC" width="128" style="display:block;width:128px;max-width:128px;height:auto;border:0;outline:none;text-decoration:none;margin:0 auto;">
                <div style="font-size:25px;line-height:1.15;color:#ffffff;font-weight:bold;margin-top:14px;">Beyond Ana Maly</div>
                <div style="font-size:14px;line-height:1.5;color:#f5c46b;margin-top:6px;font-weight:bold;letter-spacing:0.5px;">Build the First Step</div>
                <div style="font-size:28px;line-height:1.15;color:#ffffff;font-weight:bold;margin-top:22px;">${escapeHtml(heroTitle)}</div>
                <div style="font-size:15px;line-height:1.5;color:#dbe7ef;margin-top:10px;">${escapeHtml(heroSubtitle)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 8px;">
                ${bodyHtml}
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

function infoCard(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
    <tr>
      <td style="background:#fff7e8;border:1px solid #f0d7a5;border-left:5px solid #f5a623;border-radius:14px;padding:18px;">
        <div style="font-size:13px;color:#8a4706;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:7px;">${label}</div>
        <div style="font-size:22px;line-height:1.3;font-weight:bold;color:#0d2b45;">${value}</div>
      </td>
    </tr>
  </table>`;
}

function linkCard(label: string, linkText: string, href: string, note: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 0 20px;">
    <tr>
      <td style="background:#f8fafc;border:1px solid #e6edf2;border-radius:14px;padding:16px;">
        <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;font-weight:bold;margin-bottom:8px;">${label}</div>
        <a href="${escapeHtml(href)}" style="color:#0d2b45;font-size:16px;font-weight:bold;text-decoration:underline;">${linkText}</a>
        <div style="font-size:14px;line-height:1.55;color:#4b5563;margin-top:8px;">${note}</div>
      </td>
    </tr>
  </table>`;
}

function darkCallout(label: string, value: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 22px;">
    <tr>
      <td style="background:#0d2b45;border-radius:14px;padding:16px 18px;color:#ffffff;">
        <div style="font-size:14px;color:#f5c46b;font-weight:bold;letter-spacing:.8px;text-transform:uppercase;">${label}</div>
        <div style="font-size:15px;line-height:1.7;color:#ffffff;margin-top:8px;">${value}</div>
      </td>
    </tr>
  </table>`;
}

function taskDocument(roleName: string, documentId: string, title: string): TaskDocument {
  return {
    roleName,
    title,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit?usp=sharing`,
    pdfUrl: `https://docs.google.com/document/d/${documentId}/export?format=pdf`
  };
}

function getApplicantTaskDocuments(firstPreference: string, secondPreference: string): ApplicantTaskDocument[] {
  const preferences = [
    { preferenceLabel: "First preference", roleName: firstPreference },
    { preferenceLabel: "Second preference", roleName: secondPreference }
  ].filter((preference) => preference.roleName);

  return preferences.map(({ preferenceLabel, roleName }) => {
    const task = TASK_DOCUMENTS[normalizeRole(roleName)] ?? {
      roleName,
      title: `${roleName} pre-interview task`,
      documentUrl: "",
      pdfUrl: ""
    };

    return {
      ...task,
      roleName: task.roleName || roleName,
      preferenceLabel
    };
  });
}

function formatTaskDocumentTextLines(tasks: ApplicantTaskDocument[]): string[] {
  if (!tasks.length) {
    return ["- Your task links are in your confirmation email."];
  }

  return tasks.flatMap((task) => [
    `- ${task.preferenceLabel}: ${task.roleName}`,
    `  Google Doc: ${task.documentUrl || "Task document link is in your confirmation email."}`
  ]);
}

function buildTaskDocumentsHtml(tasks: ApplicantTaskDocument[]): string {
  if (!tasks.length) {
    return `<p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#4b5563;">Your task links are in your confirmation email.</p>`;
  }

  const rows = tasks
    .map((task) => {
      const docLink = task.documentUrl
        ? `<a href="${escapeHtml(task.documentUrl)}" style="display:inline-block;background:#0d2b45;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:10px;padding:10px 14px;">Open Google Doc</a>`
        : `<span style="color:#64748b;font-size:15px;">Google Doc link is in your confirmation email.</span>`;

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

function gmailConfigured(): boolean {
  return Boolean(GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && GMAIL_SENDER_EMAIL);
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
  html
}: {
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}): string {
  const boundary = `resala-${crypto.randomUUID()}`;
  const message = [
    `From: ${from}`,
    `To: ${to}`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=utf-8",
    "",
    text,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
    "",
    `--${boundary}--`
  ].join("\r\n");

  return base64UrlEncode(message);
}

async function ensureSheetHeaders(token: string, sheetName: string, headers: string[]): Promise<void> {
  const width = headers.length;
  const response = await sheetsFetch(token, "GET", `${sheetRange(sheetName, `A1:${columnLetter(width)}1`)}`);
  const currentValues = (await response.json()).values?.[0] ?? [];

  if (currentValues.length === 0 || headers.some((header, index) => currentValues[index] !== header)) {
    await sheetsFetch(token, "PUT", `${sheetRange(sheetName, `A1:${columnLetter(width)}1`)}?valueInputOption=RAW`, {
      values: [headers]
    });
  }
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
      scope: "https://www.googleapis.com/auth/spreadsheets",
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

function columnLetter(columnNumber: number): string {
  let value = columnNumber;
  let output = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    output = String.fromCharCode(65 + remainder) + output;
    value = Math.floor((value - 1) / 26);
  }

  return output;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
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

function buildLocalDateTime(date: string, time: string): string {
  const parsedTime = parseTime(time);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !parsedTime) {
    return "";
  }

  return `${date}T${parsedTime}:00`;
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

function addMinutesToLocalDateTime(value: string, minutesToAdd: number): string {
  const match = String(value ?? "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return "";

  const [, year, month, day, hour, minute, second] = match.map(String);
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute) + minutesToAdd,
      Number(second)
    )
  );

  const datePart = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-");
  const timePart = [
    String(date.getUTCHours()).padStart(2, "0"),
    String(date.getUTCMinutes()).padStart(2, "0"),
    String(date.getUTCSeconds()).padStart(2, "0")
  ].join(":");

  return `${datePart}T${timePart}`;
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}
