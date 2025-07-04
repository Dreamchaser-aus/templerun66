// ========== 全局变量先声明 ==========
let chances = 3, inviteChances = 0;
let score = 0, surviveTime = 0, isStarted = false, isGameOver = false, timeInterval;
let leaderboardData = [
    { name: "玩家A", score: 320 },
    { name: "玩家B", score: 230 },
    { name: "玩家C", score: 180 }
];
let characterX = 180, characterY = 300, characterFace = 1;
let coinX = 100, coinY = 0, coinSize = 32, coinSpeed = 3;
let trapX = 200, trapY = 0, trapSize = 36, trapSpeed = 4;
let dragging = false, dragStartX = null, charStartX = null;

// ========== DOM节点 ==========
const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");
const goGameBtn = document.getElementById("goGameBtn");
const welcomeChancesDiv = document.getElementById("welcome-chances");
const leaderboardList = document.getElementById("leaderboard-list");
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

// ========== 素材加载 ==========
const bg = new Image();
bg.src = "assets/background.jpg";
const character = new Image();
character.src = "assets/character1.png";
const coinImg = new Image();
coinImg.src = "assets/coin.png";
const trapImg = new Image();
trapImg.src = "assets/trap.png";
const coinSound = new Audio("assets/coin.mp3");

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
goGameBtn.onclick = () => {
    welcomeScreen.style.display = "none";
    gameScreen.style.display = "block";
    draw();
};

// ========== 触屏滑动同步控制主角 ==========
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
    if (characterX < 0) characterX = 0;
    if (characterX > canvas.width - 40) characterX = canvas.width - 40;
    if (delta > 5) characterFace = 1;
    if (delta < -5) characterFace = -1;
    draw();
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', function(e) {
    dragging = false;
    e.preventDefault();
}, { passive: false });

// ========== 键盘左右支持（可选） ==========
document.addEventListener('keydown', function(e) {
    if (!isStarted || isGameOver) return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        characterX -= 16;
        if (characterX < 0) characterX = 0;
        characterFace = -1;
        draw();
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        characterX += 16;
        if (characterX > canvas.width - 40) characterX = canvas.width - 40;
        characterFace = 1;
        draw();
    }
});

// ========== 游戏主循环 ==========
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    if (coinImg.complete) ctx.drawImage(coinImg, coinX, coinY, coinSize, coinSize);
    if (trapImg.complete) ctx.drawImage(trapImg, trapX, trapY, trapSize, trapSize);
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
function checkGetCoin() {
    return (
        characterX < coinX + coinSize &&
        characterX + 40 > coinX &&
        characterY < coinY + coinSize &&
        characterY + 40 > coinY
    );
}
function checkHitTrap() {
    return (
        characterX < trapX + trapSize &&
        characterX + 40 > trapX &&
        characterY < trapY + trapSize &&
        characterY + 40 > trapY
    );
}
function resetCoin() {
    coinX = Math.random() * (canvas.width - coinSize);
    coinY = -coinSize;
}
function resetTrap() {
    trapX = Math.random() * (canvas.width - trapSize);
    trapY = -trapSize;
}
function mainLoop() {
    if (!isStarted || isGameOver) return;

    // 金币下落
    coinY += coinSpeed;
    if (checkGetCoin()) {
        coinSound.currentTime = 0;
        coinSound.play();
        score += 10;
        updateUI();
        resetCoin();
    }
    if (coinY > canvas.height) resetCoin();

    // 陷阱下落
    trapY += trapSpeed;
    if (trapY > canvas.height) resetTrap();

    // 碰到陷阱，游戏结束
    if (checkHitTrap()) {
        isGameOver = true;
        updateUI();
        draw();
        setTimeout(() => {
            alert("💀 游戏结束！分数: " + score);
            leaderboardData.push({ name: "你", score: score });
            leaderboardData = leaderboardData
                .sort((a, b) => b.score - a.score)
                .slice(0, 5);
            isStarted = false;
            isGameOver = false;
            updateUI();
            goToWelcome();
        }, 100);
        return;
    }

    draw();
    requestAnimationFrame(mainLoop);
}

// ========== 开始游戏 ==========
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
    isGameOver = false;
    characterX = 180;
    characterFace = 1;
    resetCoin();
    resetTrap();
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

bg.onload = draw;
character.onload = draw;
coinImg.onload = draw;
trapImg.onload = draw;
draw();
