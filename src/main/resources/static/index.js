// A ÚNICA MUDANÇA ESTÁ NESTA LINHA
const apiUrl = '';

let telefone; 

const promiseProdutos = fetch(apiUrl + '/produtos', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  }
}).then(response => {
  if (!response.ok) throw new Error('Falha ao buscar produtos');
  return response.json();
});

const promiseContato = fetch(apiUrl + '/admin/contato', {
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  }
}).then(response => {
  if (!response.ok) throw new Error('Falha ao buscar contato');
  return response.json();
});

Promise.all([promiseProdutos, promiseContato])
  .then(([produtosJson, contatoJson]) => {
    telefone = contatoJson.telefone; 
    const json = produtosJson;
    const tiposDeProduto = [...new Set(json.map(produto => produto.tipo))];

    const seletorCategorias = document.getElementById('seletorCategorias');
    const seletorProdutos = document.getElementById('seletorProdutos');
    const inputQuantidade = document.getElementById('inputQuantidade');
    const painelDetalhes = document.getElementById('painelDetalhes');
    const btnAdicionar = document.getElementById('btnAdicionar');
    const corpoTabelaPedido = document.getElementById('corpoTabelaPedido');
    const totalPedidoElemento = document.getElementById('totalPedido');
    const btnFinalizarPedido = document.getElementById('btnFinalizarPedido');
    const statusPedidoEl = document.getElementById('status-pedido'); 

    painelDetalhes.style.display = 'none';
    inputQuantidade.disabled = true;
    inputQuantidade.value = 1;
    btnAdicionar.disabled = true;
    seletorProdutos.disabled = true;
    btnFinalizarPedido.disabled = true;

    seletorCategorias.innerHTML = '<option value="" selected>Selecionar...</option>';
    tiposDeProduto.forEach(tipo => {
      const novaOpcao = document.createElement('option');
      novaOpcao.value = tipo;
      novaOpcao.textContent = tipo;
      seletorCategorias.appendChild(novaOpcao);
    });

    const dicionarioDeTipos = tiposDeProduto.reduce((acumulador, tipo) => {
      acumulador[tipo] = [];
      return acumulador;
    }, {});
    json.forEach(produto => {
      if (dicionarioDeTipos[produto.tipo]) {
        dicionarioDeTipos[produto.tipo].push(produto);
      }
    });

    seletorCategorias.addEventListener('change', (event) => {
      const valorSelecionado = event.target.value;
      seletorProdutos.innerHTML = '<option value="" disabled selected>Selecione um produto...</option>';
      dicionarioDeTipos[valorSelecionado].forEach(produto => {
        const novaOpcao = document.createElement('option');
        novaOpcao.value = produto.nome;
        novaOpcao.textContent = produto.nome;
        seletorProdutos.appendChild(novaOpcao);
      });
      seletorProdutos.disabled = false;
      painelDetalhes.style.display = 'none';
      btnAdicionar.disabled = true;
      inputQuantidade.disabled = true;
      inputQuantidade.value = 1;
    });

    seletorProdutos.addEventListener('change', () => {
      const categoriaSelecionada = seletorCategorias.value;
      const produtoEscolhido = dicionarioDeTipos[categoriaSelecionada].find(p => p.nome == seletorProdutos.value);

      const detalheImagem = document.getElementById('detalheImagem');
      const detalheNome = document.getElementById('detalheNome');
      const detalhePreco = document.getElementById('detalhePreco');
      const detalheEstoque = document.getElementById('detalheEstoque');
      const detalheTotal = document.getElementById('detalheTotal');

      fetch(`${apiUrl}/produtos/imagem/${produtoEscolhido.imagemUUID}`, {
        headers: { 'Accept': 'image/*' },
        mode: 'cors'
      })
      .then(async res => {
        if (!res.ok) throw new Error("Imagem inválida");
        const blob = await res.blob();
        detalheImagem.src = URL.createObjectURL(blob);
      })
      .catch(err => console.error("Erro imagem:", err));

      detalheNome.textContent = produtoEscolhido.nome;
      detalhePreco.textContent = `R$ ${produtoEscolhido.preco.toFixed(2)}`;
      detalheEstoque.textContent = produtoEscolhido.estoque;
      const quantidade = parseInt(inputQuantidade.value, 10);
      detalheTotal.textContent = `R$ ${(produtoEscolhido.preco * quantidade).toFixed(2)}`;
      painelDetalhes.style.display = 'block';
      inputQuantidade.disabled = false;
      btnAdicionar.disabled = false;
    });

    inputQuantidade.addEventListener('change', () => {
      const categoriaSelecionada = seletorCategorias.value;
      const produtoEscolhido = dicionarioDeTipos[categoriaSelecionada].find(p => p.nome == seletorProdutos.value);
      const detalheTotal = document.getElementById('detalheTotal');
      const quantidade = parseInt(inputQuantidade.value, 10);
      detalheTotal.textContent = `R$ ${(produtoEscolhido.preco * quantidade).toFixed(2)}`;
    });

    btnAdicionar.addEventListener('click', () => {
        const categoriaSelecionada = seletorCategorias.value;
        const produtoEscolhido = dicionarioDeTipos[categoriaSelecionada].find(p => p.nome == seletorProdutos.value);
        const quantidade = parseInt(inputQuantidade.value, 10);

        if (!produtoEscolhido || quantidade < 1) return;

        let quantidadeJaAdicionada = 0;
        for (const linha of corpoTabelaPedido.children) {
            if (linha.children[0].textContent === produtoEscolhido.nome) {
            quantidadeJaAdicionada += parseInt(linha.children[1].textContent, 10);
            }
        }

        if ((quantidadeJaAdicionada + quantidade) > produtoEscolhido.estoque) {
            alert(`Quantidade insuficiente. Estoque disponível: ${produtoEscolhido.estoque}`);
            return;
        }

        const subtotal = produtoEscolhido.preco * quantidade;
        const novaLinha = document.createElement('tr');
        novaLinha.setAttribute('data-produto-id', produtoEscolhido.id);
        novaLinha.innerHTML = `
            <td>${produtoEscolhido.nome}</td>
            <td>${quantidade}</td>
            <td>R$ ${subtotal.toFixed(2)}</td>
            <td><button class="btn-remover">Remover</button></td>
        `;
        novaLinha.querySelector('.btn-remover').addEventListener('click', () => {
            novaLinha.remove();
            atualizarTotalPedido();
        });
        corpoTabelaPedido.appendChild(novaLinha);
        atualizarTotalPedido();

        // --- INÍCIO DA LÓGICA DE LIMPEZA APÓS ADICIONAR ---
        // Reseta o formulário de seleção de produto para o estado inicial,
        // permitindo que um novo produto seja adicionado em seguida.

        // 1. Reseta o seletor de categorias para a opção padrão
        seletorCategorias.value = "";

        // 2. Limpa e desabilita o seletor de produtos
        seletorProdutos.innerHTML = '<option value="" disabled selected>Selecione um produto...</option>';
        seletorProdutos.disabled = true;

        // 3. Esconde o painel de detalhes do produto
        painelDetalhes.style.display = 'none';

        // 4. Reseta e desabilita o campo de quantidade
        inputQuantidade.value = 1;
        inputQuantidade.disabled = true;

        // 5. Desabilita o próprio botão de adicionar
        btnAdicionar.disabled = true;
        // --- FIM DA LÓGICA DE LIMPEZA ---
    });


    btnFinalizarPedido.addEventListener('click', () => {
        if (corpoTabelaPedido.children.length === 0) {
          alert('O pedido está vazio.');
          return;
        }

        // --- MUDANÇA AQUI: Captura os novos dados ---
        const nomeCliente = document.getElementById('inputNome').value;
        const telefoneCliente = document.getElementById('inputTelefone').value;

        // Validação simples para garantir que os campos foram preenchidos
        if (!nomeCliente || !telefoneCliente) {
            alert('Por favor, preencha seu nome e telefone para continuar.');
            return;
        }
        // --- FIM DA MUDANÇA ---

        btnFinalizarPedido.disabled = true;
        if (statusPedidoEl) statusPedidoEl.textContent = 'Registrando pedido no sistema...';

        const itensDoPedido = [];
        for (const linha of corpoTabelaPedido.children) {
          itensDoPedido.push({
            produtoId: parseInt(linha.dataset.produtoId, 10),
            quantidade: parseInt(linha.children[1].textContent, 10)
          });
        }

        // --- MUDANÇA AQUI: Adiciona os novos dados ao corpo da requisição ---
        const corpoDaRequisicao = {
          nome: nomeCliente,
          telefone: telefoneCliente,
          itens: itensDoPedido
        };
        // --- FIM DA MUDANÇA ---

        fetch(apiUrl + '/pedidos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(corpoDaRequisicao)
        })
        .then(response => {
          if (!response.ok) {
            return response.json().then(err => {
              throw new Error(err.message || 'Erro no servidor. Verifique os dados enviados.')
            });
          }
           return response.json();
        })
        .then(pedidoCriado => {
          // O resto do código continua igual, pois ele já usa a variável 'telefone' global
          // que é buscada da API de contato, e não o telefone digitado pelo cliente.

          if (statusPedidoEl) statusPedidoEl.textContent = 'Pedido registrado! Abrindo WhatsApp...';

          const idDoPedido = pedidoCriado ? pedidoCriado.id : 'sem ID';
          alert(`Pedido salvo com sucesso! ID: ${idDoPedido}. Agora vamos abrir o WhatsApp.`);

          let mensagem = `*Confirmação de Pedido Nº ${idDoPedido}*\n\n`;
          mensagem += `*Cliente:* ${nomeCliente}\n`; // Adicionamos o nome do cliente na mensagem
          mensagem += `*Contato:* ${telefoneCliente}\n\n`; // Adicionamos o telefone do cliente

          for (const linha of corpoTabelaPedido.children) {
            const nome = linha.children[0].textContent;
            const quantidade = linha.children[1].textContent;
            const subtotal = linha.children[2].textContent;
            mensagem += `• ${nome} - ${quantidade} un. - ${subtotal}\n`;
          }
          mensagem += `\n*Total:* ${totalPedidoElemento.textContent}`;

          // A variável 'telefone' aqui se refere ao telefone do administrador para onde a msg será enviada
          const urlWhatsApp = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
          window.open(urlWhatsApp, '_blank');

          // Limpa a tela
          corpoTabelaPedido.innerHTML = '';
          atualizarTotalPedido();
          seletorCategorias.value = "";
          seletorProdutos.innerHTML = '';
          seletorProdutos.disabled = true;
          painelDetalhes.style.display = 'none';
          document.getElementById('inputNome').value = ''; // Limpa o campo nome
          document.getElementById('inputTelefone').value = ''; // Limpa o campo telefone

        })
        .catch(error => {
          console.error('Erro ao finalizar pedido:', error);
          alert(`Houve um erro ao salvar o pedido no sistema: ${error.message}`);
          if (statusPedidoEl) statusPedidoEl.textContent = 'Falha ao registrar.';
        })
        .finally(() => {
          if (corpoTabelaPedido.children.length > 0) {
            btnFinalizarPedido.disabled = false;
          }
        });
    });

    function atualizarTotalPedido() {
      let somaTotal = 0;
      for (const linha of corpoTabelaPedido.children) {
        const subtotalTexto = linha.children[2].textContent;
        const valor = parseFloat(subtotalTexto.replace('R$ ', '').replace(',', '.'));
        somaTotal += valor;
      }
      totalPedidoElemento.textContent = `R$ ${somaTotal.toFixed(2)}`;
      btnFinalizarPedido.disabled = corpoTabelaPedido.children.length === 0;
    }
  })
  .catch(error => {
    console.error('Erro ao carregar dados iniciais:', error);
    alert('Não foi possível carregar os dados do servidor. A página pode não funcionar corretamente.');
  });