export type RoleId =
  | "treasurer"
  | "tech-director"
  | "operations"
  | "branding-media"
  | "hr"
  | "pr"
  | "fundraising"
  | "visits"
  | "children-day-director"
  | "mothers-day-director"
  | "initiatives-director";

export type RoleOption = {
  id: RoleId;
  name: string;
  stepTitle: string;
  description: string;
};

export type ApplicationPayload = {
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
  hopeToLearn: string;
  previousResalaExperience: string;
  interviewSlot: string;
  interviewSlotId: string;
  interviewSlotLabel: string;
  createdAt: string;
};

export type TaskSubmissionPayload = {
  mode: "task-submission";
  aucEmail: string;
  studentId: string;
  firstPreferenceTaskLink: string;
  secondPreferenceTaskLink: string;
  taskNotes: string;
  submittedAt: string;
};

export type ConfirmationEmailTemplate = {
  subject: string;
  body: string;
};

export type InterviewSlotOption = {
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
};

type ApplicationEndpointMode = "cors" | "no-cors";

type RuntimeSpreadsheetConfig = typeof globalThis & {
  RESALA_APPLICATIONS_ENDPOINT?: string;
  RESALA_APPLICATIONS_ENDPOINT_MODE?: ApplicationEndpointMode;
};

const runtimeConfig = globalThis as RuntimeSpreadsheetConfig;

export const APPLICATION_ENDPOINT = runtimeConfig.RESALA_APPLICATIONS_ENDPOINT?.trim() ?? "";
export const APPLICATION_ENDPOINT_MODE: ApplicationEndpointMode =
  runtimeConfig.RESALA_APPLICATIONS_ENDPOINT_MODE === "no-cors" ? "no-cors" : "cors";

export const roles: RoleOption[] = [
  {
    id: "treasurer",
    name: "Treasurer",
    stepTitle: "The Step of Trust",
    description: "Keeps the team's finances organized, tracks spending, follows up on bills and reimbursements, and makes sure money-related communication stays clear."
  },
  {
    id: "tech-director",
    name: "Tech Director",
    stepTitle: "The Step of System",
    description: "Builds and improves simple digital systems that make applications, tracking, communication, and team operations easier to manage."
  },
  {
    id: "operations",
    name: "Operations",
    stepTitle: "The Step of Structure",
    description: "Turns plans into organized execution by managing logistics, setup, supplies, timelines, and on-ground coordination during events."
  },
  {
    id: "branding-media",
    name: "Branding / Media",
    stepTitle: "The Step of Voice",
    description: "Shapes how Resala appears online by planning content, documenting work, keeping the visual identity consistent, and growing community awareness."
  },
  {
    id: "hr",
    name: "HR",
    stepTitle: "The Step of People",
    description: "Supports the member experience through onboarding, engagement, internal communication, check-ins, and activities that keep the team connected."
  },
  {
    id: "pr",
    name: "PR",
    stepTitle: "The Step of Opportunity",
    description: "Builds relationships with partners, campus communities, and external contacts so Resala can communicate professionally and open doors for collaboration."
  },
  {
    id: "fundraising",
    name: "Fundraising",
    stepTitle: "The Step of Support",
    description: "Plans sponsor outreach and donation paths so Resala can fund and expand its campaigns responsibly."
  },
  {
    id: "visits",
    name: "Visits",
    stepTitle: "The Step of Presence",
    description: "Plans meaningful visit programs and coordinates volunteers so Resala can show up consistently for orphanages, Dar Mosneen, and community partners."
  },
  {
    id: "children-day-director",
    name: "Children Day Director",
    stepTitle: "The Step of Learning",
    description: "Designs children's day experiences that are safe, engaging, and useful, with activities that support learning, confidence, and belonging."
  },
  {
    id: "mothers-day-director",
    name: "Mothers Day Director",
    stepTitle: "The Step of Care",
    description: "Creates programs that support mothers, keep them aware of what children are learning, and connect family care with children's growth."
  },
  {
    id: "initiatives-director",
    name: "Initiatives Director",
    stepTitle: "The Step of Access",
    description: "Develops focused initiatives that respond to clear needs on campus or in the community, especially accessibility and inclusion needs."
  }
];

export const yearLevelOptions = ["Freshman", "Sophomore", "Junior", "Senior", "Graduate", "Other"] as const;

export async function fetchInterviewSlots(): Promise<InterviewSlotOption[]> {
  if (!APPLICATION_ENDPOINT) {
    throw new Error("Application database is not configured yet. Add the spreadsheet endpoint in spreadsheet-config.js.");
  }

  const response = await fetch(APPLICATION_ENDPOINT, { method: "GET", mode: APPLICATION_ENDPOINT_MODE });
  const body = await response.json();

  if (!response.ok || body?.ok === false) {
    throw new Error(body?.error || "Could not load interview slots.");
  }

  return Array.isArray(body?.slots) ? (body.slots as InterviewSlotOption[]) : [];
}

export function createConfirmationEmailTemplate(payload: ApplicationPayload): ConfirmationEmailTemplate {
  const role = payload.roleAppliedFor.toLowerCase();
  const roleLine =
    role.includes("treasurer")
      ? "A simple way you would keep track of bills, reimbursements, and team communication."
      : role.includes("tech")
        ? "One small system idea that could make a club process easier, and how you would implement it."
        : role.includes("branding")
          ? "A short plan for reaching 5k followers through consistent content."
          : role === "pr"
            ? "A short outreach plan for a partner or collaborator Resala should approach."
            : role.includes("fundraising")
              ? "A short plan for reaching sponsors for Ramadan packs."
              : role.includes("hr")
                ? "A simple plan for keeping people engaged through events, retreats, or check-ins."
                : role.includes("operations")
                  ? "A simple plan for managing logistics, setup, and tracking during an event."
                  : role.includes("visit")
                    ? "A proposal for a one-day program that can be implemented in different orphanages or Dar Mosneen."
                  : role.includes("children")
                    ? "A proposal for the outcome underprivileged children need based on what you know about them."
                    : role.includes("mother")
                      ? "A plan for keeping mothers aware of what children learn and helping them believe children can change."
                      : role.includes("initiative")
                        ? "An initiative that supports visually impaired people across campus and makes daily life easier."
                        : "One practical idea for how you would help the team move the work forward.";

  return {
    subject: `Resala AUC: your ${payload.roleAppliedFor} application was received`,
    body: [
      `Hi ${payload.fullName},`,
      "",
      `Thanks for applying to Resala AUC. Your first preference is ${payload.roleAppliedFor}, and your second preference is ${payload.secondPreference}.`,
      "",
      `Your interview slot is: ${payload.interviewSlotLabel || payload.interviewSlot}.`,
      "",
      "Please prepare one simple idea for the role:",
      "",
      `- ${roleLine}`,
      "",
      "Keep it simple. We are not looking for a polished pitch.",
      "If anything feels unclear, just reply to this email and we will help.",
      "",
      "Best,",
      "Resala AUC"
    ].join("\n")
  };
}

export async function submitApplication(data: ApplicationPayload): Promise<{ ok: true }> {
  if (!APPLICATION_ENDPOINT) {
    throw new Error("Application database is not configured yet. Add the spreadsheet endpoint in spreadsheet-config.js.");
  }

  const response = await fetch(APPLICATION_ENDPOINT, {
    method: "POST",
    mode: APPLICATION_ENDPOINT_MODE,
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      ...data
    })
  });

  if (response.type === "opaque") {
    return { ok: true };
  }

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok || responseBody?.ok === false) {
    throw new Error(responseBody?.error || "Application database rejected the submission.");
  }

  return { ok: true };
}

export async function submitTasks(data: TaskSubmissionPayload): Promise<{ ok: true }> {
  if (!APPLICATION_ENDPOINT) {
    throw new Error("Application database is not configured yet. Add the spreadsheet endpoint in spreadsheet-config.js.");
  }

  const response = await fetch(APPLICATION_ENDPOINT, {
    method: "POST",
    mode: APPLICATION_ENDPOINT_MODE,
    headers: {
      "Content-Type": "text/plain;charset=utf-8"
    },
    body: JSON.stringify({
      ...data
    })
  });

  if (response.type === "opaque") {
    return { ok: true };
  }

  const responseText = await response.text();
  const responseBody = responseText ? JSON.parse(responseText) : null;

  if (!response.ok || responseBody?.ok === false) {
    throw new Error(responseBody?.error || "Application database rejected the task submission.");
  }

  return { ok: true };
}
