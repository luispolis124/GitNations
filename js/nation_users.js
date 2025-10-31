// Variáveis de Configuração
const GITHUB_REPO = "GitNations/DadosGlobais";
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/nations/`;

/**
 * Busca a lista de todos os arquivos JSON de nações no repositório.
 * @returns {Array<string>} Uma lista de caminhos de arquivos (ex: ['brasil.json', 'atlantis.json']).
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
 * Busca o conteúdo de um único arquivo JSON (reutiliza a lógica de panel_nation.js).
 * @param {string} fileName - O nome do arquivo (ex: 'brasil.json').
 * @returns {object|null} O objeto de dados da nação.
 */
async function fetchSingleNationData(fileName) {
    const fileUrl = `${GITHUB_API_URL.replace('/contents/nations/', '/contents/nations/')}${fileName}`;
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

    // 1. Classificação: Por enquanto, ordena por IDH (do maior para o menor)
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

    tbody.innerHTML = ''; // Limpa o "Carregando dados globais..."

    nations.forEach((nation, index) => {
        const row = tbody.insertRow();
        row.insertCell().textContent = index + 1; // Posição
        
        // Link para o Painel do País
        const nationLink = document.createElement('a');
        nationLink.href = `painel_pais.html?nation_id=${nation.id}`;
        nationLink.textContent = nation.nome;
        row.insertCell().appendChild(nationLink);

        row.insertCell().textContent = nation.tipo_governo;
        row.insertCell().textContent = nation.capital;
        row.insertCell().textContent = nation.estatisticas.idh.toFixed(3); // 3 casas decimais
        row.insertCell().textContent = nation.estatisticas.populacao.toLocaleString('pt-BR');
        row.insertCell().textContent = nation.fundador_git_user;
    });

    if (nations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Nenhuma nação encontrada no registro global.</td></tr>';
    }
}

// Inicia o carregamento ao abrir a página (se houver a tabela)
if (document.getElementById('nation-ranking-table')) {
    loadAndRankNations();
}
