document.addEventListener('DOMContentLoaded', () => {
    const abaBtns = document.querySelectorAll('.aba-item');
    const listaMensagens = document.getElementById('lista-mensagens');
    const confirmOverlay = document.getElementById('confirm-overlay-comunicacao');
    const confirmMessage = document.getElementById('confirm-message-comunicacao');
    const confirmOk = document.getElementById('confirm-ok-comunicacao');
    const confirmCancel = document.getElementById('confirm-cancel-comunicacao');
    let abaAtiva = 'mensagens';

    let mensagens = JSON.parse(localStorage.getItem('mensagens')) || [
        { id: 1, tipo: 'mensagens', titulo: 'Pedido Urgente - Cliente VIP', conteudo: 'Cliente Restaurante Mar Azul solicitou entrega emergencial de 100kg de Atum para amanhã às 6h.', de: 'Ana Vendedora', para: 'Equipe de Produção', data: '2024-01-15 09:30', prioridade: 'urgente', status: 'Não lida' },
        { id: 2, tipo: 'notificacoes', titulo: 'Produto vencendo em 2 dias', conteudo: 'Pescada Amarela (Lote #1234) vencerá em 48 horas. Câmara B.', de: 'Sistema', para: 'Estoque', data: '2024-01-15 08:00', prioridade: 'normal', status: 'Lida' },
        { id: 3, tipo: 'notificacoes', titulo: 'Baixo estoque de Tilápia', conteudo: 'Quantidade atual: 15kg. Limite mínimo: 50kg.', de: 'Sistema', para: 'Administração', data: '2024-01-15 07:15', prioridade: 'normal', status: 'Lida' }
    ];

    function mudarAba(aba) {
        abaAtiva = aba;
        abaBtns.forEach(btn => btn.classList.remove('ativa'));
        const btnClicado = Array.from(abaBtns).find(btn => btn.textContent.toLowerCase().includes(aba));
        btnClicado && btnClicado.classList.add('ativa');
        aba === 'nova' ? mostrarFormulario() : atualizarLista();
    }

    function atualizarLista() {
        if (!listaMensagens) return;

        const filtradas = mensagens.filter(m =>
            abaAtiva === 'mensagens' ? m.tipo === 'mensagens' : m.tipo === 'notificacoes'
        );

        listaMensagens.innerHTML = filtradas.length === 0 ?
            '<div style="padding:40px;text-align:center;color:#666;">Nenhuma mensagem encontrada</div>' : '';

        filtradas.forEach(m => {
            const div = document.createElement('div');
            div.className = `mensagem-item ${m.prioridade}`;
            div.innerHTML = `
                <div class="mensagem-conteudo">
                    <div class="mensagem-titulo">${m.titulo}</div>
                    <p>${m.conteudo}</p>
                    <small class="mensagem-detalhes">De: ${m.de} | Para: ${m.para} | ${m.data}</small>
                </div>
                <div class="mensagem-status badge ${m.status === 'Lida' ? 'green' : 'red'}">${m.status}</div>
            `;
            listaMensagens.appendChild(div);
        });

        const naoLidas = mensagens.filter(m => m.status === 'Não lida').length;
        const totalNotif = mensagens.filter(m => m.tipo === 'notificacoes').length;
        const contadores = document.querySelectorAll('.contador');
        const infoBtns = document.querySelectorAll('.info-btn');

        contadores[0] && (contadores[0].textContent = naoLidas);
        contadores[1] && (contadores[1].textContent = totalNotif);
        infoBtns[0] && (infoBtns[0].textContent = `💭 ${naoLidas} não lida${naoLidas !== 1 ? 's' : ''}`);
        infoBtns[1] && (infoBtns[1].textContent = `🔔 ${totalNotif} notificaç${totalNotif !== 1 ? 'ões' : 'ão'}`);
    }

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

    function mostrarFormulario() {
        if (!listaMensagens) return;
        listaMensagens.innerHTML = `
            <div class="card" style="max-width:600px;margin:0 auto;padding:30px;">
                <h2 style="margin-bottom:20px;">Nova Mensagem</h2>
                <label>Para:</label>
                <input type="text" id="msg-para" class="search-input" style="width:100%;margin-bottom:15px;">
                <label>Assunto:</label>
                <input type="text" id="msg-titulo" class="search-input" style="width:100%;margin-bottom:15px;">
                <label>Mensagem:</label>
                <textarea id="msg-conteudo" class="search-input" style="width:100%;min-height:120px;margin-bottom:15px;"></textarea>
                <label>Prioridade:</label>
                <select id="msg-prioridade" class="styled-select" style="width:100%;margin-bottom:20px;">
                    <option value="normal">Normal</option>
                    <option value="urgente">Urgente</option>
                </select>
                <div style="display:flex;gap:10px;">
                    <button class="save-btn" onclick="enviarMensagem()" style="flex:1;">Enviar</button>
                    <button class="cancel-btn" onclick="voltarMensagens()" style="flex:1;">Cancelar</button>
                </div>
            </div>
        `;
    }

    window.enviarMensagem = () => {
        const para = document.getElementById('msg-para').value.trim();
        const titulo = document.getElementById('msg-titulo').value.trim();
        const conteudo = document.getElementById('msg-conteudo').value.trim();

        if (!para || !titulo || !conteudo) {
            showConfirm('Preencha todos os campos!', () => {});
            return;
        }

        const session = JSON.parse(localStorage.getItem('beiramar_auth_session'));
        mensagens.unshift({
            id: Date.now(),
            tipo: 'mensagens',
            titulo,
            conteudo,
            de: session ? session.nome : 'Usuário',
            para,
            data: new Date().toLocaleString('pt-BR'),
            prioridade: document.getElementById('msg-prioridade').value,
            status: 'Não lida'
        });
        localStorage.setItem('mensagens', JSON.stringify(mensagens));
        showConfirm('Mensagem enviada com sucesso!', (ok) => {
            if (ok) voltarMensagens();
        });
    };

    window.voltarMensagens = () => {
        mudarAba('mensagens');
        abaBtns[0].click();
    };

    abaBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const texto = btn.textContent.toLowerCase();
            if (texto.includes('mensagens')) mudarAba('mensagens');
            else if (texto.includes('notificações')) mudarAba('notificações');
            else if (texto.includes('nova')) mudarAba('nova');
        });
    });

    atualizarLista();
});
