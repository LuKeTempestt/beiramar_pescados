document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - inicializando histórico...');

    const { jsPDF } = window.jspdf;
    const auditoriaContainer = document.getElementById('auditoria-container');
    const exportarBtn = document.getElementById('exportar-pdf');
    const confirmOverlay = document.getElementById('confirm-overlay-historico');
    const confirmMessage = document.getElementById('confirm-message-historico');
    const confirmOk = document.getElementById('confirm-ok-historico');

    // Elementos dos filtros
    const searchTerm = document.getElementById('search-term');
    const filterAcao = document.getElementById('filter-acao');
    const filterUsuario = document.getElementById('filter-usuario');
    const filterDataInicio = document.getElementById('filter-data-inicio');
    const filterDataFim = document.getElementById('filter-data-fim');

    // Função para extrair dados dos cards do HTML
    function extrairDadosDosCards() {
        const cards = auditoriaContainer.querySelectorAll('.card');
        const dados = [];

        cards.forEach(card => {
            const entidade = card.querySelector('strong').textContent;
            const badges = card.querySelectorAll('.badge');
            const acao = badges[0].textContent;
            const tipo = badges[1].textContent;
            const descricao = card.querySelector('p').textContent;
            const subtext = card.querySelector('.subtext').textContent;
            
            // Extrair usuário e data do subtext
            const usuarioMatch = subtext.match(/👤\s*(.+?)\s*\|/);
            const dataMatch = subtext.match(/📅\s*(.+)/);
            
            const usuario = usuarioMatch ? usuarioMatch[1].trim() : '';
            const data = dataMatch ? dataMatch[1].trim() : '';
            
            // Extrair data no formato yyyy-mm-dd dos data attributes
            const dataRaw = card.getAttribute('data-data');

            dados.push({
                elemento: card,
                entidade,
                acao,
                tipo,
                descricao: descricao.replace(/\n/g, ' ').trim(),
                observacao: card.querySelector('.subtext') ? card.querySelector('.subtext').textContent : '',
                usuario,
                data,
                dataRaw: dataRaw ? new Date(dataRaw) : new Date(),
                // Extrair informações específicas
                quantidade: extrairQuantidade(descricao),
                lote: extrairLote(descricao),
                entrega: extrairEntrega(descricao)
            });
        });

        return dados;
    }

    // Funções auxiliares para extrair informações específicas
    function extrairQuantidade(texto) {
        const match = texto.match(/(\d+)\s*kg/);
        return match ? match[1] + 'kg' : '';
    }

    function extrairLote(texto) {
        const match = texto.match(/Lote\s+(\w+)/);
        return match ? match[1] : '';
    }

    function extrairEntrega(texto) {
        const match = texto.match(/ENT\d+/);
        return match ? match[0] : '';
    }

    // Função para aplicar filtros
    function aplicarFiltros() {
        const termo = searchTerm.value.toLowerCase();
        const acaoSelecionada = filterAcao.value;
        const usuarioSelecionado = filterUsuario.value;
        const dataInicio = filterDataInicio.value ? new Date(filterDataInicio.value) : null;
        const dataFim = filterDataFim.value ? new Date(filterDataFim.value) : null;

        const cards = auditoriaContainer.querySelectorAll('.card');
        let totalVisiveis = 0;
        let entradas = 0, saidas = 0, entregas = 0, alteracoes = 0;

        cards.forEach(card => {
            const acao = card.getAttribute('data-acao');
            const usuario = card.getAttribute('data-usuario');
            const dataCard = new Date(card.getAttribute('data-data'));
            
            const textoCard = card.textContent.toLowerCase();
            
            // Aplicar filtros
            const matchTermo = termo === '' || textoCard.includes(termo);
            const matchAcao = acaoSelecionada === 'todos' || acao === acaoSelecionada;
            const matchUsuario = usuarioSelecionado === 'todos' || usuario === usuarioSelecionado;
            
            let matchData = true;
            if (dataInicio && dataFim) {
                matchData = dataCard >= dataInicio && dataCard <= dataFim;
            } else if (dataInicio) {
                matchData = dataCard >= dataInicio;
            } else if (dataFim) {
                matchData = dataCard <= dataFim;
            }

            const deveMostrar = matchTermo && matchAcao && matchUsuario && matchData;
            
            card.style.display = deveMostrar ? 'block' : 'none';
            
            if (deveMostrar) {
                totalVisiveis++;
                // Contar por tipo de ação
                switch(acao) {
                    case 'Entrada': entradas++; break;
                    case 'Saída': saidas++; break;
                    case 'Entrega': entregas++; break;
                    case 'Alteração': alteracoes++; break;
                    case 'Cancelamento': saidas++; break;
                }
            }
        });

        // Atualizar cards
        document.getElementById('total-registros').textContent = totalVisiveis;
        document.getElementById('total-entradas').textContent = entradas;
        document.getElementById('total-saidas').textContent = saidas;
        document.getElementById('total-entregas').textContent = entregas;
        document.getElementById('total-alteracoes').textContent = alteracoes;
    }

    function showAlert(msg) {
        if (!confirmOverlay || !confirmMessage) return;
        confirmMessage.textContent = msg;
        confirmOverlay.style.display = 'flex';

        confirmOk.onclick = () => {
            confirmOverlay.style.display = 'none';
        };
    }

    // Função para exportar PDF
    function exportarPDF() {
        const doc = new jsPDF();
        const cardsVisiveis = Array.from(auditoriaContainer.querySelectorAll('.card'))
            .filter(card => card.style.display !== 'none');

        if (cardsVisiveis.length === 0) {
            showAlert('Nenhum registro para exportar com os filtros atuais!');
            return;
        }

        // Cabeçalho do relatório
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Relatório de Auditoria - BeiraMar Pescados', 105, 15, { align: 'center' });
        
        // Informações dos filtros aplicados
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        
        const filtrosAplicados = [];
        if (searchTerm.value) filtrosAplicados.push(`Busca: "${searchTerm.value}"`);
        if (filterAcao.value !== 'todos') filtrosAplicados.push(`Ação: ${filterAcao.value}`);
        if (filterUsuario.value !== 'todos') filtrosAplicados.push(`Usuário: ${filterUsuario.value}`);
        if (filterDataInicio.value) filtrosAplicados.push(`De: ${formatarDataPDF(filterDataInicio.value)}`);
        if (filterDataFim.value) filtrosAplicados.push(`Até: ${formatarDataPDF(filterDataFim.value)}`);
        
        if (filtrosAplicados.length > 0) {
            doc.text(`Filtros aplicados: ${filtrosAplicados.join(' | ')}`, 14, 25);
        }
        
        doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);
        doc.text(`Total de registros: ${cardsVisiveis.length}`, 14, 35);

        // Preparar dados para a tabela
        const tableData = cardsVisiveis.map(card => {
            const entidade = card.querySelector('strong').textContent.replace(/[🐟🦐🍽️🐠🚫]/g, '').trim();
            const badges = card.querySelectorAll('.badge');
            const acao = badges[0].textContent;
            const tipo = badges[1].textContent;
            const descricao = card.querySelector('p').textContent.replace(/\n/g, ' ').trim();
            const subtext = card.querySelector('.subtext').textContent;
            
            // Extrair usuário e data
            const usuarioMatch = subtext.match(/👤\s*(.+?)\s*\|/);
            const dataMatch = subtext.match(/📅\s*(.+)/);
            
            const usuario = usuarioMatch ? usuarioMatch[1].trim() : '';
            const data = dataMatch ? dataMatch[1].trim() : '';

            return [entidade, acao, tipo, descricao, usuario, data];
        });

        // Configuração da tabela
        doc.autoTable({
            startY: 45,
            head: [['Cliente', 'Ação', 'Tipo', 'Descrição', 'Usuário', 'Data']],
            body: tableData,
            theme: 'grid',
            styles: {
                fontSize: 8,
                cellPadding: 3,
            },
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 45 }
        });

        // Estatísticas no final
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        
        const entradas = cardsVisiveis.filter(card => card.getAttribute('data-acao') === 'Entrada').length;
        const saidas = cardsVisiveis.filter(card => card.getAttribute('data-acao') === 'Saída').length;
        const entregas = cardsVisiveis.filter(card => card.getAttribute('data-acao') === 'Entrega').length;
        const alteracoes = cardsVisiveis.filter(card => card.getAttribute('data-acao') === 'Alteração').length;
        const cancelamentos = cardsVisiveis.filter(card => card.getAttribute('data-acao') === 'Cancelamento').length;

        doc.text('Resumo Estatístico:', 14, finalY);
        doc.text(`• Total de Registros: ${cardsVisiveis.length}`, 20, finalY + 6);
        doc.text(`• Entradas: ${entradas}`, 20, finalY + 12);
        doc.text(`• Saídas: ${saidas}`, 20, finalY + 18);
        doc.text(`• Entregas: ${entregas}`, 20, finalY + 24);
        doc.text(`• Alterações: ${alteracoes}`, 20, finalY + 30);
        doc.text(`• Cancelamentos: ${cancelamentos}`, 20, finalY + 36);

        // Nome do arquivo com data
        const dataAtual = new Date().toISOString().split('T')[0];
        const nomeArquivo = `Relatorio_auditoria_${dataAtual}.pdf`;

        // Salvar PDF
        doc.save(nomeArquivo);
    }

    // Função auxiliar para formatar data no PDF
    function formatarDataPDF(dataString) {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    }

    // Event Listeners para filtros
    searchTerm.addEventListener('input', aplicarFiltros);
    filterAcao.addEventListener('change', aplicarFiltros);
    filterUsuario.addEventListener('change', aplicarFiltros);
    filterDataInicio.addEventListener('change', aplicarFiltros);
    filterDataFim.addEventListener('change', aplicarFiltros);

    // Event Listener para exportar PDF
    exportarBtn.addEventListener('click', exportarPDF);

    // Inicializar
    function inicializar() {
        // Definir datas padrão (últimos 30 dias)
        const hoje = new Date();
        const umMesAtras = new Date(hoje);
        umMesAtras.setDate(hoje.getDate() - 30);
        
        filterDataInicio.value = umMesAtras.toISOString().split('T')[0];
        filterDataFim.value = hoje.toISOString().split('T')[0];
        
        aplicarFiltros();
    }

    inicializar();
});