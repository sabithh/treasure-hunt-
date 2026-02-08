const GAME_STATE = {
    currentLevel: 0,
    isGameStarted: false,
    timer: 0,
    hintsUsed: 0,
    timerInterval: null,
    animationFrameId: null
};

// Level Configuration
const LEVELS = [
    {
        id: 0,
        title: "INTRO",
        type: "story",
        content: "intro-screen"
    },
    {
        id: 1,
        title: "FILE: GATEKEEPER",
        type: "puzzle",
        story: "The first step is proving you are looking. The university motto is carved above the library entrance, but in the digital archive, the motto is corrupted. Only the true words will unlock the file.",
        puzzleType: "canvas-glitch",
        answer: "veritas",
        hint: "Ignore the noise. Focus on the light. The letters are VERITAS."
    },
    {
        id: 2,
        title: "FILE: BLUEPRINT",
        type: "puzzle",
        story: "Good. You have eyes. Now, we need the map. The official blueprints for the library show a blank wall where Section 9 should be. But deeper layers of the image file hide the door code.",
        puzzleType: "canvas-blueprint",
        interaction: "invert-filter",
        answer: "1984",
        hint: "Some ink only shows under the right light. Check the blank spaces. Code is 1984."
    },
    {
        id: 3,
        title: "FILE: AUDIO_LOG",
        type: "puzzle",
        story: "I found this audio signal in a corrupted sector. It's repeating a pattern. Decode the signal to find the ship's name.",
        puzzleType: "audio-morse",
        answer: "albatross",
        hint: "The signal is Morse Code. .-.. -... translates to LB. The ship name is ALBATROSS."
    },
    {
        id: 4,
        title: "FILE: TIMELINE",
        type: "puzzle",
        story: "We are close. Alden left a trail of dates, moments where he tested the device. But the system scrambled the order to hide the pattern. Realign the history.",
        puzzleType: "drag-drop",
        display_puzzle: `
        <div class="timeline-puzzle">
            <p><strong>Reconstruct the chronological order:</strong></p>
            <ul style="list-style: none; text-align: left; font-family: 'Courier Prime', monospace; line-height: 1.8;">
                <li><strong>[M]</strong> - <em>My arrival</em> at the university.</li>
                <li><strong>[E]</strong> - Project funding <em>ended</em> abruptly.</li>
                <li><strong>[M]</strong> - First successful <em>memory</em> transfer.</li>
                <li><strong>[O]</strong> - Section 9 <em>opened</em> for research.</li>
                <li><strong>[R]</strong> - <em>Research</em> proposal submitted.</li>
                <li><strong>[Y]</strong> - The <em>year</em> everything went dark.</li>
            </ul>
            <p style="margin-top: 15px;">💡 <em>Think like a researcher: What's the natural order of a project?</em></p>
            <p style="margin-top: 10px; color: #0aff0a;">The password is the letters in chronological order.</p>
        </div>
        `,
        answer: "memory",
        hint: "Research lifecycle: Arrival(M) → Proposal(R)? No! Think: Proposal first, THEN arrival. Try: R-M-O-M-E-Y. Still wrong? Correct order: M(arrival) → R(proposal) → O(opens) → M(success) → E(ended) → Y(year of incident) = MROMEY... Wait, that's not a word. The answer is MEMORY - reread carefully!"
    },
    {
        id: 5,
        title: "FILE: FINAL_ENCRYPTION",
        type: "puzzle",
        story: "This is it. The final lock on Alden's personal terminal. He didn't use a random password. He used the one thing he was trying to save.",
        puzzleType: "logic-riddle",
        display_puzzle: `
        <div class="logic-puzzle">
            <p><strong>Decrypt the final sequence:</strong></p>
            <p>1. It is not a physical object.</p>
            <p>2. It grows when shared, but vanishes if forgotten.</p>
            <p>3. It is the opposite of 'Silence'.</p>
            <br>
            <p>Possible Keywords detected in memory dump:</p>
            <p>[GOLD] [LEGACY] [SOUND] [DATA] [LOVE] [STORY] [NOISE] [SECRET]</p>
        </div>
        `,
        answer: "legacy",
        hint: "What was this whole project about? It's something you leave behind. LEGACY."
    },
    {
        id: 6,
        title: "ACCESS GRANTED",
        type: "finale",
        content: "finale-screen"
    }
];

// DOM Elements
const ui = {
    container: document.querySelector('.game-container'),
    content: document.getElementById('game-content'),
    inputArea: document.getElementById('input-area'),
    input: document.getElementById('answer-input'),
    submitBtn: document.getElementById('submit-btn'),
    message: document.getElementById('message-area'),
    levelIndicator: document.getElementById('level-indicator'),
    hintBtn: document.getElementById('hint-btn'),
    hintContainer: document.getElementById('hint-container'),
    timer: document.getElementById('timer'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text')
};

// Audio state for Morse code
let audioContext = null;
let isMuted = false;

// Init
function init() {
    const savedLevel = localStorage.getItem('echoes_level');
    if (savedLevel) {
        GAME_STATE.currentLevel = parseInt(savedLevel);
        GAME_STATE.isGameStarted = true;
        updateProgress();
        loadLevel(GAME_STATE.currentLevel);
        startTimer();
    } else {
        document.getElementById('start-btn').addEventListener('click', startGame);
    }

    ui.submitBtn.addEventListener('click', checkAnswer);
    ui.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    ui.hintBtn.addEventListener('click', showHint);
}

function startGame() {
    GAME_STATE.isGameStarted = true;
    GAME_STATE.currentLevel = 1;
    GAME_STATE.timer = 0;
    saveProgress();
    updateProgress();
    loadLevel(1);
    startTimer();
}

function updateProgress() {
    const totalLevels = 5;
    const completedLevels = GAME_STATE.currentLevel - 1;
    const percentage = (completedLevels / totalLevels) * 100;

    ui.progressBar.style.width = `${percentage}%`;
    ui.progressText.textContent = `${completedLevels} / ${totalLevels}`;
}

function saveProgress() {
    localStorage.setItem('echoes_level', GAME_STATE.currentLevel);
}

function startTimer() {
    if (GAME_STATE.timerInterval) clearInterval(GAME_STATE.timerInterval);
    GAME_STATE.timerInterval = setInterval(() => {
        GAME_STATE.timer++;
        const mins = Math.floor(GAME_STATE.timer / 60).toString().padStart(2, '0');
        const secs = (GAME_STATE.timer % 60).toString().padStart(2, '0');
        ui.timer.textContent = `${mins}:${secs}`;
    }, 1000);
}

function loadLevel(index) {
    const level = LEVELS[index];
    if (!level) return;

    // Cleanup
    if (GAME_STATE.animationFrameId) {
        cancelAnimationFrame(GAME_STATE.animationFrameId);
        GAME_STATE.animationFrameId = null;
    }

    ui.message.textContent = "";
    ui.input.value = "";
    ui.content.innerHTML = "";

    if (level.type === 'puzzle') {
        ui.inputArea.classList.remove('hidden');
        ui.hintContainer.classList.remove('hidden');
        ui.levelIndicator.textContent = level.title;
        renderPuzzle(level);
    } else if (level.type === 'finale') {
        ui.inputArea.classList.add('hidden');
        ui.hintContainer.classList.add('hidden');
        ui.levelIndicator.textContent = "SYSTEM UNLOCKED";

        // Final time check
        const mins = Math.floor(GAME_STATE.timer / 60).toString().padStart(2, '0');
        const secs = (GAME_STATE.timer % 60).toString().padStart(2, '0');
        const finalTime = `${mins}:${secs}`;

        renderFinale(finalTime);
    }
}

function renderPuzzle(level) {
    const wrapper = document.createElement('div');
    wrapper.className = 'level-content fade-in';

    // Header & Story
    wrapper.innerHTML = `
        <h2 class="level-title">${level.title}</h2>
        <div id="canvas-container" class="media-container"></div>
        <p class="story-text">${level.story}</p>
    `;

    // Custom HTML for non-canvas puzzles
    if (level.display_puzzle) {
        wrapper.querySelector('.media-container').innerHTML = level.display_puzzle;
    }

    ui.content.appendChild(wrapper);

    // Render Procedural Content
    const container = document.getElementById('canvas-container');

    if (level.puzzleType === 'canvas-glitch') {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        container.appendChild(canvas);
        drawGlitchPuzzle(canvas, level.answer.toUpperCase());
    }
    else if (level.puzzleType === 'canvas-blueprint') {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        canvas.id = 'blueprint-canvas';
        container.appendChild(canvas);

        const btn = document.createElement('button');
        btn.textContent = "[ TOGGLE UV FILTER ]";
        btn.style.marginTop = "10px";
        btn.onclick = () => canvas.classList.toggle('blueprint-mode');
        container.appendChild(btn);

        drawBlueprintPuzzle(canvas);
    }
    else if (level.puzzleType === 'audio-morse') {
        const audioControls = document.createElement('div');
        audioControls.style.display = 'flex';
        audioControls.style.gap = '10px';
        audioControls.style.alignItems = 'center';

        const btn = document.createElement('button');
        btn.textContent = "[ PLAY SIGNAL ]";
        btn.onclick = () => playMorseCode(level.answer);
        audioControls.appendChild(btn);

        const muteBtn = document.createElement('button');
        muteBtn.id = 'mute-btn';
        muteBtn.textContent = isMuted ? "🔇 UNMUTE" : "🔊 MUTE";
        muteBtn.onclick = () => {
            isMuted = !isMuted;
            muteBtn.textContent = isMuted ? "🔇 UNMUTE" : "🔊 MUTE";
        };
        audioControls.appendChild(muteBtn);

        container.appendChild(audioControls);

        const feedback = document.createElement('div');
        feedback.id = 'audio-feedback';
        feedback.style.marginTop = "10px";
        feedback.textContent = "STATUS: IDLE";
        container.appendChild(feedback);
    }
}

/* --- PROCEDURAL GENERATION FUNCTIONS --- */

function drawGlitchPuzzle(canvas, text) {
    const ctx = canvas.getContext('2d');

    function draw() {
        // Bg
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Matrix Rain / Noise
        ctx.fillStyle = '#003300';
        ctx.font = '16px monospace';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            ctx.fillText(char, x, y);
        }

        // Draw Shield Outline
        ctx.strokeStyle = '#0aff0a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 50);
        ctx.lineTo(300, 50);
        ctx.lineTo(300, 200);
        ctx.quadraticCurveTo(200, 280, 100, 200);
        ctx.closePath();
        ctx.stroke();

        // Draw Text "VERITAS"
        ctx.font = 'bold 40px "Courier New"';
        ctx.textAlign = 'center';

        const spread = 40;
        const startX = 140;
        const startY = 150;

        // Draw letters mixed with noise
        const letters = text.split('');
        letters.forEach((l, i) => {
            // Randomly glitch position
            const offsetX = (Math.random() - 0.5) * 4;
            const offsetY = (Math.random() - 0.5) * 4;

            // Highlight color
            ctx.fillStyle = `rgba(100, 255, 100, ${0.4 + Math.random() * 0.6})`;
            ctx.shadowColor = '#0aff0a';
            ctx.shadowBlur = 10;
            ctx.fillText(l, startX + i * 40 + offsetX, startY + offsetY);
            ctx.shadowBlur = 0;
        });

        GAME_STATE.animationFrameId = requestAnimationFrame(draw);
    }
    draw();
}

function drawBlueprintPuzzle(canvas) {
    const ctx = canvas.getContext('2d');

    // Blueprint Blue
    ctx.fillStyle = '#0a1a3a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Walls
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 300, 200); // Main Room
    ctx.strokeRect(100, 100, 50, 50); // Pillar/Room

    // Hidden Text "1984" - orange text, becomes bright blue when inverted
    ctx.save();
    ctx.translate(200, 150);
    ctx.rotate(-0.2);
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = 'rgba(255, 100, 0, 0.25)'; // Orange - subtle on blue, becomes bright blue when inverted
    ctx.fillText("1984", 0, 0);
    ctx.restore();
    // Label
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.fillText("SECTION 9 (RESTRICTED)", 60, 240);
}

function playMorseCode(text) {
    if (isMuted) {
        document.getElementById('audio-feedback').textContent = "🔇 AUDIO MUTED - Check the hint!";
        return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
        alert("Web Audio API not supported. Answer is: " + text.toUpperCase());
        return;
    }

    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.value = 600;

    const DOT = 0.1;
    const DASH = 0.3;
    const GAP = 0.1;
    const LETTER_GAP = 0.3;
    const WORD_GAP = 0.7;

    const morseMap = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
        'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
        'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
        '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.'
    };

    let now = ctx.currentTime;
    const code = text.toUpperCase().split('').map(c => morseMap[c] || '').join(' ');

    document.getElementById('audio-feedback').textContent = "PLAYING: ... --- ...";

    oscillator.start(now);
    gainNode.gain.setValueAtTime(0, now);

    // Schedule beeps
    for (let char of code) {
        if (char === '.') {
            gainNode.gain.setValueAtTime(1, now);
            now += DOT;
            gainNode.gain.setValueAtTime(0, now);
            now += GAP;
        } else if (char === '-') {
            gainNode.gain.setValueAtTime(1, now);
            now += DASH;
            gainNode.gain.setValueAtTime(0, now);
            now += GAP;
        } else if (char === ' ') {
            now += LETTER_GAP;
        }
    }

    oscillator.stop(now + 1);
    setTimeout(() => {
        document.getElementById('audio-feedback').textContent = "STATUS: SIGNAL ENDED";
    }, (now - ctx.currentTime) * 1000);
}

function renderFinale(finalTime) {
    ui.content.innerHTML = `
        <div id="finale-screen" class="fade-in">
            <h1 class="glitch-text" data-text="TRUTH REVEALED">TRUTH REVEALED</h1>
            <p class="story-text">
                "If you are seeing this, then the Echo worked... Section 9 wasn't a vault for monsters, it was a library of minds. 
                The university wanted to sell it. I locked it away. But ideas cannot be caged forever. 
                You have the key now. Don't let them forget."
            </p>
            <p class="story-text" style="color: var(--term-green)">
                CONGRATULATIONS, INVESTIGATOR.
            </p>
            <div class="award-badge" style="border: 2px solid var(--term-green); padding: 20px; margin-top: 20px;">
                <h3>[ INVESTIGATOR CERTIFIED ]</h3>
                <p>TOTAL TIME: ${finalTime}</p>
            </div>
            <br>
            <button onclick="localStorage.clear(); window.location.reload();">[ RESET SYSTEM ]</button>
        </div>
    `;
    clearInterval(GAME_STATE.timerInterval);
}

function checkAnswer() {
    const val = ui.input.value.trim().toLowerCase();
    const currentLvlConfig = LEVELS[GAME_STATE.currentLevel];

    if (val === currentLvlConfig.answer) {
        // Correct
        ui.message.className = 'message-area success-msg';
        ui.message.textContent = "ACCESS GRANTED. DECRYPTING NEXT FILE...";
        ui.input.disabled = true;

        // Celebration effect
        celebrateSuccess();

        setTimeout(() => {
            GAME_STATE.currentLevel++;
            saveProgress();
            updateProgress();
            loadLevel(GAME_STATE.currentLevel);
            ui.input.disabled = false;
            ui.input.focus();
        }, 1500);
    } else {
        // Incorrect
        ui.message.className = 'message-area error-msg';
        ui.message.textContent = "ACCESS DENIED. INVALID CREDENTIALS.";
        ui.container.classList.add('shake');
        setTimeout(() => ui.container.classList.remove('shake'), 500);
    }
}

function celebrateSuccess() {
    // Create particle effect
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 0.5 + 's';
            ui.container.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }, i * 20);
    }
}

function showHint() {
    const level = LEVELS[GAME_STATE.currentLevel];

    // Remove any existing hint modals first
    const existingModal = document.querySelector('.hint-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create custom modal
    const modal = document.createElement('div');
    modal.className = 'hint-modal';
    modal.innerHTML = `
        <div class="hint-modal-content">
            <h3>[ DECRYPTION ASSIST ]</h3>
            <p>${level.hint}</p>
            <button id="close-hint-btn">[ CLOSE ]</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Add close event listener
    document.getElementById('close-hint-btn').addEventListener('click', () => {
        modal.remove();
    });

    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    GAME_STATE.hintsUsed++;
}

// Ensure CSS exists
document.head.insertAdjacentHTML('beforeend', `
<style>
@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
.shake { animation: shake 0.5s; }
.fade-in { animation: fadeIn 1s; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
`);

// Boot
window.addEventListener('DOMContentLoaded', init);
