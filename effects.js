function decidirOrdemHabilidadesSuporte() {
    const suporteJ1 = Array.from(document.querySelectorAll('#player-supports .field-slot img'));
    const suporteIA = Array.from(document.querySelectorAll('#ia-supports .field-slot img'));
    suporteIAExecutado = false; // Reseta o controle para a nova fase
    console.log("suporte IA ja usado?", suporteIAExecutado);
    const calcularMediaVelocidade = (suportes) => {
      if (suportes.length === 0) return 0;
      const somaVelocidade = suportes.reduce((soma, ninja) => soma + (parseInt(ninja.dataset.velocidade, 10) || 0), 0);
      return somaVelocidade / suportes.length;
    };
  
    const mediaVelocidadeJ1 = calcularMediaVelocidade(suporteJ1);
    const mediaVelocidadeIA = calcularMediaVelocidade(suporteIA);
  
    console.log(`Média de velocidade do J1: ${mediaVelocidadeJ1}`);
    console.log(`Média de velocidade da IA: ${mediaVelocidadeIA}`);
  
    if (mediaVelocidadeJ1 > mediaVelocidadeIA) {
      alert("O jogador vai usar as habilidades de suporte primeiro.");
      configurarHabilidadesSuporte();
    } else if (mediaVelocidadeIA > mediaVelocidadeJ1) {
      alert("A IA vai usar as habilidades de suporte primeiro.");
      escolherHabilidadesSuporteIA();
      configurarHabilidadesSuporte();
    } else {
      alert("Empate de velocidade. O jogador usará as habilidades de suporte primeiro.");
      configurarHabilidadesSuporte();
    }
}  
function configurarHabilidadesSuporte() {
    if (estadoAtual !== "suporte") {
        alert("Você só pode usar Hab. de Suporte nessa fase!");
        return;
    }
    const suportes = document.querySelectorAll('#player-supports .field-slot img');
    let habilidadesUsadas = 0;

    suportes.forEach(ninja => {
        ninja.addEventListener('click', () => {
            if (ninja.dataset.habUsada === "true") {
                alert("Este suporte já usou sua habilidade neste turno.");
                return;
            }

            if (habilidadesUsadas >= 2) {
                alert("Você só pode usar 2 habilidades de suporte por turno.");
                return;
            }

            if (ninja.dataset.paralyze === "true") {
                alert("Este ninja está Paralisado e não pode ativar sua habilidade.");
                return;
            }

            const confirmar = confirm(`Deseja ativar a habilidade de suporte (${ninja.dataset.habilidadeSuporte}) do ninja ${ninja.dataset.nome}?`);
            if (confirmar) {
                habilidadesUsadas++;
                ninja.dataset.habUsada = "true"; // Marca como usada
                processarHabilidadeSuporte(ninja, "J1");
            }
        });
    });
}
async function processarHabilidadeSuporte(ninjaSuporte, jogador) {
    const habilidade = ninjaSuporte.dataset.habilidadeSuporte;
    const custo = parseInt(ninjaSuporte.dataset.custoHabSup, 10);
    const probabilidadeBase = parseInt(ninjaSuporte.dataset.probabilidade, 10);
    let alvo;

    if (parseInt(ninjaSuporte.dataset.chakra, 10) < custo) {
        alert(`${jogador === "J1" ? "Seu ninja" : "O ninja da IA"} não possui chakra suficiente para usar esta habilidade.`);
        return;
    }

    // Reduz o chakra do ninja
    ninjaSuporte.dataset.chakra -= custo;

    switch (habilidade) {
        case "Poising":
            if (jogador === "J1") {
                alert("Escolha um ninja para aplicar Poising.");
                alvo = await selecionarAlvoCampo("poising");
            } else {
                alvo = escolherAlvoIA("poising");
            }
            if (alvo) aplicarEfeitoPoising(ninjaSuporte, alvo);
            break;

        case "Paralyze":
            if (jogador === "J1") {
                alert("Escolha um ninja para aplicar Paralyze.");
                alvo = await selecionarAlvoCampo("paralyze");
            } else {
                alvo = escolherAlvoIA("paralyze");
            }
            if (alvo) aplicarEfeitoParalyze(ninjaSuporte, alvo);
            break;

        case "NinjaBaralho":
            if (jogador === "J1") {
                alert("Escolha um ninja do baralho para adicionar à mão.");
                abrirModalEscolhaBaralho("ninja");
            } else {
                adicionarNinjaBaralhoIA();
            }
            break;

        default:
            console.error("Habilidade desconhecida:", habilidade);
    }
}
function selecionarAlvoCampo(habilidade) {
    return new Promise((resolve) => {
        const alvos = document.querySelectorAll('.field-slot img');

        alvos.forEach(alvo => {
            alvo.classList.add('alvo-selecionavel'); // Adiciona estilo visual ao alvo
            alvo.addEventListener('click', function handleClick() {
                alvos.forEach(a => a.classList.remove('alvo-selecionavel'));
                alvo.removeEventListener('click', handleClick);
                console.log(`Alvo escolhido para ${habilidade}: ${alvo.id}`);
                resolve(alvo); // Retorna o alvo escolhido
            });
        });
    });
}
function escolherAlvoIA(habilidade) {
    const alvosPossiveis = Array.from(document.querySelectorAll('#player-leader-slot img, #player-supports .field-slot img'))
        .filter(alvo => {
            if (habilidade === "poising" && !alvo.dataset.poising) {
                return true;
            }
            if (habilidade === "paralyze" && !alvo.dataset.paralyze) {
                return true;
            }
            return false;
        });

    if (alvosPossiveis.length === 0) {
        console.log(`Nenhum alvo disponível para ${habilidade}.`);
        return null;
    }

    const alvoEscolhido = alvosPossiveis.reduce((maior, atual) => {
        if (habilidade === "poising") {
            return parseInt(atual.dataset.hpInicial, 10) > parseInt(maior.dataset.hpInicial, 10) ? atual : maior;
        } else if (habilidade === "paralyze") {
            return parseInt(atual.dataset.velocidade, 10) > parseInt(maior.dataset.velocidade, 10) ? atual : maior;
        }
    });

    console.log(`Alvo escolhido pela IA para ${habilidade}: ${alvoEscolhido.id}`);
    return alvoEscolhido;
}
function aplicarEfeitoPoising(ninjaSuporte, ninjaAlvo) {
    const probabilidade = calcularProbabilidade(ninjaSuporte, ninjaAlvo);
    console.log(`Poising - Ninja Suporte: ${ninjaSuporte.dataset.nome}, Ninja Alvo: ${ninjaAlvo.dataset.nome}`);
    console.log(`Poising - Probabilidade Calculada: ${probabilidade}%`);

    if (Math.random() * 100 <= probabilidade) {
        alert(`Habilidade Poising aplicada com sucesso no ninja ${ninjaAlvo.dataset.nome}!`);
        console.log(`Poising aplicado com sucesso no ninja ${ninjaAlvo.dataset.nome}.`);
        ninjaAlvo.dataset.poising = "true";

        // Verifica se o alvo é um líder
        if (ninjaAlvo.closest("#player-leader-slot")) {
            atualizarAtributosLider(ninjaAlvo);
        } else if (ninjaAlvo.closest("#ia-leader-slot")) {
            atualizarAtributosLiderIA(ninjaAlvo);
        }
    } else {
        alert("A habilidade Poising falhou.");
        console.log(`Poising falhou no ninja ${ninjaAlvo.dataset.nome}.`);
    }
}
function aplicarEfeitoParalyze(ninjaSuporte, ninjaAlvo) {
    const probabilidade = calcularProbabilidade(ninjaSuporte, ninjaAlvo);
    console.log(`Paralyze - Ninja Suporte: ${ninjaSuporte.dataset.nome}, Ninja Alvo: ${ninjaAlvo.dataset.nome}`);
    console.log(`Paralyze - Probabilidade Calculada: ${probabilidade}%`);

    if (Math.random() * 100 <= probabilidade) {
        alert(`Habilidade Paralyze aplicada com sucesso no ninja ${ninjaAlvo.dataset.nome}!`);
        console.log(`Paralyze aplicado com sucesso no ninja ${ninjaAlvo.dataset.nome}.`);
        ninjaAlvo.dataset.paralyze = "true";

        // Salva velocidade original e zera a atual
        ninjaAlvo.dataset.velocidadeOriginal = ninjaAlvo.dataset.velocidade || 0;
        ninjaAlvo.dataset.velocidade = 0;

        // Verifica se o alvo é um líder
        if (ninjaAlvo.closest("#player-leader-slot")) {
            atualizarAtributosLider(ninjaAlvo);
        } else if (ninjaAlvo.closest("#ia-leader-slot")) {
            atualizarAtributosLiderIA(ninjaAlvo);
        }
    } else {
        alert("A habilidade Paralyze falhou.");
        console.log(`Paralyze falhou no ninja ${ninjaAlvo.dataset.nome}.`);
    }
}
function calcularProbabilidade(ninjaSuporte, ninjaAlvo) {
    const probabilidadeBase = parseInt(ninjaSuporte.dataset.probabilidade, 10);
    const diferencaVelocidade = parseInt(ninjaSuporte.dataset.velocidade, 10) - parseInt(ninjaAlvo.dataset.velocidade, 10);

    let probabilidade = probabilidadeBase + diferencaVelocidade;
    probabilidade = Math.min(90, Math.max(20, probabilidade));

    console.log(`Calcular Probabilidade - Base: ${probabilidadeBase}%, Diferença Velocidade: ${diferencaVelocidade}, Resultado Final: ${probabilidade}%`);
    return probabilidade;
}
function abrirModalEscolhaBaralho(tipo) {
    // Obter o modal e seus elementos
    const modal = document.getElementById('baralhoModal'); // Certifique-se de ter um modal com esse ID no HTML
    const modalTitle = document.getElementById('baralhoModalTitle');
    const modalBody = document.getElementById('baralhoModalBody');
    const modalConfirmButton = document.getElementById('baralhoModalConfirm');
    const maoJ1 = jogadorMao;

    console.log("Abrindo modal para escolha de cartas do tipo:", tipo);

    // Verifique se o baralho do jogador está carregado
    if (!jogadorBaralho || !jogadorBaralho.cards) {
        console.error("O baralho do jogador não foi carregado corretamente.");
        alert("Erro: O baralho do jogador não foi carregado.");
        return;
    }

    // Filtrar os cards do tipo especificado
    const cartasFiltradas = jogadorBaralho.cards.filter(card => card.tipo.toLowerCase() === tipo.toLowerCase());
    console.log(`Cartas filtradas (${tipo}):`, cartasFiltradas);

    if (cartasFiltradas.length === 0) {
        alert(`Não há cartas do tipo "${tipo}" no baralho.`);
        return;
    }

    // Atualizar o título do modal
    modalTitle.textContent = `Escolha um ${tipo} do baralho`;

    // Limpar o conteúdo do modal
    modalBody.innerHTML = '';

    // Renderizar os cards no modal
    cartasFiltradas.forEach(card => {
        const cardElement = document.createElement('img');
        cardElement.src = card.imagem;
        cardElement.alt = card.nome || 'Card';
        cardElement.classList.add('modal-card');
        cardElement.dataset.idCard = card.idCard;

        // Adicionar evento de seleção
        cardElement.addEventListener('click', () => {
            document.querySelectorAll('.modal-card').forEach(c => c.classList.remove('selected'));
            cardElement.classList.add('selected'); // Marcar como selecionado
        });

        modalBody.appendChild(cardElement);
    });

    // Mostrar o modal
    modal.style.display = 'block';

    // Configurar o botão de confirmação
    modalConfirmButton.onclick = () => {
        const selectedCard = modalBody.querySelector('.modal-card.selected');
        if (!selectedCard) {
            alert('Por favor, selecione um card antes de confirmar.');
            return;
        }

        const cardId = selectedCard.dataset.idCard;
        const cardSelecionado = jogadorBaralho.cards.find(card => card.idCard === cardId);

        if (cardSelecionado) {
            // Usar a função comprarCard para adicionar à mão
            const cardAdicionado = comprarCard(
                jogadorBaralho.cards,
                maoJ1,
                'player-deck-slot' // Ajuste conforme o ID do deckSlot do jogador
            );

            if (cardAdicionado) {
                renderizarMao(maoJ1);
                alert(`Você adicionou o card "${cardAdicionado.nome}" à sua mão.`);
            } else {
                alert('Erro ao adicionar o card à mão.');
            }
        } else {
            alert('O card selecionado não foi encontrado no baralho.');
        }

        // Fechar o modal
        modal.style.display = 'none';
    };
}
function adicionarNinjaBaralhoIA() {
    console.log("IA ativando habilidade NinjaBaralho...");
    const maoIA = iaMao;

    if (!iaBaralho || !iaBaralho.cards || iaBaralho.cards.length === 0) {
        console.warn("O baralho da IA está vazio ou não carregado.");
        alert("A IA não possui mais ninjas no baralho para adicionar.");
        return;
    }

    // Obter os ninjas no campo da IA
    const ninjasCampoIA = Array.from(document.querySelectorAll('#ia-formation-field .field-slot img'))
        .filter(card => card.dataset.tipo === 'Ninja');
    
    console.log("Ninjas no campo da IA:", ninjasCampoIA);

    // Priorizar ninjas do baralho conforme as regras
    let ninjaSelecionado = null;

    // Regra 1: Um ninja estágio 3 com o mesmo registro de um estágio 2 no campo da IA
    ninjaSelecionado = iaBaralho.cards.find(card =>
        card.tipo === 'Ninja' &&
        card.estagio === 3 &&
        ninjasCampoIA.some(ninjaCampo => ninjaCampo.dataset.registro === card.registro && ninjaCampo.dataset.estagio == 2)
    );

    if (ninjaSelecionado) {
        console.log(`Ninja estágio 3 selecionado: ${ninjaSelecionado.nome}`);
    }

    // Regra 2: Um ninja estágio 2 com o mesmo registro de um estágio 1 no campo da IA
    if (!ninjaSelecionado) {
        ninjaSelecionado = iaBaralho.cards.find(card =>
            card.tipo === 'Ninja' &&
            card.estagio === 2 &&
            ninjasCampoIA.some(ninjaCampo => ninjaCampo.dataset.registro === card.registro && ninjaCampo.dataset.estagio == 1)
        );

        if (ninjaSelecionado) {
            console.log(`Ninja estágio 2 selecionado: ${ninjaSelecionado.nome}`);
        }
    }

    // Regra 3: O ninja estágio 1 com a maior soma de atributos
    if (!ninjaSelecionado) {
        ninjaSelecionado = iaBaralho.cards
            .filter(card => card.tipo === 'Ninja' && card.estagio === 1)
            .reduce((melhor, atual) => 
                calcularSomaAtributos(atual) > calcularSomaAtributos(melhor) ? atual : melhor,
                { hp: 0, chakra: 0, taijutsu: 0, genjutsu: 0, ninjutsu: 0, defesa: 0, velocidade: 0 }
            );

        if (ninjaSelecionado) {
            console.log(`Ninja estágio 1 selecionado: ${ninjaSelecionado.nome}`);
        }
    }

    if (!ninjaSelecionado) {
        console.warn("A IA não conseguiu selecionar nenhum ninja para adicionar à mão.");
        alert("A IA não possui um ninja válido para adicionar à mão.");
        return;
    }

    // Adicionar o ninja à mão da IA usando comprarCard
    console.log(`Adicionando o ninja ${ninjaSelecionado.nome} à mão da IA.`);

    const ninjaAdicionado = comprarCard(
        iaBaralho.cards.filter(card => card.idCard === ninjaSelecionado.idCard), // Cria um baralho temporário com apenas o ninja selecionado
        maoIA,
        'ia-deck-slot' // Atualiza o slot do deck da IA
    );

    if (ninjaAdicionado) {
        console.log(`Ninja "${ninjaAdicionado.nome}" foi adicionado à mão da IA.`);
        alert(`A IA adicionou o ninja "${ninjaAdicionado.nome}" à sua mão.`);
    } else {
        console.warn("Falha ao adicionar o ninja à mão da IA.");
    }
}

function escolherHabilidadesSuporteIA() {
    console.log("Iniciando habilidades da IA...");
    const suportesIA = Array.from(document.querySelectorAll('#ia-supports .field-slot img'));
    const habilidadesIA = [];
    let tentativas = 0;

    if (suportesIA.length === 0) {
        alert("A IA não possui ninjas no suporte para usar habilidades.");
        console.log("A IA não possui ninjas no suporte para usar habilidades.");
        suporteIAExecutado = true; // Marca como processado
        return;
    }

    // Garantir que o loop `while` não seja infinito
    while (habilidadesIA.length < 2 && tentativas < 5) {
        const suporteEscolhido = suportesIA[Math.floor(Math.random() * suportesIA.length)];
        if (!habilidadesIA.includes(suporteEscolhido) && !suporteEscolhido.dataset.habUsada) {
            habilidadesIA.push(suporteEscolhido);
            suporteEscolhido.dataset.habUsada = "true";
        }
        tentativas++;
    }

    if (habilidadesIA.length === 0) {
        alert("A IA possui ninjas no suporte, mas nenhum com habilidade de suporte disponível para usar.");
        console.log("A IA possui ninjas no suporte, mas nenhum com habilidade de suporte disponível para usar.");
        suporteIAExecutado = true; // Marca como processado
        return;
    }

    habilidadesIA.sort((a, b) => parseInt(b.dataset.velocidade, 10) - parseInt(a.dataset.velocidade, 10)); // Ordem pela velocidade

    habilidadesIA.forEach(ninja => {
        const habilidade = ninja.dataset.habilidadeSuporte || "Habilidade desconhecida";
        const custo = ninja.dataset.custoHabSup || "Desconhecido";
        alert(`IA está usando a habilidade "${habilidade}" do ninja "${ninja.dataset.nome}" com custo de ${custo} chakra.`);
        console.log(`IA está usando a habilidade "${habilidade}" do ninja "${ninja.dataset.nome}" com custo de ${custo} chakra.`);
        processarHabilidadeSuporte(ninja, "IA");
    });

    suporteIAExecutado = true; // Marca como processado
}