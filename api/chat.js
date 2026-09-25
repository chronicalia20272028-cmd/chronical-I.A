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
        
        // Extrai o texto da resposta do Gemini com segurança
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply) {
            console.error("Resposta da API inválida:", JSON.stringify(data));
            return res.status(200).json({ reply: "Recebi a mensagem, mas a API não retornou conteúdo. Verifique se a chave de API está ativa." });
        }

        return res.status(200).json({ reply });
    } catch (error) {
        console.error("Erro interno:", error);
        return res.status(500).json({ error: 'Erro ao comunicar com a API do Gemini.' });
    }
}
