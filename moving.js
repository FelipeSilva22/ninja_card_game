/*Inicio DragandDrop*/
function initializeDragAndDrop() {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      initializeTouchEvents();
    } else {
      dragAndDrop();
    }
}
function dragAndDrop() {
// Seleciona os cards na mão do jogador
    const cards = document.querySelectorAll('.hand-card, .field-card');

    // Seleciona os slots válidos com base no estado atual
    const slots = document.querySelectorAll('.field-slot');

    // Configura eventos de drag nos cards
    cards.forEach(card => {
        const tipo = card.dataset.tipo;
        const estagio = parseInt(card.dataset.estagio, 10);

        // Impede que os cards da IA sejam arrastados
        if (card.closest('#ia-area')) {
        card.setAttribute('draggable', 'false');
        card.removeEventListener('dragstart', dragStartHandler);
        return;
        }

        // Configuração para o estado "novoLider"
        if (estadoAtual === "novoLider") {
        const slotOrigem = card.parentElement;

        // Permite arrastar apenas cards no suporte do J1
        if (slotOrigem && slotOrigem.id.startsWith("supJ1")) {
            card.setAttribute('draggable', 'true');
            card.addEventListener('dragstart', dragStartHandler);
        } else {
            card.setAttribute('draggable', 'false');
            card.removeEventListener('dragstart', dragStartHandler);
        }
        }
        // Configuração para os estados "formacao" ou "preparacao"
        else if (estadoAtual === "formacao" && (tipo !== "Ninja" || estagio !== 1)) {
        card.setAttribute('draggable', 'false');
        card.removeEventListener('dragstart', dragStartHandler);
        } else {
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', dragStartHandler);
        }
    });

    // Configura eventos de drag nos slots
    slots.forEach(slot => {
        const isLeaderSlot = slot.id === "player-leader-slot";

        // Bloqueia slots da IA
        if (slot.closest('#ia-area')) {
        slot.removeEventListener('dragover', dragOverHandler);
        slot.removeEventListener('drop', handleDrop);
        return;
        }

        // Configuração para o estado "premio"
        if (estadoAtual === "novoLider") {
        if (isLeaderSlot) {
            slot.addEventListener('dragover', dragOverHandler);
            slot.addEventListener('drop', handleDrop);
        } else {
            slot.removeEventListener('dragover', dragOverHandler);
            slot.removeEventListener('drop', handleDrop);
        }
        }
        // Configuração para os estados "formacao" ou "preparacao"
        else {
        slot.addEventListener('dragover', dragOverHandler);
        slot.addEventListener('drop', handleDrop);
        }
    });
}
function dragStartHandler(e) {
const cardId = e.target.id; // ID do card sendo arrastado

e.dataTransfer.setData('cardId', cardId);
//console.log(`Card arrastado: ${cardId}`);
}
function dragOverHandler(e) {
e.preventDefault(); // Permite o drop
}
function handleDrop(e) {
e.preventDefault();

const cardId = e.dataTransfer.getData('cardId'); // ID do card arrastado
const card = document.getElementById(cardId); // Elemento do card arrastado
const slotDestino = e.currentTarget; // Slot de destino
const slotOrigem = card.parentElement; // Slot de origem do card
const cardDestino = slotDestino.querySelector('img'); // Card já no slot de destino, se houver

//console.log(`Tentando soltar o card: ${cardId} no slot: ${slotDestino.id}`);

// Chama o processamento com as variáveis
processarDrop(card, slotOrigem, cardDestino, slotDestino);
}
function initializeTouchEvents() {
const cards = document.querySelectorAll('.hand-card, .field-card');
const slots = document.querySelectorAll('.field-slot');
let cardBeingDragged = null;

// Configurar eventos touchstart, touchmove e touchend
cards.forEach(card => {
    card.addEventListener('touchstart', (e) => {
    cardBeingDragged = card;
    card.classList.add('dragging');
    // Salva a posição inicial
    const touch = e.touches[0];
    card.style.position = 'absolute';
    card.style.left = `${touch.clientX - card.offsetWidth / 2}px`;
    card.style.top = `${touch.clientY - card.offsetHeight / 2}px`;
    });

    card.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (cardBeingDragged) {
        const touch = e.touches[0];
        cardBeingDragged.style.left = `${touch.clientX - cardBeingDragged.offsetWidth / 2}px`;
        cardBeingDragged.style.top = `${touch.clientY - cardBeingDragged.offsetHeight / 2}px`;
    }
    });

    card.addEventListener('touchend', (e) => {
    if (cardBeingDragged) {
        const touch = e.changedTouches[0];
        cardBeingDragged.classList.remove('dragging');
        cardBeingDragged.style.position = 'initial';

        const targetSlot = document.elementFromPoint(touch.clientX, touch.clientY);

        // Verifica se o alvo é um slot válido
        if (targetSlot && targetSlot.classList.contains('field-slot')) {
        processarDrop(cardBeingDragged, cardBeingDragged.parentElement, targetSlot.querySelector('img'), targetSlot);
        }

        cardBeingDragged = null;
    }
    });
});

console.log("Touch drag and drop initialized.");
}
function processarDrop(cardOrigem, slotOrigem, cardDestino, slotDestino) {
console.log(`Processando drop: cardOrigem=${cardOrigem.id}, slotOrigem=${slotOrigem.id}, cardDestino=${cardDestino?.id || "null"}, slotDestino=${slotDestino.id}`);
// Validação: Slot de origem é igual ao slot de destino
if (slotOrigem === slotDestino) {
    console.log("O card foi solto no mesmo slot de origem. Ação ignorada.");
    return;
}
// Validação do estadoAtual
if (estadoAtual === "formacao") {
    // Caso 1: Soltar em slot ocupado a partir da mão
    if (slotOrigem.id === "maoJ1" && cardDestino) {
        alert("Você só pode soltar um Ninja Estágio 1 em um slot vazio!");
        return;
    }
    // Caso 2: Soltar de mão em slot vazio
    if (slotOrigem.id === "maoJ1" && !cardDestino) {
        //console.log(`Movendo card da mão para slot vazio: ${cardOrigem.id} -> ${slotDestino.id}`);
        removerCardDaMao(cardOrigem);          
        moverCard(cardOrigem, slotDestino);
        return;
    }
    // Caso 3: Soltar de campo em slot vazio
    if (slotOrigem.id !== "maoJ1" && !cardDestino) {
        console.log(`Movendo card no campo: ${cardOrigem.id} -> ${slotDestino.id}`);
        moverCard(cardOrigem, slotDestino, slotOrigem);
        return;
    }
    // Caso 4: Soltar de campo em slot ocupado
    if (slotOrigem.id !== "maoJ1" && cardDestino) {
        console.log(`Trocando cards: ${cardOrigem.id} <-> ${cardDestino.id}`);
        trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
        return;
    }
    console.log("Ação inválida para a fase de formação.");
} else if (estadoAtual === "preparacao") {
    const tipo = cardOrigem.dataset.tipo;
    const cardStage = parseInt(cardOrigem.dataset.estagio, 10); // Estágio do Ninja
    //console.log(`Chakra já usado antes do If? ${chakraUsado}`);
    if (tipo === "Chakra" && cardDestino) {
    //console.log(`Chakra já usado? ${chakraUsado}`);
    if (chakraUsado) {
        alert("Você já usou um Chakra neste turno.");
        return;
    }
    aplicarEfeito(cardDestino, cardOrigem);
    adicionarAoDescarte(cardOrigem);
    removerCardDaMao(cardOrigem);

    // Marca que o chakra foi usado neste turno
    chakraUsado = true;

    } else if (tipo === "Tool" && cardDestino) {
    // Verifica se o Tool já foi usado no ninja
    if (cardDestino.dataset.toolUsado === "true") {
        alert("Este ninja já recebeu um Tool neste turno.");
        return;
    }
        aplicarEfeito(cardDestino, cardOrigem);
        adicionarAoDescarte(cardOrigem);
        removerCardDaMao(cardOrigem);

    // Marca que o Tool foi usado no ninja neste turno
    cardDestino.dataset.toolUsado = "true";  
    } else if (tipo === "Ninja") {
    // Lógica para Ninja Estágio 1
    if (cardStage === 1) {
        // Caso 1: Mão para slot ocupado
        if (slotOrigem.id === "maoJ1" && cardDestino) {
        alert("Você só pode soltar um Ninja Estágio 1 em um slot vazio!");
        return;
        }
        // Caso 2: Mão para slot vazio
        if (slotOrigem.id === "maoJ1" && !cardDestino) {
        //console.log(`Movendo Ninja Estágio 1 (${cardOrigem.id}) da mão para slot vazio (${slotDestino.id})`);
        removerCardDaMao(cardOrigem);
        moverCard(cardOrigem, slotDestino);
        return;
        }
        // Caso 3: Suporte para outro slot vazio
        if (slotOrigem.id.startsWith("supJ1") && !cardDestino && slotDestino.id !== "player-leader-slot") {
        console.log(`Movendo Ninja (${cardOrigem.id}) do suporte (${slotOrigem.id}) para slot vazio (${slotDestino.id})`);
        moverCard(cardOrigem, slotDestino, slotOrigem);
        return;
        }
        // Caso 4: Suporte para líder (slot vazio)
        if (slotOrigem.id.startsWith("supJ1") && !cardDestino && slotDestino.id === "player-leader-slot") {
        const confirmar = confirm("Mover este ninja para o slot de líder custará 20 de chakra. Deseja continuar?");
        if (confirmar) {
            const chakraAtual = parseInt(cardOrigem.dataset.chakra, 10);
            if (chakraAtual >= 20) {
            cardOrigem.dataset.chakra = chakraAtual - 20;
            console.log(`Reduzindo 20 de chakra do ninja (${cardOrigem.id})`);
            moverCard(cardOrigem, slotDestino, slotOrigem);
            } else {
            alert("O ninja não possui chakra suficiente para esta troca.");
            }
        }
        return;
        }
        // Caso 5: Suporte para outro slot ocupado (não líder)
        if (slotOrigem.id.startsWith("supJ1") && cardDestino && slotDestino.id !== "player-leader-slot") {
        console.log(`Trocando ninjas entre suporte (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`);
        trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
        return;
        }
        // Caso 6: Suporte para líder (slot ocupado)
        if (slotOrigem.id.startsWith("supJ1") && cardDestino && slotDestino.id === "player-leader-slot") {
        const confirmar = confirm("Trocar este ninja com o líder custará 20 de chakra de cada ninja. Deseja continuar?");
        if (confirmar) {
            const chakraOrigem = parseInt(cardOrigem.dataset.chakra, 10);
            const chakraDestino = parseInt(cardDestino.dataset.chakra, 10);
            if (chakraOrigem >= 20 && chakraDestino >= 20) {
                cardOrigem.dataset.chakra = chakraOrigem - 20;
                cardDestino.dataset.chakra = chakraDestino - 20;
                console.log(`Reduzindo 20 de chakra de ${cardOrigem.id} e ${cardDestino.id}`);
                trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
            } else {
                alert("Um ou ambos os ninjas não possuem chakra suficiente para esta troca.");
            }
        }
        return;
        }
        // Caso 7: Líder para outro slot vazio
        if (slotOrigem.id === "player-leader-slot" && !cardDestino) {
        alert("O líder só pode ser trocado por outro ninja. Esta ação é inválida.");
        return;
        }
        // Caso 8: Líder para outro slot ocupado
        if (slotOrigem.id === "player-leader-slot" && cardDestino) {
        const confirmar = confirm("Trocar o líder custará 20 de chakra de cada ninja. Deseja continuar?");
        if (confirmar) {
            const chakraOrigem = parseInt(cardOrigem.dataset.chakra, 10);
            const chakraDestino = parseInt(cardDestino.dataset.chakra, 10);
            if (chakraOrigem >= 20 && chakraDestino >= 20) {
            cardOrigem.dataset.chakra = chakraOrigem - 20;
            cardDestino.dataset.chakra = chakraDestino - 20;
            console.log(`Reduzindo 20 de chakra de ${cardOrigem.id} e ${cardDestino.id}`);
            trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
            } else {

            alert("Um ou ambos os ninjas não possuem chakra suficiente para esta troca.");
            }
        }
        return;
        }
    }
    // Lógica para Ninja Estágio 2 ou 3
    if (cardStage === 2 || cardStage === 3) {
        // Validação para evolução do Ninja
        if (slotOrigem.id === "maoJ1") {
        if (!cardDestino || cardDestino.dataset.tipo !== "Ninja") {
            alert("Esse ninja só pode evoluir um Ninja no campo, não pode invocar em slot vazio");
            return;
        }
        console.log(`Iniciando validação de evolução para ${cardOrigem.id}`);
        validarEvolucao(cardOrigem, cardDestino, slotOrigem, slotDestino);
        return;
        }
        // Movimentação ou troca no campo
        if (slotOrigem.id.startsWith("supJ1") || slotOrigem.id === "player-leader-slot") {
        // Slot vazio
        if (!cardDestino) {
            if (slotDestino.id === "player-leader-slot") {
            const confirmar = confirm(
                "Mover este ninja para o slot de líder custará 20 de chakra. Deseja continuar?"
            );
            if (confirmar) {
                const chakraAtual = parseInt(cardOrigem.dataset.chakra, 10);
                if (chakraAtual >= 20) {
                cardOrigem.dataset.chakra = chakraAtual - 20;
                console.log(`Reduzindo 20 de chakra do ninja (${cardOrigem.id})`);
                moverCard(cardOrigem, slotDestino, slotOrigem);
                } else {
                alert("O ninja não possui chakra suficiente para esta troca.");
                }
            }
            } else {
            console.log(`Movendo Ninja (${cardOrigem.id}) para slot vazio (${slotDestino.id})`);
            moverCard(cardOrigem, slotDestino, slotOrigem);
            }
            return;
        }
        // Slot ocupado
        if (cardDestino) {
            if (slotDestino.id === "player-leader-slot") {
            const confirmar = confirm(
                "Trocar este ninja com o líder custará 20 de chakra de cada ninja. Deseja continuar?"
            );
            if (confirmar) {
                const chakraOrigem = parseInt(cardOrigem.dataset.chakra, 10);
                const chakraDestino = parseInt(cardDestino.dataset.chakra, 10);
                if (chakraOrigem >= 20 && chakraDestino >= 20) {
                cardOrigem.dataset.chakra = chakraOrigem - 20;
                cardDestino.dataset.chakra = chakraDestino - 20;
                console.log(`Reduzindo 20 de chakra de ${cardOrigem.id} e ${cardDestino.id}`);
                trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
                } else {
                alert("Um ou ambos os ninjas não possuem chakra suficiente para esta troca.");
                }
            }
            } else {
            console.log(
                `Trocando ninjas entre ${cardOrigem.id} e ${cardDestino.id} nos slots ${slotOrigem.id} e ${slotDestino.id}`
            );
            trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
            }
            return;
        }
        }
    }
    }
} else if (estadoAtual === "novoLider") {
    if (!slotOrigem.id.startsWith("supJ1") || slotDestino.id !== "player-leader-slot") {
    alert("Você só pode mover ninjas de suporte para o slot de líder!");
    return;
    }
    /*
    // Mover ninja para o slot de líder
    moverCard(cardOrigem, slotDestino, slotOrigem);
    return;
    */
    // Caso 1: Suporte para outro slot vazio
    if (slotOrigem.id.startsWith("supJ1") && !cardDestino && slotDestino.id !== "player-leader-slot") {
    console.log(`Movendo Ninja (${cardOrigem.id}) do (${slotOrigem.id}) para slot vazio (${slotDestino.id})`);
    moverCard(cardOrigem, slotDestino, slotOrigem);
    return;
    }
    // Caso 2: Suporte para líder (slot vazio)
    if (slotOrigem.id.startsWith("supJ1") && !cardDestino && slotDestino.id === "player-leader-slot") {
    console.log(`Movendo Ninja (${cardOrigem.id}) do (${slotOrigem.id}) para slot vazio (${slotDestino.id})`);
    moverCard(cardOrigem, slotDestino, slotOrigem);
    }
    // Caso 3: Suporte para outro slot ocupado (não líder)
    if (slotOrigem.id.startsWith("supJ1") && cardDestino && slotDestino.id !== "player-leader-slot") {
    console.log(`Trocando ninjas entre (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`);
    trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
    return;
    }
    // Caso 4: Suporte para líder (slot ocupado)
    if (slotOrigem.id.startsWith("supJ1") && cardDestino && slotDestino.id === "player-leader-slot") {
    console.log(`Trocando ninjas entre (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`);
    trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
    }
    // Caso 5: Líder para outro slot vazio
    if (slotOrigem.id === "player-leader-slot" && !cardDestino) {
    alert("O líder só pode ser trocado por outro ninja. Esta ação é inválida.");
    return;
    }
    // Caso 6: Líder para outro slot ocupado
    if (slotOrigem.id === "player-leader-slot" && cardDestino) {
    console.log(`Trocando ninjas entre (${slotOrigem.id}) e slot ocupado (${slotDestino.id})`);
    trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino);
    }
}  
}
function moverCard(card, slotDestino, slotOrigem = null) {
//console.log("Entrando na função moverCard");
if (slotOrigem) {
    slotOrigem.removeAttribute("data-ocupado"); // Marca o slot de origem como desocupado
    console.log(`Slot ${slotOrigem.id} desocupado.`);
}

slotDestino.appendChild(card); // Move o card para o slot de destino
slotDestino.setAttribute("data-ocupado", "true"); // Marca o slot de destino como ocupado
//console.log(`Card ${card.id} movido para slot ${slotDestino.id}`);
resetarEstilosCard(card);
// Atualizar atributos do líder, se necessário
atualizarLiderSeNecessario(slotOrigem, slotDestino);
}
function trocarCards(cardOrigem, cardDestino, slotOrigem, slotDestino) {
console.log(`Iniciando troca: ${cardOrigem.id} <-> ${cardDestino.id}`);

// Remove os cards dos slots atuais
slotOrigem.removeChild(cardOrigem);
slotDestino.removeChild(cardDestino);

// Move os cards para os slots opostos
slotOrigem.appendChild(cardDestino);
slotDestino.appendChild(cardOrigem);

// Atualiza os atributos de ocupação
slotOrigem.setAttribute("data-ocupado", "true");
slotDestino.setAttribute("data-ocupado", "true");

console.log(`Troca concluída: ${cardOrigem.id} no ${slotDestino.id}, ${cardDestino.id} no ${slotOrigem.id}`);
// Atualizar atributos do líder, se necessário
atualizarLiderSeNecessario(slotOrigem, slotDestino);
}
function removerCardDaMao(cardOrigem) {
    const maoJ1 = document.getElementById("maoJ1");
    const maoIA = document.getElementById("maoIA");
  
    console.log(`Tentando remover o card: ${cardOrigem.id} da mão`);
  
    if (maoJ1.contains(cardOrigem)) {
      // Remover o card da mão do jogador
      maoJ1.removeChild(cardOrigem);
      console.log(`Card ${cardOrigem.id} removido da mão do jogador.`);
    } else if (maoIA.contains(cardOrigem) || cardOrigem.closest('.card-wrapper-ia')) {
      // Para a IA, verificar se o card está em um contêiner com a classe .card-wrapper-ia
      const cardWrapper = cardOrigem.closest('.card-wrapper-ia');
      if (cardWrapper) {
        maoIA.removeChild(cardWrapper); // Remove o contêiner inteiro
        console.log(`Card ${cardOrigem.id} removido da mão da IA.`);
      } else {
        // Caso não tenha um contêiner, tenta remover o card diretamente (fallback)
        maoIA.removeChild(cardOrigem);
        console.log(`Card ${cardOrigem.id} removido diretamente da mão da IA.`);
      }
    } else {
      console.warn(`Card ${cardOrigem.id} não encontrado na mão do jogador ou da IA.`);
    }
  
    // Eliminar contêineres de 'card-wrapper-ia' que não possuem um elemento com a classe 'hand-card-ia'
    const wrappersIA = maoIA.querySelectorAll('.card-wrapper-ia');
    wrappersIA.forEach(wrapper => {
      if (!wrapper.querySelector('.hand-card-ia')) {
        wrapper.remove();
        console.log(`Contêiner vazio removido: ${wrapper.className}`);
      }
    });
}  
  
function adicionarAoDescarte(card) {
    // Identifica se o card pertence ao jogador ou à IA
    const isIA = card.closest('#maoIA') || card.closest('#ia-leader-slot') || card.closest('#ia-supports');
      // Remove estilos ou classes extras do card para manter consistência no descarte
      card.classList.remove('field-card','hand-card', 'hand-card-ia');
      card.draggable = false; // Impede arrastar o card após ser descartado
  
    if (isIA) {
        console.log(`Adicionando card (${card.id}) ao descarte da IA.`);
        document.querySelector('#ia-discard-slot').appendChild(card);
        arrayDescarteIA.push(card.id); // Adiciona o ID ao array da IA
    } else {
        console.log(`Adicionando card (${card.id}) ao descarte do Jogador.`);
        document.querySelector('#player-discard-slot').appendChild(card);
        arrayDescartePlayer.push(card.id); // Adiciona o ID ao array do Jogador
    }
}
  
function evoluirNinja(cardDestino, cardOrigem) {
    console.log(`Iniciando evolução do ninja: ${cardDestino.id} para ${cardOrigem.id}`);
  
    // Calcula o dano sofrido
    const hpInicial = parseInt(cardDestino.dataset.hpInicial, 10) || 0;
    const hpAtual = parseInt(cardDestino.dataset.hp, 10) || 0;
    const danoSofrido = hpInicial - hpAtual;
  
    // Calcula o chakra gasto
    const chakraInicial = parseInt(cardDestino.dataset.chakraInicial, 10) || 0;
    const chakraAtual = parseInt(cardDestino.dataset.chakra, 10) || 0;
    const chakraGasto = chakraInicial - chakraAtual;
  
    // Atualiza os valores do card de evolução
    cardOrigem.dataset.hp = (parseInt(cardOrigem.dataset.hpInicial, 10) || 0) - danoSofrido;
    cardOrigem.dataset.chakra = (parseInt(cardOrigem.dataset.chakraInicial, 10) || 0) - chakraGasto;
    cardOrigem.dataset.chakraFogo = cardDestino.dataset.chakraFogo;
    cardOrigem.dataset.chakraVento = cardDestino.dataset.chakraVento;
    cardOrigem.dataset.chakraRaio = cardDestino.dataset.chakraRaio;
    cardOrigem.dataset.chakraTerra = cardDestino.dataset.chakraTerra;
    cardOrigem.dataset.chakraAgua = cardDestino.dataset.chakraAgua;
  
    console.log(
        `Evolução concluída: HP final=${cardOrigem.dataset.hp}, Chakra final=${cardOrigem.dataset.chakra}, Elementos mantidos.`
    );
  
    // Confere se o slotDestino ainda é válido
    const slotDestino = cardDestino.parentElement;
    if (!slotDestino) {
        console.error("Slot de destino não encontrado. Evolução abortada.");
        return;
    }
  
    // Aloca o card de evolução no mesmo slot antes de remover o estágio anterior
    slotDestino.appendChild(cardOrigem);
    console.log(`Card ${cardOrigem.id} alocado no slot ${slotDestino.id}`);
    resetarEstilosCard(cardOrigem);
  
    // Remove o estágio anterior (cardDestino) para a pilha de descarte
    adicionarAoDescarte(cardDestino);
    console.log(`Card ${cardDestino.id} adicionado ao descarte.`);
  
    // Atualizar atributos se o slot for do líder
    if (slotDestino.id === "player-leader-slot") {
        atualizarAtributosLider(cardOrigem);
    } else if (slotDestino.id === "ia-leader-slot") {
        atualizarAtributosLiderIA(cardOrigem);
    }
}
/*Fim DragandDrop*/