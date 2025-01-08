/* Atualizar dados */
function resetarEstilosCard(cardOrigem) {
    //console.log("iniciando reset de estilo");
    cardOrigem.style.position = "static"; // Remove posicionamento personalizado
    cardOrigem.style.margin = "0"; // Remove margens desnecessárias
    cardOrigem.style.zIndex = "1"; // Reseta nível de empilhamento
    cardOrigem.style.transform = "none"; // Remove transformações aplicadas durante hover
    cardOrigem.style.width = "100%"; // Ajusta à largura total do slot
    cardOrigem.style.height = "100%"; // Ajusta à altura total do slot
    cardOrigem.style.objectFit = "cover"; // Mantém proporções da imagem dentro do slot
    cardOrigem.style.transition = "none"; // Remove efeitos de transição
    cardOrigem.classList.remove("hover-effect", "hand-card"); // Remove classes específicas de hover ou estilo da mão
    //console.log("reset de estilo finalizado");
}
function atualizarAtributosLider(cardElement) {
    //console.log("Executando atualização de atributos");
    if (!cardElement || !cardElement.dataset) {
        console.error("Erro: cardElement inválido ou não encontrado!", cardElement);
        return;
    }
    const atributos = {
        hp: parseInt(cardElement.dataset.hp, 10) || 0,
        chakra: parseInt(cardElement.dataset.chakra, 10) || 0,
        taijutsu: parseInt(cardElement.dataset.taijutsu, 10) || 0,      
        genjutsu: parseInt(cardElement.dataset.genjutsu, 10) || 0,
        ninjutsu: parseInt(cardElement.dataset.ninjutsu, 10) || 0,
        defesa: parseInt(cardElement.dataset.defesa, 10) || 0,
        velocidade: parseInt(cardElement.dataset.velocidade, 10) || 0,
        chakraFogo: parseInt(cardElement.dataset.chakraFogo || 0, 10),
        chakraVento: parseInt(cardElement.dataset.chakraVento || 0, 10),
        chakraRaio: parseInt(cardElement.dataset.chakraRaio || 0, 10),
        chakraTerra: parseInt(cardElement.dataset.chakraTerra || 0, 10),
        chakraAgua: parseInt(cardElement.dataset.chakraAgua || 0, 10),
    };
    document.getElementById("attr-hp").textContent = atributos.hp;
    document.getElementById("attr-chakra").textContent = atributos.chakra;
    document.getElementById("attr-taijutsu").textContent = atributos.taijutsu;
    document.getElementById("attr-genjutsu").textContent = atributos.genjutsu;
    document.getElementById("attr-ninjutsu").textContent = atributos.ninjutsu;  
    document.getElementById("attr-defesa").textContent = atributos.defesa;
    document.getElementById("attr-velocidade").textContent = atributos.velocidade;
    document.getElementById("attr-chakraFogo").textContent = atributos.chakraFogo;
    document.getElementById("attr-chakraVento").textContent = atributos.chakraVento;
    document.getElementById("attr-chakraRaio").textContent = atributos.chakraRaio;
    document.getElementById("attr-chakraTerra").textContent = atributos.chakraTerra;
    document.getElementById("attr-chakraAgua").textContent = atributos.chakraAgua;

    const totalElementos =
        atributos.chakraFogo +
        atributos.chakraVento +
        atributos.chakraRaio +
        atributos.chakraTerra +
        atributos.chakraAgua;

    document.getElementById("elementosTotal").textContent = totalElementos;
    //console.log("Atributos Lider J1 atualizados:", atributos);
}
function atualizarAtributosLiderIA(cardElement) {
    //console.log("cardElement recebido:", cardElement);
    if (!cardElement || !cardElement.dataset) {
        console.error("Erro: cardElement inválido ou não encontrado!", cardElement);
        return;
    }

    const atributos = {
        hp: parseInt(cardElement.dataset.hp, 10) || 0,
        chakra: parseInt(cardElement.dataset.chakra, 10) || 0,
        taijutsu: parseInt(cardElement.dataset.taijutsu, 10) || 0,
        genjutsu: parseInt(cardElement.dataset.genjutsu, 10) || 0,
        ninjutsu: parseInt(cardElement.dataset.ninjutsu, 10) || 0,
        defesa: parseInt(cardElement.dataset.defesa, 10) || 0,
        velocidade: parseInt(cardElement.dataset.velocidade, 10) || 0,
        chakraFogo: parseInt(cardElement.dataset.chakraFogo || 0, 10),
        chakraVento: parseInt(cardElement.dataset.chakraVento || 0, 10),
        chakraRaio: parseInt(cardElement.dataset.chakraRaio || 0, 10),
        chakraTerra: parseInt(cardElement.dataset.chakraTerra || 0, 10),
        chakraAgua: parseInt(cardElement.dataset.chakraAgua || 0, 10),
    };

    document.getElementById("ia-attr-hp").textContent = atributos.hp;
    document.getElementById("ia-attr-chakra").textContent = atributos.chakra;
    document.getElementById("ia-attr-taijutsu").textContent = atributos.taijutsu;
    document.getElementById("ia-attr-genjutsu").textContent = atributos.genjutsu;
    document.getElementById("ia-attr-ninjutsu").textContent = atributos.ninjutsu;
    document.getElementById("ia-attr-defesa").textContent = atributos.defesa;
    document.getElementById("ia-attr-velocidade").textContent = atributos.velocidade;
    document.getElementById("ia-attr-chakraFogo").textContent = atributos.chakraFogo;
    document.getElementById("ia-attr-chakraVento").textContent = atributos.chakraVento;
    document.getElementById("ia-attr-chakraRaio").textContent = atributos.chakraRaio;
    document.getElementById("ia-attr-chakraTerra").textContent = atributos.chakraTerra;
    document.getElementById("ia-attr-chakraAgua").textContent = atributos.chakraAgua;

    const totalElementos = atributos.chakraFogo + atributos.chakraVento + atributos.chakraRaio + atributos.chakraTerra + atributos.chakraAgua;
    document.getElementById("ia-elementosTotal").textContent = totalElementos;

    console.log("Atributos Lider IA atualizados:", atributos);
}
function atualizarLiderSeNecessario(slotOrigem, slotDestino) {
    // Verifica movimentação envolvendo o líder do jogador
    if (slotOrigem?.id === "player-leader-slot" || slotDestino?.id === "player-leader-slot") {
        //console.log("Atualizando atributos do líder do jogador...");
        const liderJogador = document.querySelector("#player-leader-slot img");
        if (liderJogador) {
            atualizarAtributosLider(liderJogador);
        } else {
            console.log("Nenhum líder no slot do jogador. Zerando atributos...");
            zerarAtributosLider("#player-leader-slot");
        }
    }

    // Verifica movimentação envolvendo o líder da IA
    if (slotOrigem?.id === "ia-leader-slot" || slotDestino?.id === "ia-leader-slot") {
        console.log("Atualizando atributos do líder da IA...");
        const liderIA = document.querySelector("#ia-leader-slot img");
        if (liderIA) {
            atualizarAtributosLiderIA(liderIA);
        } else {
            console.log("Nenhum líder no slot da IA. Zerando atributos...");
            zerarAtributosLider("#ia-leader-slot");
        }
    }
}
function zerarAtributosLider(slotId) {
    // Determina o prefixo com base no slot
    const prefix = slotId === "#player-leader-slot" ? "attr" : "ia-attr";

    // Lista dos atributos a serem zerados
    const atributos = [
        "hp",
        "chakra",
        "taijutsu",
        "genjutsu",
        "ninjutsu",
        "defesa",      
        "velocidade",
        "chakraFogo",
        "chakraVento",
        "chakraRaio",
        "chakraTerra",
        "chakraAgua"
    ];

    // Itera pelos atributos e zera o valor
    atributos.forEach(atributo => {
        const elemento = document.getElementById(`${prefix}-${atributo}`);
        if (elemento) {
            elemento.textContent = 0; // Zera o conteúdo do elemento
        } else {
            console.warn(`Elemento ${prefix}-${atributo} não encontrado no DOM.`);
        }
    });

    console.log(`Atributos do líder no slot ${slotId} foram zerados.`);

    // Zerando o total de elementos
    if (slotId === "#player-leader-slot") {
        const elementosTotalElement = document.getElementById('elementosTotal');
        if (elementosTotalElement) {
            elementosTotalElement.innerText = 0;
        }
        console.log("Campo elementosTotal foi zerado.");
    }
}
// Função para incrementar a variável bloqEvo
function incrementarBloqEvo() {
    const allCardsInField = document.querySelectorAll('.field-slot img');
  
    allCardsInField.forEach(card => {
        let bloqEvo = parseInt(card.dataset.bloqEvo || 0);
        if (bloqEvo < 3) {
            bloqEvo += 1;
        }
        card.dataset.bloqEvo = bloqEvo; // Atualiza a variável bloqEvo no dataset
    });
  
    console.log("bloqEvo atualizado para todos os cards no campo.");
}