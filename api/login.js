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

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email e senha são obrigatórios.' });
    }

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Usuários'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Planilha "Usuários" não encontrada.' });
        }

        const rows = await sheet.getRows();

        // ALTERAÇÃO FEITA AQUI: Comparação mais robusta
        const user = rows.find(row => {
            const rowEmail = row.email || ''; // Pega o email da linha ou uma string vazia se for nulo
            const rowPassword = row.password || ''; // Pega a senha da linha

            // Compara o email em minúsculas e sem espaços
            // Compara a senha removendo espaços
            return rowEmail.trim().toLowerCase() === email.trim().toLowerCase() && 
                   rowPassword.trim() === password.trim();
        });


        if (user) {
            const redirectUrl = "https://docs.google.com/spreadsheets/d/1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA/edit?gid=1452592090#gid=1452592090";
            return res.status(200).json({ success: true, message: 'Login bem-sucedido!', redirectUrl });
        } else {
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    } catch (error) {
        console.error('Erro ao processar login:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
