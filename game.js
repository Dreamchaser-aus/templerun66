let score = 0;
let surviveTime = 0;
let chances = 3;
let inviteChances = 0;
let gameInterval;
let timeInterval;

const scoreDiv = document.getElementById("score");
const timeDiv = document.getElementById("time");
const chancesDiv = document.getElementById("chances");
const startBtn = document.getElementById("startBtn");
const taskBtn = document.getElementById("taskBtn");
const skinsBtn = document.getElementById("skinsBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const canvas = document.getElementById('gameCanvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'red';
ctx.fillRect(50, 50, 100, 100);

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

  gameInterval = setInterval(() => {
    score += 1;
    updateUI();
  }, 100);

  timeInterval = setInterval(() => {
    surviveTime += 1;
    updateUI();
  }, 1000);
}

function updateUI() {
  scoreDiv.textContent = `分数: ${score}`;
  timeDiv.textContent = `存活时间: ${surviveTime}s`;
  chancesDiv.textContent = `今日机会: ${chances} | 邀请机会: ${inviteChances}`;
}

// 示例按钮事件
taskBtn.onclick = () => alert("任务功能后端对接中...");
skinsBtn.onclick = () => alert("切换皮肤功能后端对接中...");
leaderboardBtn.onclick = () => alert("排行榜功能后端对接中...");
