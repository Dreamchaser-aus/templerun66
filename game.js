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

// 游戏变量
let score = 0;
let surviveTime = 0;
let chances = 3;
let inviteChances = 0;
let isStarted = false;
let timeInterval;

// 主角参数
let characterX = 180;
let characterY = 300;
let characterSpeed = 0;
let moveLeft = false;
let moveRight = false;
let characterFace = 1; // 1向右，-1向左

// 金币参数
let coinX = 100;
let coinY = 0;
const coinSize = 32;
let coinSpeed = 3;

// 绘制
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    if (isStarted) {
        if (coinImg.complete) ctx.drawImage(coinImg, coinX, coinY, coinSize, coinSize);

        // 角色朝向自动切换
        ctx.save();
        if (characterFace === 1) {
            ctx.drawImage(character, characterX, characterY, 40, 40);
        } else {
            ctx.translate(characterX + 40, characterY);
            ctx.scale(-1, 1);
            ctx.drawImage(character, 0, 0, 40, 40);
        }
        ctx.restore();
    }
}

// 碰撞检测
function checkGetCoin() {
    return (
        characterX < coinX + coinSize &&
        characterX + 40 > coinX &&
        characterY < coinY + coinSize &&
        characterY + 40 > coinY
    );
}

// 金币重置
function resetCoin() {
    coinX = Math.random() * (canvas.width - coinSize);
    coinY = -coinSize;
    // coinSpeed = 3 + Math.floor(score / 100); // 难度递增可选
}

// ==== 触屏控制 ====
canvas.addEventListener('touchstart', function(e) {
    if (!isStarted) return;
    const touch = e.touches[0];
    const bound = canvas.getBoundingClientRect();
    if (touch.clientX < bound.left + canvas.width / 2) {
        moveLeft = true;
    } else {
        moveRight = true;
    }
});
canvas.addEventListener('touchend', function(e) {
    moveLeft = false;
    moveRight = false;
});

// ==== 键盘控制 ====
document.addEventListener('keydown', function(e) {
    if (!isStarted) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = true;
});
document.addEventListener('keyup', function(e) {
    if (!isStarted) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;
});

// ====== 主循环（自然移动、金币掉落、碰撞检测、朝向切换）======
function mainLoop() {
    if (!isStarted) return;

    // 主角惯性移动
    if (moveLeft) characterSpeed -= 0.6;
    if (moveRight) characterSpeed += 0.6;
    characterSpeed *= 0.82;
    if (characterSpeed > 9) characterSpeed = 9;
    if (characterSpeed < -9) characterSpeed = -9;
    characterX += characterSpeed;
    // 边界
    if (characterX < 0) {
        characterX = 0;
        characterSpeed = 0;
    }
    if (characterX > canvas.width - 40) {
        characterX = canvas.width - 40;
        characterSpeed = 0;
    }

    // 自动切换朝向（自然切换）
    if (characterSpeed > 0.2) characterFace = 1;
    else if (characterSpeed < -0.2) characterFace = -1;

    // 金币下落
    coinY += coinSpeed;

    // 碰到金币
    if (checkGetCoin()) {
        coinSound.currentTime = 0;
        coinSound.play();
        score += 10;
        updateUI();
        resetCoin();
    }

    // 金币到底部
    if (coinY > canvas.height) {
        resetCoin();
    }

    draw();
    requestAnimationFrame(mainLoop);
}

// ==== 开始游戏 ====
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
    characterSpeed = 0;
    moveLeft = false;
    moveRight = false;
    characterFace = 1;
    resetCoin();
    updateUI();
    draw();

    clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        surviveTime += 1;
        updateUI();
    }, 1000);

    requestAnimationFrame(mainLoop);
}

// ==== UI刷新 ====
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
