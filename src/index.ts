import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';
import { SheetsClient } from './sheets';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the static front-end
const staticPath = path.join(__dirname, '..', 'resala-form');
app.use(express.static(staticPath));

// Load credentials
function loadCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH) {
    const p = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
    return require(p);
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
  }
  throw new Error('Google service account key not found in env. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_PATH');
}

const SHEET_ID = process.env.SHEET_ID;
if (!SHEET_ID) {
  console.error('Missing SHEET_ID environment variable');
}

let sheetsClient: SheetsClient | null = null;
try {
  const creds = loadCredentials();
  sheetsClient = new SheetsClient({ client_email: creds.client_email, private_key: creds.private_key });
} catch (err) {
  console.error('Failed to initialize Sheets client:', err.message || err);
}

const REQUIRED = ['fullName','aucId','email','phone','major','year','position','whyJoin','roleFit','commitment','hours'];

function validatePayload(body: any) {
  const errors: string[] = [];
  for (const f of REQUIRED) if (!body[f] || (typeof body[f] === 'string' && body[f].trim() === '')) errors.push(`${f} is required`);

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Invalid email format');
  if (body.phone && !/^01\d{9}$/.test(body.phone)) errors.push('Invalid phone format. Use 01xxxxxxxxx');
  if (body.aucId && !/^9\d{6,9}$/.test(body.aucId)) errors.push('Invalid AUC ID. Should start with 9 and be 7-10 digits');

  if (body.fullName && body.fullName.length > 100) errors.push('Full Name too long');
  if (body.whyJoin && body.whyJoin.length > 2000) errors.push('Why Join text too long');
  if (body.experience && body.experience.length > 2000) errors.push('Experience text too long');

  return errors;
}

app.post('/api/submit', async (req, res) => {
  if (!sheetsClient) return res.status(500).json({ error: 'Sheets client not configured' });
  if (!SHEET_ID) return res.status(500).json({ error: 'SHEET_ID not configured' });

  const body = req.body || {};
  const errors = validatePayload(body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  try {
    const headers = [
      'Timestamp','Full Name','AUC ID','Email','Phone Number','Academic Year','Major','Selected Position','Why Join Resala','Previous Experience','Availability','Submission Status'
    ];
    await sheetsClient.ensureHeaders(SHEET_ID, headers);

    // Duplicate detection by AUC ID or Email
    const dupByAuc = await sheetsClient.findDuplicate(SHEET_ID, 'AUC ID', body.aucId || '');
    const dupByEmail = await sheetsClient.findDuplicate(SHEET_ID, 'Email', body.email || '');
    if (dupByAuc || dupByEmail) return res.status(409).json({ error: 'You have already submitted an application.' });

    const timestamp = new Date().toISOString();
    const availability = `Hours/week: ${body.hours || ''}; Interview: ${body.interviewTime || ''}`;
    const row = [
      timestamp,
      body.fullName || '',
      body.aucId || '',
      body.email || '',
      body.phone || '',
      body.year || '',
      body.major || '',
      body.position || '',
      body.whyJoin || '',
      body.experience || '',
      availability,
      'Pending'
    ];

    await sheetsClient.appendRow(SHEET_ID, row);
    return res.json({ status: 'success' });
  } catch (err: any) {
    console.error('Submission error:', err.message || err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
