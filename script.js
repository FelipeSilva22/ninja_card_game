//Função para exibir os cards conforme o filtro
let decks = [];
let allCards = []; // Variável global para armazenar os cards carregados
let cardsExibidos = 0; // Quantidade de cards exibidos na página
const cardsPorLote = 20; // Quantidade de cards por clique no botão "Mostrar Mais"
let currentCardIndex = 0; // Índice do card atual no array
let filteredCards = []; // Lista de cards filtrados
let selectedDeck = null; // Baralho atualmente selecionado
let jogadorNome = '';
let jogadorBaralho = null;
let iaBaralho = null;

// Função para exibir os cards filtrados
function applyFilters() {
  // Obtém os elementos, ou null se não existirem
  const filterType = document.getElementById('filter-type'); // Tipo selecionado
  const filterNatureza = document.getElementById('filter-natureza'); // Natureza selecionada
  const filterStage = document.getElementById('filter-stage'); // Estágio
  // Verifica se os elementos existem antes de acessar suas propriedades
  const filterTypeValue = filterType ? filterType.value : 'all';
  const filterNaturezaValue = filterNatureza ? filterNatureza.value : 'all';
  const filterStageValue = filterStage ? filterStage.value : 'all';
  const container = document.getElementById('cards-container');
    container.innerHTML = ''; // Limpa os cards atuais
    cardsExibidos = 0; // Reseta a contagem de cards exibidos
  
    // Aplica os filtros apenas nos cards disponíveis
  filteredCards = allCards.filter(card => {
    const matchesType = filterTypeValue === 'all' || card.tipo === filterTypeValue;
    const matchesNatureza =
      filterNaturezaValue === 'all' ||
      card.naturezaNinja === filterNaturezaValue || // Natureza do Ninja
      card.naturezaChakra === filterNaturezaValue; // Natureza do Chakra
    const matchesStage =
      filterStageValue === 'all' ||
      (card.tipo === 'Ninja' && card.estagio === parseInt(filterStageValue)); // Estágio para Ninja
    return matchesType && matchesNatureza && matchesStage;
  });

    // Exibe o primeiro lote de cards filtrados
    mostrarMaisCards();

    // Exibe o botão "Mostrar Mais" se houver mais cards para carregar
    if (filteredCards.length > cardsPorLote) {
      document.getElementById('load-more-container').style.display = 'block';
    } else {
      document.getElementById('load-more-container').style.display = 'none';
    }
}

function clearFilters() {
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-natureza').value = 'all';
    document.getElementById('filter-stage').value = 'all';
    applyFilters(); // Reaplica os filtros (sem restrições)
}

// Função para carregar os cards de múltiplos arquivos JSON
Promise.all([
  fetch('ninja.json').then(response => response.json()),
  fetch('chakra.json').then(response => response.json()),
  fetch('tool.json').then(response => response.json())
])
  .then(([ninjas, chakras, tools]) => {
    allCards = [...ninjas, ...chakras, ...tools]; // Combina todos os cards carregados
    filteredCards = allCards; // Inicialmente, todos os cards estão visíveis
    console.log("Cards carregados com sucesso:", allCards);

    const pathname = window.location.pathname;
    if (pathname.includes("visualizar_cards.html")) {
      // Aplica os filtros e exibe o primeiro lote somente na página visualizar_cards.html
      applyFilters();
    }
    if (!pathname.includes("index.html") && !pathname.includes("visualizar_cards.html")) {
      // Carrega os decks em todas as páginas, exceto index.html e visualizar_cards.html
      carregarDecks();
    }
  })
  .catch(error => console.error('Erro ao carregar os cards:', error));

// Função para abrir o modal com os detalhes do card
function openModal(card, index) {
    currentCardIndex = index; // Define o índice do card atual
    const modal = document.getElementById('card-modal');
    const modalImage = document.getElementById('modal-image');
    const modalDetails = document.getElementById('modal-details');
  
    // Preenche a imagem do card
    modalImage.innerHTML = `<img src="${card.imagem}" alt="${card.idCard}">`;
  
    // Monta os detalhes dinamicamente com base no tipo do card
    let detailsContent = `<h1>${card.nome || card.tipo}</h1>
    <p><strong>ID:</strong> ${card.idCard}</p>`;

    if (card.tipo === "Chakra") {
      // Exibe os campos específicos para cards de Chakra
      detailsContent += `
        <p><strong>Natureza:</strong> ${card.naturezaChakra}</p>
        <p><strong>Descrição:</strong> ${card.descricao}</p>`;
    
    } else if (card.tipo === "Tool") {
      // Exibe os campos específicos para cards de Tool
      detailsContent += `
        <p><strong>Nome:</strong> ${card.nome}</p>
        <p><strong>Descrição:</strong> ${card.descricao}</p>
        `;
    } else if (card.tipo === "Ninja") {
    // Exibe os campos específicos para cards de Ninja
      detailsContent += `
        <p><strong>Registro:</strong> ${card.registro}</p>
        ${card.vila ? `<p><strong>Vila:</strong> ${card.vila} / <strong>Ranking:</strong> ${card.ranking}</p>` : ''}
        ${card.hp ? `<p><strong>HP:</strong> ${card.hp} / <strong>Chakra:</strong> ${card.chakra} / <strong>Velocidade:</strong> ${card.velocidade}</p>` : ''}
        ${card.DescEfeitoNinja ? `<p><strong>Efeito Ninja:</strong> ${card.DescEfeitoNinja}</p>` : ''}
        ${card.jutsus ? `
          <h4><strong>Jutsus:</strong></h4>
          <ul>
            ${card.jutsus.map(jutsu => `
              <li>
                <img src="${jutsu.logoJutsu}" alt="${jutsu.estiloJutsu}" class="jutsu-logo">
                <strong>${jutsu.nomeJutsu}</strong> 
                <br><strong>Dano: ${jutsu.powerJutsu}</strong>
                (${jutsu.categoria} - ${jutsu.naturezaJutsu || "Neutro"})
                <br><strong>Custo Chakra</strong>: ${jutsu.custoChakra} | 
                <strong>Requisito</strong>: ${Object.entries(jutsu.requisitoChakra).map(([key, value]) => `${key}: ${value}`).join(', ')}
                <br><strong>Descrição</strong>: ${jutsu.detalheJutsu}
              </li>`).join('')}
          </ul>` : ''}
      `;
    }
    
    // Preenche os detalhes no modal
    modalDetails.innerHTML = detailsContent;

    // Exibe o modal
    modal.style.display = 'flex';
}

function navigateCard(direction) {
  // Ajusta o índice com base na direção
  currentCardIndex += direction;
  
  // Garante que o índice esteja dentro dos limites da lista filtrada
  if (currentCardIndex < 0) {
    currentCardIndex = filteredCards.length - 1; // Vai para o último card
  } else if (currentCardIndex >= filteredCards.length) {
    currentCardIndex = 0; // Volta para o primeiro card
  }
  
    // Atualiza o modal com o próximo card da lista filtrada
  const currentCard = filteredCards[currentCardIndex];
  openModal(currentCard, currentCardIndex); // Chama o modal com o card filtrado
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('card-modal');
    modal.classList.add('fade-out'); // Adiciona a classe para animação de saída
  
    // Esconde o modal após a animação
    setTimeout(() => {
      modal.style.display = 'none';
      modal.classList.remove('fade-out'); // Remove a classe para uso futuro
    }, 450); // A duração da animação deve coincidir com o CSS
  }

function fecharModalFundo(event) {
    const modalContent = document.querySelector('.modal-content');
    
    // Fecha o modal apenas se o clique for fora do conteúdo principal
    if (!modalContent.contains(event.target)) {
      closeModal();
    }
 }

 // Fechar o modal ao pressionar a tecla "Esc"
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeModal(); // Chama a função que fecha o modal
  }
});

function mostrarMaisCards() {
  const container = document.getElementById('cards-container');
  const totalCards = filteredCards.length;

  // Determina o próximo lote de cards a exibir
  const proximoLote = Math.min(cardsExibidos + cardsPorLote, totalCards);

  for (let i = cardsExibidos; i < proximoLote; i++) {
    const card = filteredCards[i];
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.innerHTML = `
      <img src="${card.imagem}" alt="${card.idCard}">
      <h3>${card.nome || card.tipo}</h3>
      <p><strong>ID:</strong> ${card.idCard}</p>
    `;

    // Adiciona o evento de clique para abrir o modal
    cardDiv.onclick = () => openModal(card, i);
    container.appendChild(cardDiv);
  }

  cardsExibidos = proximoLote; // Atualiza o número de cards exibidos

  // Oculta o botão "Mostrar Mais" se todos os cards forem exibidos
  if (cardsExibidos >= totalCards) {
    document.getElementById('load-more-container').style.display = 'none';
  }
}

// Função para carregar os decks a partir do deck.json
function carregarDecks() {
  Promise.all([
      fetch('deck1.json').then(response => response.json()),
      fetch('deck2.json').then(response => response.json()),
      fetch('deck3.json').then(response => response.json()),
      fetch('deck4.json').then(response => response.json())
  ])
  .then(([deck1, deck2, deck3, deck4]) => {
      decks = [...deck1, ...deck2, ...deck3, ...deck4]; // Combina todos os decks carregados
      console.log("Decks carregados com sucesso:", decks);
      carregarMiniaturasDecks(); // Atualiza a visualização dos decks
  })
  .catch(err => console.error('Erro ao carregar decks:', err));
}

// Função para carregar as miniaturas dos baralhos
function carregarMiniaturasDecks() {
  console.trace('Chamando carregarMiniaturasDecks');
  const container = document.getElementById('decks-container');

  // Verifica se o contêiner existe antes de manipulá-lo
  if (!container) {
    console.warn('O contêiner dos decks não existe nesta página.');
    return;
  }

  container.innerHTML = ''; // Limpa o conteúdo atual

  decks.forEach(deck => {
    const deckDiv = document.createElement('div');
    deckDiv.className = 'deck';
    deckDiv.innerHTML = `
      <img src="${deck.image}" alt="${deck.name}">
      <h3>${deck.name}</h3>
    `;
    deckDiv.onclick = () => selecionarDeck(deck); // Associa o clique ao baralho
    container.appendChild(deckDiv);
  });
}

function selecionarDeck(deck) {
  selectedDeck = deck; // Armazena o baralho selecionado
  document.getElementById('deck-name').innerText = deck.name; // Exibe o nome do deck
  atualizarListaCards(); // Atualiza a lista de cards do deck selecionado
  document.getElementById('deck-details').classList.remove('hidden'); // Exibe os detalhes do deck
}

function atualizarListaCards() {
  const list = document.getElementById('deck-cards-list');
  list.innerHTML = ''; // Limpa a lista de cards antes de adicionar novos cards

  if (selectedDeck.cards && selectedDeck.cards.length > 0) {
    //if (selectedDeck.cards.length > 0) {
    selectedDeck.cards.forEach((card, index) => {
      const listItem = document.createElement('li');
      //Estrutura do card na lista
      listItem.innerHTML = `
      <span>${card.idCard} - ${card.nome || card.tipo}</span>
      <button onclick="removerCardDoDeck(${index})">Remover</button>
    `;
    list.appendChild(listItem);
  });
} else {
    list.innerHTML = '<p>Este baralho está vazio. Adicione novos cards.</p>';
  }

  // Exibe os botões de adicionar card e salvar baralho
  document.getElementById('add-card-btn').classList.remove('hidden');
  document.getElementById('save-deck-btn').classList.remove('hidden');
}
// Função para remover um card do deck
function removerCardDoDeck(index) {
  if (!selectedDeck) return;

  // Remove o card pelo índice
  selectedDeck.cards.splice(index, 1);

  // Atualiza a lista de cards no deck
  atualizarListaCards();
}
function mostrarPainelSelecao() {
  const panel = document.getElementById('card-selection-panel');
  const list = document.getElementById('cards-list-panel');

  // Filtra os cards disponíveis
  const usedCardIds = decks.flatMap(deck => deck.cards.map(card => card.idCard));
  const availableCards = allCards.filter(card => !usedCardIds.includes(card.idCard));

  // Gera a lista de cards disponíveis
  list.innerHTML = '';
  if (availableCards.length > 0) {
    availableCards.forEach(card => {
      const listItem = document.createElement('li');
      listItem.innerText = `${card.idCard} - ${card.nome || card.tipo}`;
      listItem.onclick = () => adicionarCardNoDeck(card);
      list.appendChild(listItem);
    });
  } else {
    list.innerHTML = '<p>Nenhum card disponível para adicionar.</p>';
  }

  // Exibe o painel
  panel.classList.remove('hidden');
}

function fecharPainelSelecao() {
  const panel = document.getElementById('card-selection-panel');
  panel.classList.add('hidden');
}

function adicionarCard() {
  // Exibir uma janela ou lista de seleção de cards
  const card = allCards.find(c => !decks.some(d => d.cards.includes(c))); // Encontra um card que não está em nenhum deck
  if (card) {
    selectedDeck.cards.push(card); // Adiciona o card ao deck selecionado
    atualizarListaCards(); // Atualiza a lista de cards no modal
  } else {
    alert('Todos os cards estão em uso em outros baralhos.');
  }
}

function adicionarCardNoDeck(card) {
  if (!selectedDeck) {
    alert('Nenhum baralho selecionado.');
    return;
  }

  // Adiciona o card ao baralho selecionado
  selectedDeck.cards.push(card);

  // Atualiza a lista de cards no baralho
  atualizarListaCards();

  // Remover o card da lista do painel sem fechar o painel
  const list = document.getElementById('cards-list-panel');
  const listItem = Array.from(list.children).find(item =>
    item.innerText.includes(card.idCard)
  );
  if (listItem) {
    listItem.remove(); // Remove o card selecionado da lista visível no painel
  }
}

function salvarBaralho() {
  if (!selectedDeck) return;

  // Validações
  const totalCards = selectedDeck.cards.length;
  const ninjas = selectedDeck.cards.filter(c => c.tipo === "Ninja").length;
  const energias = selectedDeck.cards.filter(c => c.tipo === "Chakra").length;
  const ferramentas = selectedDeck.cards.filter(c => c.tipo === "Tool").length;

  if (totalCards < 15 || totalCards > 60) {
      alert("O baralho deve ter entre 15 e 60 cards.");
      return;
  }
  if (ninjas < 3 || energias < 5 || ferramentas < 2) {
      alert("O baralho deve ter no mínimo 3 Ninjas, 5 Energias e 2 Ferramentas.");
      return;
  }

  // Salvar o baralho selecionado em selectedDeck.json
  const data = JSON.stringify([selectedDeck], null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "selectedDeck.json";
  a.click();

  URL.revokeObjectURL(url);
}

function voltarPaginaInicial() {
  window.location.href = "index.html";
}

// Função para confirmar o nome do jogador
function confirmarNome() {
  const playerNameInput = document.getElementById('player-name');
  const name = playerNameInput.value.trim();

  if (name.length < 3 || name.length > 15) {
    alert('O nome deve ter entre 3 e 15 caracteres.');
    return;
  }

  jogadorNome = name;
  alert(`Bem-vindo, ${jogadorNome}!`);

  // Esconde o input de nome e avança para a seleção de baralhos
  document.getElementById('player-name-container').classList.add('hidden');
  document.getElementById('deck-selection-container').classList.remove('hidden');

  carregarBaralhosParaSelecao();
}
// Função para carregar os baralhos disponíveis
function carregarBaralhosParaSelecao() {
  const container = document.getElementById('player-deck-container');
  container.innerHTML = ''; // Limpa os baralhos anteriores

  decks.forEach((deck, index) => {
    const deckDiv = document.createElement('div');
    deckDiv.className = 'deck';
    deckDiv.innerHTML = `
      <img src="imagens/deck${index + 1}.png" alt="${deck.name}">
      <h3>${deck.name}</h3>
    `;
    deckDiv.onclick = () => selecionarBaralhoJogador(deck);
    container.appendChild(deckDiv);
  });
}

// Função para selecionar o baralho do jogador
function selecionarBaralhoJogador(deck) {
  jogadorBaralho = deck;
  alert(`Você escolheu o baralho: ${deck.name}`);
  // Salva a imagem e as informações do baralho do jogador
  localStorage.setItem('jogadorDeckImage', deck.image); // Salva a imagem do deck do jogador
  // IA seleciona um baralho aleatório (excluindo o do jogador)
  selecionarBaralhoIA();

  // Exibe o botão para iniciar o combate
  document.getElementById('start-combat-btn').classList.remove('hidden');
}

// Função para a IA selecionar um baralho
function selecionarBaralhoIA() {
  const baralhosDisponiveis = decks.filter(deck => deck !== jogadorBaralho);
  iaBaralho = baralhosDisponiveis[Math.floor(Math.random() * baralhosDisponiveis.length)];
  document.getElementById('ia-deck-selection').classList.remove('hidden');
  document.getElementById('ia-deck-selection').innerText = `IA escolheu o baralho: ${iaBaralho.name}`;
  // Salva a imagem e as informações do baralho da IA
  localStorage.setItem('iaDeckImage', iaBaralho.image); // Salva a imagem do deck da IA
}
function iniciarCombate() {
  if (!jogadorNome || !jogadorBaralho || !iaBaralho) {
    alert('Certifique-se de que o jogador e a IA selecionaram seus baralhos.');
    return;
  }

  // Salvar informações no localStorage para serem acessadas na tela de combate
  localStorage.setItem('jogadorNome', jogadorNome);
  localStorage.setItem('jogadorBaralho', JSON.stringify(jogadorBaralho));
  localStorage.setItem('iaBaralho', JSON.stringify(iaBaralho));
  

  // Redirecionar para a página de combate
  window.location.href = 'tela_combate.html';
}