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
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    // Recebendo role, email e password
    const { role, email, password } = req.body;

    if (!role || !email || !password) {
        return res.status(400).json({ success: false, message: 'Role, email and password are required.' });
    }

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Users'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Spreadsheet "Users" not found.' });
        }

        const rows = await sheet.getRows();

        // Lógica de login para checar role, email e password
        const user = rows.find(row => {
            const rowRole = row._rawData[0] || '';
            const rowEmail = row._rawData[2] || '';
            const rowPassword = row._rawData[3] || '';

            return rowRole.trim().toLowerCase() === role.trim().toLowerCase() &&
                   rowEmail.trim().toLowerCase() === email.trim().toLowerCase() &&
                   rowPassword.trim() === password.trim();
        });


        if (user) {
            const redirectUrl = "agendamentos.html";
            return res.status(200).json({ success: true, message: 'Login successful!', redirectUrl });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }
    } catch (error) {
        console.error('Error processing login:', error);
        return res.status(500).json({ success: false, message: 'An error occurred on the server. Please try again.' });
    }
}
