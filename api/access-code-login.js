import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ success: false, message: 'A senha é obrigatória.' });
    }

    const fCodeEnv = process.env.F_CODE;
    
    if (!fCodeEnv) {
        console.error('Environment variable F_CODE is not set.');
        return res.status(500).json({ success: false, message: 'Erro de configuração do servidor: F_CODE não definido.' });
    }

    // Assume F_CODE format is "REDIRECT_URL,ACCESS_CODE"
    const [redirectUrl, accessCode] = fCodeEnv.split(',');

    if (!accessCode || !redirectUrl) {
        console.error('Environment variable F_CODE is improperly formatted.');
        return res.status(500).json({ success: false, message: 'Erro de configuração do servidor: F_CODE formatado incorretamente.' });
    }

    console.log(`Comparing entered password with access code for general access.`);

    // Validation Check: Case-sensitive match for the specified code
    if (password.trim() === accessCode.trim()) {
        console.log('Access code login successful.');
        return res.status(200).json({ success: true, message: 'Acesso concedido!', redirectUrl });
    } else {
        console.log('Access code login failed: Invalid password.');
        return res.status(401).json({ success: false, message: 'Código de acesso inválido.' });
    }
}
