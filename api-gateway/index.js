// Importações
const express = require('express');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors());

// Configuração do ambiente

app.use(express.json());

const AGENTE_GERADOR_URL = process.env.AGENTE_GERADOR_URL || 'http://localhost:8001';
const AGENTE_REVISOR_URL = process.env.AGENTE_REVISOR_URL || 'http://localhost:8002';
const PADROES_FILE_PATH = path.join(__dirname, '..', 'db-padroes', 'regras.json');


// Funções para as rotas

//Função para obter o arquivo de padrões
async function getPadroes(filename) {
    try {
        const data = await fs.readFile(filename, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("ERRO: Falha ao ler o Arquivo de Padrões.", error.message);
        throw new Error("Padrões de Comunicação não disponíveis.");
    }
}

// Função para chamar o Agente 1 (Gerador)
async function chamarAgenteGerador(topicos) {
    try {
        const response = await axios.post(`${AGENTE_GERADOR_URL}/generate`, { topicos });
        return response.data; 
    } catch (error) {
        console.error('ERRO: Falha ao contatar Agente 1 (Gerador)', error.message);
        throw new Error('Serviço de Geração de Rascunho está indisponível.');
    }
}

// Função para chamar o Agente 2 (Revisor)
async function chamarAgenteRevisor(rascunho, padroes, mcp_agente_1) {
    try {
        const response = await axios.post(`${AGENTE_REVISOR_URL}/revisar`, { 
            rascunho: rascunho,
            padroes: padroes,
            mcp_agente_1: mcp_agente_1 
        });
        return response.data;
    } catch (error) {
        console.error('ERRO: Falha ao contatar Agente 2 (Revisor)', error.message);
        throw new Error('Serviço de Revisão de Rascunho está indisponível.');
    }
}

// Rotas de Serviço (Health Check e Acesso a Dados)

//Health Check
app.get('/api/status', (req, res) => {
    res.json({status: 'API Gateway Online', service: 'API Gateway'});
});

//Acesso aos Dados ( Health Check do arquivo dos Padrões )
app.get('/api/padroes', async (req, res) => {
    try {
        const padroes = await getPadroes(PADROES_FILE_PATH);
        res.json({ padroes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota Principal
app.post('/api/gerar-rascunho', async (req, res) => {
    const { topicos } = req.body;

    if (!topicos || topicos.length === 0) {
        return res.status(400).json({ error: 'Tópicos de entrada são obrigatórios.' });
    }
    try {
        console.log("Gateway: Chamando Agente 1 (Gerador)...");
        // Recebe o objeto inteiro (rascunho + mcp)
        const data_agente_1 = await chamarAgenteGerador(topicos);
        const rascunhoInicial = data_agente_1.rascunho;
        const mcp_agente_1 = data_agente_1.mcp;

        console.log("Gateway: Buscando padrões locais (D1)...");
        const padroes = await getPadroes(PADROES_FILE_PATH);
        
        console.log("Gateway: Chamando Agente 2 (Revisor) com o rascunho e padrões...");
        // Passa o rascunho, padrões E o mcp_agente_1
        const data_agente_2 = await chamarAgenteRevisor(rascunhoInicial, padroes, mcp_agente_1);
        const rascunhoFinal = data_agente_2.rascunho_revisado;
        const mcp_agente_2 = data_agente_2.mcp;
        
        // Agrega os contextos MCP para a resposta final
        res.json({
            status: 'sucesso',
            rascunho_final_revisado: rascunhoFinal,
            mcp_trace: {
                agente_gerador: mcp_agente_1,
                agente_revisor: mcp_agente_2
            }
        });

    } catch (error) {
        console.error('Erro na Orquestração do Gateway:', error.message);
        
        res.status(503).json({ 
            error: 'Serviço indisponível ou falha na orquestração.', 
            detail: error.message 
        });
    }
});

// Ligar o servidor
app.listen(PORT, () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
});