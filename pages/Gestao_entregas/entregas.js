document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-entregas');
    const statusFilter = document.getElementById('status-filter');
    const entregasBody = document.getElementById('entregas-body');
    const viewOverlay = document.getElementById('view-overlay-entrega');
    const viewContent = document.getElementById('view-content-entrega');
    const viewClose = document.getElementById('view-close-entrega');
    const confirmOverlay = document.getElementById('confirm-overlay-entrega');
    const confirmMessage = document.getElementById('confirm-message-entrega');
    const confirmOk = document.getElementById('confirm-ok-entrega');
    const confirmCancel = document.getElementById('confirm-cancel-entrega');

    let entregas = JSON.parse(localStorage.getItem('entregas')) || [
        { id: 1, pedido: 'PED-001', cliente: 'Restaurante Mar Azul', rota: 'Rota Centro', produtos: 'Atum (50kg), Pescada (30kg)', entrega: '2024-01-15', status: 'Em Rota', prioridade: 'Alta', valor: 'R$ 1.250,00' },
        { id: 2, pedido: 'PED-002', cliente: 'Mercado Bom Preço', rota: 'Rota Norte', produtos: 'Tilápia (100kg)', entrega: '2024-01-15', status: 'Pendente', prioridade: 'Média', valor: 'R$ 850,00' },
        { id: 3, pedido: 'PED-003', cliente: 'Hotel Vista Mar', rota: 'Rota Centro', produtos: 'Robalo (40kg), Camarão (20kg)', entrega: '2024-01-14', status: 'Entregue', prioridade: 'Normal', valor: 'R$ 2.100,00' }
    ];

    function atualizarTabela() {
        if (!entregasBody) return;

        const termo = searchInput ? searchInput.value.toLowerCase() : '';
        const statusSel = statusFilter ? statusFilter.value : 'Todos';

        let listaFiltrada = entregas.filter(e => {
            const matchTermo = `${e.pedido} ${e.cliente} ${e.rota}`.toLowerCase().includes(termo);
            const matchStatus = statusSel === 'Todos' || e.status === statusSel;
            return matchTermo && matchStatus;
        });

        entregasBody.innerHTML = listaFiltrada.length === 0 ?
            '<tr><td colspan="8" style="text-align:center;">Nenhuma entrega encontrada</td></tr>' : '';

        listaFiltrada.forEach(e => {
            const statusColors = { 'Pendente': 'yellow', 'Em Rota': 'blue', 'Entregue': 'green', 'Problema': 'red' };
            const prioridadeColors = { 'Alta': 'red', 'Média': 'yellow', 'Normal': 'green' };

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${e.pedido}</strong></td>
                <td><strong>${e.cliente}</strong><br><span class="subtext">${e.rota}</span></td>
                <td>${e.produtos}</td>
                <td>${e.entrega}</td>
                <td><span class="badge ${statusColors[e.status]}">${e.status}</span></td>
                <td><span class="badge ${prioridadeColors[e.prioridade]}">${e.prioridade}</span></td>
                <td><strong>${e.valor}</strong></td>
                <td>
                    <button class="icon-btn" onclick="visualizarEntrega(${e.id})">
                       👁️
                    </button>
                    <button class="icon-btn" onclick="alterarStatus(${e.id})">
                        <i class="fas fa-truck" style="color: #10b981;"></i>
                    </button>
                </td>
            `;
            entregasBody.appendChild(tr);
        });

        atualizarCards();
    }

    function atualizarCards() {
        const cards = document.querySelectorAll('.card-value');
        cards[0] && (cards[0].textContent = entregas.length);
        cards[1] && (cards[1].textContent = entregas.filter(e => e.status === 'Pendente').length);
        cards[2] && (cards[2].textContent = entregas.filter(e => e.status === 'Em Rota').length);
        cards[3] && (cards[3].textContent = entregas.filter(e => e.status === 'Entregue').length);
        cards[4] && (cards[4].textContent = entregas.filter(e => e.status === 'Problema').length);
    }

    window.visualizarEntrega = (id) => {
        const e = entregas.find(item => item.id === id);
        if (!e || !viewOverlay || !viewContent) return;

        viewContent.textContent = `Entrega: ${e.pedido}\nCliente: ${e.cliente}\nRota: ${e.rota}\nStatus: ${e.status}\nPrioridade: ${e.prioridade}\nProdutos: ${e.produtos}\nData: ${e.entrega}\nValor: ${e.valor}`;
        viewOverlay.style.display = 'flex';
    };

    function showConfirm(msg, callback) {
        if (!confirmOverlay || !confirmMessage) return;
        confirmMessage.textContent = msg;
        confirmOverlay.style.display = 'flex';

        confirmOk.onclick = () => {
            confirmOverlay.style.display = 'none';
            callback && callback(true);
        };
        confirmCancel.onclick = () => {
            confirmOverlay.style.display = 'none';
            callback && callback(false);
        };
    }

    window.alterarStatus = (id) => {
        const e = entregas.find(item => item.id === id);
        if (!e) return;

        showConfirm(`Alterar status de "${e.status}" para "Em Rota"?`, (ok) => {
            if (ok) {
                e.status = 'Em Rota';
                localStorage.setItem('entregas', JSON.stringify(entregas));
                atualizarTabela();
            } else {
                showConfirm(`Alterar para "Entregue"?`, (ok2) => {
                    if (ok2) {
                        e.status = 'Entregue';
                        localStorage.setItem('entregas', JSON.stringify(entregas));
                        atualizarTabela();
                    }
                });
            }
        });
    };

    window.concluirEntregaRota = (cliente, rota) => {
        showConfirm(`Confirmar conclusão da entrega para ${cliente}?`, (ok) => {
            if (ok) {
                showConfirm(`Entrega concluída! Avançando para próxima parada da ${rota}.`, () => {});
            }
        });
    };

    window.verDetalhesRota = (cliente, endereco, horario) => {
        if (!viewOverlay || !viewContent) return;

        viewContent.textContent = `Cliente: ${cliente}\nEndereço: ${endereco}\nHorário: ${horario}`;
        viewOverlay.style.display = 'flex';
    };

    viewClose?.addEventListener('click', () => {
        viewOverlay.style.display = 'none';
    });

    searchInput?.addEventListener('input', atualizarTabela);
    statusFilter?.addEventListener('change', atualizarTabela);
    atualizarTabela();
});
