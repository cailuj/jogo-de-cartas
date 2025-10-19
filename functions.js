// Definição da classe Card para Truco Mineiro com manilha fixa
class Card {
    constructor(suit, rank) {
        this.suit = suit; // Naipe (e.g., 'paus', 'copas', 'espadas', 'ouros')
        this.rank = rank; // Valor (e.g., 'A', '2', '3', ..., 'K')
        this.trucoValue = this.getTrucoValue(); // Valor para comparação no Truco
    }

    // Retorna o valor da carta no contexto do Truco Mineiro com manilha fixa
    getTrucoValue() {
        const fixedManilhas = {
            '4_paus': 14, // Zap
            '7_copas': 13, // Copeta
            'A_espadas': 12, // Espadilha
            '7_ouros': 11  // Pica-fumo
        };

        const cardIdentifier = `${this.rank}_${this.suit}`;
        if (fixedManilhas[cardIdentifier]) {
            return fixedManilhas[cardIdentifier];
        }

        // Ordem de força das cartas normais no Truco Mineiro (decrescente)
        const rankOrder = ['3', '2', 'A', 'K', 'J', 'Q', '7', '6', '5', '4'];
        return rankOrder.indexOf(this.rank);
    }

    compareTo(otherCard) {
        if (this.trucoValue > otherCard.trucoValue) {
            return -1;
        } else if (this.trucoValue < otherCard.trucoValue) {
            return 1;
        } else {
            return 0;
        }
    }

    // Retorna o caminho da imagem da carta
    getImagePath() {
        const suitMap = {
            'paus': 'clubs',
            'copas': 'hearts',
            'espadas': 'spades',
            'ouros': 'diamonds'
        };
        const mappedSuit = suitMap[this.suit] || this.suit;
        return `cards/${mappedSuit}_${this.rank}.png`;
    }

    // Renderiza a carta como um elemento HTML
    render(isHidden = false) {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        if (isHidden) {
            cardElement.classList.add('hidden');
            const randomCover = Math.random() < 0.5 ? 'cover_blue' : 'cover_red';
            cardElement.classList.add(randomCover);
        }
        cardElement.dataset.suit = this.suit;
        cardElement.dataset.rank = this.rank;
        if (!isHidden) {
            cardElement.style.backgroundImage = `url(${this.getImagePath()})`;
        }
        return cardElement;
    }
}

// Definição da classe Player
class Player {
    constructor(name) {
        this.name = name;
        this.hand = [];
        this.score = 0;
        this.isTurn = false;
        this.cardsPlayedInRound = [];
        this.hasStartedTurn = false;
    }

    addCard(card) {
        this.hand.push(card);
    }

    playCard(cardIndex) {
        if (cardIndex >= 0 && cardIndex < this.hand.length) {
            const card = this.hand.splice(cardIndex, 1)[0];
            this.cardsPlayedInRound.push(card);
            return card;
        }
        return null;
    }

    resetHand() {
        this.hand = [];
        this.cardsPlayedInRound = [];
    }

    updateScore(points) {
        this.score += points;
    }

    reset() {
        this.hand = [];
        this.score = 0;
        this.isTurn = false;
        this.cardsPlayedInRound = [];
        this.hasStartedTurn = false;
    }
}

// Definição da classe Game para Truco Mineiro
class Game {
    constructor(player1Name, player2Name) {
        this.players = [new Player(player1Name), new Player(player2Name)];
        this.deck = [];
        this.table = [];
        this.history = [];
        this.currentPlayerIndex = 0;
        this.roundWinner = null;
        this.roundCount = 0;
        this.handPoints = [0, 0];
        this.isGameStarted = false;

        this.currentTrucoValue = 1;
        this.trucoCaller = null;
        this.isTrucoActive = false;
        this.trucoPendingResponse = false;

        this.initGame();
    }

    initGame() {
        this.createDeck();
        this.shuffleDeck();
        this.dealInitialCards(3);
        this.players[0].isTurn = true;
        this.isGameStarted = true;
        this.roundCount = 0;
        this.handPoints = [0, 0];
        this.history = [];
        this.players.forEach(player => player.hasStartedTurn = false);
        this.updatePlayerTurnDisplay();

        this.currentTrucoValue = 1;
        this.trucoCaller = null;
        this.isTrucoActive = false;
        this.trucoPendingResponse = false;
    }

    createDeck() {
        const suits = ['paus', 'copas', 'espadas', 'ouros'];
        const ranks = ['4', '5', '6', '7', 'Q', 'J', 'K', 'A', '2', '3'];
        for (const suit of suits) {
            for (const rank of ranks) {
                this.deck.push(new Card(suit, rank));
            }
        }
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealInitialCards(numCards) {
        this.players.forEach(player => player.resetHand());
        for (let i = 0; i < numCards; i++) {
            this.players[0].addCard(this.deck.pop());
            this.players[1].addCard(this.deck.pop());
        }
    }

    playCard(player, card) {
        if (this.trucoPendingResponse) {
            this.history.push(`${player.name} tentou jogar uma carta, mas há um pedido de truco pendente!`);
            return;
        }

        this.table.push({ player: player, card: card });
        this.history.push(`${player.name} jogou ${card.rank} de ${card.suit}`);

        if (this.table.length === 2) {
            this.determineRoundWinner();
            this.roundCount++;
            this.table = [];
            this.checkHandEnd();
        } else {
            this.nextPlayerTurn();
        }
    }

    determineRoundWinner() {
        const card1 = this.table[0].card;
        const card2 = this.table[1].card;
        const player1Index = this.players.indexOf(this.table[0].player);
        const player2Index = this.players.indexOf(this.table[1].player);

        const comparison = card1.compareTo(card2);

        if (comparison === 1) {
            this.handPoints[player1Index]++;
            this.roundWinner = player1Index;
            this.history.push(`${this.players[player1Index].name} venceu a rodada.`);
        } else if (comparison === -1) {
            this.handPoints[player2Index]++;
            this.roundWinner = player2Index;
            this.history.push(`${this.players[player2Index].name} venceu a rodada.`);
        } else {
            this.roundWinner = -1;
            this.history.push(`Rodada empatada!`);
        }
    }

    checkHandEnd() {
        if (this.handPoints[0] >= 2) {
            this.endHand(this.players[0]);
        } else if (this.handPoints[1] >= 2) {
            this.endHand(this.players[1]);
        } else if (this.roundCount === 3) {
            if (this.handPoints[0] > this.handPoints[1]) {
                this.endHand(this.players[0]);
            } else if (this.handPoints[1] > this.handPoints[0]) {
                this.endHand(this.players[1]);
            } else {
                this.endHand(null);
            }
        } else {
            if (this.roundWinner !== -1) {
                this.currentPlayerIndex = this.roundWinner;
            } else {
                this.currentPlayerIndex = 0;
            }
            this.players.forEach(player => player.hasStartedTurn = false);
            this.updatePlayerTurnDisplay();
        }
    }

    endHand(winner, pointsAlreadyAwarded = false) {
        if (winner) {
            if (!pointsAlreadyAwarded) {
                winner.updateScore(this.currentTrucoValue);
                this.history.push(`${winner.name} venceu a mão e ganhou ${this.currentTrucoValue} pontos!`);
            }
        } else {
            this.history.push("Mão empatada. Ninguém marcou pontos.");
        }
        this.initGame();
        updateUI();
    }

    resetRoundState() {
        this.table = [];
        this.roundWinner = null;
        this.roundCount = 0;
        this.handPoints = [0, 0];
        this.players.forEach(player => player.cardsPlayedInRound = []);

        this.currentTrucoValue = 1;
        this.trucoCaller = null;
        this.isTrucoActive = false;
        this.trucoPendingResponse = false;
    }

    nextPlayerTurn() {
        this.players[this.currentPlayerIndex].isTurn = false;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.players[this.currentPlayerIndex].isTurn = true;
        this.players.forEach(player => player.hasStartedTurn = false);
        this.history.push(`É a vez de ${this.players[this.currentPlayerIndex].name}`);
        this.updatePlayerTurnDisplay();
    }

    updatePlayerTurnDisplay() {
        this.players[0].isTurn = (this.currentPlayerIndex === 0);
        this.players[1].isTurn = (this.currentPlayerIndex === 1);
    }

    resetGame() {
        this.players.forEach(player => player.reset());
        this.initGame();
        updateUI();
    }

    callTruco() {
        if (this.isTrucoActive) {
            this.history.push("Truco já foi pedido!");
            return;
        }
        this.isTrucoActive = true;
        this.trucoPendingResponse = true;
        this.trucoCaller = this.currentPlayerIndex;
        this.currentTrucoValue = 3;
        this.history.push(`${this.players[this.trucoCaller].name} pediu Truco!`);
        this.nextPlayerTurn();
        updateUI();
    }

    acceptTruco() {
        this.isTrucoActive = true;
        this.trucoPendingResponse = false;
        this.history.push(`${this.players[this.currentPlayerIndex].name} aceitou o Truco! A mão agora vale ${this.currentTrucoValue} pontos.`);
        updateUI();
    }

    denyTruco() {
        const winnerIndex = this.trucoCaller;
        const pointsAwarded = this.currentTrucoValue - 2;
        this.players[winnerIndex].updateScore(pointsAwarded);
        this.history.push(`${this.players[this.currentPlayerIndex].name} negou o Truco! ${this.players[winnerIndex].name} ganha ${pointsAwarded} ponto(s).`);
        this.endHand(this.players[winnerIndex], true);
    }

    increaseTruco() {
        if (this.trucoCaller === this.currentPlayerIndex) {
            this.history.push("Você não pode aumentar seu próprio truco!");
            return;
        }

        let nextValue = this.currentTrucoValue;
        if (nextValue === 1) nextValue = 3;
        else if (nextValue === 3) nextValue = 6;
        else if (nextValue === 6) nextValue = 9;
        else if (nextValue === 9) nextValue = 12;
        else {
            this.history.push("A aposta já está no máximo (12).");
            return;
        }

        this.currentTrucoValue = nextValue;
        this.trucoCaller = this.currentPlayerIndex;
        this.trucoPendingResponse = true;
        this.history.push(`${this.players[this.trucoCaller].name} pediu ${this.currentTrucoValue}!`);
        this.nextPlayerTurn();
        updateUI();
    }
}

let game;
const player1Name = localStorage.getItem('player1Name') || 'Jogador 1';
const player2Name = localStorage.getItem('player2Name') || 'Jogador 2';

function updateScoreboard() {
    const placarTabelaBody = document.querySelector('#placar-tabela tbody');
    if (!placarTabelaBody) return;

    placarTabelaBody.innerHTML = '';
    game.players.forEach(player => {
        const row = placarTabelaBody.insertRow();
        const nameCell = row.insertCell();
        const scoreCell = row.insertCell();
        nameCell.textContent = player.name;
        scoreCell.textContent = player.score;

        if (player.isTurn) {
            row.classList.add('jogador-da-vez');
        } else {
            row.classList.remove('jogador-da-vez');
        }
    });
}

function renderPlayerHand(player, handElementId) {
    const handElement = document.getElementById(handElementId);
    if (!handElement) return;

    handElement.innerHTML = '';
    player.hand.forEach((card, index) => {
        let isCardHidden = false;
        if (game.players.indexOf(player) !== game.currentPlayerIndex) {
            isCardHidden = true;
        }
        if (player.isTurn && !player.hasStartedTurn) {
            isCardHidden = true;
        }

        const cardElement = card.render(isCardHidden);
        if (player.isTurn && !isCardHidden && !game.trucoPendingResponse) {
            cardElement.addEventListener('click', (event) => handleCardPlay(player, card, index, event));
        }
        handElement.appendChild(cardElement);
    });

    const playerArea = handElement.closest('.area-jogador');
    if (playerArea) {
        if (player.isTurn) {
            playerArea.classList.add('jogador-da-vez-area');
        } else {
            playerArea.classList.remove('jogador-da-vez-area');
        }
    }
}

function renderTable() {
    const mesaElement = document.getElementById('mesa');
    if (!mesaElement) return;

    mesaElement.innerHTML = '';
    if (game.table.length > 0) {
        game.table.forEach(playedCard => {
            const cardElement = playedCard.card.render();
            cardElement.classList.add('card-on-table');
            mesaElement.appendChild(cardElement);
        });
    }
}

function updateHistory() {
    const historicoLista = document.getElementById('historico-lista');
    if (!historicoLista) return;

    historicoLista.innerHTML = '';
    game.history.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = entry;
        historicoLista.appendChild(li);
    });
    historicoLista.scrollTop = historicoLista.scrollHeight;
}

function handleCardPlay(player, card, cardIndex, event) {
    if (!game.isGameStarted || !player.isTurn || !player.hasStartedTurn || game.trucoPendingResponse) {
        return;
    }

    const cardElement = event.target.closest('.card');
    if (cardElement) {
        cardElement.remove();
        const playedCardElement = card.render();
        playedCardElement.classList.add('card-played-animation');
        document.getElementById('mesa').appendChild(playedCardElement);

        setTimeout(() => {
            game.playCard(player, player.playCard(cardIndex));
            updateUI();
        }, 500);
    }
}

function updateUI() {
    updateScoreboard();
    renderPlayerHand(game.players[0], 'mao-jogador-1');
    renderPlayerHand(game.players[1], 'mao-jogador-2');
    renderTable();
    updateHistory();

    document.getElementById('nome-jogador-1').textContent = game.players[0].name;
    document.getElementById('nome-jogador-2').textContent = game.players[1].name;

    const btnComecarJogada = document.getElementById('btn-comecar-jogada');
    if (btnComecarJogada) {
        const currentPlayer = game.players[game.currentPlayerIndex];
        btnComecarJogada.disabled = !currentPlayer.isTurn || currentPlayer.hasStartedTurn || game.trucoPendingResponse;
        if (currentPlayer.isTurn && !currentPlayer.hasStartedTurn && !game.trucoPendingResponse) {
            btnComecarJogada.style.display = 'block';
        } else {
            btnComecarJogada.style.display = 'none';
        }
    }

    const btnTruco = document.getElementById('btn-truco');
    const trucoOptions = document.getElementById('truco-options');
    const btnAceitarTruco = document.getElementById('btn-aceitar-truco');
    const btnNegarTruco = document.getElementById('btn-negar-truco');
    const btnAumentarTruco = document.getElementById('btn-aumentar-truco');

    if (btnTruco && trucoOptions && btnAceitarTruco && btnNegarTruco && btnAumentarTruco) {
        const currentPlayer = game.players[game.currentPlayerIndex];

        if (game.trucoPendingResponse) {
            btnTruco.style.display = 'none';
            trucoOptions.style.display = 'block';
            btnAceitarTruco.disabled = (game.trucoCaller === game.currentPlayerIndex);
            btnNegarTruco.disabled = (game.trucoCaller === game.currentPlayerIndex);
            btnAumentarTruco.disabled = (game.trucoCaller === game.currentPlayerIndex) || (game.currentTrucoValue === 12);
        } else {
            btnTruco.style.display = 'block';
            trucoOptions.style.display = 'none';
            btnTruco.disabled = !currentPlayer.isTurn || game.isTrucoActive;
        }
    }
}

function setupGamePage() {
    if (document.body.classList.contains('jogo-page')) {
        game = new Game(player1Name, player2Name);
        updateUI();

        document.getElementById('btn-comecar-jogada').addEventListener('click', () => {
            const currentPlayer = game.players[game.currentPlayerIndex];
            if (currentPlayer.isTurn && !currentPlayer.hasStartedTurn) {
                currentPlayer.hasStartedTurn = true;
                updateUI();
            }
        });

        document.getElementById('btn-truco').addEventListener('click', () => {
            game.callTruco();
        });

        document.getElementById('btn-aceitar-truco').addEventListener('click', () => {
            game.acceptTruco();
        });

        document.getElementById('btn-negar-truco').addEventListener('click', () => {
            game.denyTruco();
        });

        document.getElementById('btn-aumentar-truco').addEventListener('click', () => {
            game.increaseTruco();
        });

        document.getElementById('btn-reset').addEventListener('click', () => {
            game.resetGame();
        });

        const modal = document.getElementById('modal-regras');
        const btnComoJogar = document.getElementById('btn-como-jogar');
        const closeButton = document.querySelector('.close-button');
        const regrasConteudo = document.getElementById('regras-conteudo');

        const regrasTruco = `
            <h3>Objetivo</h3>
            <p>O objetivo do Truco Mineiro é ser o primeiro a atingir 12 pontos. Cada mão vale 1 ponto, podendo ser aumentada para 3, 6, 9 ou 12 pontos através do pedido de Truco.</p>

            <h3>Cartas</h3>
            <p>O baralho é composto por 40 cartas (sem 8s, 9s e 10s). Cada jogador recebe 3 cartas.</p>

            <h3>Manilha Fixa (Ordem de Força Decrescente)</h3>
            <ul>
                <li><strong>4 de Paus (Zap):</strong> A mais forte de todas.</li>
                <li><strong>7 de Copas (Copeta):</strong> Segunda mais forte.</li>
                <li><strong>Ás de Espadas (Espadilha):</strong> Terceira mais forte.</li>
                <li><strong>7 de Ouros (Pica-fumo):</strong> Quarta mais forte.</li>
            </ul>
            <p>As demais cartas seguem a ordem decrescente de força: 3, 2, A (exceto Espadilha), K, J, Q, 7 (exceto Copeta e Ouros), 6, 5, 4 (exceto Paus).</p>

            <h3>Desenvolvimento da Mão</h3>
            <p>Uma mão é disputada em até 3 rodadas. O jogador que vencer a maioria das rodadas (2 de 3) ganha a mão. Em caso de empate na primeira ou segunda rodada, a vitória é decidida na rodada seguinte. Se houver empate na terceira rodada, a mão é considerada empatada.</p>

            <h3>Pontuação</h3>
            <ul>
                <li>Cada mão vale 1 ponto.</li>
                <li>Ao "pedir Truco", a mão passa a valer 3 pontos. Se aceito, o jogo continua. Se recusado, o time que pediu ganha 1 ponto.</li>
                <li>Se o Truco for aceito, o adversário pode pedir "Seis", aumentando a mão para 6 pontos, e assim sucessivamente para "Nove" e "Doze".</li>
            </ul>

            <h3>Como Jogar no Sistema</h3>
            <p>1. Na página inicial, insira os nomes dos jogadores.</p>
            <p>2. Clique em "Iniciar Jogo".</p>
            <p>3. Na página do jogo, o jogador da vez verá o botão "Começar Jogada". Clique nele para revelar suas cartas.</p>
            <p>4. Clique em uma de suas cartas para jogá-la na mesa.</p>
            <p>5. O outro jogador fará o mesmo. Após ambos jogarem, o vencedor da rodada será determinado.</p>
            <p>6. O jogo continua até que um jogador atinja 12 pontos.</p>
        `;

        regrasConteudo.innerHTML = regrasTruco;

        btnComoJogar.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        closeButton.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function setupCadastroPage() {
    const setupForm = document.getElementById('setup-form');
    if (setupForm) {
        setupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const p1Name = document.getElementById('player1').value;
            const p2Name = document.getElementById('player2').value;

            localStorage.setItem('player1Name', p1Name);
            localStorage.setItem('player2Name', p2Name);

            window.location.href = 'jogo.html';
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('cadastro-page')) {
        setupCadastroPage();
    } else if (document.body.classList.contains('jogo-page')) {
        setupGamePage();
    }
});

