(function () {
    const STORAGE_KEY = 'employees_v1';
    const initial = [
        { id: 'FUNC001', name: 'João Silva Santos', cpf: '000.000.000-00', role: 'Gerente de Estoque', sector: 'Logística', email: 'joao.silva@freshfish.com', phone: '(11) 99999-0001', admission: '2023-01-15', active: true },
        { id: 'FUNC002', name: 'Maria Oliveira Costa', cpf: '111.111.111-11', role: 'Operador de Produção', sector: 'Produção', email: 'maria.oliveira@freshfish.com', phone: '(11) 99999-0002', admission: '2023-03-10', active: true },
        { id: 'FUNC003', name: 'Carlos Eduardo Lima', cpf: '222.222.222-22', role: 'Motorista', sector: 'Logística', email: 'carlos.lima@freshfish.com', phone: '(11) 99999-0003', admission: '2022-11-05', active: true }
    ];

    // Remove a função load() duplicada - mantenha apenas esta
    function load() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            save(initial);
            return initial;
        }
        return JSON.parse(stored);
    }

    function save(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    const formOverlay = document.getElementById('form-overlay');
    const viewOverlay = document.getElementById('view-overlay');
    const empForm = document.getElementById('employee-form');
    const idxInput = document.getElementById('emp-idx');
    const nameInput = document.getElementById('emp-name');
    const cpfInput = document.getElementById('emp-cpf');
    const roleInput = document.getElementById('emp-role');
    const sectorInput = document.getElementById('emp-sector');
    const emailInput = document.getElementById('emp-email');
    const passwordInput = document.getElementById('emp-password');
    const phoneInput = document.getElementById('emp-phone');
    const admInput = document.getElementById('emp-adm');
    const saveBtn = document.querySelector('.save-btn');
    const viewContent = document.getElementById('view-content');
    const formClose = document.getElementById('form-close'); 

    function openForm(mode, idx) {
        const title = document.getElementById('form-title');
        if (mode === 'new') {
            title.textContent = 'Cadastrar Novo Funcionário';
            idxInput.value = '';
            nameInput.value = '';
            cpfInput.value = '';
            roleInput.value = '';
            sectorInput.value = '';
            emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
            phoneInput.value = '';
            admInput.value = '';
            saveBtn.textContent = 'Cadastrar';
        } else {
            const data = load();
            const f = data[idx];
            if (!f) return;
            title.textContent = 'Editar Funcionário';
            idxInput.value = idx;
            nameInput.value = f.name || '';
            cpfInput.value = f.cpf || '';
            roleInput.value = f.role || '';
            sectorInput.value = f.sector || '';
            emailInput.value = f.email || '';
            if (passwordInput) passwordInput.value = f.password || '';
            phoneInput.value = f.phone || '';
            admInput.value = f.admission || '';
            saveBtn.textContent = 'Salvar alterações';
        }
        formOverlay.style.display = 'flex';
        nameInput.focus();
    }

    function closeForm(){ formOverlay.style.display = 'none'; }
    function openView(text){ viewContent.textContent = text; viewOverlay.style.display = 'flex'; }
    function closeView(){ viewOverlay.style.display = 'none'; }

    // FUNÇÃO UPDATE STATISTICS 
    function updateStatistics() {
        const data = load();
        console.log('Dados carregados:', data);

        const total = data.length;
        const ativos = data.filter(x => x.active).length;
        const inativos = total - ativos;

        console.log('Estatísticas:', { total, ativos, inativos });

        const cards = document.querySelectorAll('.card .card-value');
        console.log('Elementos cards encontrados:', cards.length);
        
        if (cards && cards.length >= 3) {
            cards[0].textContent = total;
            cards[1].textContent = ativos;
            cards[2].textContent = inativos;
        }
        
        const sub = document.querySelector('.subtext');
        if (sub) sub.textContent = `${total} funcionários encontrados`;
    }

    function render(){
        const tbody = document.getElementById('func-tbody');
        const data = load();
        tbody.innerHTML = '';
        data.forEach((f, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge purple">${f.id}</span></td>
                <td>${f.name}</td>
                <td><span class="badge blue">${f.role}</span></td>
                <td>${f.email || ''}</td>
                <td><span class="badge ${f.active ? 'green' : 'red'}">${f.active ? 'Ativo' : 'Inativo'}</span></td>
                <td style="text-align:center;">
                    <button class="icon-btn view-btn" data-id="${idx}" title="Ver">👁️</button>
                    <button class="icon-btn edit-btn" data-id="${idx}" title="Editar">✏️</button>
                    <button class="icon-btn status-btn" data-id="${idx}" title="${f.active ? 'Inativar' : 'Ativar'}">${f.active ? '🔒' : '🔓'}</button>
                    <button class="icon-btn delete-btn" data-id="${idx}" title="Excluir">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // REMOVA O CÓDIGO DUPLICADO AQUI - apenas chame updateStatistics()
        updateStatistics();
    }

    function addEmployeeThroughForm(obj) {
        const data = load();
        const maxNum = data.reduce((m, e) => Math.max(m, parseInt((e.id || '').replace(/\D/g, '')) || 0), 0);
        const newId = 'FUNC' + String(maxNum + 1).padStart(3, '0');
        obj.id = newId; obj.active = true;
        data.push(obj);
        save(data);
        render(); 
    }

    function updateEmployeeThroughForm(idx, obj) {
        const data = load();
        const f = data[idx];
        if (!f) return;
        f.name = obj.name; f.cpf = obj.cpf; f.role = obj.role; f.sector = obj.sector;
        f.email = obj.email; f.password = obj.password; f.phone = obj.phone; f.admission = obj.admission;
        save(data);
        render(); 
    }

    function viewEmployee(idx) {
        const data = load();
        const f = data[idx];
        if (!f) return;
        const text = `ID: ${f.id}\nNome: ${f.name}\nCPF: ${f.cpf || ''}\nFunção: ${f.role || ''}\nSetor: ${f.sector || ''}\nE-mail: ${f.email || ''}\nTelefone: ${f.phone || ''}\nData Admissão: ${f.admission || ''}\nStatus: ${f.active ? 'Ativo' : 'Inativo'}`;
        openView(text);
    }

    function toggleEmployee(idx) {
        const data = load();
        const f = data[idx];
        if (!f) return;
        f.active = !f.active;
        save(data);
        render(); 
    }

    async function deleteEmployee(idx) {
        if (!await customConfirm('Confirma exclusão deste funcionário?')) return;
        const data = load();
        data.splice(idx, 1);
        save(data);
        render();
    }

    // Delegação de eventos para botões na tabela
    document.addEventListener('click', function (e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        if (btn.id === 'new-employee-btn') { openForm('new'); return; }
        if (btn.classList.contains('view-btn')) viewEmployee(btn.dataset.id);
        if (btn.classList.contains('edit-btn')) openForm('edit', btn.dataset.id);
        if (btn.classList.contains('status-btn')) toggleEmployee(btn.dataset.id);
        if (btn.classList.contains('delete-btn')) deleteEmployee(btn.dataset.id);
    });

    // Formulário: submit
    empForm.addEventListener('submit', function (ev) {
        ev.preventDefault();
        const idx = idxInput.value;
        const obj = {
            name: nameInput.value.trim(),
            cpf: cpfInput.value.trim(),
            role: roleInput.value.trim(),
            sector: sectorInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput ? passwordInput.value : undefined,
            phone: phoneInput.value.trim(),
            admission: admInput.value
        };
        if (!obj.name || !obj.cpf || !obj.role || !obj.sector || !!(passwordInput && !obj.password) || !obj.admission) {
            customAlert('Preencha todos os campos obrigatórios.');
            return;
        }
        if (idx === '') addEmployeeThroughForm(obj);
        else updateEmployeeThroughForm(parseInt(idx, 10), obj);
        closeForm();
    });

    document.getElementById('cancel-btn').addEventListener('click', function () { closeForm(); });
    document.getElementById('view-close').addEventListener('click', function () { closeView(); });
    if(formClose) formClose.addEventListener('click', function () { closeForm(); });

    // Fecha modais com ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeForm(); closeView();
        }
    });

    // INICIALIZAÇÃO CORRIGIDA
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM carregado - inicializando...');
        render(); 
    });

})();