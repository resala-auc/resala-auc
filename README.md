# Resala AUC Recruitment

This repo contains the Resala AUC recruitment landing page, application form, and a Supabase Edge Function that writes applications to Google Sheets.

## What is included

- `src/` — static site source for the landing page and application form
- `supabase/functions/submit/` — public form submission endpoint for the static GitHub Pages site
- `supabase/functions/send-interview-reminders/` — scheduled reminder email job for upcoming interviews
- `dist/` — generated static site output after `npm run build`

## Supabase setup

The static form posts to:

```js
window.RESALA_APPLICATIONS_ENDPOINT = "https://upnmxdgqdkvgzfwqaicb.supabase.co/functions/v1/submit";
```

Required Supabase secrets:

- `SHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_KEY`
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_SENDER_EMAIL`
- `GMAIL_SENDER_NAME` is optional
- `EMAIL_LOGO_URL` is optional and defaults to the public Supabase Storage Resala logo at `https://upnmxdgqdkvgzfwqaicb.supabase.co/storage/v1/object/public/resala-logo/Resala%20Logo%20-%20source.png`
- `TASK_SUBMISSION_URL` is optional but recommended. Set it to the deployed `/tasks/` page URL so confirmation and reminder emails send applicants to the task submission form. If unset, emails ask applicants to reply with their files or links.
- `CALENDAR_ID` is optional if it is the same as `GMAIL_SENDER_EMAIL`
- `CALENDAR_TIME_ZONE` is optional and defaults to `Africa/Cairo`

`GOOGLE_SERVICE_ACCOUNT_KEY` can be the full Google service account JSON or its base64-encoded JSON. The Google Sheet must be shared with that service account's `client_email`. To attach task PDFs when the Google Docs are not public, also share the task documents with the same service account.

For Gmail confirmation emails and applicant Calendar invites, the function uses OAuth refresh-token flow with the Gmail sender account. The refresh token must include both scopes:

```text
https://www.googleapis.com/auth/gmail.send
https://www.googleapis.com/auth/calendar.events
```

If the existing refresh token was generated with only Gmail access, regenerate it with both scopes and update `GMAIL_REFRESH_TOKEN`.

The function will also create and use two sheet tabs if they do not already exist:

- `Interview Slots`
- `Interview Reservations`

The `Interview Slots` tab seeds editable one-hour rows for `3:00 PM`, `3:30 PM`, `7:00 PM`, `7:30 PM`, `8:00 PM`, and `8:30 PM`. Only dated, active, non-full, future slots appear on the form.

Recruitment slots run from Monday, June 22, 2026 through Wednesday, July 15, 2026. The backend generates one row per date/time, with a unique `Slot ID` for every row:

```text
slot-2026-06-22-1500 | 2026-06-22 | 3:00 PM | 4:00 PM | 2026-06-22 at 3:00 PM | 1 | TRUE
slot-2026-06-22-1530 | 2026-06-22 | 3:30 PM | 4:30 PM | 2026-06-22 at 3:30 PM | 1 | TRUE
slot-2026-06-22-1900 | 2026-06-22 | 7:00 PM | 8:00 PM | 2026-06-22 at 7:00 PM | 1 | TRUE
slot-2026-06-22-1930 | 2026-06-22 | 7:30 PM | 8:30 PM | 2026-06-22 at 7:30 PM | 1 | TRUE
slot-2026-06-22-2000 | 2026-06-22 | 8:00 PM | 9:00 PM | 2026-06-22 at 8:00 PM | 1 | TRUE
slot-2026-06-22-2030 | 2026-06-22 | 8:30 PM | 9:30 PM | 2026-06-22 at 8:30 PM | 1 | TRUE
```

The generated sheet includes those six rows for every date through `2026-07-15`. Once a slot's start time passes in the `Africa/Cairo` timezone, the backend automatically hides it from the form.

Calendar setup:

- Enable Google Calendar API and Google Meet/conferencing for the Google project.
- Make sure the Gmail sender account can create events on the target calendar.
- Set `CALENDAR_ID` to that calendar ID if it is not the same as `GMAIL_SENDER_EMAIL`.

Reminder emails:

- Each reservation stores `Reminder Send At`, `Reminder Sent At`, and `Reminder Status` in `Interview Reservations`.
- New reservations also store `Role Applied For` and `Second Preference` in `Interview Reservations` so reminder emails can repeat both task links.
- Deploy `send-interview-reminders` with `--no-verify-jwt` and schedule it to run every few minutes from Supabase.
- The reminder function sends from the configured Gmail account when `Reminder Send At` is due, skips rows marked `Done`, and avoids stale reminders older than `REMINDER_STALE_MINUTES` minutes.
- The scheduler authenticates with `REMINDER_JOB_SECRET` in the `x-reminder-secret` header.

Task submissions:

- The static site builds a task submission page at `/tasks/`.
- Applicants submit with the same AUC email and Student ID used in the application.
- The submit function matches both values against the Applications sheet and updates the same row.
- Applications sheet task columns are `Task Submitted At`, `First Preference Task Link`, `Second Preference Task Link`, `Task Notes`, and `Task Submission Status`.

Schedule the reminder worker from the Supabase SQL editor:

```sql
create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;

select vault.create_secret('https://upnmxdgqdkvgzfwqaicb.supabase.co', 'project_url');
select vault.create_secret('YOUR_PRIVATE_REMINDER_JOB_SECRET', 'reminder_job_secret');

select cron.schedule(
  'send-interview-reminders-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/send-interview-reminders',
    headers := jsonb_build_object(
      'Content-type', 'application/json',
      'x-reminder-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'reminder_job_secret')
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

Deploy:

```bash
supabase secrets set --project-ref upnmxdgqdkvgzfwqaicb SHEET_ID='1AIoEVXGc6I_SZcvndvum4GadrbF_HIpyGHqL5BJW2C8'
supabase secrets set --project-ref upnmxdgqdkvgzfwqaicb GOOGLE_SERVICE_ACCOUNT_KEY='<service-account-json-or-base64>'
supabase secrets set --project-ref upnmxdgqdkvgzfwqaicb TASK_SUBMISSION_URL='https://YOUR_SITE_URL/tasks/'
supabase functions deploy submit --project-ref upnmxdgqdkvgzfwqaicb --no-verify-jwt --use-api
supabase functions deploy send-interview-reminders --project-ref upnmxdgqdkvgzfwqaicb --no-verify-jwt --use-api
```

## Notes

- The landing page links directly to `/apply/`.
- Role cards deep-link to `/apply/?role=<role-id>` and preselect that role.
- Submission status is stored as `Pending` in the sheet.
- Applications store the applicant's first role preference and second role preference.
- Duplicate checking uses AUC email or Student ID.
- Interview slots are live and reserved through the sheet-backed booking list.
- Past interview slots are automatically hidden based on their start time in the configured calendar timezone.
- Each reservation creates a Google Calendar event from the Gmail sender account, invites the applicant as an attendee, generates a Google Meet link, stores the link in `Interview Reservations`, and sends it in the confirmation email.
- Confirmation emails include two task documents, one for each role preference, with Google Doc/PDF links and PDF attachments when Drive export is available.
- A separate scheduled Supabase function sends a direct Gmail reminder 30 minutes before the interview, reminds applicants to submit both tasks if they have not submitted yet, and marks the reminder as `Sent`.
- The `/tasks/` page lets applicants submit task links and maps them back to their application row.
- `Interview Reservations` includes an `Interview Status` column seeded as `Not Done`; update it to `Done` after the interview.
- The admin dashboard can update each reservation's interview status and includes an `Extend booked to 1 hour` action for patching already-created Calendar events after deploying the one-hour duration change.
- The Edge Function is deployed with JWT verification disabled so GitHub Pages can post to it directly.

## Local testing

Build and serve locally:

```bash
npm run build
npm run dev
```
