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

// Função para converter o número de série da data do Excel para o formato YYYY/MM/DD
function excelDateToYYYYMMDD(serial) {
    // Dias entre 1900-01-01 e 1970-01-01 (com ajuste para ano bissexto de 1900)
    const excelEpoch = new Date(Date.UTC(1899, 11, 30)); 
    const days = serial - 1; // Ajusta para o índice 0-base
    const date = new Date(excelEpoch.getTime() + days * 86400000); // 86400000 ms em um dia
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}/${month}/${day}`;
}

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
        
        await sheet.loadCells('B1:B' + sheet.rowCount);
        const appointments = [];
        
        for (let i = 1; i < sheet.rowCount; i++) {
            const cell = sheet.getCell(i, 1); // Coluna B tem índice 1
            if (cell.value) {
                // Converte o número de série para o formato YYYY/MM/DD
                const formattedDate = excelDateToYYYYMMDD(cell.value);
                appointments.push({ date: formattedDate });
            }
        }
        
        return res.status(200).json(appointments);

    } catch (error) {
        console.error('Erro ao buscar dados da planilha:', error);
        res.status(500).json({ error: 'Falha ao buscar dados da planilha.' });
    }
}
