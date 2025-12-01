document.addEventListener('DOMContentLoaded', function () {
    // Verifica se já está autenticado e redireciona para o painel
    if (window.authSystem && window.authSystem.isAuthenticated()) {
        // Redireciona para a página padrão do role atual
        const target = window.authSystem.getDefaultRedirect();
        window.location.href = target;
        return;
    }

    const entrarBtn = document.querySelector('.button');
    const usuarioInput = document.getElementById('userId');
    const senhaInput = document.getElementById('userPassword');
    const inputs = document.querySelectorAll('input');

    // 1. EFEITOS VISUAIS NOS INPUTS
    function configurarEfeitosVisuais() {
        inputs.forEach(input => {
            // Efeito ao focar no input
            input.addEventListener('focus', function () {
                this.style.transform = 'scale(1.02)';
                this.style.transition = 'all 0.3s ease';
                this.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.5)';
                this.style.border = '2px solid #0000ffff';
            });

            // Efeito ao sair do input
            input.addEventListener('blur', function () {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = 'none';
                this.style.border = '2px solid transparent';
            });
        });
    }

    // 2. EFEITOS NO BOTÃO ENTRAR
    function configurarEfeitosBotao() {
        // Efeito hover adicional
        entrarBtn.addEventListener('mouseenter', function () {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 5px 15px rgba(0, 123, 255, 0.4)';
            this.style.transition = 'all 0.3s ease';
        });

        entrarBtn.addEventListener('mouseleave', function () {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });

        // Efeito ao clicar
        entrarBtn.addEventListener('mousedown', function () {
            this.style.transform = 'translateY(1px)';
        });

        entrarBtn.addEventListener('mouseup', function () {
            this.style.transform = 'translateY(-2px)';
        });
    }

    // 3. VALIDAÇÃO E AUTENTICAÇÃO
    function configurarValidacao() {
        entrarBtn.addEventListener('click', function (e) {
            e.preventDefault();

            let isValid = true;

            // Remove estilos de erro anteriores
            inputs.forEach(input => {
                input.style.border = '2px solid transparent';
                input.style.background = '';
            });

            const userId = usuarioInput.value.trim();
            const password = senhaInput.value;

            // Valida usuário
            if (!userId) {
                mostrarErro(usuarioInput, 'Por favor, digite seu ID');
                usuarioInput.focus();
                isValid = false;
            }

            // Valida senha
            if (!password) {
                mostrarErro(senhaInput, 'Por favor, digite sua senha');
                if (isValid) senhaInput.focus();
                isValid = false;
            }

            // Se válido, tenta fazer login
            if (isValid) {
                realizarLogin(userId, password);
            }
        });
    }

        // mostrar e ocultar a senha
    function configurarToggleSenha() {
        const togglePassword = document.querySelector('.toggle-password');
        if (togglePassword) {
            togglePassword.addEventListener('click', function () {
                const passwordInput = document.getElementById('userPassword');
                const icon = this.querySelector('i');

                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    this.setAttribute('aria-label', 'Ocultar senha');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    this.setAttribute('aria-label', 'Mostrar senha');
                }
            });
        }
    }

    // Mostra erro no campo
    function mostrarErro(input, mensagem) {
        input.style.border = '2px solid #dc3545';
        input.style.background = 'linear-gradient(45deg, #ffe6e6, #ffffff)';
    }

    // Realiza login usando o sistema de autenticação
    function realizarLogin(id, senha) {
        const resultado = window.authSystem.login(id, senha);

        if (resultado.success) {
            animacaoLoginSucesso(resultado.user.nome);
        } else {
            animacaoLoginFalha(resultado.message);
        }
    }

    // Animação de falha no login
    function animacaoLoginFalha(mensagem) {
        // Efeito no botão
        entrarBtn.style.background = 'linear-gradient(45deg, #dc3545, #c82333)';
        entrarBtn.innerHTML = '✗ ' + mensagem;

        // Efeito nos inputs
        inputs.forEach(input => {
            input.style.border = '2px solid #dc3545';
            input.style.background = 'linear-gradient(45deg, #ffe6e6, #ffffff)';
        });

        // Vibração
        entrarBtn.style.animation = 'shake 0.5s';

        // Restaura depois de 2 segundos
        setTimeout(() => {
            entrarBtn.style.background = '';
            entrarBtn.innerHTML = 'Acessar';
            entrarBtn.style.animation = '';
            inputs.forEach(input => {
                input.style.border = '2px solid transparent';
                input.style.background = '';
            });
        }, 2000);
    }

    // 4. ANIMAÇÃO DE LOGIN BEM-SUCEDIDO
    function animacaoLoginSucesso(nomeUsuario) {
        // Efeito no botão
        entrarBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
        entrarBtn.innerHTML = '✓ Bem-vindo(a), ' + nomeUsuario + '!';
        entrarBtn.style.transform = 'scale(1.05)';

        // Efeito nos inputs
        inputs.forEach(input => {
            input.style.border = '2px solid #28a745';
            input.style.background = 'linear-gradient(45deg, #e8f5e8, #ffffff)';
        });

        // Redireciona após breve delay
        setTimeout(() => {
            // Redireciona para a página padrão definida pelo AuthSystem (role → página)
            const target = window.authSystem.getDefaultRedirect();
            window.location.href = target;
        }, 1500);
    }

    // 5. SUBMETER COM ENTER
    function configurarEnterSubmit() {
        inputs.forEach(input => {
            input.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    entrarBtn.click();
                }
            });
        });
    }

    // INICIALIZAÇÃO DE TODAS AS FUNCIONALIDADES
    function inicializar() {
        console.log('Inicializando sistema de login Beira Mar Pescados...');

        configurarEfeitosVisuais();
        configurarEfeitosBotao();
        configurarValidacao();
        configurarEnterSubmit();
        configurarToggleSenha()

        console.log('Sistema de login inicializado com sucesso!');
    }

    inicializar();
});