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

    // --- LOGS DE DIAGNÓSTICO ---
    console.log('--- INICIANDO TENTATIVA DE LOGIN ---');
    console.log('Recebido do formulário:');
    console.log(`Email: "${email}"`);
    console.log(`Senha: "${password}"`);
    console.log('------------------------------------');
    // --- FIM DOS LOGS ---

    try {
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Usuários'];
        if (!sheet) {
            return res.status(500).json({ success: false, message: 'Planilha "Usuários" não encontrada.' });
        }

        const rows = await sheet.getRows();
        console.log(`Encontradas ${rows.length} linhas na planilha.`);

        const user = rows.find((row, index) => {
            const rowEmail = row.email || '';
            const rowPassword = row.password || '';

            // --- LOGS DE DIAGNÓSTICO POR LINHA ---
            console.log(`\n--- Verificando Linha ${index + 1} da Planilha ---`);
            console.log(`Planilha Email: "${rowEmail}"`);
            console.log(`Planilha Senha: "${rowPassword}"`);

            const isEmailMatch = rowEmail.trim().toLowerCase() === email.trim().toLowerCase();
            const isPasswordMatch = rowPassword.trim() === password.trim();

            console.log(`Comparando valores tratados:`);
            console.log(`'${rowEmail.trim().toLowerCase()}' === '${email.trim().toLowerCase()}'? -> ${isEmailMatch}`);
            console.log(`'${rowPassword.trim()}' === '${password.trim()}'? -> ${isPasswordMatch}`);
            console.log('---------------------------------');
            // --- FIM DOS LOGS ---

            return isEmailMatch && isPasswordMatch;
        });


        if (user) {
            console.log('SUCESSO: Usuário encontrado!');
            const redirectUrl = "https://docs.google.com/spreadsheets/d/1nwC53lk48RfU0hOk9605G7ZCfe67tw4o-RBNS9XNfWA/edit?gid=1452592090#gid=1452592090";
            return res.status(200).json({ success: true, message: 'Login bem-sucedido!', redirectUrl });
        } else {
            console.log('FALHA: Nenhuma correspondência de usuário encontrada.');
            return res.status(401).json({ success: false, message: 'Usuário ou senha inválidos.' });
        }
    } catch (error) {
        console.error('ERRO CRÍTICO NO BLOCO DE LOGIN:', error);
        return res.status(500).json({ success: false, message: 'Ocorreu um erro no servidor. Por favor, tente novamente.' });
    }
}
