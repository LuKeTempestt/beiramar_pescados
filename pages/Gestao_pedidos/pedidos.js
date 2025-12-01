document.addEventListener('DOMContentLoaded', () => {
  const addBtns = Array.from(document.querySelectorAll('.add-product-btn'));
  const viewOverlay = document.getElementById('view-overlay-pedido');
  const viewContent = document.getElementById('view-content-pedido');
  const viewClose = document.getElementById('view-close-pedido');
  const popup = document.getElementById('popup-overlay-pedido');
  const cancelBtn = document.getElementById('cancelar-popup-pedido');
  const salvarBtn = document.getElementById('salvar-pedido');
  const tableBody = document.querySelector('.orders-body');
  const searchInput = document.getElementById('orders-search');

  let pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
  let editId = null;

  function emitirAtualizacao() {
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    window.dispatchEvent(new CustomEvent('pedidosUpdated'));
    window.dispatchEvent(new CustomEvent('producaoUpdated'));
  }

  // Função para carregar clientes no select
  function carregarClientesNoSelect() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    const selectCliente = document.getElementById('pedido-cliente');

    if (!selectCliente) {
      return;
    }

    selectCliente.innerHTML = '';

    if (clientes.length === 0) {
      return;
    }

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.nome;
      option.textContent = cliente.nome;
      selectCliente.appendChild(option);
    });
  }

  // mostrar popup para criar (vincula todos os botões possíveis)
  addBtns.forEach(btn => btn && btn.addEventListener('click', () => {
    editId = null;
    document.getElementById('popup-title').textContent = 'Adicionar Pedido';
    carregarClientesNoSelect();
    document.getElementById('pedido-cliente').value = '';
    document.getElementById('produto-nome').value = 'Atum';
    document.getElementById('produto-qtd').value = '';
    document.getElementById('pedido-data').value = '';
    document.getElementById('pedido-hora').value = '';
    document.getElementById('pedido-status').value = 'Pendente';
    document.getElementById('pedido-prioridade').value = 'Média';
    document.getElementById('pedido-valor').value = '';
    popup.style.display = 'flex';
  }));

  cancelBtn && cancelBtn.addEventListener('click', () => {
    popup.style.display = 'none';
  });

  salvarBtn && salvarBtn.addEventListener('click', () => {
    const cliente = document.getElementById('pedido-cliente').value.trim();
    const produto = document.getElementById('produto-nome').value;
    const quantidade = parseFloat(document.getElementById('produto-qtd').value) || 0;
    const data = document.getElementById('pedido-data').value;
    const hora = document.getElementById('pedido-hora').value;
    const status = document.getElementById('pedido-status').value;
    const prioridade = document.getElementById('pedido-prioridade').value;
    const valor = parseFloat(document.getElementById('pedido-valor').value) || 0;

    if (!cliente || !data || !produto || quantidade <= 0) {
      customAlert('Preencha cliente, produto, quantidade e data de entrega!');
      return;
    }

    if (editId) {
      pedidos = pedidos.map(p => p.id === editId ? { 
        ...p, 
        cliente, 
        produto, 
        quantidade, 
        data, 
        hora, 
        status, 
        prioridade, 
        valor 
      } : p);
    } else {
      const id = Date.now();
      const createdAt = (() => {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
      })();
      
      pedidos.push({ 
        id, 
        numero: `PED-${String(id).slice(-6)}`, 
        cliente, 
        produto,
        quantidade,
        data, 
        hora, 
        status, 
        prioridade, 
        valor, 
        createdAt,
        emProducao: false,
        dataInicioProducao: null,
        lote: '',
        progresso: 0
      });
    }

    emitirAtualizacao();
    atualizarTabela();
    popup.style.display = 'none';
  });

  function atualizarCardsResumo() {
    const cards = document.querySelectorAll('.dashboard-grid .card');
    const total = pedidos.length;
    const pendentes = pedidos.filter(p => p.status === 'Pendente').length;
    const producao = pedidos.filter(p => p.status === 'Em Produção').length;
    const prontos = pedidos.filter(p => p.status === 'Pronto').length;

    if (cards && cards.length >= 4) {
      cards[0].querySelector('.card-value').textContent = String(total);
      cards[1].querySelector('.card-value').textContent = String(pendentes);
      cards[2].querySelector('.card-value').textContent = String(producao);
      cards[3].querySelector('.card-value').textContent = String(prontos);
    }
  }

  function atualizarTabela() {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    // aplicando filtros atuais
    const termo = (searchInput && searchInput.value || '').toLowerCase();

    const lista = pedidos.filter(p => {
      const texto = `${p.numero} ${p.cliente} ${p.produto} ${p.data} ${p.hora} ${p.status} ${p.prioridade} ${p.valor}`.toLowerCase();
      const matchTerm = termo === '' ? true : texto.includes(termo);
      return matchTerm;
    });

    lista.forEach(p => {
      const tr = document.createElement('tr');
      // NOVA ORDEM: Número, Cliente, Produto, Quantidade, Data Entrega, Status, Prioridade, Valor Total, Ações
      tr.innerHTML = `
        <td>${p.numero}</td>
        <td><strong>${p.cliente}</strong></td>
        <td>${p.produto}</td>
        <td>${p.quantidade} kg</td>
        <td>${formatDate(p.data)}<br><span class="subtext">${p.hora || ''}</span></td>
        <td><span class="badge ${badgeClass(p.status)}">${p.status}</span></td>
        <td><span class="badge ${badgePriority(p.prioridade)}">${p.prioridade}</span></td>
        <td>R$ ${p.valor.toFixed(2)}</td>
        <td style="text-align:center;">
          <button class="icon-btn view-btn" data-id="${p.id}" title="Ver">👁️</button>
          <button class="icon-btn edit-btn" data-id="${p.id}" title="Editar">✏️</button>
          <button class="icon-btn delete-btn" data-id="${p.id}" title="Remover">🗑️</button>
        </td>
      
        <td style="text-align:center;">
         <button class="icon-btn start-production-btn" data-id="${p.id}" title="Colocar em produção">Produção▶️</button>
         <button class="icon-btn mark-ready-btn" data-id="${p.id}" title="Marcar como pronto">Pronto✅</button>

        </td>
      `;
      tableBody.appendChild(tr);
    });

    atualizarCardsResumo();
  }

  // filtros
  searchInput && searchInput.addEventListener('input', atualizarTabela);

  // Função para colocar pedido em produção
  function colocarEmProducao(id) {
    const idx = pedidos.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    pedidos[idx].status = 'Em Produção';
    pedidos[idx].emProducao = true;
    pedidos[idx].dataInicioProducao = new Date().toISOString();
    pedidos[idx].lote = `LOTE-${String(id).slice(-6)}`;
    pedidos[idx].progresso = 0;
    
    emitirAtualizacao();
    atualizarTabela();
    
    setTimeout(() => {
      if (typeof window.atualizarProducao === 'function') {
        window.atualizarProducao();
      }
    }, 100);
  }

  // Função para marcar pedido como pronto
  function marcarComoPronto(id) {
    const idx = pedidos.findIndex(p => p.id === id);
    if (idx === -1) return;
    
    pedidos[idx].status = 'Pronto';
    pedidos[idx].emProducao = false;
    pedidos[idx].progresso = 100;
    
    emitirAtualizacao();
    atualizarTabela();
    
    setTimeout(() => {
      if (typeof window.atualizarProducao === 'function') {
        window.atualizarProducao();
      }
    }, 100);
  }

  // delegação para ações
  tableBody && tableBody.addEventListener('click', async (e) => {
    const del = e.target.closest('.delete-btn');
    const edit = e.target.closest('.edit-btn');
    const view = e.target.closest('.view-btn');
    const startBtn = e.target.closest('.start-production-btn');
    const readyBtn = e.target.closest('.mark-ready-btn');

    if (del) {
      const id = Number(del.getAttribute('data-id'));
      if (!await customConfirm('Deseja remover este pedido?')) return;
      pedidos = pedidos.filter(p => p.id !== id);
      emitirAtualizacao();
      atualizarTabela();

      setTimeout(() => {
        if (typeof window.atualizarProducao === 'function') {
          window.atualizarProducao();
        }
      }, 100);
      return;
    }

    if (startBtn) {
      const did = startBtn.getAttribute('data-id');
      if (did) {
        const id = Number(did);
        colocarEmProducao(id);
      }
      return;
    }

    if (readyBtn) {
      const did = readyBtn.getAttribute('data-id');
      if (did) {
        const id = Number(did);
        marcarComoPronto(id);
      }
      return;
    }

    if (edit) {
      const id = Number(edit.getAttribute('data-id'));
      const p = pedidos.find(x => x.id === id);
      if (!p) return;
      editId = id;
      document.getElementById('popup-title').textContent = 'Editar Pedido';
      carregarClientesNoSelect();
      document.getElementById('pedido-cliente').value = p.cliente || '';
      document.getElementById('produto-nome').value = p.produto || 'Atum';
      document.getElementById('produto-qtd').value = p.quantidade || '';
      document.getElementById('pedido-data').value = p.data || '';
      document.getElementById('pedido-hora').value = p.hora || '';
      document.getElementById('pedido-status').value = p.status || 'Pendente';
      document.getElementById('pedido-prioridade').value = p.prioridade || 'Média';
      document.getElementById('pedido-valor').value = p.valor || 0;
      popup.style.display = 'flex';
      return;
    }

    if (view) {
      const did = view.getAttribute('data-id');
      if (did) {
        const id = Number(did);
        const p = pedidos.find(x => x.id === id);
        if (!p) return;
        const text = `Pedido: ${p.numero}\nCliente: ${p.cliente}\nProduto: ${p.produto || ''}\nQuantidade: ${p.quantidade || 0}kg\nData: ${p.data || ''} ${p.hora || ''}\nStatus: ${p.status || ''}\nPrioridade: ${p.prioridade || ''}\nValor: R$ ${p.valor.toFixed(2)}`;
        openViewPedido(text);
      } else {
        const row = view.closest('tr');
        if (!row) return;
        const cols = row.querySelectorAll('td');
        const numero = cols[0] ? cols[0].innerText.trim() : '';
        const cliente = cols[1] ? cols[1].innerText.trim() : '';
        const produto = cols[2] ? cols[2].innerText.trim() : '';
        const quantidade = cols[3] ? cols[3].innerText.trim() : '';
        const data = cols[4] ? cols[4].innerText.trim() : '';
        const status = cols[5] ? cols[5].innerText.trim() : '';
        const prioridade = cols[6] ? cols[6].innerText.trim() : '';
        const valor = cols[7] ? cols[7].innerText.trim() : '';
        const text = `Pedido: ${numero}\nCliente: ${cliente}\nProduto: ${produto}\nQuantidade: ${quantidade}\nData/Entrega: ${data}\nStatus: ${status}\nPrioridade: ${prioridade}\nValor: ${valor}`;
        openViewPedido(text);
      }
      return;
    }
  });

  // helpers
  function formatDate(d) {
    if (!d) return '';
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

  // abrir/fechar view modal
  function openViewPedido(text) {
    if (!viewOverlay || !viewContent) {
      customAlert(text);
      return;
    }
    viewContent.textContent = text;
    viewOverlay.style.display = 'flex';
  }

  function closeViewPedido() {
    if (!viewOverlay) return;
    viewOverlay.style.display = 'none';
  }

  if (viewClose) viewClose.addEventListener('click', closeViewPedido);

  // fechar modais com ESC
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      if (popup) popup.style.display = 'none';
      closeViewPedido();
    }
  });

  // resgatar do storage quando houver mudanças em outra aba
  window.addEventListener('storage', (ev) => {
    if (ev.key === 'pedidos') {
      pedidos = JSON.parse(ev.newValue) || [];
      atualizarTabela();
    }
  });

  // ouvir evento custom para atualizar no mesmo contexto
  window.addEventListener('pedidosUpdated', () => {
    pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    atualizarTabela();
  });

  // Inicializa tabela
  atualizarTabela();
  
  // Garante que os pedidos tenham os campos de produção
  inicializarCamposProducao();
  
  function inicializarCamposProducao() {
    let needsUpdate = false;
    pedidos = pedidos.map(p => {
      if (p.emProducao === undefined) {
        needsUpdate = true;
        return {
          ...p,
          emProducao: p.status === 'Em Produção',
          dataInicioProducao: p.status === 'Em Produção' ? (p.dataInicioProducao || new Date().toISOString()) : null,
          lote: p.status === 'Em Produção' ? (p.lote || `LOTE-${String(p.id).slice(-6)}`) : '',
          progresso: p.status === 'Em Produção' ? (p.progresso || 0) : 0
        };
      }
      return p;
    });
    
    if (needsUpdate) {
      emitirAtualizacao();
    }
  }

});