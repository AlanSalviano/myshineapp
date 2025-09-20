import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { SHEET_NAME_APPOINTMENTS } from './configs/sheets-config.js';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID_APPOINTMENTS = process.env.SHEET_ID_APPOINTMENTS;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        const { rowIndex, technician, petShowed, serviceShowed, tips, paymentMethod, verification } = req.body;
        
        console.log('Dados recebidos do frontend para atualização:', { rowIndex, technician, petShowed, serviceShowed, tips, paymentMethod, verification });

        if (rowIndex === undefined || rowIndex < 0) {
            console.error('Validation Error: O índice da linha é inválido.');
            return res.status(400).json({ success: false, message: 'O índice da linha é inválido.' });
        }

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID_APPOINTMENTS, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[SHEET_NAME_APPOINTMENTS];

        if (!sheet) {
            console.error(`Spreadsheet Error: Planilha "${SHEET_NAME_APPOINTMENTS}" não encontrada.`);
            return res.status(500).json({ success: false, message: `Planilha "${SHEET_NAME_APPOINTMENTS}" não encontrada.` });
        }

        const rows = await sheet.getRows();
        
        if (rowIndex >= rows.length) {
            console.error(`Row not found: Índice da linha "${rowIndex}" fora do intervalo de linhas disponíveis (${rows.length}).`);
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
        }

        const rowToUpdate = rows[rowIndex];
        
        console.log('Dados da linha antes da atualização:', rowToUpdate);

        rowToUpdate.Technician = technician;
        rowToUpdate['Pet Showed'] = petShowed;
        rowToUpdate['Service Showed'] = serviceShowed;
        rowToUpdate.Tips = tips;
        rowToUpdate.Method = paymentMethod;
        rowToUpdate.Verification = verification;
        
        console.log('Dados da linha depois da atualização (antes de salvar):', rowToUpdate);
        
        await rowToUpdate.save();

        console.log('Dados atualizados com sucesso para o índice:', rowIndex);
        return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
