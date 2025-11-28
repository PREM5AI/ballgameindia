const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreBox = document.getElementById("score");
const replayBtn = document.getElementById("replayBtn");
const jumpscare = document.getElementById("jumpscare");

// Bird
let bird = { x: 50, y: 250, vel: 0 };
let gravity = 0.5;
let lift = -7;
let pipes = [];
let score = 0;
let gameOver = false;

// HORROR SOUNDS (Procedural)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playHorrorTone(freq, duration, type = "sawtooth") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.15;

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

function flapSound() { playHorrorTone(200, 0.15, "square"); }
function hitSound() { playHorrorTone(60, 0.4, "sawtooth"); }
function scoreSound() { playHorrorTone(700, 0.1, "triangle"); }

// Horror ambient drone
function startAmbient() {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 40;
    osc.type = "triangle";
    gain.gain.value = 0.07;

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();

    ambient = osc;
}

let ambient;

// Controls
document.addEventListener("keydown", flap);
canvas.addEventListener("click", flap);

function flap() {
    if (gameOver) return;
    bird.vel = lift;
    flapSound();
}

// Reset game
function reset() {
    bird = { x: 50, y: 250, vel: 0 };
    pipes = [];
    score = 0;
    gameOver = false;
    scoreBox.innerHTML = "0";

    jumpscare.classList.add("hidden");
    replayBtn.classList.add("hidden");

    if (ambient) ambient.stop();
    startAmbient();

    animate();
}

// Pipe generator
function addPipe() {
    let gap = 150;
    let top = Math.random() * (300 - 50) + 50;

    pipes.push({
        x: 400,
        top: top,
        bottom: top + gap,
        scored: false
    });
}

setInterval(() => { if (!gameOver) addPipe(); }, 2000);

// Collision check
function collides(p) {
    return (
        bird.x + 20 > p.x &&
        bird.x < p.x + 60 &&
        (bird.y - 20 < p.top || bird.y + 20 > p.bottom)
    );
}

// Main loop
function animate() {
    if (gameOver) return;

    requestAnimationFrame(animate);

    ctx.fillStyle = "#1c0000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bird physics
    bird.vel += gravity;
    bird.y += bird.vel;

    // Draw bird (white circle)
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(bird.x, bird.y, 20, 0, Math.PI * 2);
    ctx.fill();

    // Pipes
    ctx.fillStyle = "#550000";
    for (let p of pipes) {
        p.x -= 2;

        ctx.fillRect(p.x, 0, 60, p.top);
        ctx.fillRect(p.x, p.bottom, 60, 600 - p.bottom);

        if (collides(p)) return endGame();

        if (!p.scored && p.x + 60 < bird.x) {
            score++;
            p.scored = true;
            scoreBox.innerHTML = score;
            scoreSound();
        }
    }

    // Boundaries
    if (bird.y < 0 || bird.y > canvas.height) endGame();
}

function endGame() {
    gameOver = true;
    hitSound();

    jumpscare.classList.remove("hidden");
    replayBtn.classList.remove("hidden");

    if (ambient) ambient.stop();
}

replayBtn.onclick = reset;

// Start game
reset();
