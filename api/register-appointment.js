const { GoogleSpreadsheet } = require('google-spreadsheet');

exports.handler = async (event, context) => {
    // Configurações e credenciais da planilha
    const SPREADSHEET_ID = process.env.REACT_APP_SPREADSHEET_ID;
    const CLIENT_EMAIL = process.env.REACT_APP_GOOGLE_CLIENT_EMAIL;
    const PRIVATE_KEY = process.env.REACT_APP_GOOGLE_SERVICE_PRIVATE_KEY.replace(/\\n/g, '\n');

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

    try {
        // Autentica com as credenciais da conta de serviço
        await doc.useServiceAccountAuth({
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        });

        // Carrega as informações da planilha
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0]; // Assume que a primeira aba é a correta

        // Analisa os dados do corpo da requisição POST
        const body = JSON.parse(event.body);
        
        // Mapeia os dados do corpo da requisição para as colunas da planilha.
        // A ordem aqui é crucial e deve corresponder à ordem das colunas na sua planilha.
        // O valor de 'reminderDate' será inserido na 18ª posição, correspondente à coluna R.
        const newRow = {
            'type': body.type,
            'data': body.data,
            'pets': body.pets,
            'closer1': body.closer1,
            'closer2': body.closer2,
            'customers': body.customers,
            'phone': body.phone,
            'oldNew': body.oldNew,
            'appointmentDate': body.appointmentDate,
            'serviceValue': body.serviceValue,
            'franchise': body.franchise,
            'city': body.city,
            'source': body.source,
            'week': body.week,
            'month': body.month,
            'year': body.year,
            'code': body.code,
            'reminderDate': body.reminderDate
        };

        // Adiciona a nova linha na planilha
        await sheet.addRow(newRow);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Agendamento registrado com sucesso!' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };

    } catch (e) {
        console.error('Erro ao processar a requisição:', e);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: 'Erro ao registrar agendamento. Por favor, tente novamente.' }),
            headers: {
                'Content-Type': 'application/json'
            }
        };
    }
};
