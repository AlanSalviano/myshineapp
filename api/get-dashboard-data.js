import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SPREADSHEET_ID_APPOINTMENTS = '1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA';
const SPREADSHEET_ID_DATA = '1kEIg8Le1nq9etQrTu162RIMSJYaCoioLLpFVg6yKBgg';

function excelDateToYYYYMMDD(excelSerialDate) {
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
        const docData = new GoogleSpreadsheet(SPREADSHEET_ID_DATA, serviceAccountAuth);

        await Promise.all([docAppointments.loadInfo(), docData.loadInfo()]);

        const sheetAppointments = docAppointments.sheetsByTitle['Datatest'];
        const sheetEmployees = docData.sheetsByTitle['Employees'];
        const sheetFranchises = docData.sheetsByTitle['Regions'];

        if (!sheetAppointments || !sheetEmployees || !sheetFranchises) {
            console.error('One or more sheets were not found.');
            return res.status(404).json({ error: 'Uma ou mais planilhas não foram encontradas.' });
        }

        // Fetch Appointments
        await sheetAppointments.loadCells('B1:E' + sheetAppointments.rowCount);
        const appointments = [];
        for (let i = 1; i < sheetAppointments.rowCount; i++) {
            const dateCell = sheetAppointments.getCell(i, 1);
            const petsCell = sheetAppointments.getCell(i, 2);
            const closer1Cell = sheetAppointments.getCell(i, 3);
            const closer2Cell = sheetAppointments.getCell(i, 4);

            if (dateCell.value) {
                const formattedDate = excelDateToYYYYMMDD(dateCell.value);
                appointments.push({ 
                    date: formattedDate,
                    pets: petsCell.value,
                    closer1: closer1Cell.value,
                    closer2: closer2Cell.value
                });
            }
        }

        // Fetch Employees
        await sheetEmployees.loadCells('A1:A' + sheetEmployees.rowCount);
        const employees = [];
        for (let i = 1; i < sheetEmployees.rowCount; i++) {
            const cell = sheetEmployees.getCell(i, 0);
            if (cell.value) {
                employees.push(cell.value);
            }
        }

        // Fetch Franchises
        await sheetFranchises.loadCells('A1:A' + sheetFranchises.rowCount);
        const franchises = [];
        for (let i = 1; i < sheetFranchises.rowCount; i++) {
            const cell = sheetFranchises.getCell(i, 0);
            if (cell.value) {
                franchises.push(cell.value);
            }
        }

        const responseData = {
            appointments,
            employees,
            franchises
        };

        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Erro ao buscar dados do painel:', error);
        res.status(500).json({ error: 'Falha ao buscar dados do painel.' });
    }
}