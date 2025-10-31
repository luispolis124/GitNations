// Importante: No mundo real, você usaria OAuth/token seguro para autenticação com o GitHub.
// Aqui, vamos focar na lógica de como a API do GitHub seria chamada.

// Variáveis de Configuração (simuladas)
const GITHUB_REPO = "GitNations/DadosGlobais"; // Repositório central onde os dados serão armazenados
const GITHUB_OWNER = "GitNations";
const GITHUB_API_URL = "https://api.github.com/repos/";

/**
 * 1. Coleta e valida os dados do formulário de criação.
 * @returns {object|null} Objeto com os dados da nação ou null se a validação falhar.
 */
function collectNationData() {
    const nomePais = document.getElementById('nome-pais').value.trim();
    const capital = document.getElementById('capital').value.trim();
    const tipoGoverno = document.getElementById('tipo-governo').value;
    const lema = document.getElementById('lema').value.trim();
    // ... Coletar todos os outros campos

    if (!nomePais || !capital) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return null;
    }

    // Estrutura do arquivo de dados da nação (o "core" do seu país)
    return {
        id: nomePais.toLowerCase().replace(/\s/g, '_'), // ID único baseado no nome
        nome: nomePais,
        capital: capital,
        tipo_governo: tipoGoverno,
        fundador_git_user: 'nome_do_usuario_logado', // Será preenchido na autenticação real
        data_fundacao: new Date().toISOString(),
        lemas: lema,
        // Adicionar campos futuros de estatísticas iniciais
        estatisticas: {
            populacao: 1000000,
            pib: 1000000000,
            idh: 0.500
        }
    };
}

/**
 * 2. Converte o objeto da nação em JSON e codifica para base64 (requisito da API do GitHub).
 * @param {object} nationData - Os dados da nação.
 * @returns {string} O conteúdo do arquivo codificado em Base64.
 */
function encodeToGitHubFormat(nationData) {
    const jsonString = JSON.stringify(nationData, null, 2); // JSON formatado
    return btoa(jsonString); // Converte a string para Base64
}

/**
 * 3. Envia o arquivo JSON para o GitHub via API, simulando a criação da nação.
 * @param {string} fileName - O nome do arquivo a ser criado (ex: 'brasil.json').
 * @param {string} contentBase64 - O conteúdo do arquivo em Base64.
 */
async function pushToGitHub(fileName, contentBase64) {
    // ESTE TOKEN DEVE SER SEGURO E NUNCA HARDCODED! (Simulação)
    const githubToken = 'SEU_TOKEN_DE_AUTENTICACAO'; 
    
    const apiUrl = `${GITHUB_API_URL}${GITHUB_REPO}/contents/nations/${fileName}`;

    const payload = {
        message: `Fundação da Nação: ${fileName.replace('.json', '')}`, // Mensagem de commit
        content: contentBase64,
        branch: 'main' // Envia diretamente para a branch principal (Poderia ser um PR para a moderação)
    };

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${githubToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log(`Nação ${fileName} criada com sucesso no GitHub!`);
            alert(`Sua nação foi fundada! Os dados estão em: ${apiUrl}`);
            window.location.href = 'painel_pais.html?nation_id=' + fileName.replace('.json', '');
        } else {
            const error = await response.json();
            console.error("Erro ao commitar no GitHub:", error);
            alert(`Falha ao fundar a nação. Detalhes: ${error.message}`);
        }
    } catch (error) {
        console.error("Erro de rede/fetch:", error);
        alert("Ocorreu um erro de conexão ao tentar fundar sua nação.");
    }
}

// 4. Lógica de Submissão do Formulário
document.getElementById('nation-creation-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Impede o envio tradicional do formulário

    const nationData = collectNationData();
    if (!nationData) return;

    const fileName = `${nationData.id}.json`;
    const contentBase64 = encodeToGitHubFormat(nationData);

    // O coração da simulação:
    await pushToGitHub(fileName, contentBase64);
});
