// Seleciona os elementos do DOM
const board = document.getElementById('board'); // Tabuleiro do jogo
const messageDiv = document.getElementById('message'); // Div para exibir mensagens
const blueTimerDisplay = document.getElementById('blue-timer'); // Cronômetro do jogador azul
const redTimerDisplay = document.getElementById('red-timer'); // Cronômetro do jogador vermelho
let pieces = []; // Array para armazenar as peças do jogo
let currentPlayer = 'blue'; // Jogador atual (azul ou vermelho)
let selectedPiece = null; // Peça selecionada para movimento
let difficulty = 'easy'; // Dificuldade da IA
let gameStarted = false; // Estado do jogo (iniciado ou não)

// Variáveis para cronometrar o tempo
let blueTime = 0; // Tempo acumulado do jogador azul
let redTime = 0; // Tempo acumulado do jogador vermelho
let blueTimerInterval; // Intervalo do cronômetro do jogador azul
let redTimerInterval; // Intervalo do cronômetro do jogador vermelho
let moveStartTime; // Tempo de início da jogada atual

// Função para criar o tabuleiro
function createBoard() {
    if (gameStarted) return; // Se o jogo já começou, não faz nada
    gameStarted = true; // Marca o jogo como iniciado

    board.innerHTML = ''; // Limpa o tabuleiro
    pieces = []; // Reinicia o array de peças
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            // Cria uma célula (tile) para cada posição do tabuleiro
            const tile = document.createElement('div');
            tile.className = `tile ${(i + j) % 2 === 0 ? 'light' : 'dark'}`; // Alterna entre cores claras e escuras
            tile.dataset.row = i; // Armazena a linha da célula
            tile.dataset.col = j; // Armazena a coluna da célula
            board.appendChild(tile); // Adiciona a célula ao tabuleiro

            // Coloca as peças nas posições iniciais
            if ((i + j) % 2 !== 0 && (i < 3 || i > 4)) {
                const piece = document.createElement('div');
                piece.className = `piece ${i < 3 ? 'red' : 'blue'}`; // Define a cor da peça
                piece.dataset.row = i; // Armazena a linha da peça
                piece.dataset.col = j; // Armazena a coluna da peça
                pieces.push(piece); // Adiciona a peça ao array de peças
                tile.appendChild(piece); // Adiciona a peça à célula
            }
        }
    }

    // Adiciona um listener para cliques no tabuleiro
    board.addEventListener('click', handleBoardClick);
    messageDiv.textContent = 'O jogo começou! Boa sorte!'; // Exibe uma mensagem de início

    // Inicia o cronômetro para o primeiro jogador (azul)
    moveStartTime = new Date();
    startBlueTimer();
}

// Função para lidar com cliques no tabuleiro
function handleBoardClick(event) {
    const tile = event.target.closest('.tile'); // Obtém a célula clicada
    if (!tile) return; // Se não for uma célula, ignora

    const row = parseInt(tile.dataset.row); // Obtém a linha da célula
    const col = parseInt(tile.dataset.col); // Obtém a coluna da célula

    if (selectedPiece) {
        // Se uma peça já foi selecionada, tenta mover para a célula clicada
        if (isValidMove(selectedPiece, row, col)) {
            movePiece(selectedPiece, row, col); // Move a peça
            selectedPiece = null; // Desmarca a peça selecionada
        } else {
            alert("Movimento inválido! Tente novamente."); // Alerta de movimento inválido
            selectedPiece = null; // Desmarca a peça selecionada
        }
    } else {
        // Se nenhuma peça foi selecionada, tenta selecionar uma peça
        const piece = pieces.find(
            p => parseInt(p.dataset.row) === row && parseInt(p.dataset.col) === col && p.classList.contains(currentPlayer)
        );
        if (piece) selectedPiece = piece; // Seleciona a peça
    }
}

// Função para mover uma peça
function movePiece(piece, newRow, newCol) {
    const oldRow = parseInt(piece.dataset.row); // Linha atual da peça
    const oldCol = parseInt(piece.dataset.col); // Coluna atual da peça
    const rowDiff = Math.abs(newRow - oldRow); // Diferença de linhas
    const colDiff = Math.abs(newCol - oldCol); // Diferença de colunas

    // Verifica se o movimento é diagonal
    if (rowDiff !== colDiff) return;

    // Verifica se a casa de destino está vazia
    const targetTile = pieces.find(p => parseInt(p.dataset.row) === newRow && parseInt(p.dataset.col) === newCol);
    if (targetTile) return;

    // Movimentação da Dama
    if (piece.classList.contains('king')) {
        const moveDirectionRow = newRow > oldRow ? 1 : -1; // Direção da movimentação (linha)
        const moveDirectionCol = newCol > oldCol ? 1 : -1; // Direção da movimentação (coluna)
        let capturedPieces = []; // Array para armazenar peças capturadas

        // Verifica se há peças no caminho
        for (let i = 1; i < rowDiff; i++) {
            const checkRow = oldRow + i * moveDirectionRow;
            const checkCol = oldCol + i * moveDirectionCol;
            const middlePiece = pieces.find(p => parseInt(p.dataset.row) === checkRow && parseInt(p.dataset.col) === checkCol);

            if (middlePiece) {
                if (middlePiece.classList.contains(currentPlayer)) {
                    // Bloqueia o movimento se encontrar uma peça da mesma cor no caminho
                    return;
                } else {
                    capturedPieces.push(middlePiece); // Adiciona a peça capturada ao array
                }
            }
        }

        // Se chegou aqui, o movimento é válido
        piece.dataset.row = newRow; // Atualiza a linha da peça
        piece.dataset.col = newCol; // Atualiza a coluna da peça
        pieces = pieces.filter(p => !capturedPieces.includes(p)); // Remove as peças capturadas
        updateBoard(); // Atualiza o tabuleiro

        if (capturedPieces.length > 0 && canCaptureAgain(piece)) {
            selectedPiece = piece; // Permite capturas múltiplas
        } else {
            checkForWin(); // Verifica se há um vencedor
            switchPlayer(); // Alterna o jogador
        }
    } else {
        // Movimentação de peças normais
        if (rowDiff === 1 && colDiff === 1) {
            // Movimento simples (não captura)
            if (!piece.classList.contains('king') && (
                (piece.classList.contains('blue') && newRow > oldRow) ||
                (piece.classList.contains('red') && newRow < oldRow)
            )) {
                return; // Bloqueia movimento para trás de peças normais
            }
            piece.dataset.row = newRow; // Atualiza a linha da peça
            piece.dataset.col = newCol; // Atualiza a coluna da peça
            checkForPromotion(piece); // Verifica se a peça deve ser promovida a dama
            updateBoard(); // Atualiza o tabuleiro
            switchPlayer(); // Alterna o jogador
        } else if (rowDiff === 2 && colDiff === 2) {
            // Movimento de captura
            const middleRow = (newRow + oldRow) / 2;
            const middleCol = (newCol + oldCol) / 2;
            const capturedPiece = pieces.find(
                p => parseInt(p.dataset.row) === middleRow && parseInt(p.dataset.col) === middleCol && !p.classList.contains(currentPlayer)
            );
            if (capturedPiece) {
                piece.dataset.row = newRow; // Atualiza a linha da peça
                piece.dataset.col = newCol; // Atualiza a coluna da peça
                pieces = pieces.filter(p => p !== capturedPiece); // Remove a peça capturada
                checkForPromotion(piece); // Verifica se a peça deve ser promovida a dama
                updateBoard(); // Atualiza o tabuleiro

                if (canCaptureAgain(piece)) {
                    selectedPiece = piece; // Permite capturas múltiplas
                } else {
                    checkForWin(); // Verifica se há um vencedor
                    switchPlayer(); // Alterna o jogador
                }
            }
        }
    }
}

// Função para verificar se uma peça pode capturar novamente
function canCaptureAgain(piece) {
    const row = parseInt(piece.dataset.row); // Linha da peça
    const col = parseInt(piece.dataset.col); // Coluna da peça

    if (piece.classList.contains('king')) {
        // Verifica movimentos possíveis para damas
        for (const [rowOffset, colOffset] of [[2, 2], [2, -2], [-2, 2], [-2, -2]]) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (isValidMove(piece, newRow, newCol)) {
                return true; // Retorna verdadeiro se houver um movimento de captura válido
            }
        }
    } else {
        // Verifica movimentos possíveis para peças normais
        for (const [rowOffset, colOffset] of [[2, 2], [2, -2]]) {
            const newRow = row + rowOffset;
            const newCol = col + colOffset;
            if (isValidMove(piece, newRow, newCol)) {
                return true; // Retorna verdadeiro se houver um movimento de captura válido
            }
        }
    }

    return false; // Retorna falso se não houver movimentos de captura válidos
}

// Função para verificar se uma peça deve ser promovida a dama
function checkForPromotion(piece) {
    const row = parseInt(piece.dataset.row); // Linha da peça
    if (piece.classList.contains('blue') && row === 0) {
        piece.classList.add('king'); // Promove a peça azul se alcançar a linha 0
    } else if (piece.classList.contains('red') && row === 7) {
        piece.classList.add('king'); // Promove a peça vermelha se alcançar a linha 7
    }
}

// Função para atualizar o tabuleiro
function updateBoard() {
    board.querySelectorAll('.tile').forEach(tile => tile.innerHTML = ''); // Limpa todas as células
    pieces.forEach(piece => {
        const row = parseInt(piece.dataset.row); // Linha da peça
        const col = parseInt(piece.dataset.col); // Coluna da peça
        const tile = board.querySelector(`.tile[data-row="${row}"][data-col="${col}"]`); // Encontra a célula correta
        tile.appendChild(piece); // Adiciona a peça à célula
    });
}

// Função para alternar o jogador
function switchPlayer() {
    const moveEndTime = new Date(); // Tempo de término da jogada
    const moveTime = Math.round((moveEndTime - moveStartTime) / 1000); // Tempo da jogada em segundos

    // Atualiza o tempo total do jogador atual
    if (currentPlayer === 'blue') {
        blueTime += moveTime; // Adiciona o tempo ao jogador azul
    } else {
        redTime += moveTime; // Adiciona o tempo ao jogador vermelho
    }
    updateTimers(); // Atualiza a exibição dos cronômetros

    currentPlayer = currentPlayer === 'blue' ? 'red' : 'blue'; // Alterna o jogador

    // Inicia o cronômetro para o próximo jogador
    moveStartTime = new Date();

    if (currentPlayer === 'red' && difficulty !== 'none') {
        setTimeout(makeAIMove, 500); // Faz a jogada da IA após 500ms
    }
}

// Função para a IA fazer uma jogada
function makeAIMove() {
    const possibleMoves = []; // Array para armazenar movimentos possíveis
    pieces.filter(p => p.classList.contains('red')).forEach(piece => {
        const row = parseInt(piece.dataset.row); // Linha da peça
        const col = parseInt(piece.dataset.col); // Coluna da peça

        if (piece.classList.contains('king')) {
            // Movimentos possíveis para damas
            [[1, 1], [1, -1], [-1, 1], [-1, -1], [2, 2], [2, -2], [-2, 2], [-2, -2]].forEach(([rowOffset, colOffset]) => {
                const newRow = row + rowOffset;
                const newCol = col + colOffset;
                if (isValidMove(piece, newRow, newCol)) {
                    possibleMoves.push({piece, newRow, newCol}); // Adiciona o movimento possível
                }
            });
        } else {
            // Movimentos possíveis para peças normais
            [[1, 1], [1, -1], [2, 2], [2, -2]].forEach(([rowOffset, colOffset]) => {
                const newRow = row + rowOffset;
                const newCol = col + colOffset;
                if (isValidMove(piece, newRow, newCol)) {
                    possibleMoves.push({piece, newRow, newCol}); // Adiciona o movimento possível
                }
            });
        }
    });

    if (possibleMoves.length > 0) {
        let move;
        if (difficulty === 'easy') {
            // Dificuldade Fácil: Movimento aleatório
            move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else if (difficulty === 'medium') {
            // Dificuldade Média: Prioriza capturas, mas faz movimentos simples
            move = possibleMoves.find(m => Math.abs(m.newRow - parseInt(m.piece.dataset.row)) === 2) || possibleMoves[0];
        } else if (difficulty === 'hard') {
            // Dificuldade Difícil: Prioriza capturas múltiplas e maximiza o número de peças capturadas
            move = possibleMoves.sort((a, b) => {
                const aCaptures = Math.abs(a.newRow - parseInt(a.piece.dataset.row)) === 2 ? 1 : 0;
                const bCaptures = Math.abs(b.newRow - parseInt(b.piece.dataset.row)) === 2 ? 1 : 0;
                return bCaptures - aCaptures; // Ordena por capturas
            })[0];
        }
        movePiece(move.piece, move.newRow, move.newCol); // Executa o movimento escolhido
    }
}

// Função para verificar se um movimento é válido
function isValidMove(piece, newRow, newCol) {
    if (newRow < 0 || newRow >= 8 || newCol < 0 || newCol >= 8) return false; // Verifica se está dentro do tabuleiro

    const targetTile = pieces.find(
        p => parseInt(p.dataset.row) === newRow && parseInt(p.dataset.col) === newCol
    );
    if (targetTile) return false; // Verifica se a célula de destino está ocupada

    const oldRow = parseInt(piece.dataset.row); // Linha atual da peça
    const oldCol = parseInt(piece.dataset.col); // Coluna atual da peça
    const rowDiff = Math.abs(newRow - oldRow); // Diferença de linhas
    const colDiff = Math.abs(newCol - oldCol); // Diferença de colunas

    // Verifica se o movimento é diagonal
    if (rowDiff !== colDiff) return false;

    if (piece.classList.contains('king')) {
        // Movimento de dama
        const moveDirectionRow = newRow > oldRow ? 1 : -1; // Direção da movimentação (linha)
        const moveDirectionCol = newCol > oldCol ? 1 : -1; // Direção da movimentação (coluna)

        // Verifica se há peças no caminho
        for (let i = 1; i < rowDiff; i++) {
            const checkRow = oldRow + i * moveDirectionRow;
            const checkCol = oldCol + i * moveDirectionCol;
            const middlePiece = pieces.find(p => parseInt(p.dataset.row) === checkRow && parseInt(p.dataset.col) === checkCol);

            if (middlePiece) {
                if (middlePiece.classList.contains(currentPlayer)) {
                    // Bloqueia o movimento se encontrar uma peça da mesma cor no caminho
                    return false;
                } else {
                    // Verifica se a peça adversária pode ser capturada
                    const nextRow = checkRow + moveDirectionRow;
                    const nextCol = checkCol + moveDirectionCol;
                    if (nextRow === newRow && nextCol === newCol) {
                        return true; // Movimento de captura válido
                    } else {                        return false; // Movimento inválido
                    }
                }
            }
        }
        return true; // Movimento válido se não houver peças no caminho
    } else {
        // Movimento de peça normal
        if (rowDiff === 1 && colDiff === 1) {
            return true; // Movimento simples (não captura)
        } else if (rowDiff === 2 && colDiff === 2) {
            const middleRow = (newRow + oldRow) / 2;
            const middleCol = (newCol + oldCol) / 2;
            const middlePiece = pieces.find(
                p => parseInt(p.dataset.row) === middleRow && parseInt(p.dataset.col) === middleCol && !p.classList.contains(currentPlayer)
            );
            return middlePiece !== undefined; // Movimento de captura
        }
    }

    return false; // Movimento inválido
}

// Função para verificar se há um vencedor
function checkForWin() {
    if (pieces.every(p => p.classList.contains('blue'))) {
        endGame('Parabéns, você venceu!'); // Jogador azul venceu
    } else if (pieces.every(p => p.classList.contains('red'))) {
        endGame('Você perdeu! Tente novamente.'); // Jogador vermelho venceu
    }
}

// Função para iniciar o jogo em modo single player
function startSinglePlayer() {
    difficulty = document.getElementById('difficulty').value; // Obtém a dificuldade selecionada
    document.getElementById('difficulty-selection').style.display = 'none'; // Oculta a seleção de dificuldade
    createBoard(); // Cria o tabuleiro e inicia o jogo
}

// Função para iniciar o jogo em modo multiplayer local
function startLocalMultiplayer() {
    difficulty = 'none'; // Define que não há IA (multiplayer local)
    createBoard(); // Cria o tabuleiro e inicia o jogo
}

// Função para iniciar o jogo em modo multiplayer global (não implementado)
function startGlobalMultiplayer() {
    alert('Multiplayer global não está implementado.'); // Exibe um alerta informando que não está implementado
}

// Função para exibir as regras do jogo
function showRules() {
    document.getElementById('rules').style.display = 'block'; // Exibe a seção de regras
}

// Função para ocultar as regras do jogo
function hideRules() {
    document.getElementById('rules').style.display = 'none'; // Oculta a seção de regras
}

// Função para exibir a seleção de dificuldade
function showDifficultySelection() {
    document.getElementById('difficulty-selection').style.display = 'block'; // Exibe a seleção de dificuldade
}

// Função para finalizar o jogo
function endGame(message) {
    stopBlueTimer(); // Para o cronômetro do jogador azul
    stopRedTimer(); // Para o cronômetro do jogador vermelho
    const totalBlueTime = formatTime(blueTime); // Formata o tempo total do jogador azul
    const totalRedTime = formatTime(redTime); // Formata o tempo total do jogador vermelho
    const userResponse = confirm(`${message}\nTempo Azul: ${totalBlueTime}\nTempo Vermelho: ${totalRedTime}\nDeseja jogar novamente?`);
    if (userResponse) {
        resetGame(); // Reinicia o jogo se o usuário confirmar
    } else {
        messageDiv.textContent = 'Obrigado por jogar!'; // Exibe uma mensagem de agradecimento
        gameStarted = false; // Marca o jogo como não iniciado
    }
}

// Função para reiniciar o jogo
function resetGame() {
    resetTimers(); // Reinicia os cronômetros
    createBoard(); // Recria o tabuleiro
    gameStarted = false; // Marca o jogo como não iniciado
}

// Funções para controlar os cronômetros

// Inicia o cronômetro do jogador azul
function startBlueTimer() {
    blueTimerInterval = setInterval(() => {
        blueTime++; // Incrementa o tempo do jogador azul
        updateTimers(); // Atualiza a exibição dos cronômetros
    }, 1000); // Executa a cada segundo
}

// Inicia o cronômetro do jogador vermelho
function startRedTimer() {
    redTimerInterval = setInterval(() => {
        redTime++; // Incrementa o tempo do jogador vermelho
        updateTimers(); // Atualiza a exibição dos cronômetros
    }, 1000); // Executa a cada segundo
}

// Para o cronômetro do jogador azul
function stopBlueTimer() {
    clearInterval(blueTimerInterval); // Limpa o intervalo do cronômetro
}

// Para o cronômetro do jogador vermelho
function stopRedTimer() {
    clearInterval(redTimerInterval); // Limpa o intervalo do cronômetro
}


function updateTimers() {
    document.getElementById('blue-timer').textContent = `Tempo Azul: ${formatTime(blueTime)}`; 
    document.getElementById('red-timer').textContent = `Tempo Vermelho: ${formatTime(redTime)}`; 
}


function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60); 
    const secs = seconds % 60; 
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`; 
}


function resetTimers() {
    stopBlueTimer(); 
    stopRedTimer(); 
    blueTime = 0; 
    redTime = 0; 
    updateTimers(); 
}

function saveGame() {
    const gameState = {
        currentPlayer: currentPlayer,
        blueTime: blueTime,
        redTime: redTime,
        pieces: pieces.map(piece => ({
            row: parseInt(piece.dataset.row),
            col: parseInt(piece.dataset.col),
            color: piece.classList.contains('blue') ? 'blue' : 'red',
            isKing: piece.classList.contains('king')
        }))
    };
    localStorage.setItem('damasGame', JSON.stringify(gameState));
    alert('Jogo salvo!');
}

function loadGame() {
    const savedGame = localStorage.getItem('damasGame');
    if (savedGame) {
        const gameState = JSON.parse(savedGame);
        currentPlayer = gameState.currentPlayer;
        blueTime = gameState.blueTime;
        redTime = gameState.redTime;
        pieces = gameState.pieces.map(pieceData => {
            const piece = document.createElement('div');
            piece.className = `piece ${pieceData.color} ${pieceData.isKing ? 'king' : ''}`;
            piece.dataset.row = pieceData.row;
            piece.dataset.col = pieceData.col;
            return piece;
        });

        updateBoard();
        updateTimers();
        alert('Jogo carregado!');
    } else {
        alert('Não há jogo salvo.');
    }
}


showDifficultySelection(); 