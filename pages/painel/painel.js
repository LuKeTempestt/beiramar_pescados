document.addEventListener('DOMContentLoaded', () => {
  const totalEl = document.getElementById('total-estoque');
  const entradasEl = document.getElementById('entradas-hoje');
  const vencendoEl = document.getElementById('vencendo-hoje');
  const alertsContainer = document.getElementById('alerts-container');

  const produtos = JSON.parse(localStorage.getItem('estoque')) || [];

  // soma total em kg
  const totalKg = produtos.reduce((s, p) => s + (Number(p.qtd) || 0), 0);
  if (totalEl) totalEl.textContent = `${totalKg} kg`;

  // entradas hoje (produtos adicionados hoje)
  const hoje = new Date();
  const pad = n => String(n).padStart(2, '0');
  const hojeStr = `${hoje.getFullYear()}-${pad(hoje.getMonth()+1)}-${pad(hoje.getDate())}`;
  const entradasHoje = produtos.filter(p => p.createdAt === hojeStr).length;
  if (entradasEl) entradasEl.textContent = String(entradasHoje);
  // itens com validade igual a hoje
  const vencendoHoje = produtos.filter(p => p.validade === hojeStr).length;
  if (vencendoEl) vencendoEl.textContent = String(vencendoHoje);

  // montar alertas 
  if (alertsContainer) {
    alertsContainer.innerHTML = '';

    const importantes = produtos
      .slice()
      .sort((a,b) => {
        const score = s => (s.status === 'CRÍTICO' ? 0 : s.status === 'ATENÇÃO' ? 1 : 2);
        return score(a) - score(b);
      })
      .filter(p => p.status === 'CRÍTICO' || p.status === 'ATENÇÃO');

    if (importantes.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'alert-empty';
      empty.textContent = 'Nenhum produto com alerta de validade.';
      alertsContainer.appendChild(empty);
    } else {
      importantes.forEach(p => {
        const item = document.createElement('div');
        item.className = 'alert-item';

        const info = document.createElement('div');
        info.className = 'alert-info';

        const nome = document.createElement('div');
        nome.className = 'alert-product';
        nome.textContent = p.nome;

        const qtd = document.createElement('div');
        qtd.className = 'alert-quantity';
        qtd.textContent = `${p.qtd} kg`;

        info.appendChild(nome);
        info.appendChild(qtd);

        const data = document.createElement('div');
        data.className = 'alert-date';
        // formata dd/mm/YYYY
        if (p.validade) {
          const parts = p.validade.split('-');
          data.textContent = `Validade: ${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          data.textContent = 'Validade: -';
        }

        const status = document.createElement('div');
        status.className = `alert-status ${p.status === 'CRÍTICO' ? 'status-critical' : 'status-warning'}`;
        status.textContent = p.status;

        item.appendChild(info);
        item.appendChild(data);
        item.appendChild(status);

        alertsContainer.appendChild(item);
      });
    }
  }

  // INFORMAÇÕES DE PEDIDOS 
  function atualizarResumoPedidos() {
    const totalPedidosEl = document.getElementById('total-pedidos');
    const pedidosPendentesEl = document.getElementById('pedidos-pendentes');
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];

    if (totalPedidosEl) totalPedidosEl.textContent = String(pedidos.length);
    if (pedidosPendentesEl) {
      const pend = pedidos.filter(p => p.status === 'Pendente').length;
      pedidosPendentesEl.textContent = String(pend);
    }
  }

  // reagir a atualizações de pedidos
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'pedidos') {
      atualizarResumoPedidos();
    }
  });

  window.addEventListener('pedidosUpdated', () => {
    atualizarResumoPedidos();
  });

  // inicializa resumo de pedidos
  atualizarResumoPedidos();
});