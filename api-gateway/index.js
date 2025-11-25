// Importações
const express = require('express');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const PORT = 3000;
const app = express();
app.use(express.json());
app.use(cors());

// Variáveis de ambiente
const AGENTE_GERADOR_URL = process.env.AGENTE_GERADOR_URL || 'http://localhost:8001';
const AGENTE_REVISOR_URL = process.env.AGENTE_REVISOR_URL || 'http://localhost:8002';
const PADROES_FILE_PATH = path.join(__dirname, '..', 'db-padroes', 'regras.json');

const LOGIN_USER = process.env.LOGIN_USER;
const LOGIN_PASS = process.env.LOGIN_PASS;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES || '1h';

// 🔥 NOVO — Middleware para proteger rotas
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer token

    if (!token)
        return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err)
            return res.status(403).json({ error: 'Token inválido ou expirado.' });

        req.user = user;
        next();
    });
}

// Funções auxiliares
async function getPadroes(filename) {
    try {
        const data = await fs.readFile(filename, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error("ERRO: Falha ao ler o Arquivo de Padrões.", error.message);
        throw new Error("Padrões de Comunicação não disponíveis.");
    }
}

async function chamarAgenteGerador(topicos) {
    try {
        const response = await axios.post(`${AGENTE_GERADOR_URL}/generate`, { topicos });
        return response.data.rascunho;
    } catch (error) {
        console.error('ERRO: Falha ao contatar Agente 1 (Gerador)', error.message);
        throw new Error('Serviço de Geração de Rascunho está indisponível.');
    }
}

async function chamarAgenteRevisor(rascunho, padroes) {
    try {
        const response = await axios.post(`${AGENTE_REVISOR_URL}/revisar`, {
            rascunho,
            padroes
        });
        return response.data.rascunho_revisado;
    } catch (error) {
        console.error('ERRO: Falha ao contatar Agente 2 (Revisor)', error.message);
        throw new Error('Serviço de Revisão de Rascunho está indisponível.');
    }
}

// login
// ---------------------------
app.post('/api/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha)
        return res.status(400).json({ error: "Usuário e senha são obrigatórios." });

    if (usuario !== LOGIN_USER || senha !== LOGIN_PASS)
        return res.status(401).json({ error: "Credenciais inválidas." });

    const token = jwt.sign(
        { usuario },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );

    res.json({
        status: 'ok',
        token
    });
});

// Health Check
app.get('/api/status', (req, res) => {
    res.json({status: 'API Gateway Online', service: 'API Gateway'});
});

// Dados dos padrões — protegido
app.get('/api/padroes', autenticarToken, async (req, res) => {
    try {
        const padroes = await getPadroes(PADROES_FILE_PATH);
        res.json({ padroes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota Principal — protegida
app.post('/api/gerar-rascunho', autenticarToken, async (req, res) => {
    const { topicos } = req.body;

    if (!topicos || topicos.length === 0) {
        return res.status(400).json({ error: 'Tópicos de entrada são obrigatórios.' });
    }

    try {
        console.log("Gateway: Chamando Agente 1 (Gerador)...");
        const rascunhoInicial = await chamarAgenteGerador(topicos);

        console.log("Gateway: Buscando padrões locais (D1)...");
        const padroes = await getPadroes(PADROES_FILE_PATH);

        console.log("Gateway: Chamando Agente 2 (Revisor)...");
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

// Start
app.listen(PORT, () => {
    console.log(`API Gateway rodando na porta ${PORT}`);
});
