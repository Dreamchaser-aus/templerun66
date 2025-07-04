// ========== 全局变量 ==========
let chances = 3, inviteChances = 0;
let score = 0, surviveTime = 0, isStarted = false, isGameOver = false, timeInterval;
let leaderboardData = [
    { name: "玩家A", score: 320 },
    { name: "玩家B", score: 230 },
    { name: "玩家C", score: 180 }
];

const characterWidth = 48, characterHeight = 48; // 建议更大更清楚
let characterX = 0, characterY = 0, characterFace = 1; // 位置后面动态设
let coinX = 100, coinY = 0, coinSize = 36, coinSpeed = 3.2;
let trapX = 200, trapY = 0, trapSize = 42, trapSpeed = 4;
let dragging = false, dragStartX = null, charStartX = null;

const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");
const startBtn = document.getElementById("startBtn");
const taskBtn = document.getElementById("taskBtn");
const skinsBtn = document.getElementById("skinsBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const welcomeChancesDiv = document.getElementById("welcome-chances");
const leaderboardList = document.getElementById("leaderboard-list");
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDiv = document.getElementById("score");
const timeDiv = document.getElementById("time");

// 素材——建议全部用 webp
const bg = new Image();
bg.src = "assets/background.webp";
const character = new Image();
character.src = "assets/character1.webp";
const coinImg = new Image();
coinImg.src = "assets/coin.webp";
const trapImg = new Image();
trapImg.src = "assets/trap.webp";
const coinSound = new Audio("assets/coin.mp3");

// ========== 自适应全屏并同步主角位置 ==========
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const statusBarHeight = 46; // 上方分数栏高度
    canvas.width = window.innerWidth * dpr;
    canvas.height = (window.innerHeight - statusBarHeight) * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = (window.innerHeight - statusBarHeight) + "px";
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // 如果正在游戏中，主角永远贴底
    if (isStarted) resetCharacterPosition();
}

function resetCharacterPosition() {
    // 始终居中、底部留8px缓冲
    characterX = (canvas.width / (window.devicePixelRatio || 1)) / 2 - characterWidth / 2;
    characterY = (canvas.height / (window.devicePixelRatio || 1)) - characterHeight - 8;
}

// ========== 首页及排行榜 ==========
function updateWelcomeScreen() {
    welcomeChancesDiv.textContent = `今日机会: ${chances} | 邀请机会: ${inviteChances}`;
    let lbHtml = "";
    leaderboardData.forEach(item => {
        lbHtml += `<li>${item.name}：${item.score}分</li>`;
    });
    leaderboardList.innerHTML = lbHtml;
}
function goToWelcome() {
    welcomeScreen.style.display = "block";
    gameScreen.style.display = "none";
    updateWelcomeScreen();
}
goToWelcome();

// 按钮事件
startBtn.onclick = startGame;
taskBtn.onclick = () => alert("任务功能后端对接中...");
skinsBtn.onclick = () => alert("切换皮肤功能后端对接中...");
leaderboardBtn.onclick = () => alert("排行榜功能后端对接中...");

// ========== 游戏主循环 ==========
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));
    if (coinImg.complete) ctx.drawImage(coinImg, coinX, coinY, coinSize, coinSize);
    if (trapImg.complete) ctx.drawImage(trapImg, trapX, trapY, trapSize, trapSize);

    ctx.save();
    if (characterFace === 1) {
        ctx.drawImage(character, characterX, characterY, characterWidth, characterHeight);
    } else {
        ctx.translate(characterX + characterWidth, characterY);
        ctx.scale(-1, 1);
        ctx.drawImage(character, 0, 0, characterWidth, characterHeight);
    }
    ctx.restore();
}
function checkGetCoin() {
    return (
        characterX < coinX + coinSize &&
        characterX + characterWidth > coinX &&
        characterY < coinY + coinSize &&
        characterY + characterHeight > coinY
    );
}
function checkHitTrap() {
    return (
        characterX < trapX + trapSize &&
        characterX + characterWidth > trapX &&
        characterY < trapY + trapSize &&
        characterY + characterHeight > trapY
    );
}
function resetCoin() {
    // coin只能在地面上方出现，避免遮挡角色
    coinX = Math.random() * (canvas.width / (window.devicePixelRatio || 1) - coinSize);
    coinY = -coinSize;
}
function resetTrap() {
    trapX = Math.random() * (canvas.width / (window.devicePixelRatio || 1) - trapSize);
    trapY = -trapSize;
}
function mainLoop() {
    if (!isStarted || isGameOver) return;

    coinY += coinSpeed;
    if (checkGetCoin()) {
        coinSound.currentTime = 0;
        coinSound.play();
        score += 10;
        updateUI();
        resetCoin();
    }
    if (coinY > canvas.height / (window.devicePixelRatio || 1)) resetCoin();

    trapY += trapSpeed;
    if (trapY > canvas.height / (window.devicePixelRatio || 1)) resetTrap();

    if (checkHitTrap()) {
        isGameOver = true;
        draw();
        setTimeout(() => {
            alert("💀 游戏结束！分数: " + score);
            leaderboardData.push({ name: "你", score: score });
            leaderboardData = leaderboardData
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
            isStarted = false;
            isGameOver = false;
            goToWelcome();
        }, 100);
        return;
    }
    draw();
    requestAnimationFrame(mainLoop);
}

// ========== 开始游戏 ==========
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
    isGameOver = false;
    resizeCanvas();
    resetCharacterPosition();
    characterFace = 1;
    resetCoin();
    resetTrap();
    welcomeScreen.style.display = "none";
    gameScreen.style.display = "block";
    updateUI();
    draw();

    clearInterval(timeInterval);
    timeInterval = setInterval(() => {
        surviveTime += 1;
        updateUI();
    }, 1000);

    requestAnimationFrame(mainLoop);
}

// ========== UI刷新 ==========
function updateUI() {
    scoreDiv.textContent = `分数: ${score}`;
    timeDiv.textContent = `存活时间: ${surviveTime}s`;
}

// 触屏滑动
canvas.addEventListener('touchstart', function(e) {
    if (!isStarted || isGameOver) return;
    if (e.touches.length === 1) {
        dragging = true;
        dragStartX = e.touches[0].clientX;
        charStartX = characterX;
    }
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchmove', function(e) {
    if (!dragging) return;
    const delta = e.touches[0].clientX - dragStartX;
    characterX = charStartX + delta;
    const canvasW = canvas.width / (window.devicePixelRatio || 1);
    if (characterX < 0) characterX = 0;
    if (characterX > canvasW - characterWidth) characterX = canvasW - characterWidth;
    if (delta > 5) characterFace = 1;
    if (delta < -5) characterFace = -1;
    draw();
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', function(e) {
    dragging = false;
    e.preventDefault();
}, { passive: false });

// 键盘左右（可选）
document.addEventListener('keydown', function(e) {
    if (!isStarted || isGameOver) return;
    const canvasW = canvas.width / (window.devicePixelRatio || 1);
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        characterX -= 16;
        if (characterX < 0) characterX = 0;
        characterFace = -1;
        draw();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        characterX += 16;
        if (characterX > canvasW - characterWidth) characterX = canvasW - characterWidth;
        characterFace = 1;
        draw();
    }
});

// 自适应
window.addEventListener('resize', () => {
    if (gameScreen.style.display === "block") resizeCanvas();
});

bg.onload = draw;
character.onload = draw;
coinImg.onload = draw;
trapImg.onload = draw;
draw();
