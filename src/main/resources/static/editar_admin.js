document.addEventListener('DOMContentLoaded', () => {
    const formEdicaoAdmin = document.getElementById('formEdicaoAdmin');
    const inputLogin = document.getElementById('inputLogin');
    const inputSenha = document.getElementById('inputSenha');
    const inputSenhaConfirm = document.getElementById('inputSenhaConfirm');
    const inputTelefone = document.getElementById('inputTelefone');
    const statusEdicao = document.getElementById('statusEdicao');
    const btnSalvarAdmin = document.getElementById('btnSalvarAdmin');
    const senhaError = document.getElementById('senhaError');
    const telefoneError = document.getElementById('telefoneError'); // <-- NOVO

    const token = localStorage.getItem('jwtToken');
    if (!token) {
        alert("Sessão expirada. Por favor, faça o login novamente.");
        window.location.href = 'index.html';
        return;
    }

    // --- FUNÇÃO DE VALIDAÇÃO DE SENHA (sem alteração) ---
    function validarSenhas() {
        const senha = inputSenha.value;
        const confirmacao = inputSenhaConfirm.value;
        if (confirmacao && senha !== confirmacao) {
            senhaError.textContent = 'As senhas não coincidem.';
            return false;
        } else {
            senhaError.textContent = '';
            return true;
        }
    }

    // --- NOVA FUNÇÃO DE VALIDAÇÃO DE TELEFONE ---
    function validarTelefone() {
        const telefone = inputTelefone.value;
        // Remove tudo que não for dígito (espaços, traços, parênteses, etc.)
        const digitos = telefone.replace(/\D/g, '');

        // Valida se o campo, uma vez preenchido, tem exatamente 13 dígitos.
        if (digitos.length > 0 && digitos.length !== 13) {
            telefoneError.textContent = 'O telefone deve ter 13 dígitos (Ex: 5579999184876).';
            return false;
        } else {
            telefoneError.textContent = '';
            return true;
        }
    }

    // --- ADICIONANDO OS EVENTOS 'input' ---
    inputSenha.addEventListener('input', validarSenhas);
    inputSenhaConfirm.addEventListener('input', validarSenhas);
    inputTelefone.addEventListener('input', validarTelefone); // <-- NOVO

    // --- LÓGICA DE SUBMISSÃO DO FORMULÁRIO (ATUALIZADA) ---
    formEdicaoAdmin.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Executa ambas as validações antes de enviar
        const senhasSaoValidas = validarSenhas();
        const telefoneEhValido = validarTelefone();

        if (!senhasSaoValidas || !telefoneEhValido) {
            return; // Interrompe o envio se qualquer validação falhar
        }

        btnSalvarAdmin.disabled = true;
        statusEdicao.textContent = 'Salvando...';
        statusEdicao.style.color = 'black';

        const dadosParaEnviar = {};

        if (inputLogin.value.trim()) {
            dadosParaEnviar.login = inputLogin.value.trim();
        }
        if (inputSenha.value.trim()) {
            dadosParaEnviar.senha = inputSenha.value.trim();
        }
        // Envia para o backend apenas os dígitos do telefone
        if (inputTelefone.value.trim()) {
            dadosParaEnviar.telefone = inputTelefone.value.replace(/\D/g, '');
        }

        if (Object.keys(dadosParaEnviar).length === 0) {
            statusEdicao.textContent = 'Nenhum campo foi preenchido para alteração.';
            statusEdicao.style.color = 'orange';
            btnSalvarAdmin.disabled = false;
            return;
        }

        try {
            // ... (resto do fetch permanece igual)
            const response = await fetch('/admin', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) {
                const erro = await response.text();
                throw new Error(`Falha na atualização: ${erro}`);
            }

            statusEdicao.textContent = 'Dados do administrador atualizados com sucesso!';
            statusEdicao.style.color = 'green';
            formEdicaoAdmin.reset();

            if (dadosParaEnviar.login || dadosParaEnviar.senha) {
                setTimeout(() => {
                    alert("Seu login ou senha foi alterado. Por favor, faça o login novamente.");
                    document.getElementById('btnLogout').click();
                }, 2000);
            }

        } catch (error) {
            console.error('Erro ao atualizar dados do admin:', error);
            statusEdicao.textContent = `Erro: ${error.message}`;
            statusEdicao.style.color = 'red';
        } finally {
            btnSalvarAdmin.disabled = false;
        }
    });
});