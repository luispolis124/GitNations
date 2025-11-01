// js/script.js - Lógica principal da página index.html

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username-input');
    const loginMessage = document.getElementById('login-message');

    if (!loginForm || !usernameInput) {
        console.error("Elementos de login não encontrados no DOM.");
        return;
    }

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const username = usernameInput.value.trim().toLowerCase();
        
        if (!username) {
            loginMessage.textContent = 'Por favor, digite seu usuário do GitHub.';
            return;
        }

        loginMessage.textContent = 'Verificando dados da nação...';
        loginMessage.style.color = 'orange';

        // Usa a função de checagem que deve ser implementada em nation_users.js
        // (Atenção: A função checkUserNation depende do nation_users.js estar no HTML!)
        if (typeof checkUserNation !== 'function') {
             loginMessage.textContent = 'Erro: O script nation_users.js não foi carregado corretamente.';
             loginMessage.style.color = 'red';
             console.error("A função checkUserNation não está definida. Verifique o nation_users.js.");
             return;
        }
        
        try {
            // Verifica se o usuário tem uma nação existente (procurando pelo JSON)
            const nationId = await checkUserNation(username); 

            if (nationId) {
                // Sucesso: Salva o usuário e redireciona para o Painel de Controle
                setGitHubUsername(username); // Salva o nome de usuário (nation_users.js)
                loginMessage.textContent = 'Login bem-sucedido! Redirecionando...';
                loginMessage.style.color = 'green';
                
                // Redireciona para o painel da nação
                window.location.href = `painel_pais.html?id=${nationId}`;
            } else {
                // Nação não encontrada
                loginMessage.textContent = `Usuário "${username}" não possui uma nação ativa. Crie uma nova!`;
                loginMessage.style.color = 'red';
            }
        } catch (error) {
            console.error("Erro durante o processo de login:", error);
            loginMessage.textContent = 'Ocorreu um erro ao tentar buscar os dados.';
            loginMessage.style.color = 'red';
        }
    });
});
```eof

Agora, quando você digitar seu nome de usuário e clicar em "Entrar", o script tentará buscar o JSON da sua nação e redirecionará para o painel se a nação existir.

---

### Verificação Final: Atualizar `js/nation_users.js`

Para que o script de login funcione, a função **`checkUserNation`** precisa ser capaz de buscar o JSON via GitHub API (como fizemos no `panel_nation.js`).

Vou incluir a versão completa do `nation_users.js` com a função `checkUserNation` baseada no GitHub API para garantir que funcione:

```javascript:Funções de Usuário (Completo):js/nation_users.js
// js/nation_users.js - Funções auxiliares para gerenciar o estado do usuário e nação

// Variáveis de Configuração
const GITHUB_REPO = "luispolis124/GitNations";
const GITHUB_API_URL = "https://api.github.com/repos/";
const USER_STORAGE_KEY = 'git_nation_user';

/**
 * Recupera o nome de usuário do GitHub armazenado localmente.
 * @returns {string|null} O username do GitHub ou null.
 */
function getGitHubUsername() {
    return localStorage.getItem(USER_STORAGE_KEY);
}

/**
 * Salva o nome de usuário do GitHub.
 * @param {string} username - O username do GitHub.
 */
function setGitHubUsername(username) {
    localStorage.setItem(USER_STORAGE_KEY, username);
}

/**
 * Verifica se o usuário logado possui uma nação já criada, buscando o JSON via GitHub API.
 * @param {string} username - O username do GitHub.
 * @returns {Promise<string|null>} O ID da nação se encontrada (o mesmo que username), ou null.
 */
async function checkUserNation(username) {
    if (!username) {
        return null;
    }
    
    // O ID da nação é, por convenção, o username em minúsculas
    const nationId = username.toLowerCase().replace(/[^a-z0-9]/g, ''); 
    const apiUrl = `${GITHUB_API_URL}${GITHUB_REPO}/contents/nations/${nationId}.json`; 

    try {
        const response = await fetch(apiUrl);
        if (response.status === 200) {
            // O arquivo JSON da nação existe!
            return nationId;
        }
    } catch (error) {
        // Ignora erro de rede/busca, assume que a nação não existe
        console.warn(`Tentativa de buscar nação para ${username} falhou (Pode ser 404):`, error.message);
    }
    return null; // Nação não encontrada
}

// Expondo as funções
window.getGitHubUsername = getGitHubUsername;
window.setGitHubUsername = setGitHubUsername;
window.checkUserNation = checkUserNation;

console.log('nation_users.js carregado. Funções de autenticação prontas.');
```eof

Agora, se você tiver uma nação fundada (com um JSON no repositório), o login deve funcionar.
