// Add this at the beginning of your script.js

// Loading screen elements
const loadingScreen = document.getElementById('loadingScreen');
const loadingProgress = document.querySelector('.loading-progress');
const loadingPercentage = document.querySelector('.loading-percentage');

// Simulate loading
function simulateLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    startScreen.classList.add('active');
                }, 500);
            }, 300);
        }
        loadingProgress.style.width = `${progress}%`;
        loadingPercentage.textContent = `${Math.floor(progress)}%`;
    }, 100);
}

// Start loading when window loads
window.addEventListener('load', simulateLoading);

// Game elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const levelElement = document.getElementById('level');
const gameOverScreen = document.getElementById('gameOver');
const startScreen = document.getElementById('startScreen');
const levelCompleteScreen = document.getElementById('levelComplete');
const finalScoreElement = document.getElementById('finalScore');
const levelScoreElement = document.getElementById('levelScore');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

// Game variables
let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let animationId;
let mouseX = 0;
let particles = [];

// Paddle properties
const paddleWidth = 100;
const paddleHeight = 15;
let paddleX = (canvas.width - paddleWidth) / 2;

// Ball properties
const ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = canvas.height - 30;
let ballSpeedX = 5;
let ballSpeedY = -5;

// Brick properties
const brickRowCount = 5;
const brickColumnCount = 9;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 60;
const brickOffsetLeft = 30;

// Create bricks
let bricks = [];
function initBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount + level - 1; r++) {
            bricks[c][r] = { 
                x: 0, 
                y: 0, 
                status: 1, 
                color: getRandomNeonColor(),
                glow: Math.random() * 0.5 + 0.5
            };
        }
    }
}

// Neon colors
function getRandomNeonColor() {
    const colors = [
        '#08f', // Blue
        '#0f8', // Green
        '#f0f', // Pink
        '#90f', // Purple
        '#f80', // Orange
        '#ff0'  // Yellow
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Particle system
function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x: x,
            y: y,
            size: Math.random() * 3 + 1,
            color: color,
            speedX: (Math.random() - 0.5) * 5,
            speedY: (Math.random() - 0.5) * 5,
            life: 30 + Math.random() * 20,
            opacity: 1
        });
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;
        p.opacity = p.life / 50;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function drawParticles() {
    particles.forEach(p => {
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// Initialize game
function initGame() {
    score = 0;
    lives = 3;
    level = 1;
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    levelElement.textContent = level;
    initBricks();
    resetBallAndPaddle();
    particles = [];
}

// Reset ball and paddle position
function resetBallAndPaddle() {
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballSpeedX = 4 + level;
    ballSpeedY = -4 - level;
    paddleX = (canvas.width - paddleWidth) / 2;
}

// Draw paddle with glow effect
function drawPaddle() {
    // Glow effect
    ctx.shadowColor = '#08f';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#08f';
    ctx.beginPath();
    ctx.roundRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight, 8);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Inner paddle
    ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
    ctx.beginPath();
    ctx.roundRect(paddleX + 2, canvas.height - paddleHeight + 2, paddleWidth - 4, paddleHeight - 4, 6);
    ctx.fill();
}

// Draw ball with glow effect
function drawBall() {
    // Glow effect
    ctx.shadowColor = '#f0f';
    ctx.shadowBlur = 15;
    ctx.fillStyle = '#f0f';
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Inner ball
    const gradient = ctx.createRadialGradient(
        ballX, ballY, 0,
        ballX, ballY, ballRadius
    );
    gradient.addColorStop(0, 'rgba(255, 200, 255, 0.9)');
    gradient.addColorStop(1, 'rgba(255, 100, 255, 0.7)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius - 2, 0, Math.PI * 2);
    ctx.fill();
}

// Draw bricks with glow effects
function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status === 1) {
                const brick = bricks[c][r];
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                brick.x = brickX;
                brick.y = brickY;
                
                // Glow effect
                ctx.shadowColor = brick.color;
                ctx.shadowBlur = 10 * brick.glow;
                ctx.fillStyle = brick.color;
                ctx.beginPath();
                ctx.roundRect(brickX, brickY, brickWidth, brickHeight, 4);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Inner brick
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.roundRect(brickX + 2, brickY + 2, brickWidth - 4, brickHeight - 4, 2);
                ctx.fill();
                
                // Animate glow
                brick.glow = Math.sin(Date.now() / 300 + c * 10 + r * 5) * 0.2 + 0.8;
            }
        }
    }
}

// Collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (
                    ballX + ballRadius > brick.x &&
                    ballX - ballRadius < brick.x + brickWidth &&
                    ballY + ballRadius > brick.y &&
                    ballY - ballRadius < brick.y + brickHeight
                ) {
                    ballSpeedY = -ballSpeedY;
                    brick.status = 0;
                    score += 10;
                    scoreElement.textContent = score;
                    
                    // Create particles
                    createParticles(
                        brick.x + brickWidth / 2,
                        brick.y + brickHeight / 2,
                        brick.color,
                        15
                    );
                    
                    // Check if all bricks are destroyed
                    if (checkLevelComplete()) {
                        levelComplete();
                    }
                }
            }
        }
    }
}

// Check if level is complete
function checkLevelComplete() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < bricks[c].length; r++) {
            if (bricks[c][r].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// Level complete
function levelComplete() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    levelScoreElement.textContent = score;
    levelCompleteScreen.classList.add('active');
}

// Next level
function nextLevel() {
    level++;
    levelElement.textContent = level;
    levelCompleteScreen.classList.remove('active');
    initBricks();
    resetBallAndPaddle();
    gameRunning = true;
    animationId = requestAnimationFrame(gameLoop);
}

// Game over
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('active');
}

// Handle mouse movement
function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    mouseX = relativeX;
    if (mouseX > paddleWidth / 2 && mouseX < canvas.width - paddleWidth / 2) {
        paddleX = mouseX - paddleWidth / 2;
    }
}

// Handle keyboard input
function handleKeyDown(e) {
    if (e.key === 'ArrowRight') {
        paddleX = Math.min(paddleX + 20, canvas.width - paddleWidth);
    } else if (e.key === 'ArrowLeft') {
        paddleX = Math.max(paddleX - 20, 0);
    }
}

// Draw game
function draw() {
    // Clear canvas with fading effect
    ctx.fillStyle = 'rgba(0, 0, 34, 0.2)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    updateParticles();
    drawParticles();
    
    // Draw game elements
    drawBricks();
    drawBall();
    drawPaddle();
    
    // Collision detection
    collisionDetection();
    
    // Wall collision (left/right)
    if (ballX + ballSpeedX > canvas.width - ballRadius || ballX + ballSpeedX < ballRadius) {
        ballSpeedX = -ballSpeedX;
        createParticles(
            ballX + (ballSpeedX > 0 ? ballRadius : -ballRadius),
            ballY,
            '#ff0',
            5
        );
    }
    
    // Wall collision (top)
    if (ballY + ballSpeedY < ballRadius) {
        ballSpeedY = -ballSpeedY;
        createParticles(
            ballX,
            ballY - ballRadius,
            '#ff0',
            5
        );
    }
    // Wall collision (bottom)
    else if (ballY + ballSpeedY > canvas.height - ballRadius) {
        // Paddle collision
        if (ballX > paddleX && ballX < paddleX + paddleWidth && 
            ballY + ballRadius >= canvas.height - paddleHeight) {
            
            // Calculate bounce angle based on where ball hits paddle
            const hitPosition = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
            const angle = hitPosition * Math.PI / 3; // Max 60 degrees
            
            ballSpeedX = 8 * Math.sin(angle);
            ballSpeedY = -Math.abs(8 * Math.cos(angle));
            
            // Create particles on paddle hit
            createParticles(
                ballX,
                canvas.height - paddleHeight,
                '#08f',
                10
            );
        } else {
            lives--;
            livesElement.textContent = lives;
            
            if (lives <= 0) {
                gameOver();
            } else {
                resetBallAndPaddle();
            }
        }
    }
    
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;
}

// Game loop
function gameLoop() {
    draw();
    if (gameRunning) {
        animationId = requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame() {
    // Remove event listeners if they exist
    canvas.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('keydown', handleKeyDown);
    
    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyDown);
    
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    levelCompleteScreen.classList.remove('active');
    initGame();
    gameRunning = true;
    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
nextLevelBtn.addEventListener('click', nextLevel);

// Show start screen initially
startScreen.classList.add('active');
gameOverScreen.classList.remove('active');
levelCompleteScreen.classList.remove('active');

// Handle window resize
function resizeCanvas() {
    const gameWrapper = document.querySelector('.game-wrapper');
    const scale = Math.min(
        window.innerWidth / 840,
        window.innerHeight / 640
    );
    gameWrapper.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();