// ゲーム状態
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let nextStarter = 'X'; // 次のゲームの先手
let scores = {
    X: 0,
    O: 0,
    draw: 0
};

// 勝利パターン
const winningConditions = [
    [0, 1, 2], // 横1
    [3, 4, 5], // 横2
    [6, 7, 8], // 横3
    [0, 3, 6], // 縦1
    [1, 4, 7], // 縦2
    [2, 5, 8], // 縦3
    [0, 4, 8], // 斜め1
    [2, 4, 6]  // 斜め2
];

// DOM要素
const cells = document.querySelectorAll('.cell');
const currentPlayerText = document.getElementById('current-player-symbol');
const resetButton = document.getElementById('reset-button');
const clearScoreButton = document.getElementById('clear-score-button');
const modal = document.getElementById('result-modal');
const modalClose = document.getElementById('modal-close');
const resultText = document.getElementById('result-text');
const resultIcon = document.getElementById('result-icon');
const scoreX = document.getElementById('score-x');
const scoreO = document.getElementById('score-o');
const scoreDraw = document.getElementById('score-draw');

// 初期化
function init() {
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
        // タッチデバイス向けの最適化
        cell.addEventListener('touchstart', handleTouchStart, { passive: true });
    });

    resetButton.addEventListener('click', resetGame);
    clearScoreButton.addEventListener('click', clearScore);
    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    updateCurrentPlayerDisplay();
    loadScores();
}

// タッチ開始時の処理（視覚的フィードバック）
function handleTouchStart(e) {
    if (!this.textContent && gameActive) {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    }
}

// セルクリック処理
function handleCellClick(e) {
    const cell = e.target;
    const cellIndex = parseInt(cell.getAttribute('data-cell'));

    // すでに埋まっているセルまたはゲーム終了時はクリック無効
    if (gameBoard[cellIndex] !== '' || !gameActive) {
        return;
    }

    // セルを更新
    gameBoard[cellIndex] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    // 音声フィードバック（振動）
    if ('vibrate' in navigator) {
        navigator.vibrate(50);
    }

    // 勝利チェック
    checkResult();
}

// 勝利判定
function checkResult() {
    let roundWon = false;
    let winningCombination = [];

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winningCombination = [a, b, c];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        highlightWinningCells(winningCombination);
        nextStarter = currentPlayer; // 勝者が次のゲームの先手
        setTimeout(() => {
            showResult(`プレイヤー ${currentPlayer} の勝利！`, getWinnerEmoji(currentPlayer));
            updateScore(currentPlayer);
        }, 500);
        return;
    }

    // 引き分けチェック
    if (!gameBoard.includes('')) {
        gameActive = false;
        // 引き分けの場合は先手を交代
        nextStarter = nextStarter === 'X' ? 'O' : 'X';
        setTimeout(() => {
            showResult('引き分け！', '🤝');
            updateScore('draw');
        }, 300);
        return;
    }

    // プレイヤー交代
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateCurrentPlayerDisplay();
}

// 勝利セルのハイライト
function highlightWinningCells(combination) {
    combination.forEach(index => {
        cells[index].classList.add('winning');
    });

    // 振動フィードバック
    if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
}

// 現在のプレイヤー表示更新
function updateCurrentPlayerDisplay() {
    currentPlayerText.textContent = currentPlayer;
    currentPlayerText.classList.remove('x', 'o');
    currentPlayerText.classList.add(currentPlayer.toLowerCase());
}

// 結果モーダル表示
function showResult(message, emoji) {
    resultText.textContent = message;
    resultIcon.textContent = emoji;
    modal.classList.add('show');
}

// モーダルを閉じる
function closeModal() {
    modal.classList.remove('show');
    resetGame();
}

// ゲームリセット
function resetGame() {
    // ゲーム中にリセットする場合は確認
    if (gameActive && !gameBoard.every(cell => cell === '')) {
        if (!confirm('ゲーム中ですが、リセットしますか？')) {
            return;
        }
    }

    gameBoard = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    currentPlayer = nextStarter; // 次の先手から開始

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning');
    });

    updateCurrentPlayerDisplay();
}

// スコア更新
function updateScore(winner) {
    if (winner === 'draw') {
        scores.draw++;
    } else {
        scores[winner]++;
    }

    updateScoreDisplay(winner);
    saveScores();
}

// スコア表示更新
function updateScoreDisplay(highlightWinner = null) {
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
    scoreDraw.textContent = scores.draw;

    // スコア更新のアニメーション（更新されたスコアのみ）
    if (highlightWinner) {
        let targetElement;
        if (highlightWinner === 'X') targetElement = scoreX;
        else if (highlightWinner === 'O') targetElement = scoreO;
        else if (highlightWinner === 'draw') targetElement = scoreDraw;

        if (targetElement) {
            targetElement.style.transform = 'scale(1.4)';
            targetElement.style.color = '#e74c3c';
            setTimeout(() => {
                targetElement.style.transform = 'scale(1)';
                targetElement.style.color = '';
            }, 400);
        }
    }
}

// スコアクリア
function clearScore() {
    if (confirm('スコアをリセットしますか？')) {
        scores = { X: 0, O: 0, draw: 0 };
        nextStarter = 'X'; // 先手もリセット
        updateScoreDisplay();
        saveScores();

        // 振動フィードバック
        if ('vibrate' in navigator) {
            navigator.vibrate(100);
        }
    }
}

// スコア保存（localStorage）
function saveScores() {
    localStorage.setItem('ticTacToeScores', JSON.stringify(scores));
}

// スコア読み込み
function loadScores() {
    const savedScores = localStorage.getItem('ticTacToeScores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        updateScoreDisplay();
    }
}

// 勝者の絵文字
function getWinnerEmoji(player) {
    return player === 'X' ? '❌' : '⭕';
}

// 画面の向き変更時の処理
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// ページが完全に読み込まれたら初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// PWA対応のための追加機能
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // サービスワーカーは後で追加可能
        console.log('三目並べゲームが読み込まれました！');
    });
}

// ダブルタップズーム防止（iOS対応）
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// スクロール防止（ゲームプレイ中）
document.body.addEventListener('touchmove', (e) => {
    if (e.target.classList.contains('cell')) {
        e.preventDefault();
    }
}, { passive: false });
