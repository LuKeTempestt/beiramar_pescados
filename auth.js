
// Definição de funções e suas permissões
const ROLES = {
    ADMIN: 'admin',
    MOTORISTA: 'motorista',
    ESTOQUISTA: 'estoquista',
    AUX_PRODUCAO: 'aux_producao',
    VENDEDOR: 'vendedor'
};

// Mapeamento de páginas por função (admin tem acesso a tudo)
const PERMISSIONS = {
    [ROLES.ADMIN]: ['*'], // Acesso total
    [ROLES.MOTORISTA]: ['entregas.html', 'comunicacao.html'],
    [ROLES.ESTOQUISTA]: ['estoque.html', 'producao.html', 'comunicacao.html'],
    [ROLES.AUX_PRODUCAO]: ['producao.html', 'comunicacao.html'],
    [ROLES.VENDEDOR]: ['cadastro_cliente.html', 'pedidos.html', 'entregas.html', 'comunicacao.html']
};

// Itens do menu por função (para o sidebar)
const MENU_PERMISSIONS = {
    [ROLES.ADMIN]: {
        painel: true,
        estoque: true,
        pedidos: true,
        producao: true,
        entregas: true,
        cadastro_cliente: true,
        cadastro_func: true,
        historico: true,
        comunicacao: true
    },
    [ROLES.MOTORISTA]: {
        entregas: true,
        comunicacao: true
    },
    [ROLES.ESTOQUISTA]: {
        estoque: true,
        producao: true,
        comunicacao: true
    },
    [ROLES.AUX_PRODUCAO]: {
        producao: true,
        comunicacao: true
    },
    [ROLES.VENDEDOR]: {
        cadastro_cliente: true,
        pedidos: true,
        entregas: true,
        comunicacao: true
    }
};

// Usuários fictícios para demonstração local; não é um banco de dados
const USERS_DB = {
    'adm': { id: 'adm', senha: 'admin123', nome: 'Administrador', role: ROLES.ADMIN },
    'moto': { id: 'moto', senha: 'motorista123', nome: 'João Motorista', role: ROLES.MOTORISTA },
    'estoque': { id: 'estoque', senha: 'estoque123', nome: 'Maria Estoquista', role: ROLES.ESTOQUISTA },
    'producao': { id: 'producao', senha: 'producao123', nome: 'Carlos Auxiliar', role: ROLES.AUX_PRODUCAO },
    'vendedor': { id: 'vendedor', senha: 'vendedor123', nome: 'Ana Vendedora', role: ROLES.VENDEDOR }
};

// Controle de sessão demonstrativo executado apenas no navegador
class AuthSystem {
    constructor() {
        this.storageKey = 'beiramar_auth_session';
        this.initializeUsers();
    }

    // Inicializa os usuários fictícios da demonstração 
    initializeUsers() {
        // Sempre atualiza com os usuários mais recentes do código
        localStorage.setItem('beiramar_users', JSON.stringify(USERS_DB));
    }

    // Busca usuário no banco
    getUser(id) {
       
        return USERS_DB[id];
    }

    // Simula o login com os dados demonstrativos
    login(id, senha) {
        const user = this.getUser(id);

        if (!user) {
            return { success: false, message: 'ID de funcionário não encontrado' };
        }

        if (user.senha !== senha) {
            return { success: false, message: 'Senha incorreta' };
        }

        // Cria sessão 
        const session = {
            id: user.id,
            nome: user.nome,
            role: user.role,
            loginTime: new Date().toISOString()
        };

        localStorage.setItem(this.storageKey, JSON.stringify(session));

        return {
            success: true,
            message: `Bem-vindo(a), ${user.nome}!`,
            user: session
        };
    }

    // Realiza logout
    logout() {
        localStorage.removeItem(this.storageKey);
        const rootPath = window.location.pathname.includes('/pages/') ? '../../index.html' : 'index.html';
        window.location.href = rootPath;
    }

    // Verifica se está autenticado
    isAuthenticated() {
        const session = this.getSession();
        return session !== null;
    }

    // Obtém sessão atual
    getSession() {
        const sessionData = localStorage.getItem(this.storageKey);
        if (!sessionData) return null;

        try {
            return JSON.parse(sessionData);
        } catch (e) {
            return null;
        }
    }

    // Obtém função do usuário atual
    getCurrentRole() {
        const session = this.getSession();
        return session ? session.role : null;
    }

    // Obtém nome do usuário atual
    getCurrentUserName() {
        const session = this.getSession();
        return session ? session.nome : null;
    }

    // Verifica se usuário tem permissão para acessar uma página
    hasPageAccess(pagePath) {
        if (!this.isAuthenticated()) {
            return false;
        }

        const role = this.getCurrentRole();
        const permissions = PERMISSIONS[role];

        // Se não houver permissões definidas, nega acesso
        if (!permissions || permissions.length === 0) {
            return false;
        }

        // Admin tem acesso a tudo
        if (permissions.includes('*')) {
            return true;
        }

        // Normaliza o caminho removendo barras e convertendo para lowercase
        const normalizePath = (path) => {
            return path
                .toLowerCase()
                .replace(/\\/g, '/')
                .replace(/\/+/g, '/')
                .trim();
        };

        const normalizedPath = normalizePath(pagePath);

        // Verifica se alguma permissão corresponde ao caminho atual
        const hasAccess = permissions.some(allowedPath => {
            const normalizedAllowed = normalizePath(allowedPath);

            // Verifica se o caminho contém a página permitida
            return normalizedPath.includes(normalizedAllowed) ||
                   normalizedAllowed.includes(normalizedPath);
        });

        return hasAccess;
    }

    // Obtém permissões do menu para o usuário atual
    getMenuPermissions() {
        const role = this.getCurrentRole();
        return MENU_PERMISSIONS[role] || {};
    }

    // Protege página (redireciona se não tiver acesso)

    protectPage(silent = true) {
        if (!this.isAuthenticated()) {
            const rootPath = window.location.pathname.includes('/pages/') ? '../../index.html' : 'index.html';
            window.location.href = rootPath;
            return false;
        }

        const currentPath = window.location.pathname;

        if (!this.hasPageAccess(currentPath)) {
            if (!silent) {
                customAlert('Você não tem permissão para acessar esta página.');
            }
            // Redireciona para a página padrão apropriada para o role atual
            const target = this.getDefaultRedirect();
            // Usa replace para não poluir o histórico do navegador
            window.location.replace(target);
            return false;
        }

        return true;
    }

    // Determina a página padrão para redirecionamento com base nas permissões do usuário
    getDefaultRedirect() {
        // Redirecionamento baseado no role do usuário (cada role tem sua página "principal")
        const role = this.getCurrentRole();
        const inPages = window.location.pathname.includes('/pages/');
        const prefix = inPages ? '../' : 'pages/';

        switch (role) {
            case ROLES.ADMIN:
                return prefix + 'painel/painel.html';
            case ROLES.MOTORISTA:
                return prefix + 'Gestao_entregas/entregas.html';
            case ROLES.ESTOQUISTA:
                return prefix + 'Estoque_control/estoque.html';
            case ROLES.AUX_PRODUCAO:
                return prefix + 'Producao_control/producao.html';
            case ROLES.VENDEDOR:
                return prefix + 'Gestao_pedidos/pedidos.html';
            default:
                // Se não houver role conhecida, tenta primeiro painel, depois fallback para login
                const menu = this.getMenuPermissions();
                if (menu.painel) return prefix + 'painel/painel.html';
                if (menu.comunicacao) return prefix + 'comunicacao/comunicacao.html';
                const rootPath = inPages ? '../../index.html' : 'index.html';
                return rootPath;
        }
    }

    // Obtém informações sobre as funções (para debug/admin)
    getRoleInfo(role) {
        return {
            role: role,
            permissions: PERMISSIONS[role],
            menuItems: MENU_PERMISSIONS[role]
        };
    }
}

// Exporta instância global
const authSystem = new AuthSystem();

// Adiciona ao objeto window para acesso global
if (typeof window !== 'undefined') {
    window.authSystem = authSystem;
    window.ROLES = ROLES;
}
