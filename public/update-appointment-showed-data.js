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
        const { code, technician, petShowed, serviceShowed, tips, paymentMethod, paymentId, verification } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'O código de agendamento é obrigatório.' });
        }

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID_APPOINTMENTS, serviceAccountAuth);
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle[SHEET_NAME_APPOINTMENTS];

        if (!sheet) {
            return res.status(500).json({ success: false, message: `Planilha "${SHEET_NAME_APPOINTMENTS}" não encontrada.` });
        }

        const rows = await sheet.getRows();
        const rowToUpdate = rows.find(row => row.code === code);

        if (!rowToUpdate) {
            return res.status(404).json({ success: false, message: 'Agendamento não encontrado.' });
        }
        
        // Assumindo que as colunas a serem atualizadas já existem ou serão criadas.
        // O mapeamento de colunas da planilha para as variáveis do objeto é crucial aqui.
        // Os nomes das colunas são os cabeçalhos da sua planilha.
        rowToUpdate['Technician'] = technician;
        rowToUpdate['Pet Showed'] = petShowed;
        rowToUpdate['Service Showed'] = serviceShowed;
        rowToUpdate['Tips'] = tips;
        rowToUpdate['Payment Method'] = paymentMethod;
        rowToUpdate['Payment ID'] = paymentId;
        rowToUpdate['Verification'] = verification;
        
        await rowToUpdate.save();

        return res.status(200).json({ success: true, message: 'Dados atualizados com sucesso!' });
    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
