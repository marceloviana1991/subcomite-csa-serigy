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

// Função principal que organiza e executa toda a lógica da página
async function main() {
    // --- 1. Referências aos Elementos do DOM ---
    const seletorCategorias = document.getElementById('seletorCategorias');
    const seletorProdutos = document.getElementById('seletorProdutos');
    const inputQuantidade = document.getElementById('inputQuantidade');
    const painelDetalhes = document.getElementById('painelDetalhes');
    const btnAdicionar = document.getElementById('btnAdicionar');
    const corpoTabelaPedido = document.getElementById('corpoTabelaPedido');
    const totalPedidoEl = document.getElementById('totalPedido');
    const btnFinalizarPedido = document.getElementById('btnFinalizarPedido');
    const statusPedidoEl = document.getElementById('statusPedido');

    // --- 2. Estado da Aplicação ---
    let pedido = [];
    let produtos = [];
    let produtosPorCategoria = {};
    let produtosPorId = {};

    // --- 3. Funções ---

    /**
     * NOVO: Função reutilizável para buscar dados e preparar a aplicação.
     */
    async function carregarEPrepararDados() {
        produtos = await buscarProdutos();
        
        if (produtos.length === 0) {
            alert("Atenção: Não foi possível carregar os produtos. Verifique se o servidor backend está rodando e consulte o console (F12) para mais detalhes.");
            return;
        }

        // Mapeia os produtos para acesso rápido
        produtosPorCategoria = produtos.reduce((acc, p) => {
            (acc[p.tipo] = acc[p.tipo] || []).push(p);
            return acc;
        }, {});

        produtosPorId = produtos.reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
        }, {});

        // Limpa e popula o seletor de categorias
        seletorCategorias.innerHTML = '<option value="" disabled selected>Selecionar...</option>';
        const categoriasIniciais = Object.keys(produtosPorCategoria);
        categoriasIniciais.forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            seletorCategorias.appendChild(option);
        });
    }

    function renderizarPedido() { /* ...código idêntico à versão anterior... */ }
    function atualizarDetalhes() { /* ...código idêntico à versão anterior... */ }

    // --- 4. Event Listeners (Ouvintes de Eventos) ---

    seletorCategorias.addEventListener('change', () => { /* ...código idêntico... */ });
    seletorProdutos.addEventListener('change', () => { /* ...código idêntico... */ });
    inputQuantidade.addEventListener('input', atualizarDetalhes);
    btnAdicionar.addEventListener('click', () => { /* ...código idêntico... */ });
    corpoTabelaPedido.addEventListener('click', (event) => { /* ...código idêntico... */ });
    
    // Listener do botão de finalizar com a nova lógica de reset
    btnFinalizarPedido.addEventListener('click', async () => {
        if (pedido.length === 0) return;

        const itensParaEnvio = pedido.map(item => ({
            produtoId: item.id,
            quantidade: item.quantidade
        }));
        const corpoRequisicao = { itens: itensParaEnvio };

        statusPedidoEl.textContent = "Enviando pedido, por favor aguarde...";
        btnFinalizarPedido.disabled = true;

        try {
            const response = await fetch(URL_BACKEND+'/pedidos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(corpoRequisicao)
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}` }));
                throw new Error(erro.message || 'Ocorreu um erro no servidor.');
            }

            const pedidoCriado = await response.json();
            statusPedidoEl.textContent = "";
            alert(`Pedido #${pedidoCriado.id} realizado com sucesso!`);
            
            // --- AQUI ESTÁ A NOVA LÓGICA DE RESET ---

            // 1. Limpa o array do pedido e a tabela na tela
            pedido = [];
            renderizarPedido();

            // 2. Reseta os inputs para o estado inicial
            inputQuantidade.value = 1;
            seletorCategorias.value = ""; // Deixa a categoria em branco

            // 3. Busca os produtos novamente para atualizar o estoque
            await carregarEPrepararDados();

            // 4. Dispara o evento de 'change' para resetar a cadeia de seletores
            seletorCategorias.dispatchEvent(new Event('change'));

        } catch (error) {
            console.error("Erro ao finalizar pedido:", error);
            statusPedidoEl.textContent = `Erro: ${error.message}`;
            alert(`Não foi possível finalizar o pedido: ${error.message}`);
            btnFinalizarPedido.disabled = false; // Reabilita o botão em caso de erro
        }
    });

    // --- 5. Inicialização ---
    await carregarEPrepararDados(); // Chama a nova função na inicialização
    seletorCategorias.dispatchEvent(new Event('change'));
}


// Colando o código completo das funções que não mudaram para facilitar
function main_completo() {
    // Código omitido para brevidade, mas o script final deve conter tudo.
    // O código abaixo é a versão final e completa para copiar e colar.
}

// =========================================================================================
// VERSÃO FINAL COMPLETA PARA COPIAR E COLAR NO SEU script.js
// =========================================================================================
async function buscarProdutos_final() {
  try {
    const response = await fetch(URL_BACKEND+'/produtos');
    if (!response.ok) { throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`); }
    const produtos = await response.json();
    return produtos;
  } catch (error) {
    console.error('Erro ao buscar os produtos:', error);
    return [];
  }
}

async function main_final() {
    const seletorCategorias = document.getElementById('seletorCategorias');
    const seletorProdutos = document.getElementById('seletorProdutos');
    const inputQuantidade = document.getElementById('inputQuantidade');
    const painelDetalhes = document.getElementById('painelDetalhes');
    const btnAdicionar = document.getElementById('btnAdicionar');
    const corpoTabelaPedido = document.getElementById('corpoTabelaPedido');
    const totalPedidoEl = document.getElementById('totalPedido');
    const btnFinalizarPedido = document.getElementById('btnFinalizarPedido');
    const statusPedidoEl = document.getElementById('statusPedido');

    let pedido = [];
    let produtos = [];
    let produtosPorCategoria = {};
    let produtosPorId = {};

    async function carregarEPrepararDados() {
        produtos = await buscarProdutos_final();
        if (produtos.length === 0) {
            alert("Atenção: Não foi possível carregar os produtos. Verifique se o servidor backend está rodando e consulte o console (F12) para mais detalhes.");
            return;
        }
        produtosPorCategoria = produtos.reduce((acc, p) => { (acc[p.tipo] = acc[p.tipo] || []).push(p); return acc; }, {});
        produtosPorId = produtos.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
        seletorCategorias.innerHTML = '<option value="" disabled selected>Selecionar...</option>';
        Object.keys(produtosPorCategoria).forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            seletorCategorias.appendChild(option);
        });
    }

    function renderizarPedido() {
        corpoTabelaPedido.innerHTML = '';
        let totalGeral = 0;
        pedido.forEach(item => {
            const produto = produtosPorId[item.id];
            if (!produto) return; // Segurança caso o produto não seja encontrado
            const linha = document.createElement('tr');
            const subtotal = produto.preco * item.quantidade;
            totalGeral += subtotal;
            linha.innerHTML = `<td>${produto.nome}</td><td>${item.quantidade}</td><td>${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td><td><button class="btn-remover" data-id="${item.id}">Remover</button></td>`;
            corpoTabelaPedido.appendChild(linha);
        });
        totalPedidoEl.textContent = totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        btnFinalizarPedido.disabled = pedido.length === 0;
    }

    function atualizarDetalhes() {
        const produtoId = seletorProdutos.value;
        const produto = produtosPorId[produtoId];
        if (!produto) { painelDetalhes.style.display = 'none'; return; }
        const quantidade = parseInt(inputQuantidade.value) || 1;
        const total = produto.preco * quantidade;
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
        document.getElementById('detalheEstoque').textContent = produto.estoque;
        document.getElementById('detalhePreco').textContent = produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('detalheTotal').textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        painelDetalhes.style.display = 'block';
    }

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
        inputQuantidade.disabled = !produtoSelecionado;
        btnAdicionar.disabled = !produtoSelecionado;
        atualizarDetalhes();
    });

    inputQuantidade.addEventListener('input', atualizarDetalhes);

    btnAdicionar.addEventListener('click', () => {
        const produtoId = seletorProdutos.value;
        const quantidadeDesejada = parseInt(inputQuantidade.value);
        const produto = produtosPorId[produtoId];
        if (!produto || !quantidadeDesejada || quantidadeDesejada < 1) { alert('Por favor, selecione um produto e uma quantidade válida.'); return; }
        const itemNoPedido = pedido.find(item => item.id.toString() === produtoId);
        const quantidadeJaNoPedido = itemNoPedido ? itemNoPedido.quantidade : 0;
        if ((quantidadeDesejada + quantidadeJaNoPedido) > produto.estoque) { alert(`Erro: Quantidade solicitada excede o estoque.\nEstoque disponível: ${produto.estoque}\nVocê já tem: ${quantidadeJaNoPedido} no pedido\nVocê tentou adicionar: ${quantidadeDesejada}`); return; }
        if (itemNoPedido) { itemNoPedido.quantidade += quantidadeDesejada; } else { pedido.push({ id: parseInt(produtoId), quantidade: quantidadeDesejada }); }
        renderizarPedido();
    });

    corpoTabelaPedido.addEventListener('click', (event) => {
        if (event.target.classList.contains('btn-remover')) {
            const produtoIdToRemove = event.target.dataset.id;
            pedido = pedido.filter(item => item.id.toString() !== produtoIdToRemove);
            renderizarPedido();
        }
    });

    btnFinalizarPedido.addEventListener('click', async () => {
        if (pedido.length === 0) return;
        const itensParaEnvio = pedido.map(item => ({ produtoId: item.id, quantidade: item.quantidade }));
        const corpoRequisicao = { itens: itensParaEnvio };
        statusPedidoEl.textContent = "Enviando pedido, por favor aguarde...";
        btnFinalizarPedido.disabled = true;
        try {
            const response = await fetch(URL_BACKEND+'/pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpoRequisicao) });
            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: `Erro ${response.status}: ${response.statusText}` }));
                throw new Error(erro.message || 'Ocorreu um erro no servidor.');
            }
            const pedidoCriado = await response.json();
            statusPedidoEl.textContent = "";
            alert(`Pedido #${pedidoCriado.id} realizado com sucesso!`);
            
            pedido = [];
            renderizarPedido();
            inputQuantidade.value = 1;
            
            await carregarEPrepararDados();
            seletorCategorias.value = "";
            seletorCategorias.dispatchEvent(new Event('change'));

        } catch (error) {
            console.error("Erro ao finalizar pedido:", error);
            statusPedidoEl.textContent = `Erro: ${error.message}`;
            alert(`Não foi possível finalizar o pedido: ${error.message}`);
            btnFinalizarPedido.disabled = false;
        }
    });

    await carregarEPrepararDados();
    seletorCategorias.dispatchEvent(new Event('change'));
}

main_final();

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('nav-links');

    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});