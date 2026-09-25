export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { message } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'A chave GEMINI_API_KEY não está configurada na Vercel.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: message }] }]
            })
        });

        const data = await response.json();
        
        // Se a API retornar um erro estruturado, envia-o para o chat
        if (data.error) {
            return.status(200).json({ reply: `Erro da API Google: ${data.error.message || JSON.stringify(data.error)}` });
        }

        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            return res.status(200).json({ reply: `Resposta vazia da API. Dados recebidos: ${JSON.stringify(data)}` });
        }

        return res.status(200).json({ reply });
    } catch (error) {
        return res.status(500).json({ reply: `Erro interno no servidor: ${error.message}` });
    }
}
