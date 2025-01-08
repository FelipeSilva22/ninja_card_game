//-----Controle de turnos e fluxo do jogo
let jogadorPergaminhos = 5;
let iaPergaminhos = 5;
const fases = ["inicio", "formacao", "compra", "preparacao", "suporte", "combate", "novoLider"];
let estadoAtual = "inicio";
let jogadorMao = []; // Cards na mão do jogador
let jogadorTime = []; // Cards no campo do jogador
let iaMao = []; // Cards na mão da IA
let iaTime = []; // Cards no campo da IA
let chakraUsado = false;//Controlar uso de chakra por turno
let turnosSemLider = 0; //Controla o empate
const arrayDescarteIA = [];
const arrayDescartePlayer = [];
let currentCardIndex = 0;
let currentDiscardPile = arrayDescartePlayer;
let suporteIAExecutado = false; // Variável de controle global

function iniciarCampoDeBatalha() { 
  //console.log("Iniciando o campo de batalha...");
  document.getElementById('player-name-display').innerText = `Time ${jogadorNome}`;
  document.getElementById('player-name-hand').innerText = `Mão de ${jogadorNome}`;
  document.getElementById('player-name-deck').innerText = `Deck de ${jogadorNome}`;
  document.getElementById('player-scroll-count').innerText = jogadorPergaminhos;
  document.getElementById('ia-scroll-count').innerText = iaPergaminhos;
  
  // Inicialização ao carregar a página
  document.addEventListener("DOMContentLoaded", () => {
    atualizarBotoes(); // Configura a aparência inicial dos botões
  });
  document.addEventListener("DOMContentLoaded", () => {
    gsap.from("#player-area", { duration: 1.5, y: 50, opacity: 0, ease: "power2.out" });
  });
  
  // Inicializa as mãos vazias
  //console.log("Definindo mãos vazias");
  jogadorMao = [];
  iaMao = [];

  // Verifica integridade inicial dos baralhos
  console.log("Deck original J1:", jogadorBaralho.cards);
  console.log("Deck original IA:", iaBaralho.cards);

  // Embaralhar os baralhos do jogador e da IA
  //console.log("Embaralhando baralhos...");
  const originalJogadorBaralho = [...jogadorBaralho.cards];
  const originalIaBaralho = [...iaBaralho.cards];

  embaralharBaralho(jogadorBaralho.cards);
  embaralharBaralho(iaBaralho.cards);

  // Verificar se o baralho foi embaralhado
  const jogadorEmbaralhado = JSON.stringify(jogadorBaralho.cards) !== JSON.stringify(originalJogadorBaralho);
  const iaEmbaralhado = JSON.stringify(iaBaralho.cards) !== JSON.stringify(originalIaBaralho);

  //console.log("Baralho do jogador embaralhado?", jogadorEmbaralhado);
  //console.log("Baralho da IA embaralhado?", iaEmbaralhado);

  if (!jogadorEmbaralhado || !iaEmbaralhado) {
      console.error("Falha no embaralhamento de um ou ambos os baralhos.");
  }

  // Formar as mãos iniciais
  //formarMaoInicial(jogadorBaralho.cards, jogadorMao);
  //formarMaoInicial(iaBaralho.cards, iaMao);
  formarMaoInicial(jogadorBaralho.cards, jogadorMao, iaBaralho.cards, iaMao);

  // Verifica estado final após formar as mãos
  //console.log("Mão inicial do jogador:", jogadorMao);
  //console.log("Mão inicial da IA:", iaMao);
  //console.log("Deck atual do jogador (pós-mão):", jogadorBaralho.cards);
  //console.log("Deck atual da IA (pós-mão):", iaBaralho.cards);

  // Renderiza as mãos na interface
  //console.log("Renderizando mãos...");
  renderizarMao(jogadorMao);
  renderizarMaoIA(iaMao);
  //console.log("Mãos renderizadas com sucesso.");

  estadoAtual = "formacao";
  console.log("Estado do jogo ajustado para:", estadoAtual);
  atualizarBotoes();
  initializeDragAndDrop();
}
function embaralharBaralho(baralho) {
  if (!Array.isArray(baralho) || baralho.length === 0) {
      console.error("Baralho inválido para embaralhar:", baralho);
      return;
  }

  //console.log("Baralho antes do embaralhamento:", JSON.stringify(baralho));

  // Implementação de embaralhamento usando Fisher-Yates Shuffle
  for (let i = baralho.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Índice aleatório de 0 a i
      [baralho[i], baralho[j]] = [baralho[j], baralho[i]]; // Troca de elementos
      console.log('Baralho embaralhado.');
  }

  //console.log("Baralho após o embaralhamento:", JSON.stringify(baralho));
}
function formarMaoInicial(baralhoJogador, maoJogador, baralhoIA, maoIA) {
  console.log("Iniciando formação de mãos...");
  let tentativas = 0; // Contador para evitar loops infinitos
  let maoJogadorCompleta = false; // Controle da mão do Jogador
  let maoIACompleta = false; // Controle da mão da IA

  // Função para verificar se uma mão tem pelo menos um Ninja Estágio 1
  function temNinjaEstagio1(mao) {
      return mao.some(card => card.tipo === "Ninja" && card.estagio === 1);
  }

  // Valida se os baralhos são arrays válidos
  if (!Array.isArray(baralhoJogador) || !Array.isArray(baralhoIA)) {
      console.error("Os baralhos devem ser arrays válidos.");
      return;
  }

  // Logs iniciais para verificar os estados dos baralhos
  //console.log("Baralho do jogador antes:", baralhoJogador);
  //console.log("Baralho da IA antes:", baralhoIA);

  // Cópias dos baralhos para evitar modificações diretas
  let copiaBaralhoJogador = [...baralhoJogador];
  let copiaBaralhoIA = [...baralhoIA];

  // Loop para formar as mãos até que ambas estejam corretas ou atinja o limite de tentativas
  while ((!maoJogadorCompleta || !maoIACompleta) && tentativas < 10) {
      console.log(`Tentativa ${tentativas + 1}:`);

      // Processa a mão do Jogador
      if (!maoJogadorCompleta) {
          maoJogador.length = 0; // Limpa a mão anterior
          maoJogador.push(...copiaBaralhoJogador.splice(0, 10)); // Retira os 5 primeiros cards do baralho

          if (!temNinjaEstagio1(maoJogador)) {
              // Devolve os cards ao final do baralho e tenta de novo
              copiaBaralhoJogador.push(...maoJogador);
              maoJogador.length = 0;
          } else {
              // Se tiver Ninja 1, finaliza a mão
              maoJogadorCompleta = true;
          }
      }

      // Processa a mão da IA
      if (!maoIACompleta) {
          maoIA.length = 0; // Limpa a mão anterior
          maoIA.push(...copiaBaralhoIA.splice(0, 10)); // Retira os 5 primeiros cards do baralho

          if (!temNinjaEstagio1(maoIA)) {
              // Devolve os cards ao final do baralho e tenta de novo
              copiaBaralhoIA.push(...maoIA);
              maoIA.length = 0;
          } else {
              // Se tiver Ninja 1, finaliza a mão
              maoIACompleta = true;
          }
      }

      tentativas++; // Incrementa o contador de tentativas
  }

  // Verificação final para garantir que ambas as mãos estão corretas
  if (!maoJogadorCompleta || !maoIACompleta) {
      console.error("Não foi possível formar mãos válidas após 20 tentativas.");
      return;
  }

  // Atualiza os baralhos originais com as cópias finais
  baralhoJogador.length = 0;
  baralhoJogador.push(...copiaBaralhoJogador);

  baralhoIA.length = 0;
  baralhoIA.push(...copiaBaralhoIA);

  //console.log("Mão inicial do Jogador:", maoJogador);
  //console.log("Baralho do Jogador após formação:", baralhoJogador);
  //console.log("Mão inicial da IA:", maoIA);
  //console.log("Baralho da IA após formação:", baralhoIA);
}
function renderizarMao(mao) {
  const maoContainer = document.getElementById('maoJ1');
  maoContainer.innerHTML = ''; // Limpa a mão antes de renderizar

  // Filtra cards que já estão no campo
  const cardsNoCampo = Array.from(document.querySelectorAll('.field-slot img')).map(card => card.id);

  // Filtra cards que estão no descarte
  const cardsNoDescarte = Array.from(document.querySelectorAll('#player-discard-slot img')).map(card => card.id);

  // Combina os filtros (campo + descarte)
  const idsExcluidos = [...cardsNoCampo, ...cardsNoDescarte];

  // Filtra apenas os cards que não estão no campo nem no descarte
  const cardsNaMao = mao.filter(card => !idsExcluidos.includes(card.idCard));

  cardsNaMao.forEach(card => {
      const cardElement = document.createElement('img');
      cardElement.src = card.imagem;
      cardElement.alt = card.nome || 'Card';
      cardElement.id = card.idCard;
      cardElement.classList.add('hand-card');

      // Configuração dos atributos com base no tipo de card
      if (card.tipo === 'Ninja') {
          Object.assign(cardElement.dataset, {
              tipo: card.tipo,
              idCard: card.idCard,
              registro: card.registro,
              nome: card.nome,
              estagio: card.estagio || 1,
              // Adiciona o HP e Chakra inicial
              hpInicial: card.hp || 0,
              chakraInicial: card.chakra || 0,
              hp: card.hp || 0,
              chakra: card.chakra || 0,
              taijutsu: card.taijutsu || 0,
              genjutsu: card.genjutsu || 0,
              ninjutsu: card.ninjutsu || 0,
              defesa: card.defesa || 0,
              velocidade: card.velocidade || 0,
              chakraFogo: card.chakraFogo || 0,
              chakraVento: card.chakraVento || 0,
              chakraRaio: card.chakraRaio || 0,
              chakraTerra: card.chakraTerra || 0,
              chakraAgua: card.chakraAgua || 0,
              habilidadeSuporte: card.habilidadeSuporte || null,
              custoHabSup: card.custoHabSup || 0,
              probabilidade: card.probabilidade || 0,
              // Adiciona os jutsus ao dataset como string JSON 
              jutsus: JSON.stringify(card.jutsus || [])
          });
      } else if (card.tipo === 'Chakra') {
          cardElement.dataset.tipo = card.tipo;
          cardElement.dataset.idCard = card.idCard;
          cardElement.dataset.naturezaChakra = card.naturezaChakra;
          // Verifica se o efeito está definido e o converte para string
          cardElement.dataset.efeito = typeof card.efeito === 'string' ? card.efeito : JSON.stringify(card.efeito || '');
      } else if (card.tipo === 'Tool') {
          cardElement.dataset.tipo = card.tipo;
          cardElement.dataset.idCard = card.idCard;
          cardElement.dataset.nome = card.nome || 'Tool';
          cardElement.dataset.efeito = typeof card.efeito === 'string' ? card.efeito : JSON.stringify(card.efeito || '');
      }

      maoContainer.appendChild(cardElement);
  });
}
function atualizarImagensMaoIA() {
  const maoIA = document.getElementById('maoIA');
  const iaDeckImage = localStorage.getItem('iaDeckImage') || 'imagens/deck_placeholder.png'; // Caminho padrão

  // Altere todas as imagens dos cards da mão da IA para a imagem do deck
  const cardsNaMao = maoIA.querySelectorAll('img');
  cardsNaMao.forEach(card => {
    card.src = iaDeckImage;
    card.dataset.originalSrc = card.dataset.originalSrc || card.src; // Salva a imagem original do card
  });
}
function restaurarImagemCard(card) {
  if (card.dataset.originalSrc) {
    card.src = card.dataset.originalSrc; // Restaura a imagem original
    delete card.dataset.originalSrc; // Remove o dado temporário
  }
}
function renderizarMaoIA(maoIA) {
  const maoContainerIA = document.getElementById('maoIA');
  maoContainerIA.innerHTML = ''; // Limpa a mão antes de renderizar os cards

  // Recupera a imagem do deck da IA
  const iaDeckImage = localStorage.getItem('iaDeckImage') || 'imagens/deck_placeholder.png';

  // Filtrar cards que já estão no campo da IA
  const cardsNoCampoIA = Array.from(document.querySelectorAll('.field-slot img')).map(card => card.id);

  // Filtrar cards que estão no descarte da IA
  const cardsNoDescarteIA = Array.from(document.querySelectorAll('#ia-discard-slot img')).map(card => card.id);

  // Combina os filtros (campo + descarte)
  const idsExcluidosIA = [...cardsNoCampoIA, ...cardsNoDescarteIA];

  // Filtrar apenas os cards que não estão no campo nem no descarte
  const cardsNaMaoIA = maoIA.filter(card => !idsExcluidosIA.includes(card.idCard));

  // Renderizar os cards filtrados
  cardsNaMaoIA.forEach((card) => {
    const cardWrapper = document.createElement('div');
    cardWrapper.classList.add('card-wrapper-ia'); // Classe para estilização

    const cardElement = document.createElement('img');
    cardElement.src = card.imagem;
    cardElement.alt = card.nome || 'Card';
    cardElement.id = card.idCard;
    cardElement.classList.add('hand-card-ia'); // Classe para estilização

    // Define atributos com base no tipo de card
    if (card.tipo === 'Ninja') {
      Object.assign(cardElement.dataset, {
        tipo: card.tipo,
        idCard: card.idCard,
        registro: card.registro,
        nome: card.nome,
        estagio: card.estagio || 1,
        hpInicial: card.hp || 0,
        chakraInicial: card.chakra || 0,
        hp: card.hp || 0,
        chakra: card.chakra || 0,
        taijutsu: card.taijutsu || 0,
        genjutsu: card.genjutsu || 0,
        ninjutsu: card.ninjutsu || 0,
        defesa: card.defesa || 0,
        velocidade: card.velocidade || 0,
        chakraFogo: card.chakraFogo || 0,
        chakraVento: card.chakraVento || 0,
        chakraRaio: card.chakraRaio || 0,
        chakraTerra: card.chakraTerra || 0,
        chakraAgua: card.chakraAgua || 0,
        habilidadeSuporte: card.habilidadeSuporte || null,
        custoHabSup: card.custoHabSup || 0,
        probabilidade: card.probabilidade || 0,
        // Adiciona os jutsus ao dataset como string JSON
        jutsus: JSON.stringify(card.jutsus || [])
      });
    } else if (card.tipo === 'Chakra') {
      cardElement.dataset.tipo = card.tipo;
      cardElement.dataset.idCard = card.idCard;
      cardElement.dataset.naturezaChakra = card.naturezaChakra;
      cardElement.dataset.efeito = typeof card.efeito === 'string' ? card.efeito : JSON.stringify(card.efeito || '');
    } else if (card.tipo === 'Tool') {
      cardElement.dataset.tipo = card.tipo;
      cardElement.dataset.idCard = card.idCard;
      cardElement.dataset.nome = card.nome || 'Tool';
      cardElement.dataset.efeito = typeof card.efeito === 'string' ? card.efeito : JSON.stringify(card.efeito || '');
    }

    const overlay = document.createElement('img');
    overlay.src = iaDeckImage;
    overlay.alt = 'Deck';
    overlay.classList.add('hand-card-overlay');

    cardWrapper.appendChild(cardElement);
    cardWrapper.appendChild(overlay);
    maoContainerIA.appendChild(cardWrapper);
  });
}
function encerrarFormacao() {
  //console.log("Encerrando fase de formação...");
 
  // Recupera o líder do jogador
  const playerLeaderSlot = document.getElementById('player-leader-slot');
  const leaderCard = playerLeaderSlot.querySelector('img');

  // Verifica se o card do líder é um Ninja Estágio 1
  if (leaderCard) {
    const leaderType = leaderCard.getAttribute('data-tipo'); // Usa getAttribute para acessar atributos
    const leaderStage = parseInt(leaderCard.getAttribute('data-estagio'), 10);
/*
    console.log(`Líder no slot encontrado:`, leaderCard);
    console.log(`Tipo do líder: ${leaderType}`);
    console.log(`Estágio do líder: ${leaderStage}`);
*/
    if (leaderType === "Ninja" && leaderStage === 1) {
      alert("Formação do time concluída!");
      
      // Adiciona a variável bloqEvo aos cards no campo
      const allCardsInField = document.querySelectorAll('.field-slot img');
      allCardsInField.forEach(card => {
        card.setAttribute('data-bloq-evo', '0'); // Bloqueia a evolução inicialmente
      });
      // Inicia a escolha do time pela IA
      escolherTimeIA();

      return; // Encerrar a função aqui
    }
  }

  alert("O Líder deve ser um Ninja Estágio 1!");
}
//-----Turno de Compra
function turnoDeCompraIA() {
  //console.log("Iniciando turno de compra da IA...");
  //estadoAtual="compra";
  //console.log("Fase:",estadoAtual);
  atualizarBotoes();

  // Verifica a quantidade de cards no deck da IA
  const deckIA = iaBaralho.cards;
  const maoIA = iaMao;

  if (deckIA.length > 2) {
      const comprado = comprarCard(deckIA, maoIA, 'ia-deck-slot');
      if (comprado) {
          renderizarMaoIA(maoIA); // Atualiza a mão da IA
      }
      console.log("A IA comprou 1 card do deck");
      turnoDeCompraJ1();
  } else if (deckIA.length === 2) {
      const comprado = comprarCard(deckIA, maoIA, 'ia-deck-slot');
      if (comprado) {
          renderizarMaoIA(maoIA); // Atualiza a mão da IA
      }
      alert("A IA só possui mais 1 card no deck");
      turnoDeCompraJ1();
  } else if (deckIA.length === 1) {
      const comprado = comprarCard(deckIA, maoIA, 'ia-deck-slot');
      if (comprado) {
          renderizarMaoIA(maoIA); // Atualiza a mão da IA
      }
      alert("IA não possui mais cards no deck");
      turnoDeCompraJ1();
  } else {
      alert("IA não pode comprar: deck vazio");
      turnoDeCompraJ1();
  }
}
function turnoDeCompraJ1() {
  //console.log("Iniciando turno de compra do jogador...");

  // Verifica a quantidade de cards no deck do jogador
  const deckJ1 = jogadorBaralho.cards;
  const maoJ1 = jogadorMao;

  if (deckJ1.length > 2) {
      const comprado = comprarCard(deckJ1, maoJ1, 'player-deck-slot');
      if (comprado) {
          renderizarMao(maoJ1); // Atualiza a mão do jogador
      }
      console.log(`${jogadorNome} comprou 1 card do deck`);
      encerrarTurno();
  } else if (deckJ1.length === 2) {
      const comprado = comprarCard(deckJ1, maoJ1, 'player-deck-slot');
      if (comprado) {
          renderizarMao(maoJ1); // Atualiza a mão do jogador
      }
      alert(`${jogadorNome} só possui mais 1 card no deck`);
      encerrarTurno();
  } else if (deckJ1.length === 1) {
      const comprado = comprarCard(deckJ1, maoJ1, 'player-deck-slot');
      if (comprado) {
          renderizarMao(maoJ1); // Atualiza a mão do jogador
      }
      alert(`${jogadorNome} não possui mais cards no deck`);
      encerrarTurno();
  } else {
      alert(`${jogadorNome} não pode comprar: deck vazio`);
      encerrarTurno();
  }
}
// Função para adicionar um card na mão e remover do deck
function comprarCard(deck, mao, deckSlotId) {
  if (deck.length === 0) return null; // Sem cards no deck

  const card = deck.shift(); // Remove o card do topo do deck
  const isCardInField = Array.from(document.querySelectorAll('.field-slot img')).some(
      fieldCard => fieldCard.id === card.idCard
  );

  if (!isCardInField) {
      mao.push(card); // Adiciona na mão se o card não estiver no campo
  } else {
      console.warn(`Card ${card.idCard} já está no campo, não será adicionado à mão.`);
  }

  // Atualiza a imagem do deck
  const deckSlot = document.getElementById(deckSlotId);
  if (deck.length === 0) {
      deckSlot.innerHTML = ''; // Remove a imagem se o deck está vazio
  }

  return card;
}
//-----Preparação
function turnoDePreparacao() {
  console.log("Iniciando turno de preparação...");
  //estadoAtual = "preparacao";
  //console.log("Fase:",estadoAtual);
  incrementarBloqEvo(); // Incrementa bloqEvo
  atualizarBotoes(); // Atualiza os botões novamente
  configurarEventosDeDuploClique();//Ativa ver cards da IA
  initializeDragAndDrop();
}
function aplicarEfeito(cardDestino, cardOrigem) {
  const efeito = cardOrigem.dataset.efeito;
  if (!efeito) {
      console.log(`O card ${cardOrigem.id} não possui efeito definido.`);
      return;
  }

  console.log(`Aplicando efeito de ${cardOrigem.id} no ninja ${cardDestino.id}`);

  // Divide os efeitos e remove strings vazias
  const efeitos = efeito.split(";").map(e => e.trim()).filter(e => e);

  console.log("Efeitos identificados:", efeitos);

  let efeitoAplicado = false; // Controle para saber se algum efeito foi aplicado

  efeitos.forEach(efeitoStr => {
      const [atributo, valor] = efeitoStr.split(":").map(e => e.trim());

      if (!atributo || !valor) {
          console.log(`Efeito inválido ignorado: ${efeitoStr}`);
          return;
      }

      // Incrementa ou decrementa o valor no dataset do ninja
      if (cardDestino.dataset[atributo] !== undefined) {
          const valorAtual = parseInt(cardDestino.dataset[atributo], 10) || 0;
          cardDestino.dataset[atributo] = valorAtual + parseInt(valor, 10);
          
          console.log(`Atributo ${atributo} de ${valorAtual} atualizado para: ${cardDestino.dataset[atributo]}`);
          efeitoAplicado = true;
      } else {
          console.log(`Atributo ${atributo} não encontrado no card de destino.`);
      }
  });

  // Atualiza atributos do líder se o efeito foi aplicado e o destino for o líder
  if (efeitoAplicado && cardDestino.parentElement.id === "player-leader-slot") {
      //console.log("Atualizando atributos do líder do jogador...");
      atualizarAtributosLider(cardDestino);
  } else if (efeitoAplicado && cardDestino.parentElement.id === "ia-leader-slot") {
      console.log("Atualizando atributos do líder da IA...");
      atualizarAtributosLiderIA(cardDestino);
  }
}
function validarEvolucao(cardOrigem, cardDestino, slotOrigem, slotDestino) {
  console.log(`Validando evolução ${cardDestino.id} com ${cardOrigem.id}`);
  const registroOrigem = cardOrigem.dataset.registro;
  const registroDestino = cardDestino.dataset.registro;
  const estagioOrigem = parseInt(cardOrigem.dataset.estagio, 10);
  const estagioDestino = parseInt(cardDestino.dataset.estagio, 10);
  const bloqueioEvo = parseInt(cardDestino.dataset.bloqEvo, 10);

  if (
    registroOrigem === registroDestino &&
    estagioDestino === estagioOrigem - 1 &&
    bloqueioEvo >= estagioOrigem
  ) {
      console.log(`Evoluindo ninja (${cardDestino.id}) com ${cardOrigem.id}`);
      evoluirNinja(cardDestino, cardOrigem);
      removerCardDaMao(cardOrigem);
  } else {
    console.log(`Bloqueio (${bloqueioEvo}), reg. origem (${registroOrigem}) e reg. destino (${registroDestino})`);
    alert("Evolução inválida: Verifique o estágio, registro ou bloqueio de evolução.");
    return;
  } 
}
function encerrarPreparacao() {
  if (estadoAtual !== "preparacaoIA") {
      alert("Você só pode encerrar o turno durante a preparação!");
      return;
  }
  console.log("Finalizando turno de preparação...");
  chakraUsado = false; // Reseta o controle de uso de Chakra
  // Reseta o uso de Tools em todos os ninjas no campo
  const ninjasNoCampo = document.querySelectorAll('.field-slot img[data-tipo="Ninja"]');
  ninjasNoCampo.forEach(ninja => {
      ninja.dataset.toolUsado = "false";
  });

  estadoAtual = "suporte";
  decidirOrdemHabilidadesSuporte();
}
// Função para atualizar os botões com base no estado atual
function atualizarBotoes() {
  document.getElementById("fase-atual").innerText = traduzirFase(estadoAtual);
}
// Exemplo de função para encerrar o turno atual e ir para o próximo
function encerrarTurno() {
  if (estadoAtual === "formacao") {
    console.log("Turno de formação do J1 encerrado!");
    estadoAtual = "form.IA"; // Transição para a formação da IA
    encerrarFormacao(); // Função específica para encerrar a formação
  } else if (estadoAtual === "compra") {
    alert("Turno de compra encerrado!");
    estadoAtual = "preparacao"; // Transição para a fase de preparação
    turnoDePreparacao(); // Função específica para o início da preparação
  } else if (estadoAtual === "preparacao") {
    console.log("Turno de preparação encerrado!");
    estadoAtual = "preparacaoIA"; // Transição para a fase de combate
    acaoPreparacaoIA(); // Função específica para encerrar a preparação
  } else if (estadoAtual === "preparacaoIA") {
    console.log("Turno de preparação IA encerrado!");
    encerrarPreparacao(); // Função específica para encerrar a preparação
  } else if (estadoAtual === "suporte") {
    console.log("Encerrando Suporte");
    if (!suporteIAExecutado) {
      console.log("IA ainda não executou as habilidades de suporte. Iniciando...");
      escolherHabilidadesSuporteIA();
      encerrarTurno();
    } else {
      console.log("IA já executou as habilidades de suporte. Avançando para a fase de combate...");
      estadoAtual = "combate";
      iniciarTurnoCombate();
    }
  } else if (estadoAtual === "combate") {
    console.log("Iniciando dano de combate");
    encerrarCombate(); // Função específica para calcular dano
  } else if (estadoAtual === "novoLider") {
    console.log("Iniciando escolha do novo lider");
    estadoAtual = "premio"; // Transição para a fase de prêmio
    encerrarTurno(); // Função específica para encerrar combate
  } else if (estadoAtual === "premio" || estadoAtual === "liderAusente") {
    console.log("Turno de prêmio encerrado!");    
    // Reseta a marcação de habilidade usada e limpa a marcação de paralyze para todos os ninjas no campo
    const todosNinjasCampo = document.querySelectorAll(".field-slot img");
    todosNinjasCampo.forEach(ninja => {
        if (ninja.dataset.habUsada === "true") {
            ninja.dataset.habUsada = "false";
            console.log(`Resetando habilidade usada para o ninja ${ninja.dataset.nome}.`);
        }
        if (ninja.dataset.paralyze === "true") {
            ninja.dataset.paralyze = "false";
            console.log(`Removendo Paralyze do ninja ${ninja.dataset.nome}.`);
            ninja.dataset.velocidade = ninja.dataset.velocidadeOriginal || ninja.dataset.velocidade; // Restaura a velocidade original, se aplicável
        }
    });

    estadoAtual = "compra";
    turnoDeCompraIA(); // Avança para o próximo estágio
  } else if (estadoAtual === "fim") {
    console.log("Encerrando Jogo");
    return;
  }

  // Atualiza os botões após a mudança de estado
  atualizarBotoes();

}
// Função de clique para os botões
function handleClick(novoEstado) {
  // Validação para encerrar a formação: verifica se o slot do líder está vazio
  if (estadoAtual === "formacao" && novoEstado === "formacao") {
    const liderSlot = document.querySelector("#player-leader-slot img");
    if (!liderSlot) {
      alert("Você deve selecionar um líder antes de encerrar a formação.");
      return; // Aborta se o líder não estiver definido
    }
  }
  // Mapeia os estados que exigem confirmação para encerrar
  const estadosComConfirmacao = {
    formacao: "Deseja encerrar o turno de formação?",
    preparacao: "Deseja encerrar o turno de preparação?",
    combate: "Deseja iniciar o combate?",
    novoLider: "Confirmar novo lider?",
  };

  if (novoEstado === estadoAtual) {
    // Verifica se o estado atual exige confirmação
    const mensagem = estadosComConfirmacao[estadoAtual];
    if (mensagem) {
      const confirmar = confirm(mensagem);
      if (confirmar) {
        encerrarTurno(); // Chama a função de encerrar turno
      }
    }
    return; // Sai se o botão ativo for clicado novamente
  }

  // Troca para o estado clicado
  trocarEstado(novoEstado);
}
// Controle de Fases
//document.getElementById("fase-atual").innerText = traduzirFase(estadoAtual);

// Manipular o botão de desistência
document.getElementById("btn-desistir").addEventListener("click", () => {
  const confirmar = confirm("Você tem certeza que deseja desistir? A IA será declarada vencedora.");
  if (confirmar) {
    declararVitoriaIA();
  }
});

// Manipular o botão de próxima fase
document.getElementById("btn-proxima-fase").addEventListener("click", () => {
  const confirmar = confirm(`Deseja encerrar a fase "${traduzirFase(estadoAtual)}" e avançar para a próxima?`);
  if (confirmar) {
    encerrarTurno();
  }
});

// Função para traduzir o nome da fase
function traduzirFase(fase) {
  const traducoes = {
    inicio: "Formando a Vila",
    formacao: "Formação do Time",
    compra: "Invocando Recurso",
    preparacao: "Equipando Time",
    suporte: "Hab. de Suporte",
    combate: "Ações de Combate",
    novoLider: "Escolher Novo Líder"
  };
  return traducoes[fase] || fase;
}
// Função para encerrar o jogo
function encerrarJogo() {
  estadoAtual = "encerrado";
  document.getElementById("fase-atual").innerText = "Jogo Encerrado";
  alert("Obrigado por jogar!");
  // Adicione lógica para encerrar o jogo (desativar botões, etc.)
  return;
}
//----Encerrar
function iniciarTurnoCombate() {
  console.log("Iniciando turno de combate...");
  atualizarBotoes();

  // Reduz HP dos ninjas com a marcação de Poising
  const todosNinjas = document.querySelectorAll(".field-slot img");
  todosNinjas.forEach(ninja => {
    if (ninja.dataset.poising === "true") {
        const hpAtual = parseInt(ninja.dataset.hp, 10);
        const hpInicial = parseInt(ninja.dataset.hpInicial, 10);

        if (hpAtual > 0) {
            const reducao = Math.ceil(hpInicial * 0.1); // 10% do HP inicial
            ninja.dataset.hp = Math.max(0, hpAtual - reducao); // Garante que o HP não fique negativo
            console.log(`Ninja ${ninja.dataset.nome} com Poising: HP reduzido em ${reducao}. HP atual: ${ninja.dataset.hp}`);

            // Atualiza atributos se o ninja for o líder
            if (ninja.closest("#player-leader-slot")) {
                console.log(`Atualizando atributos do líder do jogador devido ao Poising.`);
                atualizarAtributosLider(ninja);
            } else if (ninja.closest("#ia-leader-slot")) {
                console.log(`Atualizando atributos do líder da IA devido ao Poising.`);
                atualizarAtributosLiderIA(ninja);
            }

            // Remove o ninja do campo se ele foi derrotado
            if (parseInt(ninja.dataset.hp, 10) === 0) {
                console.log(`Ninja ${ninja.dataset.nome} foi derrotado devido ao efeito de Poising.`);
                adicionarAoDescarte(ninja); // Função para remover o ninja do campo
            }
        }
    }
  });


  const liderJogador = document.querySelector("#player-leader-slot img");
  const liderIA = document.querySelector("#ia-leader-slot img");

  console.log("Líder Atual IA:", liderIA ? liderIA.dataset.nome : "Não encontrado");
  console.log("Líder Atual Jogador:", liderJogador ? liderJogador.dataset.nome : "Não encontrado");

  if (!liderJogador && !liderIA) {
      console.log("Ambos os slots de líder estão vazios.");
      turnosSemLider++;
      if (turnosSemLider >= 3) {
          acordoPaz();
      } else {
          encerrarTurno();
      }
      return;
  }

  if (liderJogador && !liderIA) {
      console.log("Jogador possui um líder, IA não.");
      turnosSemLider = 0; // Reseta o contador
      resgatePremioJ1();
      return;
  }

  if (liderIA && !liderJogador) {
      console.log("IA possui um líder, Jogador não.");
      turnosSemLider = 0; // Reseta o contador
      resgatePremioIA();
      return;
  }

  if (liderJogador && liderIA) {
      console.log("Ambos os líderes estão presentes.");
      turnosSemLider = 0; // Reseta o contador
      atualizarDropdownAcoes();
      atualizarDropdownAcoesIA();
  }
}
function resgatePremioJ1() {
  console.log("Resgatando prêmio para o Jogador...");
  const iaScrollCount = document.getElementById("ia-scroll-count");
  const playerScrollCount = document.getElementById("player-scroll-count");

  if (parseInt(iaScrollCount.textContent, 10) > 0) {
      iaScrollCount.textContent = parseInt(iaScrollCount.textContent, 10) - 1;
      playerScrollCount.textContent = parseInt(playerScrollCount.textContent, 10) + 1;

      if (parseInt(iaScrollCount.textContent, 10) === 0) {
          console.log("IA não possui mais pergaminhos.");
          declararVitoriaJ1();
      } else {
          escolherNovoLiderIA();
      }
  } else {
      console.log("IA não possui mais pergaminhos.");
      declararVitoriaJ1();
  }
}
function declararVitoriaJ1() {
  console.log("Jogador 1 venceu!");
  alert("Jogador 1 venceu!");
  // Encerrar o jogo
  encerrarJogo();
}
function resgatePremioIA() {
  console.log("Resgatando prêmio para a IA...");
  const iaScrollCount = document.getElementById("ia-scroll-count");
  const playerScrollCount = document.getElementById("player-scroll-count");

  if (parseInt(playerScrollCount.textContent, 10) > 0) {
      playerScrollCount.textContent = parseInt(playerScrollCount.textContent, 10) - 1;
      iaScrollCount.textContent = parseInt(iaScrollCount.textContent, 10) + 1;
  
      if (parseInt(playerScrollCount.textContent, 10) === 0) {
        console.log("J1 não possui mais pergaminhos.");
        declararVitoriaIA();
      } else {
        estadoAtual = "novoLider";
        escolherNovoLiderJ1();
      }
    } else {
      console.log("Jogador não possui mais pergaminhos.");
      declararVitoriaIA();
  }
}
function escolherNovoLiderJ1() {
  alert("Promova um suporte para ser o lider");
  atualizarBotoes(); // Atualiza os botões novamente
  configurarEventosDeDuploClique();//Ativa ver cards da IA
  //dragAndDrop(); // Ativa os eventos de drag-and-drop para preparação
  initializeDragAndDrop();
}
function declararVitoriaIA() {
  console.log("IA venceu!");
  alert("IA venceu!");
  // Encerrar o jogo
  encerrarJogo();
}
function acordoPaz() {
  console.log("Acordo de paz chamado.");
  // Lógica para acordo de paz
}
function atualizarDropdownAcoes() {
  // Obter o ninja líder atual do slot de líder do jogador
  const liderAtual = document.querySelector("#player-leader-slot img");
  if (!liderAtual) {
      console.warn("Nenhum ninja líder está no slot de líder do jogador.");
      return;
  }
  // Obter os atributos do ninja líder 
  const taijutsu = liderAtual.dataset.taijutsu || 0; 
  const defesa = liderAtual.dataset.defesa || 0; 
  const genjutsu = liderAtual.dataset.genjutsu || 0; 
  const velocidade = liderAtual.dataset.velocidade || 0;
  // Obter os jutsus do ninja líder
  const jutsus = JSON.parse(liderAtual.dataset.jutsus || "[]");
  console.log("Jutsus do líder atual:", jutsus);

  // Obter os dropdowns
  const dropdownOfensiva = document.getElementById("j1-offensive-action");
  const dropdownDefensiva = document.getElementById("j1-defensive-action");

  // Limpar opções atuais
  dropdownOfensiva.innerHTML = "";
  dropdownDefensiva.innerHTML = "";

  // Adicionar opções baseadas nos atributos
  const opcoesBasicas = [
    { value: "taijutsu", text: `Ataque Simples (${taijutsu})` },
    { value: "defesa", text: `Proteger-se (${defesa})` },
    { value: "velocidade", text: `Desviar (${velocidade})` }
  ];

  // Adicionar atributos ao dropdown de ação ofensiva
  const ataqueBasicoOption = document.createElement("option");
  ataqueBasicoOption.value = opcoesBasicas[0].value;
  ataqueBasicoOption.textContent = opcoesBasicas[0].text;
  dropdownOfensiva.appendChild(ataqueBasicoOption);
  //console.log("Opção 'Ataque Básico' adicionada ao dropdown ofensivo.");

  // Adicionar atributos ao dropdown de ação defensiva
  opcoesBasicas.slice(1).forEach(opcao => {
      const option = document.createElement("option");
      option.value = opcao.value;
      option.textContent = opcao.text;
      dropdownDefensiva.appendChild(option);
      //console.log(`Opção '${opcao.text}' adicionada ao dropdown defensivo.`);
  });

  // Adicionar jutsus ao dropdown correspondente
  jutsus.forEach(jutsu => {
    const option = document.createElement("option");
    option.value = jutsu.nomeJutsu;
    option.textContent = `${jutsu.nomeJutsu} (${jutsu.estiloJutsu}) - Power: ${jutsu.powerJutsu}`;
    //console.log("Adicionando jutsu:", jutsu.nomeJutsu);

    if (jutsu.categoria === "ataque") {
        dropdownOfensiva.appendChild(option);
        dropdownDefensiva.appendChild(option.cloneNode(true));
        //console.log(`Jutsu '${jutsu.nomeJutsu}' adicionado aos dropdowns ofensivo e defensivo.`);
    } else if (jutsu.categoria === "defesa" || jutsu.categoria === "evasiva") {
        dropdownDefensiva.appendChild(option);
        //console.log(`Jutsu '${jutsu.nomeJutsu}' adicionado ao dropdown defensivo.`);
    }
  });
  console.log("Dropdowns atualizados com ações do ninja líder.");
}
function atualizarDropdownAcoesIA() {
  // Obter o ninja líder atual do slot de líder da IA
  const liderAtualIA = document.querySelector("#ia-leader-slot img");
  console.log("Líder Atual IA:", liderAtualIA ? liderAtualIA.dataset.nome : "Não encontrado");
  if (!liderAtualIA) {
      console.warn("Nenhum ninja líder está no slot de líder da IA.");
      return;
  }

  // Obter os atributos do ninja líder da IA
  const taijutsu = liderAtualIA.dataset.taijutsu || 0;
  const defesa = liderAtualIA.dataset.defesa || 0;
  const genjutsu = liderAtualIA.dataset.genjutsu || 0;
  const velocidade = liderAtualIA.dataset.velocidade || 0;

  // Obter os jutsus do ninja líder da IA
  const jutsusIA = JSON.parse(liderAtualIA.dataset.jutsus || "[]");
  console.log("Jutsus do líder atual da IA:", jutsusIA);

  // Obter os dropdowns
  const dropdownOfensivaIA = document.getElementById("ia-offensive-action");
  const dropdownDefensivaIA = document.getElementById("ia-defensive-action");

  // Limpar opções atuais
  dropdownOfensivaIA.innerHTML = "";
  dropdownDefensivaIA.innerHTML = "";

  // Adicionar opções baseadas nos atributos
  const opcoesBasicasIA = [
    { value: "taijutsu", text: `Ataque Simples (${taijutsu})` },
    { value: "defesa", text: `Proteger-se (${defesa})` },
    //{ value: "genjutsuIA", text: `Genjutsu (${genjutsuIA})` },
    { value: "velocidade", text: `Desviar (${velocidade})` }
  ];

  // Adicionar atributos ao dropdown de ação ofensiva da IA
  const ataqueBasicoOptionIA = document.createElement("option");
  ataqueBasicoOptionIA.value = opcoesBasicasIA[0].value;
  ataqueBasicoOptionIA.textContent = opcoesBasicasIA[0].text;
  dropdownOfensivaIA.appendChild(ataqueBasicoOptionIA);
  //console.log("Opção 'Ataque Básico' adicionada ao dropdown ofensivo da IA.");

  // Adicionar atributos ao dropdown de ação defensiva da IA
  opcoesBasicasIA.slice(1).forEach(opcao => {
      const option = document.createElement("option");
      option.value = opcao.value;
      option.textContent = opcao.text;
      dropdownDefensivaIA.appendChild(option);
      //console.log(`Opção '${opcao.text}' adicionada ao dropdown defensivo da IA.`);
  });

  // Adicionar jutsus ao dropdown correspondente
  jutsusIA.forEach(jutsu => {
      const option = document.createElement("option");
      option.value = jutsu.nomeJutsu;
      option.textContent = `${jutsu.nomeJutsu} (${jutsu.estiloJutsu}) - Power: ${jutsu.powerJutsu}`;
      //console.log("Adicionando jutsu:", jutsu.nomeJutsu);

      if (jutsu.categoria === "ataque") {
          dropdownOfensivaIA.appendChild(option);
          dropdownDefensivaIA.appendChild(option.cloneNode(true));
          //console.log(`Jutsu '${jutsu.nomeJutsu}' adicionado aos dropdowns ofensivo e defensivo da IA.`);
      } else if (jutsu.categoria === "defesa" || jutsu.categoria === "evasiva") {
          dropdownDefensivaIA.appendChild(option);
          //console.log(`Jutsu '${jutsu.nomeJutsu}' adicionado ao dropdown defensivo da IA.`);
      }
  });

  console.log("Dropdowns da IA atualizados com ações do ninja líder.");
}
function encerrarCombate() {
  //alert('Encerrar combate');
  configurarEventosDeDuploClique();
  const ofensivaJ1 = document.getElementById("j1-offensive-action").value;
  const defensivaJ1 = document.getElementById("j1-defensive-action").value;

  const liderAtual = document.querySelector("#player-leader-slot img");
    if (!liderAtual) {
        console.warn("Nenhum ninja líder está no slot de líder do jogador.");
        return;
    }

  if (ofensivaJ1 && defensivaJ1) {
      // Validar escolha do jogador
      if (!validarEscolhaAcoes(document.getElementById("j1-offensive-action"), liderAtual)) return;
      if (!validarEscolhaAcoes(document.getElementById("j1-defensive-action"), liderAtual)) return;

      // Jogador escolheu as ações, agora a IA escolhe suas ações
      escolherAcoesIA();
  } else {
      alert("Escolha uma ação ofensiva e uma ação defensiva.");
  }
}
//------Escolher ações
function validarRequisitosChakra(requisitoChakra, atributos) {
  for (const [key, value] of Object.entries(requisitoChakra)) {
    if ((atributos[key] || 0) < value) {
      console.warn(
        `Requisito não atendido: ${key} precisa de ${value}, mas possui ${(atributos[key] || 0)}.`
      );
      return false;
    }
  }
  return true;
}
function validarEscolhaAcoes(elementoDropdown, lider) {
  const opcaoSelecionada = elementoDropdown.value;
  console.log(`Validando ação: ${opcaoSelecionada} para o líder: ${lider.alt}`);

  // Definição de ações básicas
  const acoesBasicas = ["taijutsu", "defesa", "velocidade"];
  if (acoesBasicas.includes(opcaoSelecionada)) {
    return true; // Ações básicas são sempre válidas
  }

  // Buscar o jutsu selecionado
  const jutsus = JSON.parse(lider.dataset.jutsus || "[]");
  const jutsuSelecionado = jutsus.find(jutsu => jutsu.nomeJutsu === opcaoSelecionada.split(" (")[0]);

  if (!jutsuSelecionado) {
    console.error("Jutsu selecionado não encontrado.");
    return false;
  }

  // Validar o custo de chakra
  const custoChakra = jutsuSelecionado.custoChakra || 0;
  const chakraAtual = parseInt(lider.dataset.chakra) || 0;

  if (chakraAtual < custoChakra) {
    console.warn("Chakra insuficiente para usar este jutsu.");
    return false;
  }

  // Calcular os atributos de chakra
  const chakraFogo = parseInt(lider.dataset.chakraFogo) || 0;
  const chakraVento = parseInt(lider.dataset.chakraVento) || 0;
  const chakraRaio = parseInt(lider.dataset.chakraRaio) || 0;
  const chakraTerra = parseInt(lider.dataset.chakraTerra) || 0;
  const chakraAgua = parseInt(lider.dataset.chakraAgua) || 0;

  const atributosChakra = {
    chakraFogo,
    chakraVento,
    chakraRaio,
    chakraTerra,
    chakraAgua,
    elementosTotal: chakraFogo + chakraVento + chakraRaio + chakraTerra + chakraAgua // Soma total dos elementos
  };

  // Validar os requisitos de chakra do jutsu
  const requisitoChakra = jutsuSelecionado.requisitoChakra || {};
  if (!validarRequisitosChakra(requisitoChakra, atributosChakra)) {
    console.warn("Requisitos de chakra não atendidos.");
    return false;
  }

  return true;
}
//------Encerrar escolha das ações
//------Inicio Modal Descarte
function openModal(discardPile, title) {
    currentDiscardPile = discardPile;
    currentCardIndex = 0;
    document.getElementById("modal-title").textContent = title; // Atualiza o título do modal
    document.getElementById("discardModal").style.display = "flex";
    showCard(currentCardIndex);
}
function closeModal() {
    document.getElementById("discardModal").style.display = "none";
}
function showCard(index) {
    //console.log(`Mostrando card no índice: ${index}`);
    if (index >= 0 && index < currentDiscardPile.length) {
        const cardDisplay = document.getElementById("cardDisplay");
        const cardId = currentDiscardPile[index];
        const cardElement = document.getElementById(cardId);

        //console.log(`Exibindo card com ID: ${cardId}`);
        // Verifica se o elemento do card foi encontrado
        if (cardElement) {
          //console.log(`Elemento do card encontrado: ${cardElement.outerHTML}`);
          cardDisplay.innerHTML = cardElement.outerHTML;
        } else {
          console.error(`Card com ID ${cardId} não encontrado no DOM.`);
        }
    }
}
document.getElementById("player-discard-slot").addEventListener("click", () => openModal(arrayDescartePlayer, "Descarte J1"));
document.getElementById("ia-discard-slot").addEventListener("click", () => openModal(arrayDescarteIA, "Descarte IA"));

const closeDiscardModalButton = document.getElementById("closeDiscardModal");
if (closeDiscardModalButton) {
    closeDiscardModalButton.addEventListener("click", closeModal);
} else {
    console.error("Botão de fechar do modal de descarte não encontrado.");
}

document.getElementById("prevCard").addEventListener("click", () => {
    currentCardIndex = (currentCardIndex > 0) ? currentCardIndex - 1 : currentDiscardPile.length - 1;
    showCard(currentCardIndex);
});
document.getElementById("nextCard").addEventListener("click", () => {
    currentCardIndex = (currentCardIndex < currentDiscardPile.length - 1) ? currentCardIndex + 1 : 0;
    showCard(currentCardIndex);
});

// Fechar modal ao clicar fora dele
window.addEventListener("click", (event) => {
    if (event.target == document.getElementById("discardModal")) {
        closeModal();
    }
});

//------Inicio Modal Card
function configurarEventosDeDuploClique() {
  const cards = document.querySelectorAll('#maoJ1 img, .field-slot img');
  //console.log("Total de cards encontrados:", cards.length);

  cards.forEach(card => {
    //console.log("Adicionando evento de duplo clique para o card:", card);
    card.addEventListener('dblclick', () => openCardDetailModal(card));
  });
}
function openCardDetailModal(card) {
    //console.log("Abrindo modal para o card:", card);
    card.classList.remove('field-card','hand-card');
    if (!card.src) {
        console.error("Card src não encontrado.");
        return;
    }

    const chakraFogo = parseInt(card.getAttribute("data-chakra-fogo")) || 0; 
    const chakraVento = parseInt(card.getAttribute("data-chakra-vento")) || 0; 
    const chakraRaio = parseInt(card.getAttribute("data-chakra-raio")) || 0; 
    const chakraTerra = parseInt(card.getAttribute("data-chakra-terra")) || 0; 
    const chakraAgua = parseInt(card.getAttribute("data-chakra-agua")) || 0; 
    const somaChakras = chakraFogo + chakraVento + chakraRaio + chakraTerra + chakraAgua;

    document.getElementById("card-name").textContent = card.getAttribute("data-nome");
    document.getElementById("card-image").src = card.src;
    document.getElementById("chakra-fogo").textContent = chakraFogo; 
    document.getElementById("chakra-vento").textContent = chakraVento; 
    document.getElementById("chakra-raio").textContent = chakraRaio; 
    document.getElementById("chakra-terra").textContent = chakraTerra; 
    document.getElementById("chakra-agua").textContent = chakraAgua; 
    document.getElementById("soma-chakras").textContent = somaChakras;

    document.getElementById("cardDetailModal").style.display = "flex";
    console.log("Modal aberto com sucesso.");
}
function closeCardDetailModal() {
    document.getElementById("cardDetailModal").style.display = "none";
    console.log("Modal fechado.");
}
configurarEventosDeDuploClique();
document.getElementById("closeCardDetailModal").addEventListener("click", closeCardDetailModal);
// Fechar modal ao clicar fora dele
window.addEventListener("click", (event) => {
    if (event.target == document.getElementById("cardDetailModal")) {
        closeCardDetailModal();
    }
});
//------Fim modal card
function debugEstadoJogo() {
  const liderAtualIA = document.querySelector("#ia-leader-slot img");
  const liderAtualJ1 = document.querySelector("#player-leader-slot img");

  console.log("Estado do Jogo:", estadoAtual);
  console.log("Líder IA:", liderAtualIA ? liderAtualIA.dataset.nome : "Não encontrado");
  console.log("Líder Jogador:", liderAtualJ1 ? liderAtualJ1.dataset.nome : "Não encontrado");
  console.log("Ações IA:", {
      ofensiva: document.getElementById("ia-offensive-action")?.value,
      defensiva: document.getElementById("ia-defensive-action")?.value,
  });
  console.log("Ações Jogador:", {
      ofensiva: document.getElementById("j1-offensive-action")?.value,
      defensiva: document.getElementById("j1-defensive-action")?.value,
  });
  console.log("IA usou Hab. de Sup. nesse turno?", suporteIAExecutado);
  console.log("Qtde de hab. sup. usada no turno:", habilidadesUsadas);
}

function voltarConfigJogo() {
  window.location.href = "iniciar_jogo.html";
}
// Recuperar os dados do localStorage
const jogadorNome = localStorage.getItem('jogadorNome');
const jogadorBaralho = JSON.parse(localStorage.getItem('jogadorBaralho'));
const iaBaralho = JSON.parse(localStorage.getItem('iaBaralho'));

// Carrega as imagens dos decks do localStorage
const jogadorDeckImage = localStorage.getItem('jogadorDeckImage');
const iaDeckImage = localStorage.getItem('iaDeckImage');

// Aplica a imagem do deck da IA aos cards da mão da IA
if (iaDeckImage) {
  const handCardsIA = document.querySelectorAll('.hand-card-ia');
  handCardsIA.forEach(card => {
    card.style.backgroundImage = `url('${iaDeckImage}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    card.style.backgroundRepeat = 'no-repeat';
  });
}

// Seleciona os elementos de imagem das miniaturas dos decks
const jogadorDeckImgElement = document.getElementById('player-deck-img');
const iaDeckImgElement = document.getElementById('ia-deck-img');

// Atualiza as imagens das miniaturas dos decks
if (jogadorDeckImage && jogadorDeckImgElement) {
  jogadorDeckImgElement.src = jogadorDeckImage;
} else {
  console.warn('Imagem do deck do jogador não encontrada. Exibindo imagem padrão.');
}

if (iaDeckImage && iaDeckImgElement) {
  iaDeckImgElement.src = iaDeckImage;
} else {
  console.warn('Imagem do deck da IA não encontrada. Exibindo imagem padrão.');
}

// Exibir o nome do jogador e preparar o campo de batalha
window.onload = function () {
  if (!jogadorNome || !jogadorBaralho || !iaBaralho) {
    alert('Erro: Informações do jogador ou dos baralhos estão ausentes.');
    window.location.href = 'iniciar_jogo.html'; // Redireciona de volta
    return;
  }
  
  iniciarCampoDeBatalha();

  // Chame essa função sempre que precisar reconfigurar os eventos
  configurarEventosDeDuploClique();
};