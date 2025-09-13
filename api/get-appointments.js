// api/get-appointments.js
const { google } = require('googleapis');

// Replace with your Google Sheets ID and sheet name
const SPREADSHEET_ID = '1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA';
const SHEET_NAME = 'datatest';

// This is where you would get your credentials.
// For a simple test, you can use an API key. For production,
// consider OAuth 2.0 or a service account.
// Replace `YOUR_API_KEY` with your actual Google Sheets API key.
const API_KEY = 'YOUR_API_KEY';

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const sheets = google.sheets({ version: 'v4', auth: API_KEY });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: SHEET_NAME,
        });

        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return res.status(200).send(JSON.stringify([]));
        }

        const headers = rows[0];
        const appointments = rows.slice(1).map(row => {
            const appointment = {};
            headers.forEach((header, index) => {
                // The 'data' field is case-sensitive and must match the dashboard.js script
                // Here we assume the column header for date is 'data' or similar.
                // If the column name is different, you must adjust it here.
                const key = header.toLowerCase(); 
                appointment[key] = row[index];
            });
            return appointment;
        });

        res.status(200).send(JSON.stringify(appointments));

    } catch (error) {
        console.error('Error fetching data from Google Sheets:', error);
        res.status(500).send(JSON.stringify({ error: 'Failed to fetch data' }));
    }
};
