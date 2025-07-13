document.addEventListener('DOMContentLoaded', () => {

    // Defina a URL base do seu backend.
    const API_BASE_URL = '';

    // --- 1. Referências aos Elementos do DOM ---
    const seletorCategorias = document.getElementById('seletorCategorias');
    const seletorProdutos = document.getElementById('seletorProdutos');
    const formularioEdicao = document.getElementById('formularioEdicao');
    const formEdicaoCampos = document.getElementById('formEdicaoCampos');
    const inputNome = document.getElementById('inputNome');
    const inputPreco = document.getElementById('inputPreco');
    const inputEstoque = document.getElementById('inputEstoque'); // NOVO: Referência para o input de estoque
    const inputImagem = document.getElementById('inputImagem');
    const imagemPreview = document.getElementById('imagemPreview');
    const btnSalvar = document.getElementById('btnSalvar');
    const statusEdicao = document.getElementById('statusEdicao');

    // --- 2. Lógica de Autenticação ---
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Acesso negado. Por favor, faça o login primeiro.");
        window.location.href = 'index.html';
        return;
    }

    // --- 3. Funções Principais ---

    async function buscarProdutos() {
        try {
            const response = await fetch(`${API_BASE_URL}/produtos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('jwtToken');
                alert("Sessão expirada ou permissão negada. Faça o login novamente.");
                window.location.href = 'index.html';
                return null;
            }
            if (!response.ok) {
                throw new Error(`Erro ao buscar produtos: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(error);
            alert("Não foi possível carregar os produtos do servidor.");
            return null;
        }
    }

    /**
     * Preenche o formulário de edição com os dados do produto selecionado.
     */
    function preencherFormulario(produto) {
        if (!produto) {
            formularioEdicao.style.display = 'none';
            return;
        }
        inputNome.value = produto.nome;
        inputPreco.value = produto.preco;
        inputEstoque.value = produto.estoque; // MODIFICADO: Preenche o campo de estoque
        imagemPreview.src = produto.imagemUUID ? `${API_BASE_URL}/produtos/imagem/${produto.imagemUUID}` : '';
        inputImagem.value = '';
        formularioEdicao.style.display = 'flex';
    }

    /**
     * Envia os dados do formulário para a API para atualizar o produto.
     */
    async function salvarEdicao(event) {
        event.preventDefault();

        const produtoId = seletorProdutos.value;
        if (!produtoId) {
            alert("Nenhum produto selecionado.");
            return;
        }

        const formData = new FormData();
        // MODIFICADO: Adiciona o campo de estoque ao JSON
        const produtoJson = {
            nome: inputNome.value,
            preco: parseFloat(inputPreco.value),
            estoque: parseInt(inputEstoque.value, 10) // Converte o valor do estoque para um inteiro
        };

        formData.append('produto', JSON.stringify(produtoJson));

        if (inputImagem.files[0]) {
            formData.append('imagem', inputImagem.files[0]);
        }

        btnSalvar.disabled = true;
        btnSalvar.textContent = 'Salvando...';
        statusEdicao.textContent = 'Enviando dados...';
        statusEdicao.style.color = '#333';

        try {
            const url = `${API_BASE_URL}/produtos/${produtoId}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                const erro = await response.json().catch(() => ({ message: `Erro no servidor: ${response.status}` }));
                throw new Error(erro.message || "Não foi possível salvar as alterações.");
            }

            alert("Produto atualizado com sucesso!");
            window.location.reload();

        } catch (error) {
            console.error("Erro ao salvar o produto:", error);
            statusEdicao.textContent = `Falha ao salvar: ${error.message}`;
            statusEdicao.style.color = 'red';
            alert(`Falha ao salvar: ${error.message}`);
        } finally {
            btnSalvar.disabled = false;
            btnSalvar.textContent = 'Salvar Alterações';
        }
    }

    /**
     * Função de inicialização da página.
     */
    async function iniciarPagina() {
        const todosProdutos = await buscarProdutos();
        if (!todosProdutos) return;

        const produtosPorId = todosProdutos.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
        const produtosPorCategoria = todosProdutos.reduce((acc, p) => {
            (acc[p.tipo] = acc[p.tipo] || []).push(p);
            return acc;
        }, {});

        seletorCategorias.innerHTML = '<option value="" disabled selected>Selecione uma categoria</option>';
        Object.keys(produtosPorCategoria).forEach(categoria => {
            const option = document.createElement('option');
            option.value = categoria;
            option.textContent = categoria;
            seletorCategorias.appendChild(option);
        });

        seletorCategorias.addEventListener('change', (e) => {
            const categoriaSelecionada = e.target.value;
            const produtosDaCategoria = produtosPorCategoria[categoriaSelecionada] || [];

            seletorProdutos.innerHTML = '<option value="" disabled selected>Selecione um produto</option>';
            formularioEdicao.style.display = 'none';

            produtosDaCategoria.forEach(produto => {
                const option = document.createElement('option');
                option.value = produto.id;
                option.textContent = produto.nome;
                seletorProdutos.appendChild(option);
            });

            seletorProdutos.disabled = !categoriaSelecionada;
        });

        seletorProdutos.addEventListener('change', (e) => {
            const produtoId = e.target.value;
            const produto = produtosPorId[produtoId];
            preencherFormulario(produto);
        });

        formEdicaoCampos.addEventListener('submit', salvarEdicao);
    }

    // --- Execução Inicial ---
    iniciarPagina();
});