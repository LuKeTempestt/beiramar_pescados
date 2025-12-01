document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - inicializando produção...');
    
    const producaoBody = document.getElementById('producao-body');
    const searchInput = document.getElementById('search-producao');
    const statusFilter = document.getElementById('status-filter-producao');
    
    // Função principal para atualizar a produção
    function atualizarProducao() {
        console.log('=== ATUALIZANDO PRODUÇÃO ===');
        
        // Carregar pedidos
        const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
        console.log('Total de pedidos:', pedidos.length);
        
        // MOSTRAR TODOS OS PEDIDOS PARA DEBUG
        console.log('=== TODOS OS PEDIDOS ===');
        pedidos.forEach(p => {
            console.log(`${p.numero}: ${p.status}`);
        });
        
        // PRIMEIRO: Filtrar apenas pedidos em produção ou prontos
        let listaFiltrada = pedidos.filter(p => {
            const isProducaoOuPronto = p.status === 'Em Produção' || p.status === 'Pronto';
            return isProducaoOuPronto;
        });
        
        console.log('Após filtro produção/pronto:', listaFiltrada.length);
        
        // SEGUNDO: Aplicar filtro de status
        const statusSel = statusFilter ? statusFilter.value : 'Todos os status';
        console.log('Status selecionado:', statusSel);
        
        if (statusSel !== 'Todos os status') {
            listaFiltrada = listaFiltrada.filter(p => {
                const match = p.status === statusSel;
                return match;
            });
        }
        
        console.log('Após filtro de status:', listaFiltrada.length);
        
        // TERCEIRO: Aplicar filtro de busca
        const termo = searchInput ? searchInput.value.toLowerCase() : '';
        console.log('Termo de busca:', termo);
        
        if (termo !== '') {
            listaFiltrada = listaFiltrada.filter(p => {
                const texto = `${p.numero} ${p.cliente} ${p.produto} ${p.data} ${p.hora}`.toLowerCase();
                const match = texto.includes(termo);
                return match;
            });
        }
        
        console.log('Lista FINAL:', listaFiltrada);
        
        // Atualizar interface
        atualizarCards(pedidos);
        atualizarTabela(listaFiltrada);
    }
    
    // Atualizar cards do dashboard
    function atualizarCards(pedidos) {
        const total = pedidos.length;
        const emProducao = pedidos.filter(p => p.status === 'Em Produção').length;
        const prontos = pedidos.filter(p => p.status === 'Pronto').length;
        
        // Calcular transferidos hoje
        const hoje = new Date().toISOString().split('T')[0];
        const transferidosHoje = pedidos.filter(p => {
            if (p.dataInicioProducao) {
                const dataProducao = p.dataInicioProducao.split('T')[0];
                return dataProducao === hoje;
            }
            return false;
        }).length;
        
        // Atualizar elementos
        document.getElementById('total-pedidos').textContent = total;
        document.getElementById('em-producao').textContent = emProducao;
        document.getElementById('prontos').textContent = prontos;
        document.getElementById('transferidos-hoje').textContent = transferidosHoje;
    }
    
    // Atualizar tabela de produção - CORRIGIDA PARA O NOVO LAYOUT
    function atualizarTabela(pedidos) {
        if (!producaoBody) {
            console.error('producao-body não encontrado!');
            return;
        }
        
        producaoBody.innerHTML = '';
        
        if (pedidos.length === 0) {
            producaoBody.innerHTML = `
                <tr>
                    <td colspan="10" style="text-align: center; padding: 40px; color: #666;">
                        Nenhum pedido em produção no momento
                    </td>
                </tr>
            `;
            return;
        }
        
        pedidos.forEach(pedido => {
            const tr = document.createElement('tr');
            // CORREÇÃO: Ordem das colunas conforme o HTML
            tr.innerHTML = `
                <td>
                    ${pedido.numero}<br>
                    <span class="subtext">${formatDate(pedido.dataInicioProducao || pedido.createdAt)}</span>
                </td>
                <td>
                    <strong>${pedido.cliente}</strong>
                </td>
                <td>
                    ${pedido.produto || 'Sem produto'}
                </td>
                <td>
                    ${formatDate(pedido.data)}<br>
                    <span class="subtext">${pedido.hora || ''}</span>
                </td>
                <td>
                    ${pedido.quantidade || 0} kg
                </td>
                <td>
                    R$ ${pedido.valor.toFixed(2)}
                </td>
                <td><span class="badge ${badgeClass(pedido.status)}">${pedido.status}</span></td>
                <td><span class="badge ${badgePriority(pedido.prioridade)}">${pedido.prioridade}</span></td>
                <td>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${pedido.progresso || 0}%"></div>
                        </div>
                        <span class="progress-text">${pedido.progresso || 0}%</span>
                    </div>
                </td>
                <td style="text-align:center;">
                    ${pedido.status === 'Em Produção' ? 
                        `<button class="btn small success finalizar-btn" data-id="${pedido.id}">Finalizar</button>
                         <button class="btn small progresso-btn" data-id="${pedido.id}" data-progresso="25">25%</button>
                         <button class="btn small progresso-btn" data-id="${pedido.id}" data-progresso="50">50%</button>
                         <button class="btn small progresso-btn" data-id="${pedido.id}" data-progresso="75">75%</button>` : 
                        `<button class="btn small black reabrir-btn" data-id="${pedido.id}">Reabrir</button>`}
                </td>
            `;
            producaoBody.appendChild(tr);
        });
        
        // Adicionar event listeners aos botões dinâmicos
        adicionarEventListeners();
    }
    
    // Adicionar event listeners aos botões dinâmicos
    function adicionarEventListeners() {
        // Botão finalizar
        document.querySelectorAll('.finalizar-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                marcarComoPronto(id);
            });
        });
        
        // Botões de progresso
        document.querySelectorAll('.progresso-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                const progresso = parseInt(this.getAttribute('data-progresso'));
                atualizarProgresso(id, progresso);
            });
        });
        
        // Botão reabrir
        document.querySelectorAll('.reabrir-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const id = parseInt(this.getAttribute('data-id'));
                reabrirProducao(id);
            });
        });
    }
    
    // Funções auxiliares
    function formatDate(d) {
        if (!d) return '';
        if (d.includes('T')) {
            return d.split('T')[0].split('-').reverse().join('/');
        }
        return d.split('-').reverse().join('/');
    }
    
    function badgeClass(status) {
        if (status === 'Pendente') return 'yellow';
        if (status === 'Em Produção') return 'blue';
        if (status === 'Pronto') return 'green';
        return '';
    }
    
    function badgePriority(p) {
        if (p === 'Alta') return 'orange';
        if (p === 'Urgente') return 'red';
        return 'blue';
    }
    
    // Event listeners para filtros
    if (searchInput) {
        searchInput.addEventListener('input', atualizarProducao);
        console.log('Event listener adicionado ao searchInput');
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            console.log('Filtro de status alterado para:', this.value);
            atualizarProducao();
        });
        console.log('Event listener adicionado ao statusFilter');
    }
    
    // Escutar evento de atualização
    window.addEventListener('producaoUpdated', atualizarProducao);
    window.addEventListener('pedidosUpdated', atualizarProducao);
    
    // Inicializar a produção
    setTimeout(atualizarProducao, 100);
});

// Funções globais para os botões
function marcarComoPronto(id) {
    console.log('Marcando como pronto:', id);
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const idx = pedidos.findIndex(p => p.id === id);
    
    if (idx !== -1) {
        pedidos[idx].status = 'Pronto';
        pedidos[idx].emProducao = false;
        pedidos[idx].progresso = 100;
        
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        window.dispatchEvent(new CustomEvent('producaoUpdated'));
        window.dispatchEvent(new CustomEvent('pedidosUpdated'));
    }
}

function atualizarProgresso(id, progresso) {
    console.log('Atualizando progresso:', id, progresso);
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const idx = pedidos.findIndex(p => p.id === id);
    
    if (idx !== -1) {
        pedidos[idx].progresso = progresso;
        
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        window.dispatchEvent(new CustomEvent('producaoUpdated'));
    }
}

function reabrirProducao(id) {
    console.log('Reabrindo produção:', id);
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    const idx = pedidos.findIndex(p => p.id === id);
    
    if (idx !== -1) {
        pedidos[idx].status = 'Em Produção';
        pedidos[idx].emProducao = true;
        
        localStorage.setItem('pedidos', JSON.stringify(pedidos));
        window.dispatchEvent(new CustomEvent('producaoUpdated'));
        window.dispatchEvent(new CustomEvent('pedidosUpdated'));
    }
}

// CSS adicional para a barra de progresso
const style = document.createElement('style');
style.textContent = `
    .progress-container {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .progress-bar {
        flex: 1;
        height: 8px;
        background: #f0f0f0;
        border-radius: 4px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: #4CAF50;
        transition: width 0.3s ease;
    }
    .progress-text {
        font-size: 12px;
        color: #666;
        min-width: 30px;
    }
    .btn.small {
        padding: 4px 8px;
        font-size: 12px;
        margin: 2px;
    }
    .btn.success {
        background: #4CAF50;
        color: white;
    }
`;
document.head.appendChild(style);