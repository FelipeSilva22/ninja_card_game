function defineOrdem(
    liderJ1,
    liderIA,
    acaoOfensivaJ1,
    acaoDefensivaJ1,
    acaoOfensivaIA,
    acaoDefensivaIA
  ) {
    console.log("Iniciando cálculo de dano...");
    console.log("Líder J1:", liderJ1.dataset.nome);
    console.log("Líder IA:", liderIA.dataset.nome);
  
    // Determina o primeiro a atacar com base na velocidade
    const velocidadeJ1 = parseInt(liderJ1.dataset.velocidade) || 0;
    const velocidadeIA = parseInt(liderIA.dataset.velocidade) || 0;
  
    let primeiroAtacante, primeiroDefensor, acaoOfensivaAtacante, acaoDefensivaDefensor;
    let segundoAtacante, segundoDefensor, acaoOfensivaSegundo, acaoDefensivaSegundo;
  
    if (velocidadeJ1 >= velocidadeIA) {
      // J1 ataca primeiro
      primeiroAtacante = liderJ1;
      primeiroDefensor = liderIA;
      acaoOfensivaAtacante = acaoOfensivaJ1;
      acaoDefensivaDefensor = acaoDefensivaIA;
  
      segundoAtacante = liderIA;
      segundoDefensor = liderJ1;
      acaoOfensivaSegundo = acaoOfensivaIA;
      acaoDefensivaSegundo = acaoDefensivaJ1;
    } else {
      // IA ataca primeiro
      primeiroAtacante = liderIA;
      primeiroDefensor = liderJ1;
      acaoOfensivaAtacante = acaoOfensivaIA;
      acaoDefensivaDefensor = acaoDefensivaJ1;
  
      segundoAtacante = liderJ1;
      segundoDefensor = liderIA;
      acaoOfensivaSegundo = acaoOfensivaJ1;
      acaoDefensivaSegundo = acaoDefensivaIA;
    }
  
    console.log(`Primeiro Atacante: ${primeiroAtacante.dataset.nome}`);
  
    // Processa o primeiro ataque
    processarAcoes(primeiroAtacante, primeiroDefensor, acaoOfensivaAtacante, acaoDefensivaDefensor);
  
    // Verificar o HP do primeiro defensor após o ataque
    const hpPrimeiroDefensor = parseInt(primeiroDefensor.dataset.hp) || 0;
    if (hpPrimeiroDefensor <= 0) {
      console.log(`${primeiroDefensor.dataset.nome} foi derrotado!`);
      adicionarAoDescarte(primeiroDefensor); // Move o defensor para o descarte
      //primeiroDefensor.parentElement.innerHTML = ''; // Remove do slot de líder

      if (primeiroDefensor === liderIA) {
        zerarAtributosLider("#ia-leader-slot");
        resgatePremioJ1();
      } else {
        zerarAtributosLider("#player-leader-slot");
        resgatePremioIA();
      }
      return; // Finaliza o cálculo, já que o defensor foi derrotado
    }
  
    console.log(`Agora ${segundoAtacante.dataset.nome} está atacando.`);
    
    // Processa o segundo ataque (invertendo os papéis)
    processarAcoes(segundoAtacante, segundoDefensor, acaoOfensivaSegundo, acaoDefensivaSegundo);
  
    // Verificar o HP do segundo defensor após o ataque
    const hpSegundoDefensor = parseInt(segundoDefensor.dataset.hp) || 0;
    if (hpSegundoDefensor <= 0) {
      console.log(`${segundoDefensor.dataset.nome} foi derrotado!`);
      adicionarAoDescarte(segundoDefensor); // Move o defensor para o descarte
      //segundoDefensor.parentElement.innerHTML = ''; // Remove do slot de líder
      if (segundoDefensor === liderIA) {
        zerarAtributosLider("#ia-leader-slot");
        resgatePremioJ1();
      } else {
        zerarAtributosLider("#player-leader-slot");
        resgatePremioIA();
      }
    } else {
      estadoAtual = "premio";
      encerrarTurno();
    }
}

function processarAcoes(atacante, defensor, acaoOfensiva, acaoDefensiva) {
  const velocidadeAtacante = parseInt(atacante.dataset.velocidade) || 0;
  let velocidadeDefensor = parseInt(defensor.dataset.velocidade) || 0;

  // Função auxiliar para consumir chakra
  function consumirChakra(ninja, custoChakra) {
      const chakraAtual = parseInt(ninja.dataset.chakra) || 0;
      if (chakraAtual >= custoChakra) {
          ninja.dataset.chakra = chakraAtual - custoChakra;
          console.log(`${ninja.dataset.nome} usou ${custoChakra} de chakra. Chakra restante: ${ninja.dataset.chakra}`);
      } else {
          console.warn(`${ninja.dataset.nome} não tem chakra suficiente!`);
      }
  }

  // Consumir chakra
  if (acaoOfensiva.tipo === "jutsu") consumirChakra(atacante, acaoOfensiva.custoChakra || 0);
  if (acaoDefensiva.tipo === "jutsu") consumirChakra(defensor, acaoDefensiva.custoChakra || 0);

  // Verificar se a ação defensiva é uma evasiva
  let tentativaEvasiva = false;

  if (acaoDefensiva.tipo === "jutsu" && acaoDefensiva.categoria === "evasiva") {
      velocidadeDefensor = velocidadeDefensor + (acaoDefensiva.powerJutsu || 0);
      console.log(`${defensor.dataset.nome} tentou usar jutsu evasivo. ${velocidadeDefensor}`);
      tentativaEvasiva = true;
  } else if (acaoDefensiva.nome === "velocidade" || acaoDefensiva.nome === "velocidadeIA") {
      console.log(`${defensor.dataset.nome} tentou usar ação básica de evasiva.`);
      tentativaEvasiva = true;
  }

  if (tentativaEvasiva) {
      const diferencaVelocidade = velocidadeDefensor - velocidadeAtacante;
      const chanceDesvio = Math.max(5, Math.min(25, diferencaVelocidade));
      if (Math.random() * 100 < chanceDesvio) {
          console.log(`${defensor.dataset.nome} conseguiu desviar!`);
          // Atualizar os atributos do atacante e do defensor
          if (atacante.closest("#player-area")) {
            atualizarAtributosLider(atacante);
          } else if (atacante.closest("#ia-area")) {
            atualizarAtributosLiderIA(atacante);
          }

          if (defensor.closest("#player-area")) {
            atualizarAtributosLider(defensor);
          } else if (defensor.closest("#ia-area")) {
            atualizarAtributosLiderIA(defensor);
          }
          return; // Dano é zerado
      } else {
          console.log(`${defensor.dataset.nome} falhou em desviar.`);
      }
  }

  // Calcular dano
  calcularDano(atacante, defensor, acaoOfensiva, acaoDefensiva);
}

function calcularDano(atacante, defensor, acaoOfensiva, acaoDefensiva) {
  let poderAtaque = 0;
  let poderDefesa = 0;

  // Determinar poder de ataque
  if (acaoOfensiva.tipo === "jutsu") {
    if (acaoOfensiva.estiloJutsu === "Genjutsu") {
      poderAtaque = (parseInt(atacante.dataset.genjutsu) || 0) + (acaoOfensiva.powerJutsu || 0);
    } else if (acaoOfensiva.estiloJutsu === "Taijutsu") {
      poderAtaque = (parseInt(atacante.dataset.taijutsu) || 0) + (acaoOfensiva.powerJutsu || 0);
    } else if (acaoOfensiva.estiloJutsu === "Ninjutsu") {
      poderAtaque = (parseInt(atacante.dataset.ninjutsu) || 0) + (acaoOfensiva.powerJutsu || 0);
    }
  } else if (acaoOfensiva.nome === "taijutsu") {
    poderAtaque = parseInt(atacante.dataset.taijutsu) || 0; // Ataque básico
  }

  // Determinar poder de defesa
  if (acaoDefensiva.tipo === "jutsu") {
    if (acaoDefensiva.estiloJutsu === "Genjutsu") {
      poderDefesa = (parseInt(defensor.dataset.genjutsu) || 0) + (acaoDefensiva.powerJutsu || 0);
    } else if (acaoDefensiva.estiloJutsu === "Taijutsu" || acaoDefensiva.estiloJutsu === "Ninjutsu") {
      poderDefesa = (parseInt(defensor.dataset.defesa) || 0) + (acaoDefensiva.powerJutsu || 0);
    } else if (acaoDefensiva.estiloJutsu === "Evasiva") {
      poderDefesa = Math.floor((parseInt(defensor.dataset.defesa) || 0) / 2);
      console.log(`${defensor.dataset.nome} usou evasiva. Defesa reduzida para ${poderDefesa}.`);
    }
  } else if (acaoDefensiva.nome === "velocidade" || acaoDefensiva.nome === "velocidadeIA") {
    // Defesa básica de evasiva
    poderDefesa = Math.floor((parseInt(defensor.dataset.defesa) || 0) / 2);
    console.log(`${defensor.dataset.nome} usou evasiva. Defesa reduzida para ${poderDefesa}.`);
  } else {
    // Defesa básica
    poderDefesa = parseInt(defensor.dataset.defesa) || 0;
  }

  // Calcular o dano
  let dano = poderAtaque - poderDefesa;
  if (dano < 0) dano = 0;

  // Aplicar dano ao defensor
  const hpAtual = parseInt(defensor.dataset.hp) || 0;
  const novoHp = Math.max(hpAtual - dano, 0);
  defensor.dataset.hp = novoHp;

  console.log(`${atacante.dataset.nome} usou ${poderAtaque} de ataque contra ${poderDefesa} de defesa.`);
  console.log(`${atacante.dataset.nome} causou ${dano} de dano a ${defensor.dataset.nome}.`);
  console.log(`${defensor.dataset.nome} agora tem ${novoHp} de HP.`);
  // Atualizar os atributos do atacante e do defensor
  if (atacante.closest("#player-area")) {
    atualizarAtributosLider(atacante);
  } else if (atacante.closest("#ia-area")) {
    atualizarAtributosLiderIA(atacante);
  }

  if (defensor.closest("#player-area")) {
    atualizarAtributosLider(defensor);
  } else if (defensor.closest("#ia-area")) {
    atualizarAtributosLiderIA(defensor);
  }
}

function verificarVantagem(naturezaAtaque, naturezaDefesa) {
  const vantagemTabela = {
    Fogo: 'Vento',
    Vento: 'Raio',
    Raio: 'Terra',
    Terra: 'Agua',
    Agua: 'Fogo',
  };

  if (naturezaAtaque === vantagemTabela[naturezaDefesa]) {
    return true;
  }
  if (naturezaDefesa === vantagemTabela[naturezaAtaque]) {
    return false;
  }
  return null; // Neutro
} 