function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses') || SpreadsheetApp.getActiveSpreadsheet().insertSheet('Responses');
  const data = JSON.parse(e.postData.contents);

  const headers = [
    'submittedAt','fullName','aucId','email','phone','major','year','position',
    'whyJoin','roleFit','experience','hours','interviewTime','commitment'
  ];

  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  sheet.appendRow(headers.map(h => data[h] || ''));

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}
