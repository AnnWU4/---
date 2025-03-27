// script.js
const ROWS = 5;
const COLS = 6;
const chessboard = document.getElementById('chessboard');
let selectedPlayers = []; // 存储选中的球员
let ballPosition = { row: 0, col: 0 }; // 足球初始位置

// 初始化棋盘
function initChessboard() {
    for (let i = 0; i < ROWS; i++) {
        for (let j = 0; j < COLS; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            chessboard.appendChild(cell);
        }
    }
    initPlayers();
    initBall();
}

// 初始化球员（3个队伍1，3个队伍2）
function initPlayers() {
    const initialPositions = [
        { team: 1, row: 0, col: 0 }, { team: 1, row: 0, col: 1 }, { team: 1, row: 0, col: 2 },
        { team: 2, row: 4, col: 3 }, { team: 2, row: 4, col: 4 }, { team: 2, row: 4, col: 5 }
    ];

    initialPositions.forEach((pos, index) => {
        const player = document.createElement('div');
        player.classList.add('player', `team${pos.team}`);
        player.dataset.team = pos.team;
        player.dataset.id = index;
        player.textContent = `P${index + 1}`;
        player.draggable = true;
        player.addEventListener('dragstart', dragStart);
        player.addEventListener('click', selectPlayer);
        const cell = document.querySelector(`.cell[data-row="${pos.row}"][data-col="${pos.col}"]`);
        cell.appendChild(player);
    });
}

// 初始化足球
function initBall() {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    ball.draggable = true;
    ball.addEventListener('dragstart', dragStart);
    const cell = document.querySelector(`.cell[data-row="${ballPosition.row}"][data-col="${ballPosition.col}"]`);
    cell.appendChild(ball);
}

// 拖拽开始
function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.id || 'ball');
}

// 拖拽目标格子的事件
chessboard.addEventListener('dragover', (e) => e.preventDefault());

chessboard.addEventListener('drop', (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const targetCell = e.target.closest('.cell');
    if (!targetCell) return;

    const playersInCell = targetCell.querySelectorAll('.player');
    const isBall = id === 'ball';

    if (isBall) {
        // 移动足球
        const ball = document.querySelector('.ball');
        targetCell.appendChild(ball);
        ballPosition = { row: parseInt(targetCell.dataset.row), col: parseInt(targetCell.dataset.col) };
    } else {
        // 移动球员
        const player = document.querySelector(`.player[data-id="${id}"]`);
        const playerTeam = player.dataset.team;

        if (playersInCell.length >= 2) return; // 格子已有两个球员，不能再添加
        if (playersInCell.length === 1 && playersInCell[0].dataset.team === playerTeam) return; // 同一队伍不能共存

        targetCell.appendChild(player);
        if (playersInCell.length === 1) targetCell.classList.add('two-players');
    }
});

// 选中球员以显示连线
function selectPlayer(e) {
    const player = e.target;
    if (selectedPlayers.includes(player)) {
        selectedPlayers = selectedPlayers.filter(p => p !== player);
        player.style.border = 'none';
    } else if (selectedPlayers.length < 2) {
        selectedPlayers.push(player);
        player.style.border = '2px solid yellow';
    }

    if (selectedPlayers.length === 2) {
        drawLine(selectedPlayers[0], selectedPlayers[1]);
    } else {
        clearLine();
    }
}

// 使用Canvas绘制连线
const canvas = document.createElement('canvas');
canvas.style.position = 'absolute';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.pointerEvents = 'none';
document.body.appendChild(canvas);

function drawLine(player1, player2) {
    const rect1 = player1.getBoundingClientRect();
    const rect2 = player2.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.beginPath();
    ctx.moveTo(rect1.left + rect1.width / 2, rect1.top + rect1.height / 2);
    ctx.lineTo(rect2.left + rect2.width / 2, rect2.top + rect2.height / 2);
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function clearLine() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 初始化
initChessboard();