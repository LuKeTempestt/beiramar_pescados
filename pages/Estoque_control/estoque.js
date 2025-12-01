document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.querySelector(".add-product-btn");
  const popup = document.getElementById("popup-overlay");
  const cancelBtn = document.getElementById("cancelar-popup");
  const salvarBtn = document.getElementById("salvar-produto");
  const tableBody = document.getElementById("inventory-body") || document.querySelector(".inventory-table tbody");
  const searchInput = document.querySelector(".search-input");
  const totalItensEl = document.getElementById("total-itens");
  const produtosCriticosEl = document.getElementById("produtos-criticos");



  let produtos = JSON.parse(localStorage.getItem("estoque")) || [];
  let editId = null; // id do produto sendo editado 

  // MOSTRAR POPUP
  addBtn.addEventListener("click", () => {
    // Limpa campos ao abrir o popup
    document.getElementById("produto-nome").selectedIndex = 0;
    document.getElementById("produto-categoria").selectedIndex = 0;
    document.getElementById("produto-qtd").value = "";
    document.getElementById("produto-local").selectedIndex = 0;
    document.getElementById("produto-validade").value = "";
    const prodGlz = document.getElementById("produto-glazer");
    if (prodGlz) prodGlz.value = 'com';
    editId = null; 

    popup.style.display = "flex";
  });

  cancelBtn.addEventListener("click", () => {
    popup.style.display = "none";
  });
  // SALVAR PRODUTO 
  salvarBtn.addEventListener("click", () => {
    const nome = document.getElementById("produto-nome").value.trim();
    const categoria = document.getElementById("produto-categoria").value;
    const qtd = Number(document.getElementById("produto-qtd").value);
    const local = document.getElementById("produto-local").value;
    const glazer = document.getElementById("produto-glazer").value; 
    const validade = document.getElementById("produto-validade").value;

    if (!nome || !qtd || !validade) {
      customAlert("Preencha todos os campos obrigatórios!");
      return;
    }

    let status = calcularStatus(validade);
    // createdAt em formato YYYY-MM-DD para rastrear entradas por dia
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

    if (editId) {
      // Atualiza item existente
      produtos = produtos.map(p => {
        if (p.id === editId) {
          return { ...p, nome, categoria, qtd, local, validade, status, glazer };
        }
        return p;
      });
    } else {
      const novo = { id: Date.now(), nome, categoria, qtd, local, validade, status, createdAt, glazer };
      produtos.push(novo);
    }

    localStorage.setItem("estoque", JSON.stringify(produtos));

    atualizarTabela();
    popup.style.display = "none";
    editId = null;
  });

  // MONTAR TABELA 
  function atualizarTabela() {
    tableBody.innerHTML = "";
    // Atualiza cards resumo
    const totalItens = produtos.reduce((acc, cur) => acc + (Number(cur.qtd) || 0), 0);
    const criticos = produtos.filter(p => p.status === "CRÍTICO").length;

    if (totalItensEl) totalItensEl.textContent = totalItens + " kg";
    if (produtosCriticosEl) produtosCriticosEl.textContent = criticos;

    // calcular glazer counts
    const comGlazer = produtos.filter(p => p.glazer === 'com').length;
    const semGlazer = produtos.filter(p => p.glazer === 'sem').length;
    const glazerCountEl = document.getElementById('glazer-count');
    if (glazerCountEl) glazerCountEl.textContent = `Com: ${comGlazer} / Sem: ${semGlazer}`;

    produtos.forEach(p => {
      let row = document.createElement("tr");

      row.innerHTML = `
        <td>${p.nome}</td>
        <td>${p.categoria}</td>
        <td>${p.qtd} kg</td>
        <td>${p.local}</td>
        <td>${p.glazer === 'com' ? 'Com' : 'Sem'}</td>
        <td>${formatarData(p.validade)}</td>
        <td><span class="alert-status ${classeStatus(p.status)}">${p.status}</span></td>
        <td>
          <button class="icon-btn edit-btn" data-id="${p.id}" title="Editar">✏️</button>
          <button class="icon-btn delete-btn" data-id="${p.id}" title="Remover">🗑️</button>
        </td>
     `;

      tableBody.appendChild(row);
    });
  }

  // FILTRO DE BUSCA 
  searchInput.addEventListener("input", () => {
    const termo = searchInput.value.toLowerCase();

    document.querySelectorAll(".inventory-table tbody tr").forEach(row => {
      const texto = row.innerText.toLowerCase();
      row.style.display = texto.includes(termo) ? "" : "none";
    });
  });

  // Delegação de evento para excluir produtos
  if (tableBody) {
    tableBody.addEventListener('click', async (e) => {
      const del = e.target.closest('.delete-btn');
      const edit = e.target.closest('.edit-btn');
      if (del) {
        const id = Number(del.getAttribute('data-id'));
        if (!await customConfirm('Deseja remover este produto do estoque?')) return;
        produtos = produtos.filter(p => p.id !== id);
        localStorage.setItem("estoque", JSON.stringify(produtos));
        atualizarTabela();
        return;
      }
      if (edit) {
        const id = Number(edit.getAttribute('data-id'));
        const p = produtos.find(x => x.id === id);
        if (!p) return;
        // Preenche popup com valores
        document.getElementById("produto-nome").value = p.nome;
        document.getElementById("produto-categoria").value = p.categoria;
        document.getElementById("produto-qtd").value = p.qtd;
        document.getElementById("produto-local").value = p.local;
        document.getElementById("produto-validade").value = p.validade;
        const prodGlz = document.getElementById("produto-glazer");
        if (prodGlz) prodGlz.value = p.glazer || 'sem';
        editId = id;
        popup.style.display = 'flex';
        return;
      }
    });
  } else {
    console.warn('tbody do inventário não encontrado — exclusão não será vinculada');
  }





  //CÁLCULO DE STATUS
  function calcularStatus(data) {
    const hoje = new Date();
    const validade = new Date(data);

    const dias = (validade - hoje) / (1000 * 60 * 60 * 24);

    if (dias <= 4) return "CRÍTICO";
    if (dias <= 8) return "ATENÇÃO";
    return "NORMAL";
  }

  function classeStatus(s) {
    if (s === "CRÍTICO") return "status-critical";
    if (s === "ATENÇÃO") return "status-warning";
    return "status-normal";
  }

  function formatarData(d) {
    if (!d) return "";
    return d.split("-").reverse().join("/");
  }

  // Inicializa tabela ao carregar a página
  atualizarTabela();
});
