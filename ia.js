function escolherTimeIA() {
    alert("A IA está escolhendo seu time...");

    const iaLeaderSlot = document.getElementById('ia-leader-slot');
    const iaSupportSlots = [
        document.getElementById('supIAa'),
        document.getElementById('supIAb'),
        document.getElementById('supIAc')
    ];

    // Filtrar somente os ninjas Estágio 1 na mão da IA
    let iaNinjasEstagio1 = iaMao.filter(card => card.tipo === 'Ninja' && card.estagio === 1);

    if (iaNinjasEstagio1.length === 0) {
        console.warn("Nenhum ninja estágio 1 disponível na mão da IA.");
        return;
    }

    // Escolher o líder com a maior soma dos atributos relevantes
    let iaLeader = iaNinjasEstagio1.reduce((melhor, atual) => 
        calcularSomaAtributosCard(atual) > calcularSomaAtributosCard(melhor) ? atual : melhor
    );

    // Remover o líder da lista
    iaNinjasEstagio1 = iaNinjasEstagio1.filter(card => card.idCard !== iaLeader.idCard);

    // Alocar o líder no slot de líder
    const leaderImg = document.createElement('img');
    leaderImg.src = iaLeader.imagem;
    leaderImg.alt = iaLeader.nome;
    leaderImg.id = iaLeader.idCard;
    leaderImg.draggable = false;
    Object.assign(leaderImg.dataset, {
        tipo: iaLeader.tipo,
        idCard: iaLeader.idCard,
        registro: iaLeader.registro,
        nome: iaLeader.nome,
        estagio: iaLeader.estagio || 1,
        hpInicial: iaLeader.hp || 0,
        chakraInicial: iaLeader.chakra || 0,
        hp: iaLeader.hp || 0,
        chakra: iaLeader.chakra || 0,
        taijutsu: iaLeader.taijutsu || 0,
        genjutsu: iaLeader.genjutsu || 0,
        ninjutsu: iaLeader.ninjutsu || 0,
        defesa: iaLeader.defesa || 0,
        velocidade: iaLeader.velocidade || 0,
        chakraFogo: iaLeader.chakraFogo || 0,
        chakraVento: iaLeader.chakraVento || 0,
        chakraRaio: iaLeader.chakraRaio || 0,
        chakraTerra: iaLeader.chakraTerra || 0,
        chakraAgua: iaLeader.chakraAgua || 0,
        habilidadeSuporte: iaLeader.habilidadeSuporte || null,
        custoHabSup: iaLeader.custoHabSup || 0,
        probabilidade: iaLeader.probabilidade || 0,
        bloqEvo: 0,
        jutsus: JSON.stringify(iaLeader.jutsus || [])
    });

    iaLeaderSlot.innerHTML = ''; // Limpa o slot
    iaLeaderSlot.appendChild(leaderImg);
    iaLeaderSlot.classList.add('occupied');
    atualizarAtributosLiderIA(leaderImg);

    // Remove o líder da mão
    iaMao = iaMao.filter(card => card.idCard !== iaLeader.idCard);

    // Alocar suportes nos slots vazios
    iaSupportSlots.forEach(slot => {
        if (iaNinjasEstagio1.length > 0 && !slot.querySelector('img')) {
            const supportCard = iaNinjasEstagio1.shift();

            const supportImg = document.createElement('img');
            supportImg.src = supportCard.imagem;
            supportImg.alt = supportCard.nome;
            supportImg.id = supportCard.idCard;
            supportImg.draggable = false;
            Object.assign(supportImg.dataset, {
                tipo: supportCard.tipo,
                idCard: supportCard.idCard,
                registro: supportCard.registro,
                nome: supportCard.nome,
                estagio: supportCard.estagio || 1,
                hpInicial: supportCard.hp || 0,
                chakraInicial: supportCard.chakra || 0,
                hp: supportCard.hp || 0,
                chakra: supportCard.chakra || 0,
                taijutsu: supportCard.taijutsu || 0,
                genjutsu: supportCard.genjutsu || 0,
                ninjutsu: supportCard.ninjutsu || 0,
                defesa: supportCard.defesa || 0,
                velocidade: supportCard.velocidade || 0,
                chakraFogo: supportCard.chakraFogo || 0,
                chakraVento: supportCard.chakraVento || 0,
                chakraRaio: supportCard.chakraRaio || 0,
                chakraTerra: supportCard.chakraTerra || 0,
                chakraAgua: supportCard.chakraAgua || 0,
                habilidadeSuporte: supportCard.habilidadeSuporte || null,
                custoHabSup: supportCard.custoHabSup || 0,
                probabilidade: supportCard.probabilidade || 0,
                bloqEvo: 0,
                jutsus: JSON.stringify(supportCard.jutsus || [])
            });

            slot.innerHTML = ''; // Limpa o slot
            slot.appendChild(supportImg);
            slot.classList.add('occupied');

            // Remove o suporte da mão
            iaMao = iaMao.filter(card => card.idCard !== supportCard.idCard);
        }
    });

    console.log("A IA concluiu sua formação!");
    estadoAtual = "compra";
    atualizarBotoes();
    turnoDeCompraIA(); // Avança para o próximo estágio
}

// Nova função para calcular a soma dos atributos de um card
function calcularSomaAtributosCard(card) {
    return (
        (card.hp || 0) +
        (card.chakra || 0) +
        (card.taijutsu || 0) +
        (card.genjutsu || 0) +
        (card.ninjutsu || 0) +
        (card.defesa || 0) +
        (card.velocidade || 0)
    );
}

//-------
function acaoPreparacaoIA() {
    console.log("Iniciando ações de preparação da IA...");
    //alert("Iniciando ações de preparação da IA");
  
    const maoIA = document.querySelectorAll('.hand-card-ia');
    const slotsIA = document.querySelectorAll('#ia-formation-field .field-slot');
    let iaChakraUsado = false; // Controla se a IA já usou um card de Chakra neste turno
  
    //console.log("Cards na mão da IA:", maoIA);
    //console.log("Slots da IA no campo:", slotsIA);
  
    maoIA.forEach(card => {
      const tipo = card.dataset.tipo;
  
      if (tipo === "Ninja") {
          const estagio = parseInt(card.dataset.estagio, 10);
  
          if (estagio === 1) {
              // Priorizar o slot de líder se estiver vazio
              const slotLider = document.getElementById('ia-leader-slot');
              if (!slotLider.querySelector('img')) {
                  console.log(`IA movendo Ninja (${card.id}) para o slot de líder (${slotLider.id})`);
                  slotLider.innerHTML = ''; // Limpa o slot
                  slotLider.appendChild(card);
                  resetarEstilosCard(card);
                  slotLider.classList.add('occupied');
                  removerCardDaMao(card);
                  atualizarAtributosLiderIA(card);
              } else {
                  // Se o líder já estiver ocupado, procura um slot vazio nos suportes
                  const slotVazio = Array.from(slotsIA).find(slot => !slot.querySelector('img'));
                  if (slotVazio) {
                      console.log(`IA movendo Ninja (${card.id}) para o slot ${slotVazio.id}`);
                      slotVazio.innerHTML = ''; // Limpa o slot
                      slotVazio.appendChild(card);
                      resetarEstilosCard(card);
                      slotVazio.classList.add('occupied');
                      removerCardDaMao(card);
                  }
              }
          } else if (estagio >= 2) {
              // Tenta evoluir um Ninja no campo
              const slotComNinjaParaEvoluir = Array.from(slotsIA).find(slot => {
                  const ninja = slot.querySelector('img');
                  //return ninja && validarEvolucao(card, ninja, null, slot);
                  if (!ninja) return false; // Slot vazio, não pode evoluir
                  
                  // Ninja estágio 2 só evolui ninjas de estágio 1 com o mesmo registro
                  if (estagio === 2) {
                      return (
                          parseInt(ninja.dataset.estagio, 10) === 1 &&
                          ninja.dataset.registro === card.dataset.registro &&
                          parseInt(ninja.dataset.bloqEvo, 10) >= 2
                      );
                  }
  
                  // Ninja estágio 3 só evolui ninjas de estágio 2 com o mesmo registro
                  if (estagio === 3) {
                      return (
                          parseInt(ninja.dataset.estagio, 10) === 2 &&
                          ninja.dataset.registro === card.dataset.registro &&
                          parseInt(ninja.dataset.bloqEvo, 10) >= 2
                      );
                  }
                  return false;
              });
  
              if (slotComNinjaParaEvoluir) {
                  const ninjaParaEvoluir = slotComNinjaParaEvoluir.querySelector('img');
                  console.log(`IA evoluindo Ninja (${ninjaParaEvoluir.id}) com ${card.id}`);
                  evoluirNinja(ninjaParaEvoluir, card);
                  removerCardDaMao(card);
              }
          }
      } else if (tipo === "Tool") {
          // Tenta usar o card de Tool
          const slotComNinjaSemTool = Array.from(slotsIA).find(slot => {
              const ninja = slot.querySelector('img');
              return ninja && (!ninja.dataset.toolUsado || ninja.dataset.toolUsado === "false");
          });
          if (slotComNinjaSemTool) {
              const ninjaNoSlot = slotComNinjaSemTool.querySelector('img');
              //console.log(`IA aplicando Tool (${card.id}) no ninja (${ninjaNoSlot.id})`);
              aplicarEfeito(ninjaNoSlot, card);
              adicionarAoDescarte(card);
              removerCardDaMao(card);
              ninjaNoSlot.dataset.toolUsado = "true"; // Marca que o ninja já recebeu uma Tool
          }
      }                      
    });
    if (!iaChakraUsado) {
      const iaLeaderSlot = document.getElementById("ia-leader-slot");
      const iaSupportSlots = [
          document.getElementById("supIAa"),
          document.getElementById("supIAb"),
          document.getElementById("supIAc")
      ];
  
      const lider = iaLeaderSlot.querySelector("img");
      const suportes = iaSupportSlots
          .map(slot => slot.querySelector("img"))
          .filter(Boolean);
  
      if (!lider && suportes.length === 0) {
          console.warn("Nenhum ninja na formação da IA.");
          encerrarPreparacaoIA();
          return;
      }
  
      // Determinar o maior requisito de chakra para cada elemento
      const determinarMaiorRequisitosElementais = (ninja) => {
          const jutsus = JSON.parse(ninja.dataset.jutsus || "[]");
          const maiorRequisitos = {
              chakraFogo: 0,
              chakraVento: 0,
              chakraRaio: 0,
              chakraTerra: 0,
              chakraAgua: 0
          };
  
          jutsus.forEach(jutsu => {
              const requisitoChakra = jutsu.requisitoChakra || {};
              Object.entries(maiorRequisitos).forEach(([elemento]) => {
                  maiorRequisitos[elemento] = Math.max(maiorRequisitos[elemento], requisitoChakra[elemento] || 0);
              });
          });
  
          return maiorRequisitos;
      };
  
      const verificarEAplicarChakra = (ninja, requisitos) => {
          const ordemElementos = [];
          const naturezaNinja = ninja.dataset.naturezaninja?.toLowerCase();
          const subNatureza = ninja.dataset.subnatureza?.toLowerCase();
  
          const elementosValidos = ["fogo", "vento", "raio", "terra", "agua"];
          if (elementosValidos.includes(naturezaNinja)) {
              ordemElementos.push(`chakra${naturezaNinja.charAt(0).toUpperCase() + naturezaNinja.slice(1)}`);
          }
          if (elementosValidos.includes(subNatureza)) {
              ordemElementos.push(`chakra${subNatureza.charAt(0).toUpperCase() + subNatureza.slice(1)}`);
          }
  
          // Adicionar os elementos restantes em ordem aleatória
          ["chakraFogo", "chakraVento", "chakraRaio", "chakraTerra", "chakraAgua"]
              .filter(elemento => !ordemElementos.includes(elemento))
              .sort(() => Math.random() - 0.5)
              .forEach(elemento => ordemElementos.push(elemento));
  
          for (const elemento of ordemElementos) {
              const quantidadeAtual = parseInt(ninja.dataset[elemento], 10) || 0;
              const requisitoElemento = requisitos[elemento] || 0;
  
              if (requisitoElemento > quantidadeAtual) {
                  console.log(`  - Faltam ${requisitoElemento - quantidadeAtual} ${elemento} para o ninja (${ninja.id}).`);
                  
                  const cardNaMao = Array.from(maoIA).find(card => {
                      const naturezaChakra = card.dataset.naturezaChakra?.toLowerCase();
                      console.log(`Elemento (${naturezaChakra})`);
                      if (!naturezaChakra) return false;
  
                      // Verifica se o elemento está no atributo `naturezaChakra`
                      const elementosChakra = naturezaChakra.split(";");
                      console.log(`Elemento (${naturezaChakra}) identificado`);
                      return elementosChakra.some(chakra => chakra === elemento.toLowerCase());
                  });
  
                  if (cardNaMao) {
                      console.log(`IA aplicando Chakra (${cardNaMao.id}) no ninja (${ninja.id}).`);
                      aplicarEfeito(ninja, cardNaMao);
                      adicionarAoDescarte(cardNaMao);
                      removerCardDaMao(cardNaMao);
                      return true; // Chakra aplicado
                  }
              }
          }
  
          return false; // Não foi possível aplicar chakra
      };
  
      const verificarElementosTotal = (ninja) => {
          const jutsus = JSON.parse(ninja.dataset.jutsus || "[]");
          const elementosTotal = (
              parseInt(ninja.dataset.chakraFogo || 0) +
              parseInt(ninja.dataset.chakraVento || 0) +
              parseInt(ninja.dataset.chakraRaio || 0) +
              parseInt(ninja.dataset.chakraTerra || 0) +
              parseInt(ninja.dataset.chakraAgua || 0)
          );
  
          const maiorElementosTotalNecessario = Math.max(
              ...jutsus.map(jutsu => jutsu.requisitoChakra?.elementosTotal || 0)
          );
  
          if (elementosTotal < maiorElementosTotalNecessario) {
              console.log(`  - Faltam ${maiorElementosTotalNecessario - elementosTotal} elementosTotal para o ninja (${ninja.id}).`);
              // Selecionar um card de chakra aleatório na mão
              const cardsDeChakraNaMao = Array.from(maoIA).filter(card => card.dataset.tipo === "Chakra");
  
              if (cardsDeChakraNaMao.length > 0) {
                  const cardAleatorio = cardsDeChakraNaMao[Math.floor(Math.random() * cardsDeChakraNaMao.length)];
                  console.log(`IA aplicando Chakra aleatório (${cardAleatorio.id}) no ninja (${ninja.id}) para atingir elementosTotal.`);
                  aplicarEfeito(ninja, cardAleatorio);
                  adicionarAoDescarte(cardAleatorio);
                  removerCardDaMao(cardAleatorio);
                  return true; // Chakra aplicado
              } else {
                  console.log("IA não possui mais cards de chakra disponíveis na mão.");
              }
          }
  
          return false;
      };
  
      if (lider) {
          const requisitosLider = determinarMaiorRequisitosElementais(lider);
          console.log(`Requisitos elementais do líder (${lider.id}):`, requisitosLider);
  
          if (verificarEAplicarChakra(lider, requisitosLider)) {
              iaChakraUsado = true;
              console.log("Maior req elemental para o lider");
              encerrarPreparacaoIA();
              return;
          }
  
          if (verificarElementosTotal(lider)) {
              iaChakraUsado = true;
              console.log("Maior req total para o lider");
              encerrarPreparacaoIA();
              return;
          }
      }
  
      for (const suporte of suportes) {
          const requisitosSuporte = determinarMaiorRequisitosElementais(suporte);
          console.log(`Requisitos elementais do suporte (${suporte.id}):`, requisitosSuporte);
  
          if (verificarEAplicarChakra(suporte, requisitosSuporte)) {
              iaChakraUsado = true;
              console.log("Maior req elemental para o sup");
              encerrarPreparacaoIA();
              return;
          }
  
          if (verificarElementosTotal(suporte)) {
              iaChakraUsado = true;
              console.log("Maior req total para o sup");
              encerrarPreparacaoIA();
              return;
          }
      }
      console.log("Nenhum ninja da IA necessita de chakra neste turno.");
      encerrarPreparacaoIA();
    }; 
}
function encerrarPreparacaoIA() {
    console.log("Ações de preparação da IA concluídas.");
    alert("Ações de preparação da IA concluídas.");
    iaChakraUsado=false;
    encerrarTurno();
}

function escolherAcoesIA() { 
    console.log("IA escolhendo ações...");
    // Identificar ações da IA
    const liderIA = document.querySelector("#ia-leader-slot img");
    const dropdownOfensivaIA = document.getElementById("ia-offensive-action");
    const dropdownDefensivaIA = document.getElementById("ia-defensive-action");
    // Identificar ações do J1
    const liderJ1 = document.querySelector("#player-leader-slot img");
    const ofensivaJ1 = document.getElementById("j1-offensive-action").value;
    const defensivaJ1 = document.getElementById("j1-defensive-action").value;
    // Logs para identificar lideres  
    console.log("Líder Atual IA:", liderIA ? liderIA.dataset.nome : "Não encontrado");
    console.log("Líder Atual Jogador:", liderJ1 ? liderJ1.dataset.nome : "Não encontrado");
    
    if (!liderIA || !liderJ1) {
        console.warn("Um dos líderes não está presente no slot.");
        return;
    }

    // Define opções básicas
    const opcaoOfIA = [{ value: "taijutsu", text: "Ataque Simples" }];
    const opcaoDfIA = [
        { value: "defesa", text: "Proteger-se" },
        { value: "velocidade", text: "Desviar" }
    ];

    // Obter jutsus e atributos do líder
    const jutsus = JSON.parse(liderIA.dataset.jutsus || "[]");
    const chakraAtual = parseInt(liderIA.dataset.chakra, 10) || 0;
    const chakraElementos = {
        chakraFogo: parseInt(liderIA.dataset.chakraFogo, 10) || 0,
        chakraVento: parseInt(liderIA.dataset.chakraVento, 10) || 0,
        chakraRaio: parseInt(liderIA.dataset.chakraRaio, 10) || 0,
        chakraTerra: parseInt(liderIA.dataset.chakraTerra, 10) || 0,
        chakraAgua: parseInt(liderIA.dataset.chakraAgua, 10) || 0,
    };
    const elementosTotal =
        chakraElementos.chakraFogo +
        chakraElementos.chakraVento +
        chakraElementos.chakraRaio +
        chakraElementos.chakraTerra +
        chakraElementos.chakraAgua;

    // Verificar e classificar jutsus
    jutsus.forEach(jutsu => {
        const custoChakra = jutsu.custoChakra || 0;
        const requisitoChakra = jutsu.requisitoChakra || {};
        const categoria = jutsu.categoria || "indefinido";

        if (chakraAtual < custoChakra) {
            console.log(`Jutsu (${jutsu.nomeJutsu}) indisponível: chakra insuficiente.`);
            return;
        }
        let possuiRequisitos = true;
        for (const [elemento, quantidade] of Object.entries(requisitoChakra)) {
            if (elemento !== "elementosTotal" && quantidade > chakraElementos[elemento]) {
                possuiRequisitos = false;
                console.log(`Jutsu (${jutsu.nomeJutsu}) indisponível: falta ${quantidade - chakraElementos[elemento]} ${elemento}.`);
                break;
            }
        }

        if (possuiRequisitos && (requisitoChakra.elementosTotal || 0) > elementosTotal) {
            possuiRequisitos = false;
            console.log(`Jutsu (${jutsu.nomeJutsu}) indisponível: falta ${(requisitoChakra.elementosTotal || 0) - elementosTotal} elementosTotal.`);
        }

        if (possuiRequisitos) {
            console.log(`Jutsu (${jutsu.nomeJutsu}) está disponível.`);
            if (categoria === "ataque") {
                // Adicionar na lista de ações ofensivas e defensivas
                opcaoOfIA.push({ value: jutsu.nomeJutsu, text: `${jutsu.nomeJutsu} (${jutsu.estiloJutsu})`, power: jutsu.powerJutsu });
                opcaoDfIA.push({ value: jutsu.nomeJutsu, text: `${jutsu.nomeJutsu} (${jutsu.estiloJutsu})`, power: jutsu.powerJutsu });
            } else if (["defesa", "evasiva"].includes(categoria)) {
                // Adicionar apenas na lista de ações defensivas
                opcaoDfIA.push({ value: jutsu.nomeJutsu, text: `${jutsu.nomeJutsu} (${jutsu.estiloJutsu})`, power: jutsu.powerJutsu });
            }
        }        
    });
    // Escolher ação ofensiva
    const melhorOfensivaIA = opcaoOfIA.reduce((melhorOpcao, opcao) => {
        let poderAtq = 0;
        if (opcao.value === "taijutsu") {
            poderAtq = parseInt(liderIA.dataset.taijutsu, 10) || 0;
        } else if (opcao.power) {
            //const estiloJutsu = opcao.text.split(" ")[1].toLowerCase();
            const estiloJutsu = opcao.text.match(/\((.*?)\)/)?.[1]?.toLowerCase();
            if (estiloJutsu === "taijutsu") {
                poderAtq = (parseInt(liderIA.dataset.taijutsu, 10) || 0) + opcao.power;
            } else if (estiloJutsu === "genjutsu") {
                poderAtq = (parseInt(liderIA.dataset.genjutsu, 10) || 0) + opcao.power;
            } else if (estiloJutsu === "ninjutsu") {
                poderAtq = (parseInt(liderIA.dataset.ninjutsu, 10) || 0) + opcao.power;
            } else {
                console.warn(`Estilo de jutsu não identificado ou não aplicável: ${estiloJutsu}`);
            }
        }
        console.log(`Opção ofensiva: ${opcao.text}, Poder de Ataque: ${poderAtq}`);
        return poderAtq > melhorOpcao.poderAtq ? { ...opcao, poderAtq } : melhorOpcao;
    }, { poderAtq: 0 });
    dropdownOfensivaIA.value = melhorOfensivaIA.value;
    console.log(`Ação ofensiva escolhida pela IA: ${melhorOfensivaIA.text}`);

    // Escolher ação defensiva
    const hpAtual = parseInt(liderIA.dataset.hp, 10) || 0;
    const hpInicial = parseInt(liderIA.dataset.hpInicial, 10) || 0;
    const defesaIA = parseInt(liderIA.dataset.defesa, 10) || 0;
    const taiJ1 = parseInt(liderJ1.dataset.taijutsu, 10) || 0;
    const ninJ1 = parseInt(liderJ1.dataset.ninjutsu, 10) || 0;

    let melhorDefensivaIA;

    // Caso 1: HP crítico e vantagem de velocidade
    //if (hpAtual <= hpInicial * 0.2 && (velocidadeIA - velocidadeJ1 > 10)) {
    // Caso 1: HP crítico
    if (hpAtual <= hpInicial * 0.2 && (defesaIA < taiJ1 || defesaIA < ninJ1)) {
        melhorDefensivaIA = { value: "velocidade", text: "Desviar" };
        console.log(`HP crítico: ${hpAtual}. Velocidade suficiente para desviar. Ação defensiva escolhida pela IA: ${melhorDefensivaIA.text}`);

    // Caso 2: HP entre 20% e 40% do HP inicial
    } else if (hpAtual > hpInicial * 0.2 && hpAtual <= hpInicial * 0.4) {
        melhorDefensivaIA = opcaoDfIA.reduce((melhorOpcao, opcao) => {
            let poderDef = 0;
            if (opcao.value === "defesa") {
                poderDef = parseInt(liderIA.dataset.defesa, 10) || 0;
            } else if (opcao.power) {
                const estiloJutsu = opcao.text.split(" ")[1].toLowerCase();
                poderDef = (estiloJutsu === "genjutsu"
                    ? parseInt(liderIA.dataset.genjutsu, 10) || 0
                    : parseInt(liderIA.dataset.defesa, 10) || 0) + opcao.power;
            }
            console.log(`Opção defensiva: ${opcao.text}, Poder de Defesa: ${poderDef}`);
            return poderDef > melhorOpcao.poderDef ? { ...opcao, poderDef } : melhorOpcao;
        }, { poderDef: 0 });
        console.log(`HP moderado: ${hpAtual}. Ação defensiva escolhida pela IA: ${melhorDefensivaIA.text}`);

    // Caso 3: HP > 40% ou outras condições
    } else {
        melhorDefensivaIA = { value: "defesa", text: "Proteger-se" };
        console.log(`HP seguro: ${hpAtual}. Ação defensiva escolhida pela IA: ${melhorDefensivaIA.text}`);
    }

    // Definir ação defensiva no dropdown
    dropdownDefensivaIA.value = melhorDefensivaIA.value;


    // Identificar jutsus ou ações básicas
    const acaoOfensivaIA = identificarAcao(liderIA, melhorOfensivaIA.value);
    const acaoDefensivaIA = identificarAcao(liderIA, melhorDefensivaIA.value);
    const acaoOfensivaJ1 = identificarAcao(liderJ1, ofensivaJ1);
    const acaoDefensivaJ1 = identificarAcao(liderJ1, defensivaJ1);

    // Calcular o dano
    defineOrdem(
        liderJ1,
        liderIA,
        acaoOfensivaJ1,
        acaoDefensivaJ1,
        acaoOfensivaIA,
        acaoDefensivaIA
    );
}

function identificarAcao(lider, acaoSelecionada) {
    if (!lider || !acaoSelecionada) {
      console.error("Líder ou ação selecionada está indefinida.");
      return null;
    }
    //const acoesBasicas = ["taijutsu", "defesa", "velocidade", "velocidadeIA", "taijutsuIA", "defesaIA"];
    const acoesBasicas = ["taijutsu", "defesa", "velocidade"];
    if (acoesBasicas.includes(acaoSelecionada)) {
      return { tipo: "basica", nome: acaoSelecionada, valor: lider.dataset[acaoSelecionada] || 0 };
    }
  
    const jutsus = JSON.parse(lider.dataset.jutsus || "[]");
    const jutsuSelecionado = jutsus.find(jutsu => jutsu.nomeJutsu === acaoSelecionada.split(" (")[0]);
  
    if (jutsuSelecionado) {
      return { tipo: "jutsu", ...jutsuSelecionado };
    }
  
    console.warn(`Ação selecionada (${acaoSelecionada}) não encontrada.`);
    //return { tipo: "invalida", nome: acaoSelecionada };
    return null;
}  

function escolherNovoLiderIA() {
    console.log("Escolhendo novo líder para a IA...");
  
    const iaLeaderSlot = document.getElementById('ia-leader-slot');
    const iaSupportSlots = [
      document.getElementById('supIAa'),
      document.getElementById('supIAb'),
      document.getElementById('supIAc')
    ];
  
    // Filtrar ninjas nos slots de suporte
    const supportNinjas = iaSupportSlots
      .filter(slot => slot.classList.contains('occupied'))
      .map(slot => slot.querySelector('img'));
  
    if (supportNinjas.length > 0) {
      // Calcula a soma dos atributos de cada ninja no suporte
      const ninjaComMaiorSoma = supportNinjas.reduce((melhorNinja, ninjaAtual) => {
        const somaAtual = calcularSomaAtributos(ninjaAtual);
        const somaMelhor = calcularSomaAtributos(melhorNinja);
        return somaAtual > somaMelhor ? ninjaAtual : melhorNinja;
      });
  
      // Move o ninja com maior soma de atributos para o slot de líder
      const slotAnterior = ninjaComMaiorSoma.parentElement;
      slotAnterior.innerHTML = '';
      slotAnterior.classList.remove('occupied');
  
      iaLeaderSlot.innerHTML = ''; // Limpa o slot de líder
      iaLeaderSlot.appendChild(ninjaComMaiorSoma);
      iaLeaderSlot.classList.add('occupied');
      ninjaComMaiorSoma.draggable = false; // Desativa arrastar o novo líder
      atualizarAtributosLiderIA(ninjaComMaiorSoma);
  
      console.log(`Novo líder ${ninjaComMaiorSoma.id} escolhido para a IA.`);
  
      estadoAtual = "premio";
      encerrarTurno();
    } else {
      console.log("IA não possui mais ninjas no suporte para escolher como novo líder.");
      estadoAtual = "premio";
      encerrarTurno();
    }
}
  
function calcularSomaAtributos(ninja) {
    const hp = parseInt(ninja.dataset.hp, 10) || 0;
    const chakra = parseInt(ninja.dataset.chakra, 10) || 0;
    const taijutsu = parseInt(ninja.dataset.taijutsu, 10) || 0;
    const genjutsu = parseInt(ninja.dataset.genjutsu, 10) || 0;
    const ninjutsu = parseInt(ninja.dataset.ninjutsu, 10) || 0;
    const defesa = parseInt(ninja.dataset.defesa, 10) || 0;
    const velocidade = parseInt(ninja.dataset.velocidade, 10) || 0;

    return hp + chakra + taijutsu + genjutsu + ninjutsu + defesa + velocidade;
}