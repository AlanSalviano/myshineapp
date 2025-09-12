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

    // ALTERAÇÃO: recebendo 'role', 'userOrEmail' e 'password'
    const { role, userOrEmail, password } = req.body;

    if (!role || !userOrEmail || !password) {
        return res.status(400).json({ success: false, message: 'Role, user/email e senha são obrigatórios.' });
    }

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Usuários'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Planilha "Usuários" não encontrada.' });
        }

        const rows = await sheet.getRows();

        // ALTERAÇÃO CRÍTICA: Lógica de login para checar role + user ou role + email
        const user = rows.find(row => {
            const rowRole = row._rawData[0] || '';
            const rowUser = row._rawData[1] || '';
            const rowEmail = row._rawData[2] || '';
            const rowPassword = row._rawData[3] || '';

            return rowRole.trim().toLowerCase() === role.trim().toLowerCase() &&
                   rowPassword.trim() === password.trim() &&
                   (rowUser.trim().toLowerCase() === userOrEmail.trim().toLowerCase() ||
                    rowEmail.trim().toLowerCase() === userOrEmail.trim().toLowerCase());
        });


        if (user) {
            const redirectUrl = "https://docs.google.com/spreadsheets/d/1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA/edit?gid=1452592090#gid=1452592090";
            return res.status(200).json({ success: true, message: 'Login bem-sucedido!', redirectUrl });
        } else {
            return res.status(401).json({ success: false, message: 'Credenciais inválidas.' });
        }
    } catch (error) {
        console.error('Erro ao processar login:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
