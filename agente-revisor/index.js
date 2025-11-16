//Importações 
const express = require('express');
const { GoogleGenAI } = require("@google/genai");
const dotenv = require('dotenv');
const path = require('path');

//Configuração do ambiente
const app = express();
const PORT = 8002;

//Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

app.use(express.json());

//Pegar a chave da API do ambiente
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if(!GEMINI_API_KEY) {
    console.error("ERRO CRÍTICO: GEMINI_API_KEY não encontrada.");
    process.exit(1);
}

//Inicializar o cliente o Google Generative AI
const genAI = new GoogleGenAI({});

//Rota de Health Check
app.get('/api/status', (req, res) => {
    res.json({
        "status": "Agente Revisor Online", 
        "service": "Agente 2 (Node.js)", 
        "gemini_sdk": GEMINI_API_KEY ? "Inicializado" : "Falhou (Chave não encontrada)"
    });
});

//Rota para revisar o rascunho
app.post('/revisar', async (req, res) => {
    // 1. Recebe os dados do Gateway (Rascunho + Padrões + Contexto MCP anterior)
    const { rascunho, padroes, mcp_agente_1 } = req.body; // <-- MODIFICAÇÃO: mcp_agente_1 adicionado

    if (!rascunho || !padroes) {
        return res.status(400).json({ error: 'Rascunho ou Padrões de revisão estão faltando.' });
    }

    try {
        console.log("Agente 2: Recebi rascunho e padrões. Chamando API Gemini...");

        // 2. Monta o Prompt para a IA Generativa
        const padroesComoTexto = JSON.stringify(padroes, null, 2);
        
        const prompt = `
          Você é um editor sênior de uma Empresa Júnior.
          Sua tarefa é revisar o "RASCUNHO" a seguir para que ele siga ESTritamente os "PADRÕES DA EMPRESA".
          Não adicione nenhuma opinião, apenas retorne o texto revisado.

          --- PADRÕES DA EMPRESA ---
          ${padroesComoTexto}
          ---------------------------

          --- RASCUNHO PARA REVISAR ---
          ${rascunho}
          -----------------------------
        `;

       const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            generationConfig: {
                temperature: 0.2 
            }
        });

        const textoRevisado = response.text; 
        
        console.log("Agente 2: Gemini respondeu com sucesso.");
        
        // --- INÍCIO DA MODIFICAÇÃO MCP ---
        
        // 1. Criar o objeto de contexto MCP para este agente
        const mcp_context = {
            "task": "Revisão de Rascunho com Padrões",
            "model": "gemini-2.5-flash",
            "prompt": prompt,
            "input": rascunho,
            "output": textoRevisado,
            "previous_step": mcp_agente_1 || null 
        };
        
        // 2. MODIFICAÇÃO: Retornar o rascunho revisado E o novo contexto
        res.json({ rascunho_revisado: textoRevisado, mcp: mcp_context });
        // --- FIM DA MODIFICAÇÃO MCP ---

    } catch (error) {
        // Agora, se tiver um erro 404, será de fato um problema de API (como a API desabilitada no Cloud)
        console.error("ERRO no Agente 2 ao chamar Gemini:", error);
        res.status(503).json({ 
            error: 'Falha ao contatar o serviço de IA na nuvem (Gemini).',
            detail: error.message
        });
    }
});
//Ligar o servidor
app.listen(PORT, () => {
    console.log(`Agente Revisor rodando na porta ${PORT}`);
});