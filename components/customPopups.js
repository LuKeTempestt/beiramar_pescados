// Popups customizados para substituir alert() e confirm()

// Função para exibir alerta customizado
function customAlert(mensagem) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-popup">
                <div class="custom-alert-message">${mensagem}</div>
                <div class="custom-alert-buttons">
                    <button class="custom-alert-ok">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const okBtn = overlay.querySelector('.custom-alert-ok');

        const fechar = () => {
            overlay.remove();
            resolve();
        };

        okBtn.addEventListener('click', fechar);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar();
        });

        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') {
                fechar();
                document.removeEventListener('keydown', handleEsc);
            }
        });
    });
}

// Função para exibir confirmação customizada
function customConfirm(mensagem) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="custom-alert-popup">
                <div class="custom-alert-message">${mensagem}</div>
                <div class="custom-alert-buttons">
                    <button class="custom-alert-ok">OK</button>
                    <button class="custom-alert-cancel">Cancelar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        const okBtn = overlay.querySelector('.custom-alert-ok');
        const cancelBtn = overlay.querySelector('.custom-alert-cancel');

        const fechar = (resultado) => {
            overlay.remove();
            resolve(resultado);
        };

        okBtn.addEventListener('click', () => fechar(true));
        cancelBtn.addEventListener('click', () => fechar(false));

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) fechar(false);
        });

        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') {
                fechar(false);
                document.removeEventListener('keydown', handleEsc);
            }
        });
    });
}
