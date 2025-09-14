import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const SPREADSHEET_ID_APPOINTMENTS = '1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA';

function excelDateToYYYYMMDD(excelSerialDate) {
    if (typeof excelSerialDate !== 'number') {
        return excelSerialDate;
    }
    const date = new Date(Date.UTC(1900, 0, 1));
    date.setDate(date.getDate() + excelSerialDate - 2); 
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const docAppointments = new GoogleSpreadsheet(SPREADSHEET_ID_APPOINTMENTS, serviceAccountAuth);

        await docAppointments.loadInfo();

        const sheetAppointments = docAppointments.sheetsByTitle['Datatest'];
        if (!sheetAppointments) {
            console.error('Sheet "Datatest" not found.');
            return res.status(404).json({ error: 'Planilha "Datatest" não encontrada.' });
        }

        const rows = await sheetAppointments.getRows();
        const customers = rows.map(row => ({
            type: row['Type'],
            date: excelDateToYYYYMMDD(row['Date']),
            pets: row['Pets'],
            closer1: row['Closer (1)'],
            closer2: row['Closer (2)'],
            customers: row['Customers'],
            phone: row['Phone'],
            oldNew: row['Old/New'],
            appointmentDate: excelDateToYYYYMMDD(row['Date (Appointment)']),
            serviceValue: row['Service Value'],
            franchise: row['Franchise'],
            city: row['City'],
            source: row['Source'],
            week: row['Week'],
            month: row['Month'],
            year: row['Year'],
            code: row['Code'],
            reminderDate: excelDateToYYYYMMDD(row['Reminder Date']),
        }));

        const responseData = {
            customers
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Error fetching customer data:', error);
        res.status(500).json({ error: 'Falha ao buscar dados dos clientes.' });
    }
}
