RESALA AUC BRANDED FORM

Files:
- index.html: form page
- style.css: Resala-themed styling
- script.js: multi-step logic + Google Sheets submit
- google-apps-script.js: paste into Google Apps Script
- assets/resala-logo.svg: Resala logo

How to connect to Google Sheets:
1. Create a Google Sheet.
2. Rename the first sheet to: Responses
3. Go to Extensions > Apps Script.
4. Paste the code from google-apps-script.js.
5. Deploy > New deployment > Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Copy the Web App URL.
9. Open script.js and replace:
   PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE
   with your deployed URL.
10. Host the folder on Vercel, Netlify, GitHub Pages, or run locally by opening index.html.
