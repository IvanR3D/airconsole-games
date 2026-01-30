// ============================================
// LABORATORIO QUÍMICO - SCREEN APP
// ============================================

// Cargar estilos
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'screen-styles.css';
document.head.appendChild(styleLink);

// ============================================
// DATOS DEL JUEGO
// ============================================

const elements = {
    H: { symbol: 'H', name: 'Hidrógeno', number: 1, group: 'nonmetal', icon: 'mdi:atom' },
    O: { symbol: 'O', name: 'Oxígeno', number: 8, group: 'nonmetal', icon: 'mdi:weather-windy' },
    C: { symbol: 'C', name: 'Carbono', number: 6, group: 'nonmetal', icon: 'mdi:diamond-stone' },
    N: { symbol: 'N', name: 'Nitrógeno', number: 7, group: 'nonmetal', icon: 'mdi:cloud' },
    Na: { symbol: 'Na', name: 'Sodio', number: 11, group: 'alkaline', icon: 'mdi:shaker' },
    Cl: { symbol: 'Cl', name: 'Cloro', number: 17, group: 'halogen', icon: 'mdi:water' },
    S: { symbol: 'S', name: 'Azufre', number: 16, group: 'nonmetal', icon: 'mdi:fire' },
    Fe: { symbol: 'Fe', name: 'Hierro', number: 26, group: 'metal', icon: 'mdi:anvil' },
    Ca: { symbol: 'Ca', name: 'Calcio', number: 20, group: 'alkaline', icon: 'mdi:bone' },
    K: { symbol: 'K', name: 'Potasio', number: 19, group: 'alkaline', icon: 'mdi:fruit-bananas' },
    Mg: { symbol: 'Mg', name: 'Magnesio', number: 12, group: 'alkaline', icon: 'mdi:flash' },
    P: { symbol: 'P', name: 'Fósforo', number: 15, group: 'nonmetal', icon: 'mdi:lightbulb' },
    He: { symbol: 'He', name: 'Helio', number: 2, group: 'noble', icon: 'mdi:balloon' },
    Ne: { symbol: 'Ne', name: 'Neón', number: 10, group: 'noble', icon: 'mdi:led-strip' },
    Al: { symbol: 'Al', name: 'Aluminio', number: 13, group: 'metal', icon: 'mdi:can' },
    Si: { symbol: 'Si', name: 'Silicio', number: 14, group: 'nonmetal', icon: 'mdi:chip' }
};

const compounds = [
    { formula: 'H₂O', name: 'Agua', elements: ['H', 'H', 'O'], points: 100, hint: 'Esencial para la vida', icon: 'mdi:water' },
    { formula: 'NaCl', name: 'Sal de mesa', elements: ['Na', 'Cl'], points: 100, hint: 'Sazona tu comida', icon: 'mdi:shaker-outline' },
    { formula: 'CO₂', name: 'Dióxido de carbono', elements: ['C', 'O', 'O'], points: 150, hint: 'Lo exhalas al respirar', icon: 'mdi:molecule-co2' },
    { formula: 'NH₃', name: 'Amoníaco', elements: ['N', 'H', 'H', 'H'], points: 150, hint: 'Olor fuerte característico', icon: 'mdi:spray' },
    { formula: 'CH₄', name: 'Metano', elements: ['C', 'H', 'H', 'H', 'H'], points: 200, hint: 'Gas natural', icon: 'mdi:gas-burner' },
    { formula: 'H₂O₂', name: 'Agua oxigenada', elements: ['H', 'H', 'O', 'O'], points: 150, hint: 'Desinfectante común', icon: 'mdi:bottle-tonic-plus' },
    { formula: 'CaCO₃', name: 'Carbonato de calcio', elements: ['Ca', 'C', 'O', 'O', 'O'], points: 250, hint: 'En conchas y huesos', icon: 'mdi:bone' },
    { formula: 'KCl', name: 'Cloruro de potasio', elements: ['K', 'Cl'], points: 100, hint: 'Sustituto de sal', icon: 'mdi:shaker' },
    { formula: 'MgO', name: 'Óxido de magnesio', elements: ['Mg', 'O'], points: 120, hint: 'Antiácido estomacal', icon: 'mdi:pill' },
    { formula: 'SiO₂', name: 'Dióxido de silicio', elements: ['Si', 'O', 'O'], points: 150, hint: 'Arena y vidrio', icon: 'mdi:beach' },
    { formula: 'Fe₂O₃', name: 'Óxido de hierro', elements: ['Fe', 'Fe', 'O', 'O', 'O'], points: 250, hint: 'Herrumbre/Óxido', icon: 'mdi:iron' },
    { formula: 'CaO', name: 'Cal viva', elements: ['Ca', 'O'], points: 120, hint: 'Usado en construcción', icon: 'mdi:wall' }
];


// ============================================
// ESTADO DEL JUEGO
// ============================================

let airconsole;
let players = {};
let currentCompound = null;
let selectedElements = [];
let playerSelections = {}; // Track cada jugador si ya seleccionó
let gameTimer = 45;
let timerInterval = null;
let roundNumber = 0;
const MAX_ROUNDS = 8;
let usedCompounds = [];

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    renderIntroScreen();
    
    airconsole = new AirConsole();
    
    airconsole.onReady = function() {
        console.log('🧪 Laboratorio Químico listo!');
        createFloatingMolecules();
    };
    
    airconsole.onConnect = function(device_id) {
        console.log('📱 Dispositivo conectado:', device_id);
    };
    
    airconsole.onDisconnect = function(device_id) {
        if (players[device_id]) {
            delete players[device_id];
            updatePlayerSlots();
            updatePlayersArea();
            broadcastGameState();
        }
    };
    
    airconsole.onMessage = function(from, data) {
        console.log('📨 Mensaje de', from, ':', data);
        
        switch(data.action) {
            case 'join':
                handlePlayerJoin(from);
                break;
            case 'selectElement':
                handleElementSelection(from, data.element);
                break;
            case 'startGame':
                startGame();
                break;
            case 'playAgain':
                resetGame();
                break;
        }
    };
}

// ============================================
// RENDER SCREENS
// ============================================

function renderIntroScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen relative" id="introScreen">
            <div class="lab-bg">
                <div class="blob-green"></div>
                <div class="waves-container">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                </div>
            </div>
            <div id="floatingMolecules" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
            
            <div class="relative z-10 text-center max-w-5xl w-full px-2">
                <img src="../LogoSteamRD-Color.webp" alt="STEAM RD" class="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto mb-4 sm:mb-6 float-element" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));">
                
                <h1 class="intro-title mb-1 sm:mb-2">LABORATORIO</h1>
                <h2 class="subtitle mb-4 sm:mb-6 lg:mb-8">QUÍMICO</h2>
                
                <div class="flex flex-wrap justify-center items-center gap-2 sm:gap-3 lg:gap-4 mb-6 sm:mb-8 lg:mb-10" id="formulaDemo">
                    <div class="element-card element-nonmetal" style="transform: scale(0.8);">
                        <span class="atomic-number">1</span>
                        <span class="symbol">H</span>
                        <span class="name">Hidrógeno</span>
                    </div>
                    <iconify-icon icon="mdi:plus" class="text-2xl sm:text-3xl lg:text-4xl" style="color: var(--color-text-light);"></iconify-icon>
                    <div class="element-card element-nonmetal" style="transform: scale(0.8);">
                        <span class="atomic-number">8</span>
                        <span class="symbol">O</span>
                        <span class="name">Oxígeno</span>
                    </div>
                    <iconify-icon icon="mdi:arrow-right" class="text-2xl sm:text-3xl lg:text-4xl" style="color: var(--color-text-light);"></iconify-icon>
                    <div class="compound-result bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
                        <iconify-icon icon="mdi:water" class="mr-1 sm:mr-2"></iconify-icon>
                        H₂O
                    </div>
                </div>
                
                <p class="text-base sm:text-lg lg:text-xl mb-4 sm:mb-6 lg:mb-8" style="color: var(--color-text-light);">
                    <iconify-icon icon="mdi:flask" class="mr-2" style="color: var(--color-accent);"></iconify-icon>
                    Combina elementos y crea compuestos químicos
                </p>
                
                <p class="text-base sm:text-lg mb-3 sm:mb-4 waiting-dots" style="color: var(--color-primary);">Esperando científicos</p>
                
                <div class="flex justify-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8" id="playerSlots">
                    ${[0,1,2,3].map(i => `
                        <div class="player-slot" data-slot="${i}">
                            <iconify-icon icon="mdi:account-plus"></iconify-icon>
                        </div>
                    `).join('')}
                </div>
                
                <div class="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm" style="color: var(--color-text-light);">
                    <div class="flex items-center gap-1 sm:gap-2">
                        <iconify-icon icon="mdi:account-group" class="text-base sm:text-lg lg:text-xl" style="color: var(--color-primary);"></iconify-icon>
                        <span>2-4 jugadores</span>
                    </div>
                    <div class="flex items-center gap-1 sm:gap-2">
                        <iconify-icon icon="mdi:timer" class="text-base sm:text-lg lg:text-xl" style="color: var(--color-warning);"></iconify-icon>
                        <span>${MAX_ROUNDS} rondas</span>
                    </div>
                    <div class="flex items-center gap-1 sm:gap-2">
                        <iconify-icon icon="mdi:trophy" class="text-base sm:text-lg lg:text-xl" style="color: var(--color-warning);"></iconify-icon>
                        <span>Gana puntos</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Animar entrada
    setTimeout(() => {
        if (window.anime) {
            window.anime.animate('.intro-title', {
                scale: [0.5, 1],
                opacity: [0, 1],
                duration: 800,
                easing: 'spring(1, 80, 10, 0)'
            });
            
            window.anime.animate('.element-card', {
                translateY: [50, 0],
                opacity: [0, 1],
                delay: window.anime.stagger(100, {start: 300}),
                duration: 600,
                easing: 'easeOutBack'
            });
        }
    }, 100);
}


function renderPlayingScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active playing-screen relative" id="playingScreen">
            <div class="lab-bg">
                <div class="blob-green"></div>
                <div class="waves-container">
                    <div class="wave"></div>
                    <div class="wave"></div>
                    <div class="wave"></div>
                </div>
            </div>
            
            <!-- Header - Responsive -->
            <div class="relative z-10 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <div class="flex items-center gap-2 sm:gap-4">
                    <iconify-icon icon="mdi:flask-round-bottom" class="text-2xl sm:text-3xl lg:text-4xl" style="color: var(--color-accent);"></iconify-icon>
                    <div>
                        <h1 class="text-lg sm:text-xl lg:text-2xl font-bold" style="color: var(--color-text);">Laboratorio Químico</h1>
                        <div class="round-indicator mt-1 sm:mt-2" id="roundIndicator">
                            ${Array(MAX_ROUNDS).fill(0).map((_, i) => `<div class="round-dot" data-round="${i+1}"></div>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="timer-ring" id="timerRing">
                    <span class="time" id="timerDisplay">45</span>
                </div>
            </div>
            
            <!-- Main content area with responsive layout -->
            <div class="playing-content relative z-10">
                <!-- Target Compound - Responsive -->
                <div class="target-display text-center" id="targetDisplay">
                    <p class="text-sm sm:text-base lg:text-lg mb-1 sm:mb-2" style="color: var(--color-text-light);">
                        <iconify-icon icon="mdi:target" class="mr-1 sm:mr-2"></iconify-icon>
                        Sintetiza el compuesto:
                    </p>
                    <div class="target-formula" id="targetFormula">H₂O</div>
                    <p class="text-lg sm:text-xl lg:text-2xl font-semibold mt-1 sm:mt-2" style="color: var(--color-primary);" id="targetName">Agua</p>
                    <p class="text-xs sm:text-sm mt-1 sm:mt-2" style="color: var(--color-text-light);" id="targetHint">
                        <iconify-icon icon="mdi:lightbulb-outline" class="mr-1"></iconify-icon>
                        <span>Esencial para la vida</span>
                    </p>
                </div>
                
                <!-- Status indicator -->
                <div class="text-center">
                    <div class="status-indicator waiting inline-flex" id="statusIndicator">
                        <iconify-icon icon="mdi:timer-sand" class="animate-pulse"></iconify-icon>
                        <span>Esperando que todos seleccionen...</span>
                    </div>
                </div>
                
                <!-- Mixing Zone - Responsive with proper containment -->
                <div class="flex-1 flex flex-col min-h-0">
                    <div class="mixing-zone" id="mixingZone">
                        <div id="bubblesContainer" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
                        
                        <div class="text-center" id="mixingContent">
                            <iconify-icon icon="mdi:beaker-question" class="text-4xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4" style="color: var(--color-text-light); opacity: 0.4;"></iconify-icon>
                            <p class="text-sm sm:text-base lg:text-lg" style="color: var(--color-text-light);">Los científicos están seleccionando elementos...</p>
                        </div>
                        
                        <div class="hidden mixing-elements flex-wrap justify-center gap-2 sm:gap-3 lg:gap-4" id="selectedElements"></div>
                    </div>
                    
                    <!-- Required elements hint -->
                    <div class="mt-2 sm:mt-3 lg:mt-4 text-center" id="requiredHint">
                        <p class="text-xs sm:text-sm mb-1 sm:mb-2" style="color: var(--color-text-light);">Elementos necesarios:</p>
                        <div class="flex justify-center gap-1 sm:gap-2 flex-wrap" id="requiredElements"></div>
                    </div>
                </div>
            </div>
            
            <!-- Players Area - Responsive grid with proper CSS class -->
            <div class="players-area relative z-10" id="playersArea"></div>
        </div>
        
        <!-- Result Overlay -->
        <div class="result-overlay" id="resultOverlay">
            <div class="result-content" id="resultContent"></div>
        </div>
    `;
    
    // Setup resize handler for responsive grid recalculation
    setupResizeHandler();
}

// Resize handler for responsive grid recalculation
let resizeTimeout = null;

function setupResizeHandler() {
    // Remove any existing resize listener to avoid duplicates
    window.removeEventListener('resize', handleScreenResize);
    
    // Add resize listener
    window.addEventListener('resize', handleScreenResize);
}

function handleScreenResize() {
    // Debounce resize events for performance
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    resizeTimeout = setTimeout(() => {
        recalculatePlayersGrid();
    }, 150);
}

function recalculatePlayersGrid() {
    const playersArea = document.getElementById('playersArea');
    if (!playersArea) return;
    
    // Force layout recalculation by triggering reflow
    playersArea.style.display = 'none';
    // eslint-disable-next-line no-unused-expressions
    playersArea.offsetHeight; // Trigger reflow
    playersArea.style.display = '';
    
    // Update players area to ensure proper grid layout
    updatePlayersArea();
}

function renderEndScreen(winner, sortedPlayers) {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen relative" id="endScreen">
            <div class="lab-bg"></div>
            <div id="confettiContainer" class="fixed inset-0 pointer-events-none z-50"></div>
            
            <div class="relative z-10 text-center max-w-3xl w-full px-2">
                <iconify-icon icon="mdi:trophy" class="text-5xl sm:text-6xl lg:text-8xl text-yellow-400 glow-orange mb-4 sm:mb-6 result-icon"></iconify-icon>
                
                <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black mb-1 sm:mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    ¡Experimento Completado!
                </h1>
                <p class="text-base sm:text-lg lg:text-xl text-white/70 mb-4 sm:mb-6 lg:mb-8">El mejor científico del laboratorio es...</p>
                
                <!-- Winner Card -->
                <div class="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 winner-card">
                    <div class="flex items-center justify-center gap-3 sm:gap-4 lg:gap-6">
                        <div class="player-avatar text-2xl sm:text-3xl lg:text-4xl" style="background: ${winner.color}; width: clamp(60px, 12vw, 100px); height: clamp(60px, 12vw, 100px);">
                            <iconify-icon icon="mdi:crown" class="text-yellow-300"></iconify-icon>
                        </div>
                        <div class="text-left">
                            <p class="text-xl sm:text-2xl lg:text-3xl font-black">${winner.name}</p>
                            <p class="text-2xl sm:text-3xl lg:text-4xl font-black text-yellow-400">${winner.score} pts</p>
                        </div>
                    </div>
                </div>
                
                <!-- Leaderboard -->
                <div class="space-y-2 sm:space-y-3 mb-4 sm:mb-6 lg:mb-8" id="leaderboard">
                    ${sortedPlayers.map((player, i) => `
                        <div class="leaderboard-item ${i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : ''}">
                            <div class="rank-badge ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'bg-white/10'}">${i + 1}</div>
                            <div class="player-avatar" style="background: ${player.color};">
                                <iconify-icon icon="mdi:flask" class="text-base sm:text-lg lg:text-xl"></iconify-icon>
                            </div>
                            <div class="flex-1 text-left min-w-0">
                                <p class="font-bold text-sm sm:text-base lg:text-lg truncate">${player.name}</p>
                            </div>
                            <div class="score-badge">${player.score} pts</div>
                        </div>
                    `).join('')}
                </div>
                
                <p class="text-white/50 text-xs sm:text-sm">
                    <iconify-icon icon="mdi:information" class="mr-1"></iconify-icon>
                    El Jugador 1 puede iniciar una nueva partida
                </p>
            </div>
        </div>
    `;
    
    createConfetti();
    
    // Animaciones
    setTimeout(() => {
        if (window.anime) {
            window.anime.animate('.result-icon', {
                scale: [0, 1.2, 1],
                rotate: [0, 10, -10, 0],
                duration: 1000,
                easing: 'easeOutElastic(1, .5)'
            });
            
            window.anime.animate('.winner-card', {
                scale: [0.8, 1],
                opacity: [0, 1],
                duration: 600,
                delay: 300,
                easing: 'easeOutBack'
            });
            
            window.anime.animate('.leaderboard-item', {
                translateX: [-50, 0],
                opacity: [0, 1],
                delay: window.anime.stagger(100, {start: 600}),
                duration: 500,
                easing: 'easeOutCubic'
            });
        }
    }, 100);
}


// ============================================
// GAME LOGIC
// ============================================

function handlePlayerJoin(device_id) {
    if (Object.keys(players).length >= 4) {
        airconsole.message(device_id, { action: 'gameFull' });
        return;
    }
    
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
    const icons = ['mdi:flask', 'mdi:atom', 'mdi:molecule', 'mdi:test-tube'];
    const playerNum = Object.keys(players).length;
    
    players[device_id] = {
        id: device_id,
        name: airconsole.getNickname(device_id) || `Científico ${playerNum + 1}`,
        color: colors[playerNum],
        icon: icons[playerNum],
        score: 0,
        isAdmin: playerNum === 0
    };
    
    airconsole.message(device_id, {
        action: 'joined',
        player: players[device_id],
        isAdmin: players[device_id].isAdmin,
        elements: Object.keys(elements)
    });
    
    updatePlayerSlots();
    broadcastGameState();
    
    // Animación de entrada
    if (window.anime) {
        const slot = document.querySelector(`.player-slot[data-slot="${playerNum}"]`);
        if (slot) {
            window.anime.animate(slot, {
                scale: [0.5, 1.2, 1],
                duration: 500,
                easing: 'easeOutBack'
            });
        }
    }
}

function updatePlayerSlots() {
    const playerList = Object.values(players);
    
    for (let i = 0; i < 4; i++) {
        const slot = document.querySelector(`.player-slot[data-slot="${i}"]`);
        if (!slot) continue;
        
        if (playerList[i]) {
            slot.classList.add('filled');
            slot.style.setProperty('--player-color', playerList[i].color);
            slot.innerHTML = `<iconify-icon icon="${playerList[i].icon}" style="font-size: 2rem; color: white;"></iconify-icon>`;
        } else {
            slot.classList.remove('filled');
            slot.style.removeProperty('--player-color');
            slot.innerHTML = `<iconify-icon icon="mdi:account-plus" style="font-size: 2rem; color: rgba(255,255,255,0.3);"></iconify-icon>`;
        }
    }
}

function broadcastGameState() {
    airconsole.broadcast({
        action: 'gameStateUpdate',
        players: players,
        currentCompound: currentCompound,
        selectedElements: selectedElements,
        round: roundNumber,
        maxRounds: MAX_ROUNDS
    });
}

function startGame() {
    renderPlayingScreen();
    roundNumber = 0;
    usedCompounds = [];
    Object.values(players).forEach(p => p.score = 0);
    nextRound();
}

function nextRound() {
    roundNumber++;
    
    if (roundNumber > MAX_ROUNDS) {
        endGame();
        return;
    }
    
    selectedElements = [];
    playerSelections = {}; // Reset selecciones de jugadores
    
    // Inicializar estado de cada jugador
    Object.keys(players).forEach(pid => {
        playerSelections[pid] = { hasSelected: false, element: null };
    });
    
    // Seleccionar compuesto no usado
    const availableCompounds = compounds.filter(c => !usedCompounds.includes(c.formula));
    currentCompound = availableCompounds[Math.floor(Math.random() * availableCompounds.length)];
    usedCompounds.push(currentCompound.formula);
    
    // Actualizar UI
    updateRoundIndicator();
    updateTargetDisplay();
    updateRequiredElements();
    resetMixingZone();
    updatePlayersArea();
    
    // Timer
    gameTimer = 45;
    updateTimerDisplay();
    
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        gameTimer--;
        updateTimerDisplay();
        
        if (gameTimer <= 0) {
            clearInterval(timerInterval);
            checkCompound();
        }
    }, 1000);
    
    // Broadcast
    airconsole.broadcast({
        action: 'newRound',
        compound: currentCompound,
        round: roundNumber,
        maxRounds: MAX_ROUNDS,
        elements: Object.keys(elements)
    });
    
    // Animación
    if (window.anime) {
        window.anime.animate('.target-display', {
            scale: [0.9, 1],
            opacity: [0, 1],
            duration: 500,
            easing: 'easeOutBack'
        });
    }
}

function updateRoundIndicator() {
    const dots = document.querySelectorAll('.round-dot');
    dots.forEach((dot, i) => {
        dot.classList.remove('completed', 'current');
        if (i + 1 < roundNumber) dot.classList.add('completed');
        else if (i + 1 === roundNumber) dot.classList.add('current');
    });
}

function updateTargetDisplay() {
    document.getElementById('targetFormula').textContent = currentCompound.formula;
    document.getElementById('targetName').textContent = currentCompound.name;
    document.getElementById('targetHint').querySelector('span').textContent = currentCompound.hint;
}

function updateRequiredElements() {
    const container = document.getElementById('requiredElements');
    const counts = {};
    currentCompound.elements.forEach(el => counts[el] = (counts[el] || 0) + 1);
    
    container.innerHTML = Object.entries(counts).map(([el, count]) => `
        <span class="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/20">
            ${count > 1 ? count + '×' : ''} ${el}
        </span>
    `).join('');
}

function resetMixingZone() {
    const zone = document.getElementById('mixingZone');
    zone.classList.remove('active', 'reacting');
    
    document.getElementById('mixingContent').classList.remove('hidden');
    document.getElementById('selectedElements').classList.add('hidden');
    document.getElementById('selectedElements').innerHTML = '';
}

function updateTimerDisplay() {
    const display = document.getElementById('timerDisplay');
    const ring = document.getElementById('timerRing');
    
    if (!display || !ring) return;
    
    display.textContent = gameTimer;
    const progress = (gameTimer / 45) * 100;
    ring.style.setProperty('--progress', `${progress}%`);
    
    ring.classList.remove('warning', 'danger');
    if (gameTimer <= 10) ring.classList.add('danger');
    else if (gameTimer <= 20) ring.classList.add('warning');
}


function handleElementSelection(device_id, element) {
    if (!currentCompound) return;
    if (!playerSelections[device_id]) return;
    
    // Si el jugador ya seleccionó, ignorar
    if (playerSelections[device_id].hasSelected) return;
    
    // Marcar que este jugador ya seleccionó
    playerSelections[device_id].hasSelected = true;
    playerSelections[device_id].element = element;
    
    selectedElements.push({ element, player: device_id });
    
    const zone = document.getElementById('mixingZone');
    const content = document.getElementById('mixingContent');
    const container = document.getElementById('selectedElements');
    
    content.classList.add('hidden');
    container.classList.remove('hidden');
    zone.classList.add('active');
    
    // Crear elemento visual
    const el = elements[element];
    const card = document.createElement('div');
    card.className = `element-card element-${el.group}`;
    card.innerHTML = `
        <span class="atomic-number">${el.number}</span>
        <span class="symbol">${el.symbol}</span>
        <span class="name">${el.name}</span>
    `;
    container.appendChild(card);
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate(card, {
            scale: [0, 1.2, 1],
            rotate: [Math.random() * 20 - 10, 0],
            duration: 400,
            easing: 'easeOutBack'
        });
    }
    
    // Crear burbujas
    createBubbles();
    
    // Actualizar UI de jugadores (mostrar quién ya seleccionó)
    updatePlayersArea(device_id);
    
    // Notificar al jugador que su selección fue recibida
    airconsole.message(device_id, { 
        action: 'selectionConfirmed', 
        element: element 
    });
    
    // Verificar si TODOS los jugadores han seleccionado
    const totalPlayers = Object.keys(players).length;
    const playersWhoSelected = Object.values(playerSelections).filter(p => p.hasSelected).length;
    
    if (playersWhoSelected >= totalPlayers) {
        // Todos seleccionaron, verificar resultado
        clearInterval(timerInterval);
        zone.classList.add('reacting');
        
        setTimeout(() => {
            checkCompound();
        }, 1000);
    }
    
    broadcastGameState();
}

function checkCompound() {
    const selected = selectedElements.map(e => e.element).sort();
    const required = [...currentCompound.elements].sort();
    
    const isCorrect = selected.length === required.length && 
                     selected.every((el, i) => el === required[i]);
    
    showResult(isCorrect);
    
    if (isCorrect) {
        // Dar puntos
        const participants = [...new Set(selectedElements.map(e => e.player))];
        const basePoints = currentCompound.points;
        const timeBonus = Math.floor(gameTimer * 2);
        const totalPoints = basePoints + timeBonus;
        const pointsPerPlayer = Math.floor(totalPoints / participants.length);
        
        participants.forEach(pid => {
            if (players[pid]) {
                players[pid].score += pointsPerPlayer;
            }
        });
    }
    
    updatePlayersArea();
    
    airconsole.broadcast({
        action: 'roundResult',
        correct: isCorrect,
        compound: currentCompound,
        players: players,
        timeBonus: isCorrect ? Math.floor(gameTimer * 2) : 0
    });
    
    setTimeout(nextRound, 3500);
}

function showResult(isCorrect) {
    const overlay = document.getElementById('resultOverlay');
    const content = document.getElementById('resultContent');
    
    if (isCorrect) {
        content.innerHTML = `
            <iconify-icon icon="mdi:check-circle" class="result-icon" style="color: var(--color-success);"></iconify-icon>
            <h2 class="text-3xl sm:text-4xl font-black mb-4" style="color: var(--color-success);">¡Síntesis Exitosa!</h2>
            <div class="compound-result bg-gradient-to-r from-emerald-500 to-teal-500 text-white inline-block mb-4">
                <iconify-icon icon="${currentCompound.icon}" class="mr-2 sm:mr-3"></iconify-icon>
                ${currentCompound.formula}
            </div>
            <p class="text-xl sm:text-2xl" style="color: var(--color-text);">${currentCompound.name}</p>
            <p class="text-lg sm:text-xl mt-4" style="color: var(--color-success);">
                <iconify-icon icon="mdi:star" class="mr-2"></iconify-icon>
                +${currentCompound.points} pts + ${Math.floor(gameTimer * 2)} bonus tiempo
            </p>
        `;
        createConfetti();
    } else {
        content.innerHTML = `
            <iconify-icon icon="mdi:close-circle" class="result-icon" style="color: var(--color-danger);"></iconify-icon>
            <h2 class="text-3xl sm:text-4xl font-black mb-4" style="color: var(--color-danger);">Reacción Fallida</h2>
            <div class="compound-result bg-gradient-to-r from-red-500 to-orange-500 text-white inline-block mb-4">
                <iconify-icon icon="mdi:flask-empty-off" class="mr-2 sm:mr-3"></iconify-icon>
                ???
            </div>
            <p class="text-lg sm:text-xl mt-4" style="color: var(--color-text-light);">La combinación no fue correcta</p>
            <p class="text-base sm:text-lg mt-2" style="color: var(--color-text-light); opacity: 0.7;">Se necesitaba: ${currentCompound.elements.join(' + ')}</p>
        `;
    }
    
    overlay.classList.add('active');
    
    // Animación
    if (window.anime) {
        window.anime.animate('.result-icon', {
            scale: [0, 1.3, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
        });
        
        window.anime.animate('.compound-result', {
            translateY: [30, 0],
            opacity: [0, 1],
            duration: 500,
            delay: 200,
            easing: 'easeOutCubic'
        });
    }
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 3000);
}

function updatePlayersArea(activePlayer = null) {
    const area = document.getElementById('playersArea');
    if (!area) return;
    
    area.innerHTML = Object.values(players).map(player => {
        const hasSelected = playerSelections[player.id]?.hasSelected || false;
        const selectedElement = playerSelections[player.id]?.element || null;
        
        return `
            <div class="player-card ${hasSelected ? 'ready' : 'waiting'}" style="--player-color: ${player.color};">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="player-avatar" style="background: ${player.color};">
                        <iconify-icon icon="${player.icon}" style="color: white;"></iconify-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold truncate text-sm sm:text-base">${player.name}</p>
                        <p class="text-xs sm:text-sm" style="color: ${hasSelected ? 'var(--color-success)' : 'var(--color-text-light)'};">
                            ${hasSelected ? `<iconify-icon icon="mdi:check-circle" style="color: var(--color-success);"></iconify-icon> ${selectedElement || 'Listo'}` : '<iconify-icon icon="mdi:timer-sand" class="animate-pulse"></iconify-icon> Seleccionando...'}
                        </p>
                    </div>
                    <div class="score-badge">${player.score}</div>
                </div>
            </div>
        `;
    }).join('');
}


function endGame() {
    if (timerInterval) clearInterval(timerInterval);
    
    const sorted = Object.values(players).sort((a, b) => b.score - a.score);
    const winner = sorted[0];
    
    renderEndScreen(winner, sorted);
    
    airconsole.broadcast({
        action: 'gameEnd',
        winner: winner,
        players: sorted
    });
}

function resetGame() {
    Object.values(players).forEach(p => p.score = 0);
    usedCompounds = [];
    renderIntroScreen();
    updatePlayerSlots();
    broadcastGameState();
}

// ============================================
// VISUAL EFFECTS
// ============================================

function createFloatingMolecules() {
    const container = document.getElementById('floatingMolecules');
    if (!container) return;
    
    const molecules = ['H₂O', 'CO₂', 'O₂', 'N₂', 'NaCl', 'CH₄'];
    const icons = ['mdi:water', 'mdi:molecule-co2', 'mdi:weather-windy', 'mdi:cloud', 'mdi:shaker', 'mdi:gas-burner'];
    
    for (let i = 0; i < 8; i++) {
        const molecule = document.createElement('div');
        molecule.className = 'particle molecule float-element';
        molecule.style.left = Math.random() * 100 + '%';
        molecule.style.top = Math.random() * 100 + '%';
        molecule.style.animationDelay = Math.random() * 5 + 's';
        molecule.style.animationDuration = (15 + Math.random() * 10) + 's';
        
        const idx = Math.floor(Math.random() * molecules.length);
        molecule.innerHTML = `<iconify-icon icon="${icons[idx]}" style="color: rgba(255,255,255,0.5);"></iconify-icon>`;
        
        container.appendChild(molecule);
    }
}

function createBubbles() {
    const container = document.getElementById('bubblesContainer');
    if (!container) return;
    
    for (let i = 0; i < 5; i++) {
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        const size = 10 + Math.random() * 20;
        bubble.style.width = size + 'px';
        bubble.style.height = size + 'px';
        bubble.style.left = 20 + Math.random() * 60 + '%';
        bubble.style.bottom = '0';
        bubble.style.animationDelay = Math.random() * 0.5 + 's';
        bubble.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        container.appendChild(bubble);
        
        setTimeout(() => bubble.remove(), 4000);
    }
}

function createConfetti() {
    const container = document.getElementById('confettiContainer') || document.body;
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
    const shapes = ['square', 'circle'];
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const color = colors[Math.floor(Math.random() * colors.length)];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        const size = 8 + Math.random() * 8;
        
        confetti.style.width = size + 'px';
        confetti.style.height = size + 'px';
        confetti.style.background = color;
        confetti.style.borderRadius = shape === 'circle' ? '50%' : '2px';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-20px';
        
        container.appendChild(confetti);
        
        if (window.anime) {
            window.anime.animate(confetti, {
                translateY: [0, window.innerHeight + 100],
                translateX: [0, (Math.random() - 0.5) * 200],
                rotate: [0, Math.random() * 720],
                opacity: [1, 0],
                duration: 2000 + Math.random() * 2000,
                delay: Math.random() * 500,
                easing: 'easeOutCubic',
                complete: () => confetti.remove()
            });
        } else {
            confetti.style.animation = `confettiFall ${2 + Math.random() * 2}s ease-out forwards`;
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            setTimeout(() => confetti.remove(), 5000);
        }
    }
}

// ============================================
// INICIAR
// ============================================

init();