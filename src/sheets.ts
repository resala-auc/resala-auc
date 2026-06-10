import { google } from 'googleapis';

type Credentials = {
  client_email: string;
  private_key: string;
};

export class SheetsClient {
  private sheets: any;
  private authClient: any;

  constructor(credentials: Credentials) {
    this.authClient = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    this.sheets = google.sheets({ version: 'v4', auth: this.authClient });
  }

  async ensureHeaders(spreadsheetId: string, headers: string[]) {
    // Read A1:1
    const resp = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:1'
    }).catch(() => ({ data: { values: [] } }));

    const existing = (resp.data.values && resp.data.values[0]) || [];
    if (existing.length === 0) {
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'A1:1',
        valueInputOption: 'RAW',
        requestBody: { values: [headers] }
      });
    }
  }

  async findDuplicate(spreadsheetId: string, columnName: string, value: string) {
    const resp = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A1:Z1000'
    });
    const rows: string[][] = resp.data.values || [];
    if (rows.length === 0) return false;
    const headers = rows[0].map((h: string) => h.trim());
    const idx = headers.indexOf(columnName);
    if (idx === -1) return false;
    for (let i = 1; i < rows.length; i++) {
      if ((rows[i][idx] || '').toString().trim().toLowerCase() === value.trim().toLowerCase()) return true;
    }
    return false;
  }

  async appendRow(spreadsheetId: string, row: (string | number)[]) {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A1',
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [row] }
    });
  }
}
