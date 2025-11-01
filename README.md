## 🌍 GitNations: O Jogo de Simulação de Governo via GitHub

O **GitNations** é um projeto de simulação de nações onde o governo e a diplomacia são conduzidos inteiramente através de funcionalidades do GitHub: **Pull Requests (PRs)**, **Issues** e **GitHub Actions**.

Este projeto foi criado por brasileiro e o motor de simulação (`js/game.js`) é executado automaticamente, atualizando o status de todas as nações a cada turno.

-----

## 🎮 Como Jogar (Governe via Git)

A jogabilidade é baseada em modificar arquivos JSON e interagir com o repositório.

### 1\. Criar sua Nação (Primeiro Passo)

Para começar a jogar, você deve criar seu próprio arquivo de nação:

1.  **Faça um Fork** deste repositório para a sua conta.

2.  Crie um novo arquivo JSON na pasta `/nations/` com o nome do seu país em minúsculas (Ex: `nations/atlantis.json`).

3.  Use o seguinte modelo e preencha o campo **`proprietario_github`** com seu `@username`:

    ```json
    {
      "id": "atlantis",
      "nome": "Império de Atlântida",
      "capital": "Poseidonia",
      "tipo_governo": "Monarquia",
      "proprietario_github": "SeuNomeDeUsuarioAqui",
      "lema_nacional": "Paz e Prosperidade",
      "bandeira_url": "URL-para-sua-bandeira.png",
      "data_fundacao": "2025-11-01",
      "estatisticas": {
        "populacao": 5000000,
        "pib": 20000000000,
        "idh": 0.650,
        "imposto_base": 0.10,
        "tecnologia": 30
      }
    }
    ```

4.  Crie um **Pull Request (PR)** do seu fork para o branch `main` deste repositório com o título: `[NOVA NAÇÃO] - Seu Nome de Nação`. Após o merge, sua nação estará no mundo\!

### 2\. Propor uma Lei Nacional (Mudança de Governo)

Para mudar as estatísticas internas da sua nação (como impostos, tipo de governo, ou investimento), você propõe uma Lei.

  * **Ferramenta:** **Pull Request (PR)**.
  * **Ação:**
    1.  Crie um novo *branch* no seu fork.
    2.  Edite **APENAS** o seu arquivo `nations/<seu_pais>.json`.
    3.  Altere o valor que deseja (Ex: mude `imposto_base` de `0.10` para `0.15`).
    4.  Crie um PR com o título: `[LEI] - Título da Proposta (Ex: Lei de Aumento de Imposto)`.
  * **Aprovação:** O **Proprietário da Nação** (ou a autoridade máxima definida) deve revisar e fazer o **Merge** (aprovar) o PR para que a Lei entre em vigor no próximo Turno Global.

### 3\. Diplomacia e Interações Globais

Para interagir com outras nações (Alianças, Declarações de Guerra, Tratados), usamos as **Issues**.

  * **Ferramenta:** **Issues** (Deste repositório principal).
  * **Ação:**
    1.  Crie uma nova Issue.
    2.  Use o título padronizado (Exemplos):
          * `[ALIANÇA] - Seu País propõe Tratado com Atlântida`
          * `[GUERRA] - Seu País declara conflito contra TestNation`
    3.  O representante da nação alvo responderá na Issue.
    4.  Um **Bot** (a ser implementado) ou a administração do jogo processará as interações complexas no próximo Turno.

-----

## 👁️ Painel de Controle e Visualização

Você pode ver as informações globais e o status detalhado da sua nação através de nossas páginas web:

  * **Painel de Controle Individual:** Acesse o painel com o ID da sua nação (Ex: `painel_pais.html?id=atlantis`) para ver o status, estatísticas e opções de governo.
  * **Ranking Global:** Veja como sua nação se compara com as outras no mundo.

-----

## ⚙️ O Motor do Jogo (GitHub Actions)

O coração do GitNations é totalmente automatizado:

  * **Arquivo:** `turnos/global_turn.js` (O motor Node.js)
  * **Execução:** Um **GitHub Action** (definido em `turno_global.yml`) roda o script a cada período (Ex: 24h).
  * **Função:** O motor lê todos os arquivos JSON em `/nations/`, calcula o crescimento de **População**, **PIB** e **IDH** com base no `tipo_governo` e nas **Leis** ativas.
  * **Resultado:** O Action commita as estatísticas atualizadas de volta para o repositório, mantendo o histórico de jogo no histórico do Git.

-----

## 🔗 Links Úteis

  * **Portal de Entrada (Index):** [https://luispolis124.github.io/GitNations/html/index.html](https://luispolis124.github.io/GitNations/html/index.html)
  * **Ranking Global:** [https://luispolis124.github.io/GitNations/html/ranking.html](https://luispolis124.github.io/GitNations/html/ranking.html)
  * **Modelos de Nação:** [nations/](https://www.google.com/search?q=nations/)
  * **Status do Turno Global:** [Link para a aba 'Actions' do seu repositório]

-----

👋 **Junte-se a nós e comece a governar sua nação\!**
