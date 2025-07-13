// =================================================================
// INÍCIO DA LÓGICA DE SEGURANÇA
// =================================================================

const URL_BACKEND = ''; // URL do seu backend
const token = localStorage.getItem('jwtToken'); // 1. Recupera o token

// 2. Verifica se o token existe, se não, redireciona para o login
if (!token) {
    alert('Acesso negado. Por favor, faça o login.');
    window.location.href = 'login.html';
}

// =================================================================
// FIM DA LÓGICA DE SEGURANÇA
// =================================================================

/**
 * Função principal para a página de relatório de pedidos.
 */
async function iniciarPaginaRelatorio() {
    // --- 1. Referências aos Elementos do DOM ---
    const filtroMesEl = document.getElementById('filtroMes');
    const filtroAnoEl = document.getElementById('filtroAno');
    const areaResultados = document.getElementById('area-resultados');

    // --- 2. Funções de Interação com a API ---
    async function buscarPedidos(mes, ano) {
      try {
        const url = `${URL_BACKEND}/pedidos/filtrar?mes=${mes}&ano=${ano}`;
        // Adiciona o cabeçalho de autorização na requisição
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        const pedidos = await response.json();
        return pedidos.sort((a, b) => new Date(b.dataPedido) - new Date(a.dataPedido));
      } catch (error) {
        console.error('Erro ao buscar os pedidos:', error);
        return [];
      }
    }

    async function confirmarPedido(pedidoId) {
        if (!confirm('Deseja realmente confirmar este pedido?')) return;
        try {
            // Adiciona o cabeçalho de autorização na requisição
            const response = await fetch(`${URL_BACKEND}/pedidos/confirmar/${pedidoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Falha ao confirmar pedido: ${erro}`);
            }
            alert('Pedido confirmado com sucesso!');
            exibirRelatorio();
        } catch (error) {
            console.error('Erro ao confirmar pedido:', error);
            alert(`Não foi possível confirmar o pedido. ${error.message}`);
        }
    }

    async function cancelarPedido(pedidoId) {
        if (!confirm('TEM CERTEZA que deseja cancelar este pedido? Esta ação não pode ser desfeita.')) return;
        try {
            // Adiciona o cabeçalho de autorização na requisição
            const response = await fetch(`${URL_BACKEND}/pedidos/cancelar/${pedidoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Falha ao cancelar pedido: ${erro}`);
            }
            alert('Pedido cancelado com sucesso!');
            exibirRelatorio();
        } catch (error) {
            console.error('Erro ao cancelar pedido:', error);
            alert(`Não foi possível cancelar o pedido. ${error.message}`);
        }
    }

    // --- 3. Funções Auxiliares ---
    function inicializarFiltros() {
        const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        meses.forEach((mes, index) => {
            const option = document.createElement('option');
            option.value = index + 1;
            option.textContent = mes;
            filtroMesEl.appendChild(option);
        });
        const dataAtual = new Date();
        filtroMesEl.value = dataAtual.getMonth() + 1;
        filtroAnoEl.value = dataAtual.getFullYear();
    }

    async function exibirRelatorio() {
        const mesSelecionado = parseInt(filtroMesEl.value);
        const anoSelecionado = parseInt(filtroAnoEl.value);
        if (!mesSelecionado || !anoSelecionado) {
            alert("Por favor, selecione um mês e um ano válidos.");
            return;
        }

        areaResultados.innerHTML = `<p style="text-align: center;">Buscando pedidos...</p>`;
        const pedidosFiltrados = await buscarPedidos(mesSelecionado, anoSelecionado);
        areaResultados.innerHTML = '';

        if (pedidosFiltrados.length === 0) {
            areaResultados.innerHTML = `<p style="text-align: center;">Nenhum pedido encontrado para este mês e ano.</p>`;
        } else {
            pedidosFiltrados.forEach(pedido => {
                const cardClass = pedido.confirmado ? 'relatorio-pedido-card confirmado' : 'relatorio-pedido-card';
                const statusHtml = pedido.confirmado ? '<span class="status-confirmado">Confirmado</span>' : '<span class="status-pendente">Pendente</span>';

                let botoesAcaoHtml = '';
                if (!pedido.confirmado) {
                    botoesAcaoHtml = `
                        <button class="btn-acao btn-confirmar" data-id="${pedido.id}">Confirmar Pedido</button>
                        <button class="btn-acao btn-cancelar" data-id="${pedido.id}">Cancelar Pedido</button>
                    `;
                }

                const linhasDosItens = pedido.itens.map(item => `
                    <tr>
                        <td>${item.produto.nome}</td>
                        <td>${item.quantidade}</td>
                        <td>${item.precoUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                    </tr>
                `).join('');

                const dataFormatada = new Date(pedido.dataPedido).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

                const pedidoHtml = `
                    <div class="${cardClass}" data-pedido-id="${pedido.id}">
                        <div class="pedido-header">
                           <h3>Pedido #${pedido.id} - ${dataFormatada}</h3>

                           <div class="pedido-info-cliente">
                                <p><strong>Cliente:</strong> ${pedido.nome}</p>
                                <p><strong>Telefone:</strong> ${pedido.telefone}</p>
                           </div>

                           ${statusHtml}
                        </div>
                        <div class="tabela-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Quantidade</th>
                                        <th>Preço Unitário</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${linhasDosItens}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colspan="2">Valor Total do Pedido:</td>
                                        <td>${pedido.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div class="botoes-acao">
                            ${botoesAcaoHtml}
                        </div>
                    </div>
                `;
                areaResultados.insertAdjacentHTML('beforeend', pedidoHtml);
            });
        }
    }

    // --- 4. Inicialização e Event Listeners ---
    inicializarFiltros();
    filtroMesEl.addEventListener('change', exibirRelatorio);
    filtroAnoEl.addEventListener('change', exibirRelatorio);

    areaResultados.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-acao')) {
            const pedidoId = target.dataset.id;
            if (target.classList.contains('btn-confirmar')) {
                confirmarPedido(pedidoId);
            } else if (target.classList.contains('btn-cancelar')) {
                cancelarPedido(pedidoId);
            }
        }
    });

    exibirRelatorio();
}

// Inicia a execução do script
iniciarPaginaRelatorio();