// api/get-appointments.js
// Usa a mesma abordagem que o get-employees.js para garantir a compatibilidade e a leitura correta dos dados.

import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SPREADSHEET_ID = '1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA';
const SHEET_NAME = 'Datatest';

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const serviceAccountAuth = new JWT({
            email: process.env.CLIENT_EMAIL,
            key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
        await doc.loadInfo(); 
        
        const sheet = doc.sheetsByTitle[SHEET_NAME];

        if (!sheet) {
            console.error(`Aba '${SHEET_NAME}' não encontrada.`);
            return res.status(404).json({ error: 'Aba não encontrada.' });
        }
        
        // Acessa os dados da coluna "Date" (coluna B)
        await sheet.loadCells('B1:B' + sheet.rowCount);
        const appointments = [];
        
        // Começa do índice 1 para pular o cabeçalho
        for (let i = 1; i < sheet.rowCount; i++) {
            const cell = sheet.getCell(i, 1); // Coluna B tem índice 1
            if (cell.value) {
                // Cria um objeto para cada agendamento
                appointments.push({ date: cell.value });
            }
        }
        
        return res.status(200).json(appointments);

    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
    }
}
