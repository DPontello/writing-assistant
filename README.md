# 🧠 Assistente de Redação Distribuído — UFLA

### Projeto da disciplina **Sistemas Distribuídos** — Universidade Federal de Lavras (UFLA)

> Sistema distribuído com múltiplos agentes de IA que auxiliam na **padronização de textos e comunicações empresariais**.

---

## 🎯 Objetivo

Desenvolver um sistema distribuído composto por múltiplos agentes de Inteligência Artificial capazes de:
- Gerar rascunhos de e-mails, propostas e comunicados empresariais;
- Realizar revisão automática de tom, terminologia e clareza;
- Garantir consistência e padronização da comunicação em empresas juniores da UFLA.

---

## 🧪 Validação do Problema
Durante a fase de levantamento de requisitos, foram conduzidas entrevistas com membros de uma Empresa Júnior da UFLA, que relataram:
- Dificuldade em manter consistência em e-mails e propostas;
- Tempo excessivo gasto em revisões;
- Necessidade de um “controle de qualidade” automatizado.

---

## 🧩 Arquitetura Geral

O sistema é composto por **microserviços containerizados** que se comunicam entre si via **MCP/A2A (Message Broker)** e expõem uma **API REST** para integração com o usuário.

**Componentes:**
- **API Gateway (FastAPI)** — ponto de entrada e roteamento.
- **DraftAgent** — gera rascunhos iniciais com base em tópicos.
- **ReviewAgent** — revisa textos e aplica padronização (modelo local via Docker).
- **Message Broker** — comunicação entre agentes.
- **Banco de Dados** — armazenamento de histórico e glossário.

**Fluxo simplificado:**
1. O usuário envia os tópicos para o Gateway;
2. O DraftAgent gera um rascunho inicial;
3. O ReviewAgent revisa o texto com base no glossário da empresa;
4. O resultado é retornado ao usuário e salvo no banco.

---

**Justificativa da Arquitetura Proposta**

**1. Modularidade e Separação de Responsabilidades**

Cada componente do sistema tem uma função clara e isolada:
O API Gateway cuida apenas da interface com o usuário e roteamento de requisições.
O DraftAgent e o ReviewAgent tratam de partes distintas do processamento do texto (geração e revisão).
O Message Broker coordena a comunicação assíncrona entre os agentes.
O Banco de Dados centraliza o armazenamento e histórico.
Essa separação facilita a manutenção, testes e evolução independente de cada serviço, sem impactar o restante do sistema.

**2. Escalabilidade e Desempenho**
Ao adotar microserviços containerizados:
Cada agente pode ser escalado horizontalmente conforme a demanda.
Exemplo: se a geração de rascunhos for mais custosa, é possível subir múltiplas instâncias do DraftAgent sem alterar o resto do sistema.
A comunicação via Message Broker permite processamento assíncrono, evitando gargalos e possibilitando alta vazão (throughput).
Isso garante melhor uso de recursos, resiliência e capacidade de atender múltiplas requisições simultâneas.

**3. Desacoplamento entre Serviços**
A utilização de um Message Broker (MCP/A2A) como camada intermediária de comunicação:
Desacopla a lógica entre produtores e consumidores de mensagens.
Evita dependência direta entre microserviços.
Permite tolerância a falhas — se um agente estiver temporariamente indisponível, as mensagens permanecem na fila até que ele volte a operar.                       Isso aumenta a resiliência e reduz o risco de interrupção completa do sistema.

**4. Manutenibilidade e Evolução Tecnológica**

Como os serviços são independentes:
É possível atualizar o modelo do ReviewAgent (ex.: trocar por uma versão mais recente do modelo de NLP) sem alterar o restante.
O sistema pode evoluir gradualmente sem reescrever a arquitetura completa.
Isso reduz o custo de evolução e aumenta a longevidade do projeto.

## ⚙️ Tecnologias Utilizadas

--

---


