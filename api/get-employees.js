import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet('1kEIg8Le1nq9etQrTu162RIMSJYaCoioLLpFVg6yKBgg', serviceAccountAuth);

export default async function handler(req, res) {
    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Employees'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Planilha "Employees" não encontrada.' });
        }
        
        // Obter os dados da coluna A, ignorando o cabeçalho
        await sheet.loadCells('A1:A' + sheet.rowCount);
        const rows = [];
        for (let i = 1; i < sheet.rowCount; i++) {
            const cell = sheet.getCell(i, 0); // Coluna A (índice 0)
            if (cell.value) {
                rows.push(cell.value);
            }
        }
        
        return res.status(200).json(rows);

    } catch (error) {
        console.error('Erro ao buscar dados dos Closers:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
