# 🔒 Modelagem de Ameaças (STRIDE)

A análise de segurança identificou **20 ameaças** ao sistema, categorizadas pela metodologia **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

---

## 📋 Metodologia

Utilizamos a metodologia **STRIDE** para identificar ameaças ao sistema, baseando-nos no Diagrama de Fluxo de Dados (DFD) da arquitetura. A análise seguiu as etapas recomendadas por Torr (2005):

1. **Criação do DFD** com processos, armazenamento de dados, fluxos e entidades externas
2. **Aplicação do STRIDE** em cada elemento do diagrama
3. **Documentação das ameaças** com descrição, categoria, probabilidade e impacto
4. **Priorização** usando matriz de risco (Probabilidade × Impacto)
5. **Definição de medidas de mitigação** para cada ameaça identificada
6. **Cálculo do risco residual** após aplicação das mitigações

---

## 📊 Tabela Completa de Ameaças

| ID | Vulnerabilidade | Fluxo DFD | Classe STRIDE | Descrição da Ameaça | Prob | Imp | Risco | Medida de Mitigação | Prob Res | Imp Res | Risco Res |
|----|-----------------|-----------|---------------|---------------------|------|-----|-------|---------------------|----------|---------|-----------|
| 1 | API Gateway sem autenticação | DF1: Usuário → API Gateway | Spoofing | Atacante pode enviar requisições falsas se passando por usuário legítimo | 8 | 9 | **72** | Implementar autenticação JWT ou OAuth 2.0 no API Gateway | 2 | 9 | 18 |
| 2 | Chave API Gemini exposta | DF4a: Agente Revisor → API Gemini | Information Disclosure | Chave da API do Gemini pode vazar se exposta no código ou logs | 7 | 10 | **70** | Usar variáveis de ambiente (.env) e nunca commitar no Git; adicionar .env no .gitignore | 2 | 10 | 20 |
| 3 | Comunicação HTTP sem criptografia | DF2: API Gateway → Agente Gerador | Tampering | Dados em trânsito podem ser interceptados e modificados | 6 | 8 | 48 | Implementar HTTPS/TLS em todas as comunicações entre microserviços | 1 | 8 | 8 |
| 4 | DoS no API Gateway | DF1: Usuário → API Gateway | Denial of Service | Múltiplas requisições podem sobrecarregar o Gateway e derrubar o serviço | 7 | 9 | **63** | Implementar rate limiting (ex: 100 req/min por IP) e timeout nas requisições | 3 | 9 | 27 |
| 5 | Injeção de prompt malicioso | DF2: API Gateway → Agente Gerador | Tampering | Usuário pode enviar tópicos maliciosos para manipular saída da IA | 8 | 7 | 56 | Sanitização de entrada; validação de caracteres; limitar tamanho do prompt | 3 | 7 | 21 |
| 6 | Container Ollama comprometido | DF2a: Agente Gerador → Ollama | Elevation of Privilege | Vulnerabilidade no container pode permitir acesso root ao host | 4 | 10 | 40 | Rodar containers em modo não-privilegiado; usar usuário não-root; scan de vulnerabilidades | 2 | 10 | 20 |
| 7 | Logs com dados sensíveis | Todos os fluxos | Information Disclosure | Logs podem conter rascunhos confidenciais ou chaves de API | 7 | 8 | 56 | Implementar log sanitization; não logar conteúdo completo; criptografar logs | 2 | 8 | 16 |
| 8 | Ausência de validação de entrada | DF1: Usuário → API Gateway | Tampering | Falta de validação pode permitir payloads malformados | 8 | 7 | 56 | Implementar validação de schema (ex: Joi/Zod); validar tipos e tamanhos | 2 | 7 | 14 |
| 9 | Serviço sem limite de recursos | P2: Agente Gerador / P3: Ollama | Denial of Service | Processamento de texto muito longo pode esgotar memória/CPU | 6 | 8 | 48 | Limitar tamanho máximo de entrada (ex: 5000 caracteres); timeout de 30s | 2 | 8 | 16 |
| 10 | Acesso não autorizado ao arquivo de padrões | DF3: API Gateway → Base de Regras | Information Disclosure | Arquivo com padrões da empresa pode ser acessado sem autorização | 5 | 6 | 30 | Implementar controle de acesso; não expor rota pública para /api/padroes | 1 | 6 | 6 |
| 11 | Dependências vulneráveis | Todos os containers (P1, P2, P4) | Elevation of Privilege | Bibliotecas desatualizadas podem conter CVEs conhecidas | 7 | 8 | 56 | Usar npm audit e pip check; atualizar dependências; scan com Snyk/Dependabot | 2 | 8 | 16 |
| 12 | Replay Attack | DF1: Usuário → API Gateway | Spoofing | Requisições antigas podem ser replicadas para obter mesmo resultado | 5 | 7 | 35 | Implementar nonce/timestamp nas requisições; validar token com expiração | 1 | 7 | 7 |
| 13 | Falta de monitoramento | Todos os processos (P1, P2, P4) | Repudiation | Impossível rastrear quem fez qual requisição em caso de incidente | 6 | 6 | 36 | Implementar logging centralizado com timestamp e identificador de usuário | 2 | 6 | 12 |
| 14 | CORS mal configurado | DF1: Usuário → API Gateway | Tampering | Origens não autorizadas podem fazer requisições ao Gateway | 6 | 7 | 42 | Configurar CORS com whitelist específica de origens permitidas | 2 | 7 | 14 |
| 15 | Ausência de timeout | DF2 e DF4: Gateway → Agentes | Denial of Service | Agente travado pode deixar requisição pendente indefinidamente | 7 | 7 | 49 | Implementar timeout de 30s em todas as chamadas HTTP entre serviços | 2 | 7 | 14 |
| 16 | Container sem health check | Todos os containers Docker | Denial of Service | Container travado continua rodando sem reiniciar automaticamente | 6 | 8 | 48 | Adicionar healthcheck no docker-compose.yml para cada serviço | 2 | 8 | 16 |
| 17 | Exposição de portas desnecessárias | Todos os containers → Host | Information Disclosure | Portas internas expostas podem ser exploradas por atacantes | 5 | 7 | 35 | Expor apenas portas necessárias; usar network interna do Docker | 1 | 7 | 7 |
| 18 | Falta de versionamento de API | DF1: Usuário → API Gateway | Repudiation | Mudanças quebram clientes sem aviso; dificulta auditoria | 4 | 5 | 20 | Implementar versionamento de API (ex: /api/v1/gerar-rascunho) | 1 | 5 | 5 |
| 19 | Modelo Ollama desatualizado | P3: Container Ollama | Elevation of Privilege | Versões antigas do modelo podem ter vulnerabilidades conhecidas | 5 | 7 | 35 | Atualizar regularmente imagem Ollama; usar tags específicas de versão | 2 | 7 | 14 |
| 20 | Falta de backup | D1: Base de Regras (regras.json) | Denial of Service | Perda do arquivo de padrões interrompe funcionamento do sistema | 4 | 9 | 36 | Implementar backup automático; versionamento no Git; redundância | 1 | 9 | 9 |

---

## 📖 Legenda

- **Prob** = Probabilidade (escala 1-10)
- **Imp** = Impacto (escala 1-10)
- **Risco** = Probabilidade × Impacto
- **Prob Res** = Probabilidade Residual (após mitigação)
- **Imp Res** = Impacto Residual (após mitigação)
- **Risco Res** = Risco Residual (após mitigação)

---

## 📈 Resumo da Análise

| Métrica | Valor |
|---------|-------|
| **Total de ameaças identificadas** | 20 |
| **Risco médio inicial** | ~45 |
| **Risco médio residual** | ~14 |
| **Redução média de risco** | ~69% |
| **Cobertura STRIDE** | Todas as 6 categorias |
| **Ameaças críticas (Risco > 60)** | 3 (IDs: 1, 2, 4) |

---

## 🎯 Distribuição por Categoria STRIDE

| Categoria | Quantidade | IDs |
|-----------|------------|-----|
| **Spoofing** (Falsificação) | 3 | #1, #12 |
| **Tampering** (Manipulação) | 5 | #3, #5, #8, #14 |
| **Repudiation** (Repúdio) | 2 | #13, #18 |
| **Information Disclosure** (Vazamento) | 4 | #2, #7, #10, #17 |
| **Denial of Service** (Negação) | 5 | #4, #9, #15, #16, #20 |
| **Elevation of Privilege** (Escalação) | 3 | #6, #11, #19 |

---

## 📁 Arquivo CSV

A versão CSV completa desta modelagem está disponível em: [`modelagem_de_ameacas.csv`](./modelagem_de_ameacas.csv)

---

## 📚 Referência Metodológica

**TORR, P.** "Demystifying the threat modeling process," *IEEE Security & Privacy*, vol. 3, no. 5, pp. 66-70, Sept.-Oct. 2005.
