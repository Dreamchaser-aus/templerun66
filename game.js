// 绑定页面元素
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

// 加载素材
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
let gameInterval;
let timeInterval;

// 绘制函数
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 背景
    if (bg.complete) ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    // 主角
    if (character.complete) ctx.drawImage(character, 180, 300, 40, 40);
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
    updateUI();
    draw();

    clearInterval(gameInterval);
    clearInterval(timeInterval);

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
    scoreDiv.textContent = `分数: ${score}`;
    timeDiv.textContent = `存活时间: ${surviveTime}s`;
    chancesDiv.textContent = `今日机会: ${chances} | 邀请机会: ${inviteChances}`;
}

// 其它按钮
taskBtn.onclick = () => alert("任务功能后端对接中...");
skinsBtn.onclick = () => alert("切换皮肤功能后端对接中...");
leaderboardBtn.onclick = () => alert("排行榜功能后端对接中...");

// 初始显示
bg.onload = draw;
character.onload = draw;
draw();
