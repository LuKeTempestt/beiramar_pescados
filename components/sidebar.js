class AppSidebar extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });

    // Obtém permissões do usuário
    const permissions = this.getUserPermissions();

    // Calcula caminho base relativo
    const basePath = window.location.pathname.includes('/pages/') ? '../' : 'pages/';
    const rootPath = window.location.pathname.includes('/pages/') ? '../../' : '';

    shadow.innerHTML = `
      <link rel="stylesheet" href="${rootPath}global.css">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">

      <style>
        @media (max-width: 720px) {
          .sidebar { transform: translateX(-100%) !important; padding-top: 80px !important; }
          .sidebar.active { transform: translateX(0) !important; }
          .toggle-btn { display: flex !important; }
          .close-btn { display: block !important; }
        }
      </style>

      <div class="sidebar-backdrop" id="backdrop"></div>
      <button class="toggle-btn" id="toggle-btn">☰</button>

      <div class="sidebar" id="sidebar">
        <button class="close-btn">&times;</button>
        <br>
        <h2>Menu</h2>

        <div class="sidebar-nav">
          ${permissions.painel ? `
          <div class="nav-section">
            <h3 class="nav-section-title">Painel</h3>
            <a href="${basePath}painel/painel.html">Início</a>
          </div>
          ` : ''}
        ${this.renderOperacionalSection(permissions, basePath)}
        ${this.renderCadastrosSection(permissions, basePath)}
        ${this.renderRelatoriosSection(permissions, basePath)}
        </div>

          <div class="nav-section">
            ${permissions.comunicacao ? `<a href="${basePath}comunicacao/comunicacao.html">Comunicação</a>` : ''}
          </div>

        <div class="sidebar-footer">
          <a href="${rootPath}index.html" class="logout-btn">Sair do Sistema</a>
        </div>
      </div>

    `;
    const sidebar = shadow.querySelector("#sidebar");
    const toggleBtn = shadow.querySelector(".toggle-btn");
    const closeBtn = shadow.querySelector(".close-btn");
    const backdrop = shadow.querySelector("#backdrop");
    const logoutBtn = shadow.querySelector(".logout-btn");

    const openSidebar = () => {
      sidebar.classList.add("active");
      backdrop.classList.add("active");
      document.body.style.overflow = "hidden";
    };

    const closeSidebar = () => {
      sidebar.classList.remove("active");
      backdrop.classList.remove("active");
      document.body.style.overflow = "";
    };

    toggleBtn.addEventListener("click", openSidebar);
    closeBtn.addEventListener("click", closeSidebar);
    backdrop.addEventListener("click", closeSidebar);

    // Adiciona evento de logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.authSystem) {
          window.authSystem.logout();
        } else {
          // Fallback caso o authSystem não esteja disponível
          localStorage.removeItem('beiramar_auth_session');
          const rootPath = window.location.pathname.includes('/pages/') ? '../../index.html' : 'index.html';
          window.location.href = rootPath;
        }
      });
    }
  }

  getUserPermissions() {
    if (window.authSystem && window.authSystem.isAuthenticated()) {
      return window.authSystem.getMenuPermissions();
    }
    return {};
  }

  renderOperacionalSection(permissions, basePath) {
    const hasAnyOperacional = permissions.estoque || permissions.pedidos ||
      permissions.producao || permissions.entregas;

    if (!hasAnyOperacional) return '';

    return `
          <div class="nav-section">
            <h3 class="nav-section-title">Operacional</h3>
            ${permissions.estoque ? `<a href="${basePath}Estoque_control/estoque.html">Controle de Estoque</a>` : ''}
            ${permissions.pedidos ? `<a href="${basePath}Gestao_pedidos/pedidos.html">Gestão de Pedidos</a>` : ''}
            ${permissions.producao ? `<a href="${basePath}Producao_control/producao.html">Controle de Produção</a>` : ''}
            ${permissions.entregas ? `<a href="${basePath}Gestao_entregas/entregas.html">Gestão de Entregas</a>` : ''}
          </div>
        `;
  }

  renderCadastrosSection(permissions, basePath) {
    const hasAnyCadastro = permissions.cadastro_cliente || permissions.cadastro_func;

    if (!hasAnyCadastro) return '';

    return `
          <div class="nav-section">
            <h3 class="nav-section-title">Cadastros</h3>
            ${permissions.cadastro_cliente ? `<a href="${basePath}cadastro_cliente/cadastro_cliente.html">Cadastro de Clientes</a>` : ''}
            ${permissions.cadastro_func ? `<a href="${basePath}cadastro_func/cadastro_func.html">Controle de Funcionários</a>` : ''}
          </div>
        `;
  }

  renderRelatoriosSection(permissions, basePath) {
    if (!permissions.historico) return '';

    return `
          <div class="nav-section">
            <h3 class="nav-section-title">Relatórios</h3>
            ${permissions.historico ? `<a href="${basePath}historico/historico.html">Histórico & Auditoria</a>` : ''}
          </div>
        `;
  }
}
customElements.define("app-sidebar", AppSidebar);