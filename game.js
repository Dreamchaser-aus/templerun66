// ---- 界面切换 ----
const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");
const goGameBtn = document.getElementById("goGameBtn");

goGameBtn.onclick = () => {
    welcomeScreen.style.display = "none";
    gameScreen.style.display = "block";
    draw();
};

// ---- 游戏核心逻辑 ----
const scoreDiv = document.getElementById("score");
const timeDiv = document.getElementById("time");
const chancesDiv = document.getElementById("chances");
const startBtn = document.getElementById("startBtn");
const taskBtn = document.getElementById("taskBtn");
const skinsBtn = document.getElementById("skinsBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

// 素材加载
const bg = new Image();
bg.src = "assets/background.jpg";
const character = new Image();
character.src = "assets/character1.png";
const coinImg = new Image();
coinImg.src = "assets/coin.png";
const coinSound = new Audio("assets/coin.mp3");

// 变量
let score = 0;
let surviveTime = 0;
let chances = 3;
let inviteChances = 0;
let isStarted = false;
let timeInterval;

// 主角参数
let characterX = 180;
let characterY = 300;
let characterStep = 16;

// 金币参数
let coinX = 100;
let coinY = 0;
const coinSize = 32;
let coinSpeed = 3; // 每帧掉落速度，可自行调整

// 画面刷新
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    if (isStarted) {
        // 画金币
        if (coinImg.complete) ctx.drawImage(coinImg, coinX, coinY, coinSize, coinSize);
        // 画主角
        if (character.complete) ctx.drawImage(character, characterX, characterY, 40, 40);
    }
}

// 检查主角是否碰到金币
function checkGetCoin() {
    // 主角与金币矩形碰撞
    return (
        characterX < coinX + coinSize &&
        characterX + 40 > coinX &&
        characterY < coinY + coinSize &&
        characterY + 40 > coinY
    );
}

// 刷新金币到顶部随机X
function resetCoin() {
    coinX = Math.random() * (canvas.width - coinSize);
    coinY = -coinSize; // 顶部之外
    // coinSpeed 可以随得分增加（加难度）
    // coinSpeed = 3 + Math.floor(score / 100); // 可选
}

// ===== 触屏滑动控制主角 =====
let touchStartX = null;
let lastTouchX = null;

canvas.addEventListener('touchstart', function(e) {
    if (!isStarted) return;
    if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        lastTouchX = characterX;
    }
});
canvas.addEventListener('touchmove', function(e) {
    if (!isStarted) return;
    if (e.touches.length === 1 && touchStartX !== null) {
        const deltaX = e.touches[0].clientX - touchStartX;
        characterX = lastTouchX + deltaX;
        if (characterX < 0) characterX = 0;
        if (characterX > canvas.width - 40) characterX = canvas.width - 40;
        draw();
    }
});
canvas.addEventListener('touchend', function(e) {
    touchStartX = null;
    lastTouchX = null;
});

// 键盘控制也可用
document.addEventListener('keydown', function(e) {
    if (!isStarted) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        characterX -= characterStep;
        if (characterX < 0) characterX = 0;
        draw();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        characterX += characterStep;
        if (characterX > canvas.width - 40) characterX = canvas.width - 40;
        draw();
    }
});

// 主循环，金币自动下落，检测碰撞
function mainLoop() {
    if (!isStarted) return;

    // 金币下落
    coinY += coinSpeed;

    // 检查碰撞
    if (checkGetCoin()) {
        coinSound.currentTime = 0;
        coinSound.play();
        score += 10;
        updateUI();
        resetCoin();
    }

    // 如果金币掉到画布底部，刷新到顶部
    if (coinY > canvas.height) {
        resetCoin();
    }

    draw();
    requestAnimationFrame(mainLoop);
}

// 开始游戏
startBtn.onclick = startGame;

function startGame() {
    if (chances <= 0 && inviteChances <= 0) {
        alert("机会已用完，邀请好友可获得更多机会！");
        return;
    }
    if (chances > 0) {
        chances--;
    } else {
        inviteChances--;
    }
    score = 0;
    surviveTime = 0;
    isStarted = true;
    characterX = 180;
    resetCoin();
    updateUI();
    draw();

    clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        surviveTime += 1;
        updateUI();
    }, 1000);

    requestAnimationFrame(mainLoop); // 启动主循环
}

// 刷新UI
function updateUI() {
    if (isStarted) {
        scoreDiv.textContent = `分数: ${score}`;
        timeDiv.textContent = `存活时间: ${surviveTime}s`;
    } else {
        scoreDiv.textContent = "";
        timeDiv.textContent = "";
    }
    chancesDiv.textContent = `今日机会: ${chances} | 邀请机会: ${inviteChances}`;
}

// 其它按钮
taskBtn.onclick = () => alert("任务功能后端对接中...");
skinsBtn.onclick = () => alert("切换皮肤功能后端对接中...");
leaderboardBtn.onclick = () => alert("排行榜功能后端对接中...");

// 首次进入绘制
bg.onload = draw;
character.onload = draw;
coinImg.onload = draw;
draw();
