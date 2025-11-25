document.addEventListener("DOMContentLoaded", () => {

            const gerarBtn = document.getElementById("gerar-btn");
            const topicosInput = document.getElementById("topicos-input");
            const resultadoTexto = document.getElementById("resultado-texto");
            const statusMsg = document.getElementById("status-msg");

            const apiUrl = "http://localhost:3000/api/gerar-rascunho";

            gerarBtn.addEventListener("click", async () => {

                const topicosTexto = topicosInput.value;

                if (!topicosTexto.trim()) {
                    alert("Por favor, insira pelo menos um tópico.");
                    return;
                }

                // 1. Converte o texto (um por linha)
                const topicosArray = topicosTexto.split('\n')
                                                .filter(topico => topico.trim() !== ''); // Remove linhas vazias

                if (topicosArray.length === 0) {
                    alert("Por favor, insira tópicos válidos.");
                    return;
                }

                // 2. Atualiza a interface para "Modo Carregando"
                gerarBtn.disabled = true;
                gerarBtn.textContent = "Gerando...";
                statusMsg.textContent = "Conectando ao Gateway e Agentes... (pode demorar na 1ª vez)";
                resultadoTexto.textContent = "";

                try {
                    // 3. Tenta chamar API
                    const token = localStorage.getItem("jwt_token");

                    const response = await fetch(apiUrl, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ topicos: topicosArray })
                    });

                    // 4. Verifica se a resposta foi um erro
                    if (!response.ok) {
                        throw new Error(`Erro HTTP! Status: ${response.status}`);
                    }

                    // 5. Se deu certo, pega o JSON da resposta
                    const data = await response.json();

                    // 6. Mostra o resultado final!
                    resultadoTexto.textContent = data.rascunho_final_revisado || data.rascunho_final; // Pega o rascunho
                    statusMsg.textContent = "Rascunho gerado e revisado com sucesso!";

                } catch (error) {
                    console.error("Erro ao chamar API:", error);
                    statusMsg.textContent = "Erro de conexão!";
                    resultadoTexto.textContent = `Falha ao conectar no Gateway (http://localhost:3000). Verifique se os containers estão rodando e veja o console (F12) para mais detalhes.`;
                } finally {
                    gerarBtn.disabled = false;
                    gerarBtn.textContent = "Gerar Rascunho";
                }
            });
        });