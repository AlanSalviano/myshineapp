import dotenv from 'dotenv';

dotenv.config();

export default async function handler(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    try {
        const techDataJson = process.env.TECH_CIDADES_JSON;
        
        if (!techDataJson) {
            return res.status(500).json({ error: 'Variável de ambiente TECH_CIDADES_JSON não encontrada.' });
        }

        const techData = JSON.parse(techDataJson);

        return res.status(200).json(techData);

    } catch (error) {
        console.error('Erro ao processar dados dos técnicos:', error);
        res.status(500).json({ error: 'Falha ao processar dados dos técnicos.' });
    }
}
