import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { excelDateToYYYYMMDD } from './utils.js';
import { SHEET_NAME_APPOINTMENTS } from './configs/sheets-config.js';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const SPREADSHEET_ID_APPOINTMENTS = process.env.SHEET_ID_APPOINTMENTS;

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const docAppointments = new GoogleSpreadsheet(SPREADSHEET_ID_APPOINTMENTS, serviceAccountAuth);
        console.log('Tentando carregar informações da planilha...');
        await docAppointments.loadInfo();
        console.log('Informações da planilha carregadas com sucesso.');

        const sheetAppointments = docAppointments.sheetsByTitle[SHEET_NAME_APPOINTMENTS];
        if (!sheetAppointments) {
            console.error(`Sheet "${SHEET_NAME_APPOINTMENTS}" not found.`);
            return res.status(404).json({ error: `Planilha "${SHEET_NAME_APPOINTMENTS}" não encontrada.` });
        }
        console.log(`Planilha "${SHEET_NAME_APPOINTMENTS}" encontrada.`);

        console.log('Carregando linhas da planilha...');
        const rows = await sheetAppointments.getRows();
        console.log(`Encontradas ${rows.length} linhas.`);

        if (rows.length > 0) {
            console.log('Dados da primeira linha:', rows[0]._rawData);
        }

        const customers = rows.map(row => {
            const customerData = {
                type: row._rawData[0] || '',
                date: excelDateToYYYYMMDD(row._rawData[1]),
                pets: row._rawData[2] || '',
                closer1: row._rawData[3] || '',
                closer2: row._rawData[4] || '',
                customers: row._rawData[5] || '',
                phone: row._rawData[6] || '',
                oldNew: row._rawData[7] || '',
                appointmentDate: excelDateToYYYYMMDD(row._rawData[8]),
                serviceValue: row._rawData[9] || '',
                franchise: row._rawData[10] || '',
                city: row._rawData[11] || '',
                source: row._rawData[12] || '',
                week: row._rawData[13] || '',
                month: row._rawData[14] || '',
                year: row._rawData[15] || '',
                code: row._rawData[16] || '',
                reminderDate: excelDateToYYYYMMDD(row._rawData[17]),
                // Mapeamento corrigido para os novos campos
                technician: row._rawData[18] || '', // Coluna S (índice 18)
                petShowed: row._rawData[19] || '', // Coluna T (índice 19)
                serviceShowed: row._rawData[20] || '', // Coluna U (índice 20)
                tips: row._rawData[21] || '', // Coluna V (índice 21)
                paymentMethod: row._rawData[22] || '', // Coluna W (índice 22)
                verification: row._rawData[24] || '' // Coluna Y (índice 24)
            };
            return customerData;
        });
        
        console.log('Mapeamento de clientes concluído.');
        const responseData = {
            customers
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({ error: 'Falha ao buscar dados dos clientes.' });
    }
}
