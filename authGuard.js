

(function() {
    'use strict';

    // Aguarda o carregamento do sistema de autenticação
    function initAuthGuard() {
        if (!window.authSystem) {
            console.error('Sistema de autenticação não encontrado!');
            const rootPath = window.location.pathname.includes('/pages/') ? '../../index.html' : 'index.html';
            window.location.href = rootPath;
            return;
        }

        // Protege a página
        const isAuthorized = window.authSystem.protectPage();

        if (isAuthorized) {
            // Adiciona informações do usuário ao DOM
            displayUserInfo();

            // Configura evento de logout
            setupLogoutButton();
        }
    }

    // Exibe informações do usuário na interface
    function displayUserInfo() {
        const userName = window.authSystem.getCurrentUserName();
        const userRole = window.authSystem.getCurrentRole();

        // Adiciona informação visual do usuário (pode ser personalizado)
        console.log(`Usuário logado: ${userName} (${userRole})`);

        addUserInfoToHeader(userName, userRole);
    }

    // Adiciona informações do usuário ao header
    function addUserInfoToHeader(userName, userRole) {
        // Verifica se já existe
        let userInfo = document.getElementById('user-info-display');

        if (!userInfo) {
            userInfo = document.createElement('div');
            userInfo.id = 'user-info-display';
            userInfo.style.cssText = `
                position: fixed;
                top: 0;
                right: 0;
                background: linear-gradient(135deg, var(--secondary-color) 0%, var(--primary-color) 100%);
                padding: 8px 20px;
                color: white;
                font-size: 13px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 9999;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            `;

            const roleLabels = {
                'admin': 'Administrador',
                'motorista': 'Motorista',
                'estoquista': 'Estoquista',
                'aux_producao': 'Auxiliar de Produção',
                'vendedor': 'Vendedor'
            };

            userInfo.innerHTML = `
                <span style="font-weight: bold;">👤 ${userName}</span>
                <span style="font-size: 11px; opacity: 0.9;">(${roleLabels[userRole] || userRole})</span>
            `;

            document.body.appendChild(userInfo);
        }
    }

    // Configura botão de logout
    function setupLogoutButton() {

    }

    // Executa quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthGuard);
    } else {
        initAuthGuard();
    }
})();
