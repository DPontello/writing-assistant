# 🏗️ Arquitetura Final — Pós-Mitigação de Ameaças

Este documento apresenta a **Visão Final da Arquitetura** do sistema após a implementação das medidas de mitigação identificadas na [Modelagem de Ameaças STRIDE](./MODELAGEM_DE_AMEACAS.md).

---

## 📊 Diagrama da Arquitetura Final

![Diagrama de Fluxo de Dados - Arquitetura Final](./assets/dfd-arquitetura-final.png)

O diagrama acima ilustra a arquitetura do sistema com todas as **medidas de segurança implementadas** para mitigar as 20 ameaças identificadas na análise STRIDE.

---

## 🛡️ Medidas de Segurança Implementadas

### **1. Autenticação e Autorização**

| Medida | Componente | Ameaças Mitigadas |
|--------|------------|-------------------|
| **JWT/OAuth 2.0** | API Gateway | #1 (Spoofing), #12 (Replay Attack) |
| **Controle de acesso** | Base de Regras | #10 (Acesso não autorizado) |
| **Nonce/Timestamp** | API Gateway | #12 (Replay Attack) |

**Descrição:**
- O API Gateway implementa autenticação JWT ou OAuth 2.0 para validar requisições de usuários legítimos
- Tokens incluem nonce e timestamp para prevenir ataques de replay
- Rotas administrativas (como `/api/padroes`) são protegidas e não expostas publicamente

---

### **2. Proteção da Comunicação**

| Medida | Componente | Ameaças Mitigadas |
|--------|------------|-------------------|
| **HTTPS/TLS** | Todos os serviços | #3 (Tampering - dados em trânsito) |
| **CORS configurado** | API Gateway | #14 (Origens não autorizadas) |

**Descrição:**
- Todas as comunicações entre microserviços utilizam HTTPS/TLS para criptografia
- CORS configurado com whitelist específica de origens permitidas
- Certificados SSL/TLS renovados automaticamente

---

### **3. Proteção contra Negação de Serviço (DoS)**

| Medida | Componente | Ameaças Mitigadas |
|--------|------------|-------------------|
| **Rate Limiting** | API Gateway | #4 (DoS - múltiplas requisições) |
| **Timeout (30s)** | Todos os serviços | #9, #15 (Serviços travados) |
| **Health Checks** | Todos os containers | #16 (Container sem reinício) |
| **Limite de recursos** | Agente Gerador/Ollama | #9 (Esgotamento de recursos) |

**Descrição:**
- Rate limiting configurado para 100 requisições por minuto por IP
- Timeout de 30 segundos em todas as chamadas HTTP entre serviços
- Health checks implementados no `docker-compose.yml` para reinicialização automática
- Tamanho máximo de entrada limitado a 5000 caracteres

---

### **4. Proteção de Dados Sensíveis**

| Medida | Componente | Ameaças Mitigadas |
|--------|------------|-------------------|
| **Variáveis de ambiente (.env)** | Agente Revisor | #2 (Chave API exposta) |
| **Log sanitization** | Todos os serviços | #7 (Logs com dados sensíveis) |
| **Backup automático** | Base de Regras | #20 (Perda de dados) |

**Descrição:**
- Chave da API Gemini armazenada em variável de ambiente (`.env`)
- Arquivo `.env` incluído no `.gitignore` para nunca ser commitado
- Logs sanitizados para não conter conteúdo completo de rascunhos ou chaves
- Sistema de backup automático para o arquivo `regras.json`

---

### **5. Segurança de Containers**

| Medida | Componente | Ameaças Mitigadas |
|--------|------------|-------------------|
| **Usuários não-privilegiados** | Todos os containers | #6 (Escalação de privilégio) |
| **Network interna do Docker** | Todos os containers | #17 (Exposição de portas) |
| **Scan de vulnerabilidades** | Dependências | #11 (CVEs conhecidas) |
| **Modelo atualizado** | Ollama | #19 (Versões desatualizadas) |

**Descrição:**
- Containers executados com usuários não-root
- Network interna do Docker para isolamento entre containers
- Apenas portas essenciais expostas ao host
- `npm audit` e `pip check` executados regularmente
- Imagem Ollama com tag específica de versão atualizada

---

### **6. Validação e Versionamento**

| Medida | Componente | Ameaças Mitigadas |
|--------|------------|-------------------|
| **Validação de schema** | API Gateway | #8 (Payloads malformados) |
| **Sanitização de entrada** | API Gateway | #5 (Injeção de prompt) |
| **Versionamento de API** | API Gateway | #18 (Mudanças sem controle) |
| **Logging centralizado** | Todos os serviços | #13 (Falta de rastreamento) |

**Descrição:**
- Validação de schema usando Joi/Zod antes de processar requisições
- Sanitização de caracteres especiais e limitação de tamanho do prompt
- API versionada (ex: `/api/v1/gerar-rascunho`) para compatibilidade
- Logging centralizado com timestamp e identificador de usuário

---

## 📈 Impacto das Mitigações

### Comparação de Risco: Antes vs Depois

| Métrica | Antes da Mitigação | Após Mitigação | Redução |
|---------|-------------------|----------------|---------|
| **Risco médio** | ~45 | ~14 | **~69%** |
| **Ameaças críticas (>60)** | 3 | 0 | **100%** |
| **Ameaças altas (40-60)** | 9 | 1 | **~89%** |

### Ameaças Críticas Neutralizadas

| ID | Vulnerabilidade | Risco Inicial | Risco Residual | Redução |
|----|-----------------|---------------|----------------|---------|
| #1 | API Gateway sem autenticação | **72** | 18 | 75% |
| #2 | Chave API Gemini exposta | **70** | 20 | 71% |
| #4 | DoS no API Gateway | **63** | 27 | 57% |

---

## 🎯 Mapeamento: Diagrama → Ameaças Mitigadas

### Elementos Visuais do Diagrama Final

| Símbolo/Elemento | Localização | Ameaças Relacionadas |
|------------------|-------------|----------------------|
| 🔐 **Autenticação JWT** | API Gateway | #1, #12 |
| 🔒 **HTTPS/TLS** | Setas de comunicação | #3 |
| ⏱️ **Rate Limiting** | API Gateway | #4 |
| ✓ **Validação de Entrada** | API Gateway | #5, #8 |
| ❤️ **Health Checks** | Todos os containers | #16 |
| 👤 **Non-root User** | Containers Docker | #6 |
| 🔑 **Variável .env** | Agente Revisor | #2 |
| 🛡️ **Network Isolada** | Docker Network | #17 |
| 💾 **Backup** | Base de Regras | #20 |
| 📝 **Logs Sanitizados** | Todos os serviços | #7 |
| 🔄 **Timeout 30s** | Conexões entre serviços | #9, #15 |
| 🌐 **CORS Whitelist** | API Gateway | #14 |

---

## 📚 Referências

### Metodologia de Segurança

- **TORR, P.** "Demystifying the threat modeling process," *IEEE Security & Privacy*, vol. 3, no. 5, pp. 66-70, Sept.-Oct. 2005.
- **MICROSOFT.** The STRIDE Threat Model. Microsoft Security Development Lifecycle (SDL).

### Boas Práticas Implementadas

- **OWASP.** API Security Top 10. Disponível em: `https://owasp.org/www-project-api-security/`
- **DOCKER.** Security Best Practices. Disponível em: `https://docs.docker.com/engine/security/`
- **NIST.** Cybersecurity Framework. National Institute of Standards and Technology.

---

## 🔗 Documentação Relacionada

- [📊 Modelagem de Ameaças Completa](./MODELAGEM_DE_AMEACAS.md)
- [📁 Tabela CSV de Ameaças](./modelagem_de_ameacas.csv)
- [🏗️ Diagrama Arquitetura Inicial](./diagrama_arquitetura.png)
- [📖 README Principal](../README.md)

---

## ✅ Conclusão

A arquitetura final representa uma evolução significativa em relação à visão inicial, incorporando **múltiplas camadas de segurança** que:

1. ✅ Reduzem o risco médio em ~69%
2. ✅ Eliminam todas as ameaças críticas (risco > 60)
3. ✅ Implementam defesa em profundidade (defense-in-depth)
4. ✅ Seguem as melhores práticas da indústria (OWASP, NIST, Docker)
5. ✅ Mantêm a escalabilidade e modularidade da arquitetura de microserviços

O sistema está agora **pronto para produção** com um nível de segurança adequado para proteger dados sensíveis e garantir disponibilidade contínua.
