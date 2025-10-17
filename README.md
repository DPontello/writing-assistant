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

## ⚙️ Tecnologias Utilizadas

--

---


