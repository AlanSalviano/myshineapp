// api/get-appointments.js
// Utiliza as mesmas credenciais da conta de serviço do register-appointment.js

const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

const SPREADSHEET_ID = '1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA';
const SHEET_NAME = 'datatest';

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const serviceAccountAuth = new JWT({
            email: process.env.CLIENT_EMAIL,
            key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        
        const sheets = google.sheets({ version: 'v4', auth: serviceAccountAuth });

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:Z`, // Lê todas as colunas da aba
        });

        const rows = response.data.values;
        
        if (!rows || rows.length <= 1) {
            return res.status(200).json([]);
        }

        const headers = rows[0].map(header => header.toLowerCase());
        const dataRows = rows.slice(1);

        const appointments = dataRows.map(row => {
            const appointment = {};
            row.forEach((value, index) => {
                const header = headers[index];
                if (header) {
                    appointment[header] = value;
                }
            });
            return appointment;
        });

        res.status(200).json(appointments);

    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
    }
};
