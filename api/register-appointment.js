import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccountAuth = new JWT({
    email: process.env.CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet('1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA', serviceAccountAuth);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Datatest'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Planilha "Datatest" não encontrada.' });
        }

        const { type, data, pets, closer1, closer2, customers, phone, oldNew, appointmentDate, serviceValue, franchise, city, source, week, month, year } = req.body;

        const newRow = {
            'Type': type,
            'Date': data,
            'Pets': pets,
            'Closer (1)': closer1, // Mapeado para o primeiro Closer
            'Closer (2)': closer2, // Mapeado para o segundo Closer
            'Customers': customers,
            'Phone': phone,
            'Old/New': oldNew,
            'Date (Appointment)': appointmentDate,
            'Service Value': serviceValue,
            'Franchise': franchise,
            'City': city,
            'Source': source,
            'Week': week,
            'Month': month,
            'Year': year
        };

        await sheet.addRow(newRow);

        return res.status(201).json({ success: true, message: 'Agendamento registrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar agendamento:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
