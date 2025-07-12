document.addEventListener('DOMContentLoaded', () => {
    // Aponta para o seu backend local
    const apiUrl = '';

    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        errorMessage.textContent = '';

        const login = document.getElementById('login').value;
        const senha = document.getElementById('senha').value;

        fetch(`${apiUrl}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ login, senha })
        })
        .then(response => {
            if (!response.ok) {
                // Se a resposta do servidor não for de sucesso, nós forçamos a ida para o .catch
                throw new Error('Falha na autenticação');
            }
            return response.json();
        })
        .then(data => {
            if (data.token) {
                localStorage.setItem('jwtToken', data.token);
                window.location.href = 'pedidos.html';
            } else {
                // Se o servidor responder com sucesso mas não enviar o token, forçamos o erro
                throw new Error('Token não retornado');
            }
        })
        .catch(error => {
            // MUDANÇA AQUI: Em vez de mostrar a mensagem técnica do erro,
            // agora exibimos uma mensagem fixa e simples para o usuário.
            errorMessage.textContent = 'Login inválido';

            // Mantemos o erro original no console para fins de depuração (F12)
            console.error('Erro de login:', error);
        });
    });
});