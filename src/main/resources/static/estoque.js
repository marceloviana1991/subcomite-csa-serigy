// =================================================================
// INÍCIO DAS MODIFICAÇÕES DE SEGURANÇA
// =================================================================

const URL_BACKEND = ''; // URL do seu backend
const token = localStorage.getItem('jwtToken'); // 1. Recupera o token

// 2. Verifica se o token existe, se não, redireciona para o login
if (!token) {
    alert('Acesso negado. Por favor, faça o login.');
    window.location.href = 'login.html';
}

// =================================================================
// FIM DAS MODIFICAÇÕES DE SEGURANÇA
// =================================================================


// Função para buscar os produtos do seu backend
async function buscarProdutos() {
  try {
    // 3. Adiciona o cabeçalho de autorização na requisição
    const response = await fetch(URL_BACKEND + '/produtos', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    const produtos = await response.json();
    return produtos;
  } catch (error) {
    console.error('Erro ao buscar os produtos:', error);
    return [];
  }
}

// Função principal que organiza e executa a lógica da página
async function iniciarPaginaEstoque() {
    // --- 1. Referências aos Elementos do DOM ---
    const seletorCategorias = document.getElementById('seletorCategorias');
    const seletorProdutos = document.getElementById('seletorProdutos');
    const inputValor = document.getElementById('inputValor');
    const painelDetalhes = document.getElementById('painelDetalhes');
    const btnAcao = document.getElementById('btnAcao');

    // --- 2. Estado da Aplicação ---
    let produtos = await buscarProdutos();
    
    if (produtos.length === 0) {
        alert("Atenção: Não foi possível carregar os produtos.");
        return;
    }

    let produtosPorCategoria = produtos.reduce((acc, p) => {
        (acc[p.tipo] = acc[p.tipo] || []).push(p);
        return acc;
    }, {});

    let produtosPorId = produtos.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
    }, {});

    // --- 3. Funções ---
    
    function atualizarDetalhes() {
        const produtoId = seletorProdutos.value;
        const produto = produtosPorId[produtoId];

        if (!produto) {
            painelDetalhes.style.display = 'none';
            return;
        }

        const imgElement = document.getElementById('detalheImagem');
        if (produto.imagemUUID) {
            // 3. Para carregar a imagem com token, precisamos fazer um fetch e criar uma URL temporária
            fetch(URL_BACKEND + `/produtos/imagem/${produto.imagemUUID}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.blob())
            .then(blob => {
                imgElement.src = URL.createObjectURL(blob);
                imgElement.alt = produto.nome;
                imgElement.style.display = 'block';
            }).catch(err => {
                console.error("Erro ao carregar imagem:", err)
                imgElement.style.display = 'none';
            });

        } else {
            imgElement.src = '';
            imgElement.style.display = 'none';
        }
        document.getElementById('detalheNome').textContent = produto.nome;
        document.getElementById('detalheEstoque').textContent = produto.estoque;
        document.getElementById('detalhePreco').textContent = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        painelDetalhes.style.display = 'block';
    }

    // --- 4. Event Listeners ---

    seletorCategorias.addEventListener('change', () => {
        seletorProdutos.innerHTML = '<option value="" disabled selected>Selecione um produto</option>';
        const categoriaSelecionada = seletorCategorias.value;
        if (categoriaSelecionada) {
            const produtosDaCategoria = produtosPorCategoria[categoriaSelecionada] || [];
            produtosDaCategoria.forEach(produto => {
                const option = document.createElement('option');
                option.value = produto.id;
                option.textContent = produto.nome;
                seletorProdutos.appendChild(option);
            });
        }
        seletorProdutos.disabled = !categoriaSelecionada;
        seletorProdutos.dispatchEvent(new Event('change'));
    });

    seletorProdutos.addEventListener('change', () => {
        const produtoSelecionado = !!seletorProdutos.value;
        inputValor.disabled = !produtoSelecionado;
        btnAcao.disabled = !produtoSelecionado;
        atualizarDetalhes();
    });

    btnAcao.addEventListener('click', async () => {
        const produtoId = seletorProdutos.value;
        const quantidade = parseInt(inputValor.value);
        
        if (!produtoId) return alert("Por favor, selecione um produto.");
        if (!quantidade || quantidade <= 0) return alert("Por favor, informe uma quantidade válida.");
        
        btnAcao.disabled = true;
        btnAcao.textContent = 'Atualizando...';

        try {
            const url = URL_BACKEND + `/produtos/${produtoId}/estoque`;
            const corpoRequisicao = { quantidade: quantidade };

            // 3. Adiciona o cabeçalho de autorização na requisição PUT
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(corpoRequisicao)
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: `Erro no servidor: ${response.status}`}));
                throw new Error(erro.message || "Não foi possível processar a requisição.");
            }

            const produtoAtualizado = await response.json();
            produtosPorId[produtoAtualizado.id] = produtoAtualizado;
            atualizarDetalhes();
            alert(`Estoque de "${produtoAtualizado.nome}" atualizado para ${produtoAtualizado.estoque} unidades.`);

        } catch (error) {
            console.error("Erro ao atualizar o estoque:", error);
            alert(`Falha ao atualizar o estoque: ${error.message}`);
        } finally {
            btnAcao.disabled = false;
            btnAcao.textContent = "Adicionar em estoque";
        }
    });


    // --- 5. Inicialização ---
    seletorCategorias.innerHTML = '<option value="" disabled selected>Selecionar...</option>';
    const categoriasIniciais = Object.keys(produtosPorCategoria);
    categoriasIniciais.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        seletorCategorias.appendChild(option);
    });
}

iniciarPaginaEstoque();