const boardEl = document.getElementById('board');
const modeSelect = document.getElementById('mode');
const startBtn = document.getElementById('startBtn');
const resetScoreBtn = document.getElementById('resetScore');
const turnPlayerEl = document.getElementById('turnPlayer');
const messageEl = document.getElementById('message');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');

let board = Array(9).fill(null);
let activePlayer = 'X';
let gameActive = false;
let scores = { X: 0, O: 0 };
let isVsComputer = false;

const winningCombos = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function initGrid() {
  boardEl.innerHTML = '';
  for (let i = 0; i < 9; i++) {
    const btn = document.createElement('button');
    btn.className = 'cell';
    btn.dataset.index = i;
    btn.addEventListener('click', handleCellClick);
    boardEl.appendChild(btn);
  }
}

function startNewGame() {
  board.fill(null);
  activePlayer = 'X';
  gameActive = true;
  isVsComputer = modeSelect.value === 'ai';

  const cells = boardEl.querySelectorAll('.cell');
  cells.forEach(cell => {
    cell.textContent = '';
    cell.disabled = false;
    cell.className = 'cell';
  });

  turnPlayerEl.textContent = activePlayer;
  messageEl.textContent = isVsComputer ? 'Playing vs Computer' : '2 Player mode';
}

function handleCellClick(e) {
  const index = Number(e.currentTarget.dataset.index);
  if (!gameActive || board[index]) return;

  executeMove(index, activePlayer);

  if (gameActive && isVsComputer && activePlayer === 'O') {
    // delay ai move
    boardEl.querySelectorAll('.cell').forEach(c => c.disabled = true);
    setTimeout(() => {
      const bestIdx = findBestMove(board, 'O');
      if (bestIdx !== null) executeMove(bestIdx, 'O');
      if (gameActive) {
        boardEl.querySelectorAll('.cell').forEach((c, idx) => {
          if (!board[idx]) c.disabled = false;
        });
      }
    }, 250);
  }
}

function executeMove(index, player) {
  board[index] = player;
  
  const cell = boardEl.children[index];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());
  cell.disabled = true;

  const winInfo = checkWinner(board);

  if (winInfo) {
    gameActive = false;
    scores[winInfo.winner]++;
    scoreXEl.textContent = scores.X;
    scoreOEl.textContent = scores.O;
    winInfo.combo.forEach(idx => boardEl.children[idx].classList.add('win'));
    messageEl.textContent = `Player ${winInfo.winner} wins!`;
    return;
  }

  if (board.every(Boolean)) {
    gameActive = false;
    messageEl.textContent = "It's a draw!";
    return;
  }

  activePlayer = activePlayer === 'X' ? 'O' : 'X';
  turnPlayerEl.textContent = activePlayer;
}

function checkWinner(state) {
  for (const combo of winningCombos) {
    const [a, b, c] = combo;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) {
      return { winner: state[a], combo };
    }
  }
  return null;
}

function resetScores() {
  scores = { X: 0, O: 0 };
  scoreXEl.textContent = '0';
  scoreOEl.textContent = '0';
  messageEl.textContent = 'Scores cleared';
}

// AI logic
function findBestMove(currentBoard, aiPlayer) {
  const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Quick opening
  if (currentBoard[4] === null) return 4;

  function evaluate(state, depth, isMaximizing) {
    const winData = checkWinner(state);
    if (winData?.winner === aiPlayer) return 10 - depth;
    if (winData?.winner === humanPlayer) return depth - 10;
    if (state.every(Boolean)) return 0;

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!state[i]) {
          state[i] = aiPlayer;
          maxScore = Math.max(maxScore, evaluate(state, depth + 1, false));
          state[i] = null;
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!state[i]) {
          state[i] = humanPlayer;
          minScore = Math.min(minScore, evaluate(state, depth + 1, true));
          state[i] = null;
        }
      }
      return minScore;
    }
  }

  let bestVal = -Infinity;
  let move = null;

  for (let i = 0; i < 9; i++) {
    if (!currentBoard[i]) {
      currentBoard[i] = aiPlayer;
      const score = evaluate(currentBoard, 0, false);
      currentBoard[i] = null;
      if (score > bestVal) {
        bestVal = score;
        move = i;
      }
    }
  }

  return move;
}

// building
initGrid();
startNewGame();

startBtn.addEventListener('click', startNewGame);
resetScoreBtn.addEventListener('click', resetScores);
modeSelect.addEventListener('change', startNewGame);