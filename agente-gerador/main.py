from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import ollama
import os

#Configuração básica

app = FastAPI()

#Definir formato de dados esperados da entrada
class TopicosInput(BaseModel):
    topicos: list[str]

#Configuração do host do Ollama
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

#Inicializar cliente Ollama
client = ollama.Client(host=OLLAMA_HOST)

#Health check 
@app.get("/api/status")
def get_status():
    try:
        client.list()
        return {
            "status": "Agente Gerador Online",
            "service": "Agente 1 (Python + Ollama)",
            "ollama_connection": "OK"
        }
    except Exception as e:
        return {
            "status": "Agente Gerador Online",
            "service": "Agente 1 (Python + Ollama)",
            "ollama_connection": "Falhou",
            "error": str(e)
        }

#Rota para gerar conteúdo baseado em tópicos
@app.post("/generate")
async def generate_rascunho(entrada: TopicosInput):
    
    topicos_recebidos = entrada.topicos
    prompt = f"Gere um rascunho de e-mail profissional com base nos seguintes tópicos: {', '.join(topicos_recebidos)}. Seja direto e formal."

    try:
        print(f"Agente 1: Recebi tópicos. Chamando Ollama ({OLLAMA_HOST}) com o modelo 'phi3'...")
        
        response = client.chat(
            model='phi3', 
            messages=[
                {'role': 'user', 'content': prompt}
            ]
        )
        
        rascunho_gerado = response['message']['content']
        print("Agente 1: Ollama respondeu com sucesso.")
        
        # --- INÍCIO DA MODIFICAÇÃO MCP ---
        mcp_context = {
            "task": "Geração de Rascunho Inicial",
            "model": "phi3",
            "prompt": prompt,
            "output": rascunho_gerado
        }
        return {"rascunho": rascunho_gerado, "mcp": mcp_context}
        # --- FIM DA MODIFICAÇÃO MCP ---

    except Exception as e:
        print(f"ERRO no Agente 1 ao chamar Ollama: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Falha ao contatar o serviço de IA local (Ollama): {str(e)}"
        )