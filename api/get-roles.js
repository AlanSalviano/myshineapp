import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.SHEET_ID, serviceAccountAuth);

export default async function handler(req, res) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Roles'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Planilha "Roles" não encontrada.' });
        }
        
        await sheet.loadCells('A1:A' + sheet.rowCount);
        const rows = [];
        for (let i = 1; i < sheet.rowCount; i++) {
            const cell = sheet.getCell(i, 0);
            if (cell.value) {
                rows.push(cell.value);
            }
        }
        
        return res.status(200).json(rows);

    } catch (error) {
        console.error('Erro ao buscar dados das Roles:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
