// Variáveis de Configuração (simuladas, as mesmas da criação)
const GITHUB_REPO = "GitNations/DadosGlobais";
const GITHUB_API_URL = "https://api.github.com/repos/";

/**
 * 1. Extrai o ID da nação da URL (ex: "brasil" em ?nation_id=brasil).
 * @returns {string|null} O ID da nação.
 */
function getNationIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('nation_id');
}

/**
 * 2. Busca o arquivo JSON da nação no GitHub.
 * @param {string} nationId - O ID da nação.
 * @returns {object|null} O objeto de dados da nação.
 */
async function fetchNationData(nationId) {
    if (!nationId) {
        document.getElementById('nation-title').textContent = "Erro: ID da Nação não especificado na URL.";
        return null;
    }

    const fileName = `${nationId}.json`;
    const apiUrl = `${GITHUB_API_URL}${GITHUB_REPO}/contents/nations/${fileName}`;

    try {
        // A API do GitHub retorna informações sobre o arquivo, incluindo o conteúdo em Base64
        const response = await fetch(apiUrl);
        
        if (response.status === 404) {
            document.getElementById('nation-title').textContent = `Erro 404: Nação '${nationId}' não encontrada.`;
            return null;
        }

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados do GitHub: ${response.status}`);
        }

        const data = await response.json();
        
        // O conteúdo do arquivo está na propriedade 'content', em Base64
        const contentBase64 = data.content;
        
        // Decodifica o Base64 para a string JSON original
        const jsonString = atob(contentBase64); 
        
        // Converte a string JSON em objeto JavaScript
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Falha ao carregar dados da nação:", error);
        document.getElementById('nation-title').textContent = "Erro ao carregar dados. Verifique a consola.";
        return null;
    }
}

/**
 * 3. Preenche o HTML do Painel com os dados da nação.
 * @param {object} data - Os dados do país.
 */
function renderNationPanel(data) {
    // Título Principal
    document.getElementById('nation-title').textContent = data.nome;

    // Seção Visão Geral
    document.getElementById('info-capital').textContent = data.capital;
    document.getElementById('info-fundador').textContent = data.fundador_git_user;
    document.getElementById('info-fundacao').textContent = new Date(data.data_fundacao).toLocaleDateString('pt-BR');

    // Seção Governo e Identidade
    document.getElementById('info-governo').textContent = data.tipo_governo;
    document.getElementById('info-lema').textContent = data.lemas;
    // Opcional: Carregar e exibir a bandeira se a URL estiver no JSON

    // Seção Estatísticas (usando os valores iniciais definidos na criação)
    const stats = data.estatisticas;
    document.getElementById('stat-populacao').textContent = stats.populacao.toLocaleString('pt-BR');
    document.getElementById('stat-pib').textContent = `U$ ${stats.pib.toLocaleString('pt-BR')}`;
    document.getElementById('stat-idh').textContent = stats.idh;
}

// 4. Inicia o processo quando a página é carregada.
async function initializePanel() {
    const nationId = getNationIdFromUrl();
    if (nationId) {
        const nationData = await fetchNationData(nationId);
        if (nationData) {
            renderNationPanel(nationData);
        }
    }
}

initializePanel();
