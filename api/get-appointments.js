// api/get-appointments.js
// Utiliza as mesmas credenciais da conta de serviço do register-appointment.js

const { GoogleSpreadsheet } = require('google-spreadsheet');
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
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'], // Usar 'readonly' para segurança
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

        await doc.loadInfo(); // Carrega as informações da planilha
        const sheet = doc.sheetsByTitle[SHEET_NAME];

        if (!sheet) {
            console.error(`Aba '${SHEET_NAME}' não encontrada.`);
            return res.status(404).json({ error: 'Aba não encontrada.' });
        }

        const rows = await sheet.getRows();
        
        // Mapeia as linhas para um formato de array de objetos
        const appointments = rows.map(row => {
            const obj = {};
            for (const header of sheet.headerValues) {
                // Acessa o valor da célula pelo nome da coluna (case-insensitive)
                obj[header.toLowerCase()] = row[header]; 
            }
            return obj;
        });

        res.status(200).send(JSON.stringify(appointments));

    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
    }
};
