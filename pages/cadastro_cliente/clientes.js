document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado - inicializando clientes...');

    const clientesBody = document.getElementById('clientes-body');
    const searchInput = document.getElementById('search-clientes');
    const cadastrarBtn = document.getElementById('cadastrar-cliente-btn');
    const popup = document.getElementById('popup-overlay-cliente');
    const cancelBtn = document.getElementById('cancelar-popup-cliente');
    const salvarBtn = document.getElementById('salvar-cliente');
    const viewOverlay = document.getElementById('view-overlay-cliente');
    const viewContent = document.getElementById('view-content-cliente');
    const viewClose = document.getElementById('view-close-cliente');


    const clientesIniciais = [
        {
            id: 1,
            nome: "Tabajara Soledade",
            documento: "12.345.678/0001-90",
            telefone: "(85) 99123-4567",
            email: "contato@tabajarasoledade.com.br",
            endereco: "Fortaleza - Centro",
            tipo: "PJ",
            status: "Ativo",
            pedidos: 45,
            ultimoPedido: "19/12/2024"
        },
        {
            id: 2,
            nome: "Loja Hiper Couto",
            documento: "98.765.432/0001-10",
            telefone: "(85) 98765-4321",
            email: "pedidos@hipercouto.com.br",
            endereco: "Fortaleza - Aldeota",
            tipo: "PJ",
            status: "Ativo",
            pedidos: 38,
            ultimoPedido: "18/12/2024"
        },
        {
            id: 3,
            nome: "Supermercado São Miguel Siqueira",
            documento: "11.222.333/0001-55",
            telefone: "(85) 97654-3210",
            email: "compras@saomiguel.com.br",
            endereco: "Fortaleza - Siqueira",
            tipo: "PJ",
            status: "Ativo",
            pedidos: 52,
            ultimoPedido: "20/12/2024"
        },
        {
            id: 4,
            nome: "Maria Silva Santos",
            documento: "123.456.789-00",
            telefone: "(85) 99887-6655",
            email: "maria.silva@email.com",
            endereco: "Fortaleza - Montese",
            tipo: "PF",
            status: "Ativo",
            pedidos: 28,
            ultimoPedido: "17/12/2024"
        }
    ];

    let clientes = JSON.parse(localStorage.getItem('clientes')) || clientesIniciais;
    let editId = null;

    // Se o localStorage estiver vazio, salvar os dados iniciais
    if (!localStorage.getItem('clientes')) {
        localStorage.setItem('clientes', JSON.stringify(clientesIniciais));
    }

    // Função para salvar no localStorage
    function salvarClientes() {
        localStorage.setItem('clientes', JSON.stringify(clientes));
        atualizarCards();
        atualizarTabela();
    }

    // Atualizar cards do dashboard
    function atualizarCards() {
        const total = clientes.length;
        const pj = clientes.filter(c => c.tipo === 'PJ').length;
        const pf = clientes.filter(c => c.tipo === 'PF').length;
        const ativos = clientes.filter(c => c.status === 'Ativo').length;

        document.getElementById('total-clientes').textContent = total;
        document.getElementById('pessoa-juridica').textContent = pj;
        document.getElementById('pessoa-fisica').textContent = pf;
        document.getElementById('clientes-ativos').textContent = ativos;
    }

    // Atualizar tabela de clientes
    function atualizarTabela() {
        if (!clientesBody) return;

        clientesBody.innerHTML = '';

        const termo = searchInput ? searchInput.value.toLowerCase() : '';

        const listaFiltrada = clientes.filter(cliente => {
            if (termo === '') return true;
            const texto = `${cliente.nome} ${cliente.documento} ${cliente.telefone} ${cliente.email} ${cliente.endereco}`.toLowerCase();
            return texto.includes(termo);
        });

        listaFiltrada.forEach(cliente => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <strong>${cliente.nome}</strong><br>
                    <span class="subtext">${cliente.documento}</span>
                </td>
                <td>
                    📞 ${cliente.telefone}<br>
                    <span class="subtext">✉️ ${cliente.email}</span>
                </td>
                <td>📍 ${cliente.endereco}</td>
                <td><span class="badge ${cliente.tipo === 'PJ' ? 'purple' : 'blue'}">${cliente.tipo}</span></td>
                <td><span class="badge ${cliente.status === 'Ativo' ? 'green' : 'red'}">${cliente.status}</span></td>
                <td>${cliente.pedidos || 0}<br><span class="subtext">Último: ${cliente.ultimoPedido || 'Nenhum'}</span></td>
                <td>
                    <button class="icon-btn view-btn" data-id="${cliente.id}" title="Ver">👁️</button>
                    <button class="icon-btn edit-btn" data-id="${cliente.id}" title="Editar">✏️</button>
                    <button class="icon-btn delete-btn" data-id="${cliente.id}" title="Excluir">🗑️</button>
                </td>
            `;
            clientesBody.appendChild(tr);
        });
    }

    // Abrir popup para cadastrar/editar
    function abrirPopupCliente(mode, id = null) {
        editId = id;
        const title = document.getElementById('popup-title-cliente');

        if (mode === 'new') {
            title.textContent = 'Cadastrar Cliente';
            // Limpar campos
            document.getElementById('cliente-tipo').value = 'PJ';
            document.getElementById('cliente-nome').value = '';
            document.getElementById('cliente-documento').value = '';
            document.getElementById('cliente-telefone').value = '';
            document.getElementById('cliente-email').value = '';
            document.getElementById('cliente-endereco').value = '';
            document.getElementById('cliente-cidade').value = '';
            document.getElementById('cliente-status').value = 'Ativo';
            atualizarLabelDocumento();
        } else {
            const cliente = clientes.find(c => c.id === id);
            if (!cliente) return;

            title.textContent = 'Editar Cliente';
            document.getElementById('cliente-tipo').value = cliente.tipo;
            document.getElementById('cliente-nome').value = cliente.nome;
            document.getElementById('cliente-documento').value = cliente.documento;
            document.getElementById('cliente-telefone').value = cliente.telefone;
            document.getElementById('cliente-email').value = cliente.email;
            document.getElementById('cliente-endereco').value = cliente.endereco;
            document.getElementById('cliente-cidade').value = cliente.cidade || '';
            document.getElementById('cliente-status').value = cliente.status;
            atualizarLabelDocumento();
        }

        popup.style.display = 'flex';
    }

    // Atualizar label do documento baseado no tipo
    function atualizarLabelDocumento() {
        const tipo = document.getElementById('cliente-tipo').value;
        const label = document.getElementById('label-documento');
        const input = document.getElementById('cliente-documento');

        if (tipo === 'PJ') {
            label.textContent = 'CNPJ';
            input.placeholder = '00.000.000/0000-00';
        } else {
            label.textContent = 'CPF';
            input.placeholder = '000.000.000-00';
            input.maxLength = 11;
        }
    }

    // Visualizar cliente
    function visualizarCliente(id) {
        const cliente = clientes.find(c => c.id === id);
        if (!cliente) return;

        const text = `Cliente: ${cliente.nome}\n${cliente.tipo === 'PJ' ? 'CNPJ' : 'CPF'}: ${cliente.documento}\nTelefone: ${cliente.telefone}\nEmail: ${cliente.email}\nEndereço: ${cliente.endereco}\nTipo: ${cliente.tipo}\nStatus: ${cliente.status}\nTotal de Pedidos: ${cliente.pedidos || 0}\nÚltimo Pedido: ${cliente.ultimoPedido || 'Nenhum'}`;

        viewContent.textContent = text;
        viewOverlay.style.display = 'flex';
    }

    // Excluir cliente
    async function excluirCliente(id) {
        if (!await customConfirm('Tem certeza que deseja excluir este cliente?')) return;

        clientes = clientes.filter(c => c.id !== id);
        salvarClientes();
    }

    // Event Listeners
    cadastrarBtn.addEventListener('click', () => abrirPopupCliente('new'));

    cancelBtn.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Mudar tipo de cliente (PJ/PF)
    document.getElementById('cliente-tipo').addEventListener('change', atualizarLabelDocumento);

    // Salvar cliente
    salvarBtn.addEventListener('click', function () {
        const tipo = document.getElementById('cliente-tipo').value;
        const nome = document.getElementById('cliente-nome').value.trim();
        const documento = document.getElementById('cliente-documento').value.trim();
        const telefone = document.getElementById('cliente-telefone').value.trim();
        const email = document.getElementById('cliente-email').value.trim();
        const endereco = document.getElementById('cliente-endereco').value.trim();
        const cidade = document.getElementById('cliente-cidade').value.trim();
        const status = document.getElementById('cliente-status').value;

        if (!nome || !documento || !telefone) {
            customAlert('Preencha pelo menos nome, documento e telefone!');
            return;
        }

        if (editId) {
            // Editar cliente existente
            clientes = clientes.map(c =>
                c.id === editId ? {
                    ...c,
                    tipo,
                    nome,
                    documento,
                    telefone,
                    email,
                    endereco: cidade ? `${endereco} - ${cidade}` : endereco,
                    status
                } : c
            );
        } else {
            // Novo cliente
            const novoCliente = {
                id: Date.now(),
                nome,
                documento,
                telefone,
                email,
                endereco: cidade ? `${endereco} - ${cidade}` : endereco,
                tipo,
                status,
                pedidos: 0,
                ultimoPedido: 'Nenhum'
            };
            clientes.push(novoCliente);
        }

        salvarClientes();
        popup.style.display = 'none';
    });

    // Delegation para ações na tabela
    clientesBody.addEventListener('click', function (e) {
        const viewBtn = e.target.closest('.view-btn');
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');

        if (viewBtn) {
            const id = parseInt(viewBtn.getAttribute('data-id'));
            visualizarCliente(id);
            return;
        }

        if (editBtn) {
            const id = parseInt(editBtn.getAttribute('data-id'));
            abrirPopupCliente('edit', id);
            return;
        }

        if (deleteBtn) {
            const id = parseInt(deleteBtn.getAttribute('data-id'));
            excluirCliente(id);
            return;
        }
    });

    // Fechar popups
    viewClose.addEventListener('click', () => {
        viewOverlay.style.display = 'none';
    });

    // Fechar com ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            popup.style.display = 'none';
            viewOverlay.style.display = 'none';
        }
    });

    // Busca
    searchInput.addEventListener('input', atualizarTabela);

    // Inicializar
    atualizarCards();
    atualizarTabela();
});