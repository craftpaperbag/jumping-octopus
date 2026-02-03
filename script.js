const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const octopus = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    gravity: 0.12,
    lift: -3.5,
    velocity: 0,
    draw() {
        ctx.fillStyle = '#ff9999'; // Retro pinkish color
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Simple eyes to keep it retro and minimal expression
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 6, this.y + 8, 4, 4);
        ctx.fillRect(this.x + 20, this.y + 8, 4, 4);

        // Simple tentacles (retro style)
        ctx.fillStyle = '#ffb3b3';
        for(let i = 0; i < 4; i++) {
            ctx.fillRect(this.x + (i * 8), this.y + this.height, 6, 8);
        }
    },
    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;

        if (this.y + this.height > canvas.height) {
            this.y = canvas.height - this.height;
            this.velocity = 0;
        }
        if (this.y < 0) {
            this.y = 0;
            this.velocity = 0;
        }
    },
    jump() {
        this.velocity = this.lift;
    }
};

const obstacles = [];
const obstacleWidth = 50;
const obstacleGap = 160;
const bubbles = [];
let frameCount = 0;
let gameState = 'START'; // START, PLAYING, GAME_OVER
let score = 0;

function resetGame() {
    obstacles.length = 0;
    octopus.y = 300;
    octopus.velocity = 0;
    frameCount = 0;
    score = 0;
    gameState = 'PLAYING';
}

function spawnObstacle() {
    const minHeight = 50;
    const maxHeight = canvas.height - obstacleGap - minHeight;
    const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    obstacles.push({
        x: canvas.width,
        top: height,
        bottom: canvas.height - height - obstacleGap
    });
}

function spawnBubble() {
    bubbles.push({
        x: Math.random() * canvas.width,
        y: canvas.height + 10,
        size: Math.random() * 4 + 2,
        speed: Math.random() * 1 + 0.5
    });
}

function updateBubbles() {
    if (Math.random() < 0.05) {
        spawnBubble();
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
        bubbles[i].y -= bubbles[i].speed;
        if (bubbles[i].y < -10) {
            bubbles.splice(i, 1);
        }
    }
}

function drawBubbles() {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (const bubble of bubbles) {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function updateObstacles() {
    if (frameCount % 150 === 0) {
        spawnObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= 2;

        // Collision detection
        if (
            octopus.x < obstacles[i].x + obstacleWidth &&
            octopus.x + octopus.width > obstacles[i].x &&
            (octopus.y < obstacles[i].top || octopus.y + octopus.height > canvas.height - obstacles[i].bottom)
        ) {
            // Collision occurred
            return true;
        }

        if (obstacles[i].x + obstacleWidth < 0) {
            obstacles.splice(i, 1);
        }
    }
    return false;
}

function drawObstacles() {
    ctx.fillStyle = '#004d80';
    for (const obstacle of obstacles) {
        // Top obstacle
        ctx.fillRect(obstacle.x, 0, obstacleWidth, obstacle.top);
        // Bottom obstacle
        ctx.fillRect(obstacle.x, canvas.height - obstacle.bottom, obstacleWidth, obstacle.bottom);
    }
}

function drawUI() {
    ctx.fillStyle = '#fff';
    ctx.font = '20px "Courier New"';
    if (gameState === 'START') {
        ctx.textAlign = 'center';
        ctx.fillText('深海の静寂', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px "Courier New"';
        ctx.fillText('クリック または スペース で開始', canvas.width / 2, canvas.height / 2 + 20);
    } else if (gameState === 'PLAYING') {
        ctx.textAlign = 'left';
        ctx.fillText(`Depth: ${score}m`, 20, 40);
    } else if (gameState === 'GAME_OVER') {
        ctx.textAlign = 'center';
        ctx.fillText('静かな終わり', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px "Courier New"';
        ctx.fillText(`到達した深さ: ${score}m`, canvas.width / 2, canvas.height / 2 + 10);
        ctx.fillText('クリック または スペース で再試行', canvas.width / 2, canvas.height / 2 + 50);
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateBubbles();
    drawBubbles();

    if (gameState === 'PLAYING') {
        octopus.update();
        const collision = updateObstacles();

        drawObstacles();
        octopus.draw();

        if (collision) {
            gameState = 'GAME_OVER';
        }

        if (frameCount % 60 === 0) {
            score++;
        }
        frameCount++;
    } else {
        drawObstacles();
        octopus.draw();
    }

    drawUI();
    requestAnimationFrame(gameLoop);
}

function handleInput() {
    if (gameState === 'START' || gameState === 'GAME_OVER') {
        resetGame();
    } else if (gameState === 'PLAYING') {
        octopus.jump();
    }
}

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        handleInput();
    }
});

canvas.addEventListener('mousedown', () => {
    handleInput();
});

gameLoop();
