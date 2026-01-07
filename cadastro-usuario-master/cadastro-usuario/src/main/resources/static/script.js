const API_URL = '/usuario';

// Event Listener para Cadastro
document.getElementById('cadastroForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const submitBtn = this.querySelector('button[type="submit"]');
    
    setLoading(submitBtn, true, 'Cadastrando...');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ nome, email })
        });

        if (response.ok) {
            showFeedback('Usuário cadastrado com sucesso!', 'success');
            this.reset();
        } else {
            showFeedback('Erro ao cadastrar usuário.', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showFeedback('Erro de conexão.', 'error');
    } finally {
        setLoading(submitBtn, false, 'Cadastrar');
    }
});

// Função de Busca
async function buscarUsuario() {
    const email = document.getElementById('searchEmail').value;
    const resultArea = document.getElementById('resultArea');
    const feedbackMsg = document.getElementById('feedbackMessage');
    
    if (!email) {
        showFeedback('Por favor, digite um email.', 'error', feedbackMsg);
        return;
    }

    try {
        const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`);
        
        if (response.ok) {
            const user = await response.json();
            if (user) {
                renderUser(user);
                resultArea.classList.remove('hidden');
                resultArea.classList.add('fade-in');
                feedbackMsg.classList.add('hidden');
            } else {
                resultArea.classList.add('hidden');
                showFeedback('Usuário não encontrado.', 'error', feedbackMsg);
            }
        } else {
            resultArea.classList.add('hidden');
            showFeedback('Usuário não encontrado.', 'error', feedbackMsg);
        }
    } catch (error) {
        console.error('Erro:', error);
        showFeedback('Erro ao buscar usuário.', 'error', feedbackMsg);
    }
}

// Renderizar Usuário na Tela
let currentUser = null; // Armazena o usuário atual buscado

function renderUser(user) {
    currentUser = user;
    const userInfo = document.getElementById('userInfo');
    const editForm = document.getElementById('editForm');
    
    // Garante que o modo de visualização está ativo
    userInfo.classList.remove('hidden');
    editForm.classList.add('hidden');

    userInfo.innerHTML = `
        <div class="bg-gray-50 p-4 rounded-md border border-gray-200">
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="text-sm font-medium text-gray-500 uppercase tracking-wider">Nome</h4>
                    <p class="mt-1 text-lg font-semibold text-gray-900">${user.nome}</p>
                    
                    <h4 class="mt-3 text-sm font-medium text-gray-500 uppercase tracking-wider">Email</h4>
                    <p class="mt-1 text-gray-900">${user.email}</p>
                    
                    <p class="mt-2 text-xs text-gray-400">ID: ${user.id}</p>
                </div>
                <div class="flex flex-col space-y-2">
                    <button onclick="prepararEdicao()" class="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        Editar
                    </button>
                    <button onclick="deletarUsuario('${user.email}')" class="text-red-600 hover:text-red-900 text-sm font-medium">
                        Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Deletar Usuário
async function deletarUsuario(email) {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${email}?`)) return;

    try {
        const response = await fetch(`${API_URL}?email=${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            document.getElementById('resultArea').classList.add('hidden');
            document.getElementById('searchEmail').value = '';
            showFeedback('Usuário excluído com sucesso!', 'success', document.getElementById('feedbackMessage'));
        } else {
            alert('Erro ao excluir usuário.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão.');
    }
}

// Editar Usuário
function prepararEdicao() {
    if (!currentUser) return;
    
    document.getElementById('userInfo').classList.add('hidden');
    const editForm = document.getElementById('editForm');
    editForm.classList.remove('hidden');
    editForm.classList.add('fade-in');
    
    document.getElementById('editId').value = currentUser.id;
    document.getElementById('editNome').value = currentUser.nome;
    document.getElementById('editEmail').value = currentUser.email;
}

function cancelarEdicao() {
    document.getElementById('editForm').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('hidden');
}

async function salvarEdicao() {
    const id = document.getElementById('editId').value;
    const nome = document.getElementById('editNome').value;
    const email = document.getElementById('editEmail').value;
    
    try {
        // Nota: O endpoint espera 'Id' com I maiúsculo na query string
        const response = await fetch(`${API_URL}?Id=${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: parseInt(id), // Mantendo ID no corpo também por garantia
                nome: nome,
                email: email
            })
        });

        if (response.ok) {
            // Atualiza o objeto local e re-renderiza
            currentUser.nome = nome;
            currentUser.email = email;
            renderUser(currentUser);
            showFeedback('Usuário atualizado com sucesso!', 'success', document.getElementById('feedbackMessage'));
        } else {
            alert('Erro ao atualizar usuário.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro de conexão.');
    }
}

// Utilitários
function setLoading(element, isLoading, text) {
    if (isLoading) {
        element.disabled = true;
        element.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${text}
        `;
    } else {
        element.disabled = false;
        element.innerHTML = text;
    }
}

function showFeedback(message, type, element) {
    // Se nenhum elemento for passado, tenta usar um global ou cria um toast (simplificado aqui para usar alert ou div específica)
    // No cadastro, usamos alert ou injetamos abaixo do form. Vamos injetar.
    
    let target = element;
    if (!target) {
        // Cria um elemento temporário abaixo do form de cadastro se não for passado
        const form = document.getElementById('cadastroForm');
        let existing = document.getElementById('cadastroFeedback');
        if (existing) existing.remove();
        
        target = document.createElement('div');
        target.id = 'cadastroFeedback';
        target.className = 'mt-3 text-sm text-center font-medium';
        form.appendChild(target);
    }
    
    target.textContent = message;
    target.classList.remove('hidden', 'text-green-600', 'text-red-600');
    
    if (type === 'success') {
        target.classList.add('text-green-600');
    } else {
        target.classList.add('text-red-600');
    }

    // Auto hide after 3 seconds if it's a temp message
    if (!element) {
        setTimeout(() => {
            target.classList.add('hidden');
        }, 5000);
    }
}
