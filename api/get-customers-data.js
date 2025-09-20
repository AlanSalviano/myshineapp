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
                type: row.Type || '',
                date: row.Date ? excelDateToYYYYMMDD(row.Date) : '',
                pets: row.Pets || '',
                closer1: row['Closer (1)'] || '',
                closer2: row['Closer (2)'] || '',
                customers: row.Customers || '',
                phone: row.Phone || '',
                oldNew: row['Old/New'] || '',
                appointmentDate: row['Date (Appointment)'] ? excelDateToYYYYMMDD(row['Date (Appointment)']) : '',
                serviceValue: row['Service Value'] || '',
                franchise: row.Franchise || '',
                city: row.City || '',
                source: row.Source || '',
                week: row.Week || '',
                month: row.Month || '',
                year: row.Year || '',
                code: row.Code || '',
                reminderDate: row['Reminder Date'] ? excelDateToYYYYMMDD(row['Reminder Date']) : '',
                technician: row.Technician || '',
                petShowed: row['Pet Showed'] || '',
                serviceShowed: row['Service Showed'] || '',
                tips: row.Tips || '',
                paymentMethod: row.Method || '',
                verification: row.Verification || ''
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
