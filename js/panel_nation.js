// js/panel_nation.js - Carrega e exibe os dados da nação, buscando-os via GitHub API.

// Variáveis de Configuração
// O repositório onde os dados das nações estão armazenados.
const GITHUB_REPO = "luispolis124/GitNations"; // Ajustado para o repositório principal
const GITHUB_API_URL = "https://api.github.com/repos/";

/**
 * 1. Extrai o ID da nação da URL.
 * O painel usa 'id', mas a nova lógica de busca usa 'nation_id' como fallback.
 * Vamos manter a busca por 'id' para compatibilidade com o HTML existente.
 * @returns {string|null} O ID da nação.
 */
function getNationIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id'); // Mantendo 'id' como chave principal
}

/**
 * 2. Busca o arquivo JSON da nação no GitHub API.
 * @param {string} nationId - O ID da nação.
 * @returns {Promise<object|null>} O objeto de dados da nação.
 */
async function fetchNationData(nationId) {
    if (!nationId) {
        document.getElementById('nation-title').textContent = "Erro: ID da Nação não especificado na URL.";
        return null;
    }

    const fileName = `${nationId}.json`;
    // Caminho completo para o arquivo dentro do repositório
    const apiUrl = `${GITHUB_API_URL}${GITHUB_REPO}/contents/nations/${fileName}`;

    try {
        // Busca os metadados do arquivo (incluindo o conteúdo em Base64)
        const response = await fetch(apiUrl);
        
        if (response.status === 404) {
            document.getElementById('nation-title').textContent = `Erro 404: Nação '${nationId}' não encontrada.`;
            document.getElementById('nation-panel').innerHTML = '<p class="error-message">A nação não existe ou seu PR de fundação ainda não foi aceito.</p>';
            return null;
        }

        if (!response.ok) {
            throw new Error(`Erro ao buscar dados do GitHub: ${response.status}`);
        }

        const data = await response.json();
        
        // Decodifica o Base64 para a string JSON original
        const contentBase64 = data.content;
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
 * @param {object} nationData - Os dados do país.
 */
function renderNationPanel(nationData) {
    const stats = nationData.estatisticas;

    // Título Principal
    document.getElementById('nation-title').textContent = nationData.nome;

    // Seção Visão Geral
    document.getElementById('info-capital').textContent = nationData.capital;
    // O campo no JSON é 'proprietario_github'
    document.getElementById('info-fundador').textContent = `@${nationData.proprietario_github || 'N/A'}`; 
    document.getElementById('info-fundacao').textContent = nationData.data_fundacao 
        ? new Date(nationData.data_fundacao).toLocaleDateString('pt-BR') 
        : 'Desconhecida';

    // Preencher a bandeira
    const flagDisplay = document.getElementById('flag-display');
    if (nationData.bandeira_url) {
        flagDisplay.innerHTML = `<img src="${nationData.bandeira_url}" alt="Bandeira de ${nationData.nome}" style="max-width: 150px; height: auto; border: 1px solid #ddd; border-radius: 8px;">`;
    } else {
        flagDisplay.innerHTML = `[Bandeira N/A]`;
    }

    // Seção Governo e Identidade
    document.getElementById('info-governo').textContent = nationData.tipo_governo;
    document.getElementById('info-lider').textContent = nationData.lider || 'Aguardando Eleição/Definição'; 
    document.getElementById('info-lema').textContent = nationData.lema_nacional || 'N/A';

    // Seção Estatísticas
    document.getElementById('stat-populacao').textContent = formatNumber(stats.populacao);
    document.getElementById('stat-pib').textContent = formatCurrency(stats.pib);
    document.getElementById('stat-idh').textContent = stats.idh.toFixed(3);
    
    // Configurar link de edição
    const editLink = document.querySelector('a[href="ficha_do_pais.html?edit=true"]');
    if (editLink) {
        // Redireciona para a ficha com o ID correto (assumindo que o ID é o nome do arquivo)
        editLink.href = `ficha_do_pais.html?id=${nationData.id}`;
    }

    // Configurar botão de Ações (Acessar CGG)
    const cggButton = document.querySelector('#actions button:last-child');
    if (cggButton) {
         cggButton.addEventListener('click', () => {
             // Link para Issues/Diplomacia
             window.open('https://github.com/luispolis124/GitNations/issues', '_blank'); 
         });
         cggButton.textContent = 'Acessar CGG (Diplomacia)';
    }
}

/** Funções de Formatação (Reutilizáveis) **/

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + ' B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + ' M';
    return num.toLocaleString('pt-BR');
}

function formatCurrency(num) {
    return 'US$ ' + formatNumber(num);
}


// 4. Inicia o processo quando a página é carregada.
document.addEventListener('DOMContentLoaded', async () => {
    const nationId = getNationIdFromUrl();
    if (nationId) {
        const nationData = await fetchNationData(nationId);
        if (nationData) {
            renderNationPanel(nationData);
        }
    }
});
