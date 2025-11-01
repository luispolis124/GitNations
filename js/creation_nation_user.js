// js/creation_nation_user.js - Lógica para gerar o arquivo JSON e instruções de PR

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('nation-creation-form');
    const nomePaisInput = document.getElementById('nome-pais');
    
    // Adiciona um listener para o envio do formulário
    form.addEventListener('submit', handleFormSubmit);

    /**
     * Processa o envio do formulário, gera o JSON e instrui o usuário sobre o PR.
     */
    function handleFormSubmit(event) {
        event.preventDefault();

        // 1. Coleta dos dados do formulário
        const nome = nomePaisInput.value.trim();
        const capital = document.getElementById('capital').value.trim();
        const tipoGoverno = document.getElementById('tipo-governo').value;
        const proprietarioGithub = document.getElementById('proprietario-github').value.trim();
        const lema = document.getElementById('lema').value.trim();
        const hino = document.getElementById('hino').value.trim();
        const bandeiraUrl = document.getElementById('bandeira-url').value.trim();
        
        // Coleta Estatísticas Iniciais
        const populacao = parseInt(document.getElementById('populacao-inicial').value);
        const pib = parseInt(document.getElementById('pib-inicial').value);
        const impostoBase = parseFloat(document.getElementById('imposto-inicial').value);
        
        // Gera um ID em minúsculas e sem espaços
        const idNacao = nome.toLowerCase().replace(/\s+/g, '_');

        // VALORES PADRÃO (Início do Jogo)
        const novaNacao = {
            "id": idNacao,
            "nome": nome,
            "capital": capital,
            "bandeira_url": bandeiraUrl || "",
            "tipo_governo": tipoGoverno,
            "lema_nacional": lema || "Paz e Progresso",
            "link_hino": hino || "",
            // Este campo é preenchido pelo usuário no formulário
            "proprietario_github": proprietarioGithub, 
            "estatisticas": {
                "populacao": populacao,
                "pib": pib,
                "idh": 0.650, // IDH inicial padrão
                "imposto_base": impostoBase,
                "tecnologia": 30,
                "militar": 100000 // Novo: Estatística Militar inicial
            },
            "historico_leis": [],
            "status_diplomatico": {}
        };
        
        // 2. Formata o JSON para exibição
        const jsonOutput = JSON.stringify(novaNacao, null, 4);

        // 3. Exibe o resultado e as instruções
        displayInstructions(idNacao, nome, jsonOutput);
    }
    
    /**
     * Exibe o código JSON e os passos para o Pull Request.
     */
    function displayInstructions(id, nome, json) {
        const main = document.querySelector('main');
        main.innerHTML = `
            <section class="info-card success-card">
                <h2>🎉 Passo Final: Pull Request.</h2>
                <p>Seu país, **${nome}**, foi configurado. Siga os passos abaixo para fundá-lo via GitHub.</p>
                
                <h3>Passo 1: Crie o Arquivo JSON</h3>
                <p>Crie um novo arquivo chamado <code>nations/${id}.json</code> no seu repositório Fork e cole o código abaixo:</p>
                <textarea rows="20" cols="80" readonly class="json-output-area">${json}</textarea>
                <button onclick="copyToClipboard('.json-output-area')">Copiar JSON</button>
                
                <h3>Passo 2: Faça o Commit e Pull Request (PR)</h3>
                <p>Faça o commit do novo arquivo no seu Fork e crie um Pull Request para o repositório principal com o título padronizado:</p>
                <code class="pr-title">[NOVA NAÇÃO] - ${nome}</code>
                <a href="https://github.com/luispolis124/GitNations/compare" target="_blank" class="button primary-button">Abrir Página de PR</a>
            </section>
        `;
    }
    
    // Função auxiliar para copiar texto
    window.copyToClipboard = function(selector) {
        const element = document.querySelector(selector);
        element.select();
        document.execCommand('copy');
        alert('Código copiado para a área de transferência!');
    };
});
```eof

## 3. Atualização do `painel_pais.html` (Painel de Controle)

Adicionamos seções de Economia e Militar para refletir as novas estatísticas.

```html:Painel de Controle:html/painel_pais.html
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Painel de Controle - GitNations</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="../css/game.css">
</head>
<body>
    <header>
        <h1 id="nation-title">Carregando Nação...</h1>
    </header>

    <main id="nation-panel">
        
        <section id="overview" class="panel-section">
            <h2>Visão Geral</h2>
            <div id="flag-display" class="nation-flag">
                <img id="nation-flag-img" src="" alt="Bandeira da Nação">
            </div>
            <p><strong>ID da Nação:</strong> <span id="info-id"></span></p>
            <p><strong>Capital:</strong> <span id="info-capital"></span></p>
            <p><strong>Fundador (@GitHub):</strong> <span id="info-fundador"></span></p>
        </section>

        <section id="government" class="panel-section">
            <h2>Governo e Identidade</h2>
            <p><strong>Tipo de Governo:</strong> <span id="info-governo"></span></p>
            <p><strong>Lema Nacional:</strong> <span id="info-lema"></span></p>
            <p><strong>Hino:</strong> <a id="info-hino-link" href="#" target="_blank">Ouvir Hino (Link)</a></p>
            <p><strong>Último Turno:</strong> <span id="info-last-turn">Carregando...</span></p>
        </section>

        <section id="stats-global" class="panel-section">
            <h2>Estatísticas Sociais</h2>
            <p><strong>População:</strong> <span id="stat-populacao"></span></p>
            <p><strong>IDH:</strong> <span id="stat-idh"></span></p>
            <p><strong>Tecnologia:</strong> <span id="stat-tecnologia"></span></p>
        </section>

        <section id="stats-economic" class="panel-section">
            <h2>Economia</h2>
            <p><strong>PIB (Valor Total):</strong> <span id="stat-pib"></span></p>
            <p><strong>PIB per Capita:</strong> <span id="stat-pib-capita"></span></p>
            <p><strong>Imposto Base:</strong> <span id="stat-imposto"></span></p>
        </section>

        <section id="stats-military" class="panel-section">
            <h2>Militar</h2>
            <p><strong>Forças Armadas:</strong> <span id="stat-militar"></span></p>
            <p><strong>Gastos Militares (PIB):</strong> <span id="stat-gastos-militar">Não definido</span></p>
        </section>

        <section id="actions" class="panel-section">
            <h2>Ações de Governo</h2>
            <a href="ficha_do_pais.html?edit=true" class="button-action">Propor Edição (PR)</a>
            <button class="button-action">Propor Lei Interna (PR)</button>
            <a href="https://github.com/luispolis124/GitNations/issues/new" target="_blank" class="button-action">Abrir Diplo. Global (Issue)</a>
        </section>

    </main>

    <script src="../js/load_nation_panel.js"></script>
    <script src="../js/nation_users.js"></script>
</body>
</html>
