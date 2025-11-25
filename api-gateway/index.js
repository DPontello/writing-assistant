// Importações
const express = require('express');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const PORT = 3000;
const app = express();

// RATE LIMITING: 100 requisições por minuto por IP
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: "Limite de requisições excedido. Tente novamente em 1 minuto." },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());
app.use(cors());

app.use(limiter);

// TIMEOUT GLOBAL PARA TODAS AS REQUISIÇÕES AXIOS
axios.defaults.timeout = 10000; // 10 segundos

// Variáveis de ambiente e Config Básica
const AGENTE_GERADOR_URL = process.env.AGENTE_GERADOR_URL || 'http://localhost:8001';
const AGENTE_REVISOR_URL = process.env.AGENTE_REVISOR_URL || 'http://localhost:8002';
const PADROES_FILE_PATH = path.join(__dirname, '..', 'db-padroes', 'regras.json');
const JWT_SECRET = process.env.JWT_SECRET;

// MIDDLEWARE DE AUTENTICAÇÃO JWT
function autenticarJWT(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; // "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ error: 'Token inválido.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }

        req.user = user; // Dados do usuário decodificados
        next();
    });
}

// Função para obter o arquivo de padrões
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
        return response.data.rascunho;
    } catch (error) {
        console.error('ERRO: Falha ao contatar Agente 1 (Gerador)', error.message);
        throw new Error('Serviço de Geração de Rascunho está indisponível.');
    }
}

// Função para chamar o Agente 2 (Revisor)
async function chamarAgenteRevisor(rascunho, padroes) {
    try {
        const response = await axios.post(`${AGENTE_REVISOR_URL}/revisar`, {
            rascunho: rascunho,
            padroes: padroes
        });
        return response.data.rascunho_revisado;
    } catch (error) {
        console.error('ERRO: Falha ao contatar Agente 2 (Revisor)', error.message);
        throw new Error('Serviço de Revisão de Rascunho está indisponível.');
    }
}

// Health Check
app.get('/api/status', (req, res) => {
    res.json({ status: 'API Gateway Online', service: 'API Gateway' });
});

//Rotas com JWT
app.use('/api', autenticarJWT);

// Acesso aos Dados (Health Check do arquivo dos padrões)
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
        const rascunhoInicial = await chamarAgenteGerador(topicos);

        console.log("Gateway: Buscando padrões locais (D1)...");
        const padroes = await getPadroes(PADROES_FILE_PATH);

        console.log("Gateway: Chamando Agente 2 (Revisor) com o rascunho e padrões...");
        const rascunhoFinal = await chamarAgenteRevisor(rascunhoInicial, padroes);

        res.json({
            status: 'sucesso',
            rascunho_final_revisado: rascunhoFinal
        });

    } catch (error) {
        console.error('Erro na Orquestração do Gateway:', error.message);

        res.status(503).json({
            error: 'Serviço indisponível ou falha na orquestração.',
            detail: error.message
        });
    }
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
});
