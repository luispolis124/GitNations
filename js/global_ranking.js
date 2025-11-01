// js/global_ranking.js - Carrega todos os arquivos JSON de nações e gera o ranking.

// Variáveis de Configuração
const GITHUB_REPO = "luispolis124/GitNations"; // Use seu repositório principal
// API URL para listar o conteúdo da pasta 'nations'
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/nations/`;

/**
 * Busca a lista de todos os arquivos JSON de nações no repositório.
 * @returns {Promise<Array<string>>} Uma lista de nomes de arquivos (ex: ['brasil.json', 'atlantis.json']).
 */
async function listNationFiles() {
    try {
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
            throw new Error(`Erro ao listar arquivos: ${response.status}`);
        }
        
        const files = await response.json();
        
        // Filtra apenas arquivos com a extensão .json
        return files
            .filter(file => file.type === 'file' && file.name.endsWith('.json'))
            .map(file => file.name);

    } catch (error) {
        console.error("Erro ao listar nações:", error);
        return [];
    }
}

/**
 * Busca o conteúdo de um único arquivo JSON, decodificando o Base64.
 * @param {string} fileName - O nome do arquivo (ex: 'brasil.json').
 * @returns {Promise<object|null>} O objeto de dados da nação.
 */
async function fetchSingleNationData(fileName) {
    // A URL é construída para buscar o conteúdo de um arquivo específico
    const fileUrl = `${GITHUB_API_API}${fileName}`;
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) return null;
        
        const data = await response.json();
        const jsonString = atob(data.content); // Decodifica Base64
        return JSON.parse(jsonString);

    } catch (error) {
        console.error(`Falha ao carregar ${fileName}:`, error);
        return null;
    }
}

/**
 * Orquestra o carregamento de todos os dados e preenche a tabela de ranking.
 */
async function loadAndRankNations() {
    const fileNames = await listNationFiles();
    const allNationPromises = fileNames.map(fetchSingleNationData);
    
    // Espera que todos os dados das nações sejam carregados simultaneamente
    let nations = await Promise.all(allNationPromises);
    
    // Remove qualquer falha de carregamento (nations nulos)
    nations = nations.filter(nation => nation !== null);

    // 1. Classificação: Ordena por IDH (do maior para o menor)
    nations.sort((a, b) => b.estatisticas.idh - a.estatisticas.idh);

    // 2. Renderização
    renderRankingTable(nations);

    // 3. Atualiza contagem do CGG (se estiver na página organizacao.html)
    if (document.getElementById('member-count')) {
        document.getElementById('member-count').textContent = nations.length;
    }
}

/**
 * Preenche a tabela no ranking.html.
 * @param {Array<object>} nations - A lista de nações classificadas.
 */
function renderRankingTable(nations) {
    const tbody = document.querySelector('#nation-ranking-table tbody');
    if (!tbody) return;

    tbody.innerHTML = ''; // Limpa o conteúdo de carregamento

    nations.forEach((nation, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1; // Posição
        
        // Link para o Painel do País
        const nationLink = document.createElement('a');
        // ATENÇÃO: Se você usar 'nation_id' na URL, mude a linha abaixo
        nationLink.href = `painel_pais.html?id=${nation.id}`; 
        nationLink.textContent = nation.nome;
        row.insertCell().appendChild(nationLink);

        row.insertCell().textContent = nation.tipo_governo;
        row.insertCell().textContent = nation.capital;
        row.insertCell().textContent = nation.estatisticas.idh.toFixed(3); // 3 casas decimais
        // O campo no JSON é proprietario_github, não fundador_git_user
        row.insertCell().textContent = formatNumber(nation.estatisticas.populacao); 
        row.insertCell().textContent = nation.proprietario_github || 'N/A';
    });

    if (nations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma nação encontrada no registro global.</td></tr>';
    }
}

/** Funções Auxiliares (Reutilizadas) **/
function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + ' B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + ' M';
    return num.toLocaleString('pt-BR');
}


// Inicia o carregamento se a tabela de ranking for encontrada na página
if (document.getElementById('nation-ranking-table')) {
    loadAndRankNations();
}
```eof

## 2. Script de Usuários da Nação (`js/nation_users.js`)

Este script mantém a funcionalidade de gerenciamento de estado do usuário (simulação de login).

**Crie o arquivo `js/nation_users.js` com o seguinte conteúdo:**

```javascript:Funções de Usuário:js/nation_users.js
// js/nation_users.js - Funções auxiliares para gerenciar o estado do usuário e nação

/**
 * Chave usada no localStorage para armazenar o ID do usuário (GitHub Username).
 * @type {string}
 */
const USER_STORAGE_KEY = 'git_nation_user';

/**
 * Recupera o nome de usuário do GitHub armazenado localmente.
 * @returns {string|null} O username do GitHub ou null.
 */
function getGitHubUsername() {
    return localStorage.getItem(USER_STORAGE_KEY);
}

/**
 * Salva o nome de usuário do GitHub para simular login/identificação.
 * @param {string} username - O username do GitHub.
 */
function setGitHubUsername(username) {
    localStorage.setItem(USER_STORAGE_KEY, username);
    console.log(`Usuário setado no LocalStorage: ${username}`);
}

/**
 * Remove o nome de usuário do GitHub (Logout).
 */
function removeGitHubUsername() {
    localStorage.removeItem(USER_STORAGE_KEY);
    console.log('Usuário removido do LocalStorage.');
}

// Expondo as funções globalmente para serem usadas em outros scripts
window.getGitHubUsername = getGitHubUsername;
window.setGitHubUsername = setGitHubUsername;
window.removeGitHubUsername = removeGitHubUsername;

console.log('nation_users.js carregado. Funções de usuário disponíveis.');
```eof

Agora você tem scripts dedicados para as três áreas principais do seu projeto: **Criação** (`creation_nation_user.js`), **Painel Individual** (`panel_nation.js`) e **Ranking Global** (`global_ranking.js`), além do script auxiliar de **Usuários** (`nation_users.js`).
