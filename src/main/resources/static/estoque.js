// Função para buscar os produtos do seu backend
async function buscarProdutos() {
  try {
    const response = await fetch(URL_BACKEND+'/produtos');
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
            imgElement.src = URL_BACKEND+`/produtos/imagem/${produto.imagemUUID}`;
            imgElement.alt = produto.nome;
            imgElement.style.display = 'block';
        } else {
            imgElement.src = '';
            imgElement.style.display = 'none';
        }
        document.getElementById('detalheNome').textContent = produto.nome;
        document.getElementById('detalheEstoque').textContent = produto.estoque; // Será atualizado dinamicamente
        document.getElementById('detalhePreco').textContent = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        painelDetalhes.style.display = 'block';
    }

    // --- 4. Event Listeners ---

    seletorCategorias.addEventListener('change', () => {
        seletorProdutos.innerHTML = '<option value="" disabled selected>Aguardando categoria...</option>';
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

    // Listener do botão de ação com a lógica da requisição PUT
    btnAcao.addEventListener('click', async () => {
        const produtoId = seletorProdutos.value;
        const quantidade = parseInt(inputValor.value);
        
        if (!produtoId) {
            alert("Por favor, selecione um produto.");
            return;
        }
        if (!quantidade || quantidade < 0) {
            alert("Por favor, informe uma quantidade válida.");
            return;
        }
        
        // Desabilita o botão e mostra feedback
        btnAcao.disabled = true;
        btnAcao.textContent = 'Atualizando...';

        try {
            // 1. Monta a URL e o corpo da requisição
            const url = URL_BACKEND+`/produtos/${produtoId}/estoque`;
            const corpoRequisicao = { quantidade: quantidade };

            // 2. Executa a requisição PUT
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpoRequisicao)
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: `Erro no servidor: ${response.status}`}));
                throw new Error(erro.message || "Não foi possível processar a requisição.");
            }

            // 3. Em caso de sucesso, atualiza os dados na tela
            const produtoAtualizado = await response.json();
            
            // Atualiza o objeto no nosso mapa de produtos em memória
            produtosPorId[produtoAtualizado.id] = produtoAtualizado;
            
            // Atualiza o painel de detalhes com o novo valor de estoque
            atualizarDetalhes();

            alert(`${produtoAtualizado.estoque} unidades de "${produtoAtualizado.nome}" adicionadas ao estoque`);

        } catch (error) {
            console.error("Erro ao atualizar o estoque:", error);
            alert(`Falha ao atualizar o estoque: ${error.message}`);
        } finally {
            // 4. Reabilita o botão, independentemente do resultado
            btnAcao.disabled = false;
            btnAcao.textContent = "Adicionar em estoque";
        }
    });


    // --- 5. Inicialização ---
    const categoriasIniciais = Object.keys(produtosPorCategoria);
    categoriasIniciais.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria;
        option.textContent = categoria;
        seletorCategorias.appendChild(option);
    });
    
    seletorCategorias.dispatchEvent(new Event('change'));
}

iniciarPaginaEstoque();