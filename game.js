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
const coinSound = new Audio("assets/coin.mp3");

// 变量
let score = 0;
let surviveTime = 0;
let chances = 3;
let inviteChances = 0;
let isStarted = false;
let gameInterval;
let timeInterval;

// 新增：主角运动变量
let characterX = 180;    // 主角横坐标
let characterY = 300;    // 主角纵坐标
let characterSpeed = 2;  // 每帧移动像素
let characterDir = 1;    // 1向右，-1向左

// 绘制函数
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 背景
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    // 游戏未开始时，不显示主角和分数
    if (isStarted && character.complete) {
        ctx.drawImage(character, characterX, characterY, 40, 40);
    }
}

// 主角自动移动循环
function gameLoop() {
    if (isStarted) {
        characterX += characterSpeed * characterDir;
        // 到边缘反向
        if (characterX < 0) {
            characterX = 0;
            characterDir = 1;
        }
        if (characterX > canvas.width - 40) {
            characterX = canvas.width - 40;
            characterDir = -1;
        }
        draw();
        requestAnimationFrame(gameLoop);
    }
}

// 获得金币并播放音效
function getCoin() {
    coinSound.currentTime = 0;
    coinSound.play();
    score += 10;
    updateUI();
    draw();
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
    isStarted = true; // 标记游戏已开始
    // 重置主角位置和方向
    characterX = 180;
    characterY = 300;
    characterDir = 1;
    updateUI();
    draw();

    clearInterval(gameInterval);
    clearInterval(timeInterval);

    // 启动主角动画循环
    requestAnimationFrame(gameLoop);

    // 每2秒获得一次金币
    gameInterval = setInterval(() => {
        getCoin();
    }, 2000);

    timeInterval = setInterval(() => {
        surviveTime += 1;
        updateUI();
    }, 1000);
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
draw();
