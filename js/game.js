// Constantes de Jogo e Configurações de Simulação
const GITHUB_REPO = "GitNations/DadosGlobais";
const GITHUB_API_URL = "https://api.github.com/repos/";
const BASE_GROWTH_RATE = 0.01; // Taxa de crescimento base de 1% (para População e PIB)

// Modificadores baseados no tipo de governo (fictícios e simplificados)
const GOVERNMENT_MODIFIERS = {
    'Democracia': { pib_mod: 1.05, populacao_mod: 1.01 }, // Crescimento econômico estável
    'Monarquia': { pib_mod: 0.95, populacao_mod: 1.02 }, // Economia mais lenta, mas foco em família/população
    'Ditadura': { pib_mod: 1.10, populacao_mod: 0.98 }   // Crescimento forçado (alto) mas declínio populacional/social (baixo)
    // Adicionar mais tipos e balanceamento aqui!
};

// Funções utilitárias (assumimos que estas são importadas de outro lugar ou definidas aqui)
// Para simulação, vamos redefinir a busca de dados.
async function fetchNationData(nationId) {
    // ... Lógica de busca e decodificação do JSON do painel_pais.js ...
    // (Por brevidade, vamos simular os dados aqui para testar o cálculo)
    if (nationId === 'testnation') {
        return {
            id: 'testnation',
            nome: 'Test Nation',
            tipo_governo: 'Democracia', // Mude para Monarquia ou Ditadura para testar
            estatisticas: {
                populacao: 10000000,
                pib: 50000000000,
                idh: 0.750
            }
        };
    }
    return null; // Retornaria o fetch real aqui
}

/**
 * 1. O Motor Principal: Roda a simulação para uma única nação.
 * @param {string} nationId - O ID da nação a ser processada.
 * @returns {object|null} Os novos dados da nação após o turno.
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
