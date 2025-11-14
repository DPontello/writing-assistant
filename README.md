# 🧠 Assistente de Redação Distribuído — UFLA

### Projeto da disciplina **Sistemas Distribuídos** — Universidade Federal de Lavras (UFLA)

> Sistema distribuído com múltiplos agentes de IA que auxiliam na **padronização de textos e comunicações empresariais**, desenvolvido para a empresa júnior **Alfa Pública Jr**.

---

## 🧑‍💻 Desenvolvedores

- **Daniel de Jesus Moreira** - [danieLx77](https://github.com/danieLx77)
- **Hugo Dias Pontello** - [DPontello](https://github.com/DPontello)
- **João Guilherme Santos Ribeiro** - [joaogsribeiro](https://github.com/joaogsribeiro)
- **Ruan Pablo Gomes Rocha** - [FixRuan](https://github.com/FixRuan)

---

## 🎯 Objetivo

Desenvolver um sistema distribuído composto por múltiplos agentes de Inteligência Artificial capazes de:
- Gerar rascunhos de e-mails, propostas e comunicados empresariais.
- Realizar revisão automática de tom, terminologia e clareza.
- Garantir consistência e padronização da comunicação na empresa júnior **Alfa Pública Jr**.

---

## 🧪 Validação do Problema

### Identificação da Dor Junto ao Cliente

**Cliente Parceiro:** Alfa Pública Jr - Empresa Júnior da UFLA

**Metodologia de Validação:**
Durante a fase de levantamento de requisitos, realizamos uma consulta estruturada via Google Forms com a empresa para identificar as principais dores relacionadas à gestão de documentos e comunicação. A presidente da empresa priorizou a seguinte dor:

**Problema Selecionado: Padronização de Textos e Comunicações**
> "A elaboração de textos recorrentes, como e-mails de primeiro contato com clientes, minutas de propostas ou comunicados internos, pode variar em tom e qualidade. Garantir que todos sigam o padrão da empresa exige revisões manuais demoradas."

**Impactos Reportados:**
- Variação de tom e qualidade entre diferentes membros da equipe.
- Tempo excessivo gasto em revisões manuais.
- Desafio em manter consistência nas comunicações empresariais.

---

## 🧩 Arquitetura Geral

O sistema é composto por **microserviços containerizados** que se comunicam entre si via **API REST** e expõem uma API principal para integração com o usuário.

### Diagrama da Arquitetura (Visão Inicial)

![Arquitetura do Projeto](./docs/diagrama_arquitetura.png)

**Componentes:**
- **API Gateway (Node.js/Express)** — Ponto de entrada e orquestração.
- **Agente Gerador (Python/FastAPI)** — Gera rascunhos iniciais com base em tópicos, utilizando um modelo local.
- **Agente Revisor (Node.js/Express)** — Revisa textos e aplica padronização, utilizando uma API externa.
- **Ollama (Phi-3)** — Modelo de IA local, executado em um container Docker.
- **API do Gemini** — Modelo de IA externo para tarefas de revisão complexas.
- **Base de Regras (JSON)** — Armazena as regras de padronização da empresa.

**Fluxo Simplificado:**
1. O usuário envia os tópicos para o Gateway.
2. O Gateway solicita ao Agente Gerador que crie um rascunho usando o modelo local (Ollama).
3. O Gateway busca as regras de padronização e envia o rascunho junto com as regras para o Agente Revisor.
4. O Agente Revisor utiliza a API externa (Gemini) para adequar o texto.
5. O resultado final é retornado ao usuário.

---

### Justificativa da Arquitetura Proposta

**1. Modularidade e Separação de Responsabilidades**
Cada componente do sistema tem uma função clara e isolada. O API Gateway cuida da orquestração, enquanto os agentes tratam de partes distintas do processamento do texto (geração e revisão). Essa separação facilita a manutenção, testes e evolução independente de cada serviço.

**2. Escalabilidade e Desempenho**
Ao adotar microserviços containerizados, cada agente pode ser escalado horizontalmente conforme a demanda. Por exemplo, se a geração de rascunhos for mais custosa, é possível subir múltiplas instâncias do Agente Gerador sem alterar o resto do sistema.

**3. Desacoplamento entre Serviços**
A utilização de um API Gateway como orquestrador centraliza a lógica de comunicação, permitindo que os agentes operem de forma independente, sem conhecerem uns aos outros. Isso aumenta a resiliência e reduz o risco de interrupção completa do sistema.

**4. Manutenibilidade e Evolução Tecnológica**
Como os serviços são independentes, é possível atualizar o modelo do Agente Revisor (ex.: trocar por uma versão mais recente do Gemini) ou a linguagem de um agente sem reescrever a arquitetura completa, reduzindo o custo de evolução.

---

## 🔒 Modelagem de Ameaças (STRIDE)

A análise de segurança identificou 20 ameaças ao sistema, categorizadas pela metodologia **STRIDE** (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).

### Tabela Completa de Ameaças

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

**Legenda:**
- **Prob** = Probabilidade (1-10)
- **Imp** = Impacto (1-10)
- **Risco** = Probabilidade × Impacto
- **Prob Res** = Probabilidade Residual
- **Imp Res** = Impacto Residual
- **Risco Res** = Risco Residual

### Resumo da Análise

- **Total de ameaças identificadas:** 20
- **Redução média de risco:** ~69% (de ~45 para ~14)
- **Cobertura STRIDE:** Todas as 6 categorias contempladas
- **Ameaças críticas (Risco > 60):** 3 (IDs: 1, 2, 4)

*Arquivo CSV completo disponível em: [`docs/modelagem_de_ameacas.csv`](./docs/modelagem_de_ameacas.csv)*

---

## ⚙️ Tecnologias Utilizadas

| Categoria | Tecnologia | Propósito |
|-----------|------------|-----------|
| **Backend** | Node.js, Python | Desenvolvimento dos microsserviços |
| **Frameworks** | Express.js, FastAPI | Criação das APIs |
| **IA (Local)** | Ollama (Phi-3) | Geração de rascunhos |
| **IA (Externa)** | Google Gemini | Revisão e padronização |
| **Containerização**| Docker, Docker Compose | Empacotamento e orquestração dos serviços |
| **Comunicação** | API REST (HTTP) | Comunicação entre os microsserviços |

---

## 🚀 Como Executar o Projeto

**Pré-requisitos:**
- Docker e Docker Compose instalados.
- Arquivo `.env` na raiz do projeto com a chave `GEMINI_API_KEY`.

**Passos:**
1. Clone o repositório:
   ```bash
   git clone https://github.com/DPontello/writing-assistant.git
   ```
2. Navegue até a pasta do projeto:
   ```bash
   cd writing-assistant
   ```
3. Crie o arquivo `.env` e adicione sua chave da API do Gemini:
   ```
   GEMINI_API_KEY=SUA_CHAVE_AQUI
   ```
4. Suba os containers:
   ```bash
   docker-compose up --build
   ```
5. A API estará disponível em `http://localhost:3000`.

---

## 📚 Referências

As seguintes fontes comprovam a relevância do problema de padronização de comunicação e a validade da arquitetura de microsserviços e IA proposta para resolvê-lo:

1.  **BRASIL JÚNIOR.** Movimento Empresa Júnior - Confederação Brasileira de Empresas Juniores. Disponível em: `https://brasiljunior.org.br/conheca-o-mej`. Acesso em: 13 nov. 2025.
    > A Brasil Júnior representa mais de 500 empresas juniores no Brasil, confirmando que a Alfa Pública Jr faz parte de um ecossistema nacional que enfrenta desafios similares de padronização e profissionalização da comunicação empresarial.

2.  **GRAMMARLY.** Business Communication Solutions - AI Writing Assistant for Teams. Disponível em: `https://www.grammarly.com/business`. Acesso em: 13 nov. 2025.
    > Demonstra a demanda de mercado por ferramentas de assistência à escrita empresarial, com clientes reportando ROI de 17x e economia de $5.000 anuais por funcionário através da padronização da comunicação.

3.  **MCKINSEY & COMPANY.** The Economic Potential of Generative AI: The Next Productivity Frontier. McKinsey Global Institute, 2023. Disponível em: `https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/the-economic-potential-of-generative-ai-the-next-productivity-frontier`. Acesso em: 13 nov. 2025.
    > Estudo que identifica a assistência à escrita como uma das principais aplicações de IA generativa, com potencial de aumentar a produtividade em 20-25% em funções que envolvem comunicação empresarial.

4.  **RADICATI GROUP.** Email Statistics Report, 2023-2027. The Radicati Group, Inc., 2023.
    > Estima que 347 bilhões de e-mails são enviados diariamente no mundo, evidenciando a importância crítica da comunicação escrita nos negócios modernos.

5.  **HARVARD BUSINESS REVIEW.** The Cost of Poor Communications. Harvard Business Publishing, 2022.
    > Demonstra que empresas com mais de 100 funcionários perdem em média $420.000 por ano devido à má comunicação e falta de padronização em documentos empresariais.

6.  **FOWLER, Martin.** Microservices. 2014. Disponível em: `https://martinfowler.com/articles/microservices.html`. Acesso em: 13 nov. 2025.
    > Artigo seminal que define o padrão de arquitetura de Microsserviços, o qual foi adotado neste projeto para garantir a escalabilidade e a separação de responsabilidades entre os agentes de IA (Gerador e Revisor).

7.  **OLLAMA.** Ollama - Run LLMs Locally. Disponível em: `https://ollama.com/`. Acesso em: 13 nov. 2025.
    > Documentação da ferramenta utilizada para executar o modelo de IA local (Phi3), atendendo ao requisito do trabalho de um agente local e containerizado (Docker).


