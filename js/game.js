// js/game.js - Motor de Simulação Unificado para GitHub Actions

// Importar os módulos nativos do Node.js
const fs = require('fs').promises; 
const path = require('path');

// --- CONSTANTES E CONFIGURAÇÕES DO JOGO ---

const BASE_GROWTH_RATE = 0.01; // Taxa de crescimento base de 1% (para População e PIB)

// Caminho para a pasta onde os arquivos JSON das nações estão.
// (O '..' é necessário pois o script está em /js/ e os dados em /nations/)
const NATIONS_DIR = path.join(__dirname, '..', 'nations'); 

// Modificadores baseados no tipo de governo
const GOVERNMENT_MODIFIERS = {
    'Democracia': { pib_mod: 1.05, populacao_mod: 1.01 }, 
    'Monarquia': { pib_mod: 0.95, populacao_mod: 1.02 }, 
    'Ditadura': { pib_mod: 1.10, populacao_mod: 0.98 }   
    // Adicionar mais tipos e balanceamento aqui!
};

// --- FUNÇÕES DE I/O (INPUT/OUTPUT) LOCAL (PARA O GITHUB ACTIONS) ---

/**
 * Lê um único arquivo JSON da nação localmente no diretório 'nations/'.
 * @param {string} nationId - O ID da nação.
 * @returns {object|null} O objeto de dados da nação.
 */
async function readNationDataLocal(nationId) {
    const filePath = path.join(NATIONS_DIR, `${nationId}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return null;
        }
        console.error(`Erro ao ler dados de ${nationId}:`, error);
        return null;
    }
}

/**
 * Salva os dados atualizados da nação localmente.
 * @param {string} nationId - O ID da nação.
 * @param {object} nationData - O objeto de dados da nação atualizado.
 */
async function writeNationDataLocal(nationId, nationData) {
    const filePath = path.join(NATIONS_DIR, `${nationId}.json`);
    const jsonString = JSON.stringify(nationData, null, 2); 
    
    try {
        await fs.writeFile(filePath, jsonString, 'utf-8');
        console.log(`Dados de ${nationId} salvos localmente.`);
    } catch (error) {
        console.error(`Erro ao salvar dados de ${nationId}:`, error);
        throw error;
    }
}

/**
 * Lista todos os IDs de nações buscando arquivos JSON no diretório 'nations/'.
 * @returns {Array<string>} Uma lista de IDs das nações.
 */
async function listAllNationIdsLocal() {
    try {
        const files = await fs.readdir(NATIONS_DIR);
        return files
            .filter(name => name.endsWith('.json'))
            .map(name => name.replace('.json', ''));
    } catch (error) {
        if (error.code === 'ENOENT') {
            return [];
        }
        console.error("Erro ao listar o diretório de nações:", error);
        return [];
    }
}

// --- FUNÇÕES DO MOTOR DE SIMULAÇÃO ---

/**
 * O Motor Principal: Roda a simulação (cálculos) para uma única nação.
 * @param {string} nationId - O ID da nação a ser processada.
 * @returns {object|null} Os novos dados da nação após o turno.
 */
async function runNationTurn(nationId) {
    // 1. Carregar Dados Atuais (via leitura local)
    const nation = await readNationDataLocal(nationId);
    if (!nation) return null;
    
    const stats = nation.estatisticas;
    const type = nation.tipo_governo;
    const mods = GOVERNMENT_MODIFIERS[type] || { pib_mod: 1.0, populacao_mod: 1.0 }; 

    // --- 2. Calcular Crescimento e Atualizar Estatísticas ---
    
    // a) Crescimento Populacional
    let popGrowthRate = BASE_GROWTH_RATE * mods.populacao_mod;
    popGrowthRate += (stats.idh * 0.005); // IDH influencia a longevidade/crescimento
    
    stats.populacao = Math.round(stats.populacao * (1 + popGrowthRate));

    // b) Crescimento do PIB
    let pibGrowthRate = BASE_GROWTH_RATE * mods.pib_mod;
    pibGrowthRate += (stats.idh * 0.02); // IDH influencia a produtividade
    
    stats.pib = Math.round(stats.pib * (1 + pibGrowthRate));

    // c) Recalcular IDH (Índice de Desenvolvimento Humano)
    const pibPerCapita = stats.pib / stats.populacao;
    
    // Simulação do cálculo de IDH
    let newIDH = 0.5 + 0.5 * Math.tanh(pibPerCapita / 50000); 
    
    // Aplicação de Penalidade Social/Governamental
    if (type === 'Ditadura') {
        newIDH *= 0.95; // Penalidade
    }
    
    stats.idh = Math.min(1.0, Math.max(0.0, newIDH)); // Garante limite entre 0 e 1
    
    console.log(`[${nation.nome}] Turno Concluído. Novo PIB: ${stats.pib.toLocaleString()}, Novo IDH: ${stats.idh.toFixed(3)}`);

    // 3. Salvar Novas Estatísticas localmente (para o commit do Actions)
    await writeNationDataLocal(nationId, nation);
    
    return nation; 
}


/**
 * Função Global: Inicia o processo de simulação para todas as nações.
 * (Chamada principal pelo GitHub Actions)
 */
async function runGlobalTurn() {
    console.log("--- INICIANDO TURNO GLOBAL GITNATIONS ---");
    
    const nationIds = await listAllNationIdsLocal();
    console.log(`Nações encontradas para o turno: ${nationIds.length}`);

    if (nationIds.length === 0) {
        console.log("Nenhuma nação para processar. Encerrando turno.");
        return;
    }

    // Executa o turno para todas as nações em paralelo
    const processPromises = nationIds.map(id => runNationTurn(id));
    await Promise.all(processPromises);
    
    console.log("--- TURNO GLOBAL CONCLUÍDO COM SUCESSO ---");
}

// Exporta a função para ser utilizada pelo fluxo de trabalho do GitHub Actions
module.exports = {
    runGlobalTurn
}; * @returns {object|null} Os novos dados da nação após o turno.
 */
async function runNationTurn(nationId) {
    const nation = await fetchNationData(nationId);
    if (!nation) return null;
    
    const stats = nation.estatisticas;
    const type = nation.tipo_governo;
    const mods = GOVERNMENT_MODIFIERS[type] || { pib_mod: 1.0, populacao_mod: 1.0 }; // Modificador padrão se não encontrar

    // --- 2. Calcular Crescimento e Atualizar Estatísticas ---
    
    // a) Crescimento Populacional
    let popGrowthRate = BASE_GROWTH_RATE * mods.populacao_mod;
    // O IDH atual (quanto maior, mais saudável/longevo) também influencia a população.
    popGrowthRate += (stats.idh * 0.005); 
    
    stats.populacao = Math.round(stats.populacao * (1 + popGrowthRate));

    // b) Crescimento do PIB
    let pibGrowthRate = BASE_GROWTH_RATE * mods.pib_mod;
    // O PIB também é influenciado pelo IDH (mão de obra mais educada/saudável)
    pibGrowthRate += (stats.idh * 0.02); 
    
    stats.pib = Math.round(stats.pib * (1 + pibGrowthRate));

    // c) Recalcular IDH (Índice de Desenvolvimento Humano)
    // IDH é uma métrica complexa. Aqui, simplificamos: depende do PIB per capita.
    const pibPerCapita = stats.pib / stats.populacao;
    
    // Simulação: IDH é uma função logarítmica do PIB per capita, limitando o crescimento
    // IDH deve ser um valor entre 0 e 1
    let newIDH = 0.5 + 0.5 * Math.tanh(pibPerCapita / 50000); // 50k é um valor de escala
    
    // O tipo de governo também impacta: uma Ditadura pode ter alto PIB, mas baixo IDH social
    if (type === 'Ditadura') {
        newIDH *= 0.95; // Penalidade social
    }
    
    // Garante que o IDH esteja entre 0 e 1 e atualiza
    stats.idh = Math.min(1.0, Math.max(0.0, newIDH));
    
    console.log(`[${nation.nome}] Turno Concluído.`);
    console.log(`Novo PIB: ${stats.pib.toLocaleString()}, Novo IDH: ${stats.idh.toFixed(3)}`);

    // --- 3. Salvar Novas Estatísticas no GitHub (Substitui o arquivo JSON) ---
    // Na implementação real, esta função usaria 'pushToGitHub' (de creation_nation_user.js) 
    // com um método PUT para sobrescrever o arquivo existente.
    // O commit message seria: "Turno [X]: Atualização automática de estatísticas."

    // await pushUpdatedNationData(nation.id, nation); // <--- Chamada de API real

    return nation; // Retorna os dados atualizados
}

/**
 * 4. Função Global para Rodar o Motor em Todas as Nações.
 * (Esta função seria chamada por um CRON Job no servidor PHP/Golang real.)
 */
async function runGlobalTurn() {
    console.log("--- INICIANDO TURNO GLOBAL GITNATIONS ---");
    // O motor real precisaria da lista de todas as nações (usando listNationFiles de nation_users.js)
    
    // SIMULAÇÃO: Rodando apenas para a nação de teste
    const updatedNation = await runNationTurn('testnation'); 
    
    if (updatedNation) {
        console.log(`Turno Global Finalizado. ${updatedNation.nome} atualizado.`);
    }

    // Na implementação real, você faria um loop sobre todas as nações e rodaria runNationTurn(id)
    // Ex: for (const nationId of allNationIds) { await runNationTurn(nationId); }
}

// --- Exemplo de como você chamaria o Motor (se estivesse no servidor) ---
// runGlobalTurn();

// -----------------------------------------------------------------------
// ** Uso no cliente (apenas para debug ou demonstração): **
// Para testar, você pode chamar no console: runNationTurn('testnation')
// -----------------------------------------------------------------------
