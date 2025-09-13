// api/get-appointments.js
// Usa as mesmas credenciais e biblioteca que get-employees.js para garantir a compatibilidade.

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

const SPREADSHEET_ID = '1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA';
const SHEET_NAME = 'Datatest';

module.exports = async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const serviceAccountAuth = new JWT({
            email: process.env.CLIENT_EMAIL,
            key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
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
            // Usa sheet.headerValues para garantir que as colunas sejam mapeadas corretamente
            // e sejam tolerantes à ordem das colunas.
            for (const header of sheet.headerValues) {
                obj[header.toLowerCase()] = row[header]; 
            }
            return obj;
        });
        
        // Filtra os dados para remover linhas vazias
        const filteredAppointments = appointments.filter(appointment => appointment.data);

        res.status(200).json(filteredAppointments);

    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
    }
};
