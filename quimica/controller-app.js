// ============================================
// LABORATORIO QUÍMICO - CONTROLLER APP
// ============================================

const elements = {
    H: { symbol: 'H', name: 'Hidrógeno', number: 1, group: 'nonmetal' },
    O: { symbol: 'O', name: 'Oxígeno', number: 8, group: 'nonmetal' },
    C: { symbol: 'C', name: 'Carbono', number: 6, group: 'nonmetal' },
    N: { symbol: 'N', name: 'Nitrógeno', number: 7, group: 'nonmetal' },
    Na: { symbol: 'Na', name: 'Sodio', number: 11, group: 'alkaline' },
    Cl: { symbol: 'Cl', name: 'Cloro', number: 17, group: 'halogen' },
    S: { symbol: 'S', name: 'Azufre', number: 16, group: 'nonmetal' },
    Fe: { symbol: 'Fe', name: 'Hierro', number: 26, group: 'metal' },
    Ca: { symbol: 'Ca', name: 'Calcio', number: 20, group: 'alkaline' },
    K: { symbol: 'K', name: 'Potasio', number: 19, group: 'alkaline' },
    Mg: { symbol: 'Mg', name: 'Magnesio', number: 12, group: 'alkaline' },
    P: { symbol: 'P', name: 'Fósforo', number: 15, group: 'nonmetal' },
    He: { symbol: 'He', name: 'Helio', number: 2, group: 'noble' },
    Ne: { symbol: 'Ne', name: 'Neón', number: 10, group: 'noble' },
    Al: { symbol: 'Al', name: 'Aluminio', number: 13, group: 'metal' },
    Si: { symbol: 'Si', name: 'Silicio', number: 14, group: 'nonmetal' }
};

let airconsole;
let playerData = null;
let isAdmin = false;
let hasJoined = false;
let currentCompound = null;
let myScore = 0;
let currentRound = 0;
let maxRounds = 8;

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    renderJoinScreen();
    
    airconsole = new AirConsole();
    
    airconsole.onReady = function() {
        console.log('🎮 Controller listo!');
    };
    
    airconsole.onMessage = function(from, data) {
        console.log('📨 Mensaje:', data);
        
        switch(data.action) {
            case 'joined': handleJoined(data); break;
            case 'gameFull': handleGameFull(); break;
            case 'gameStateUpdate': handleGameStateUpdate(data); break;
            case 'newRound': handleNewRound(data); break;
            case 'roundResult': handleRoundResult(data); break;
            case 'gameEnd': handleGameEnd(data); break;
        }
    };
}

function sendMessage(msg) {
    airconsole.message(AirConsole.SCREEN, msg);
}

// ============================================
// RENDER SCREENS
// ============================================

function renderJoinScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-5 text-center" id="joinScreen">
            <div class="w-full max-w-sm">
                <img src="../LogoSteamRD-Color.webp" alt="STEAM RD" class="w-20 h-20 mx-auto mb-4" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));">
                
                <h1 class="text-3xl font-black mb-1" style="color: #10b981;">LABORATORIO</h1>
                <h2 class="text-xl font-bold mb-6" style="color: #06b6d4;">QUÍMICO</h2>
                
                <div class="space-y-3 mb-6">
                    <div class="info-card">
                        <iconify-icon icon="mdi:flask" style="color: #10b981;"></iconify-icon>
                        <div class="text-left">
                            <p class="font-bold text-sm">Sintetiza compuestos</p>
                            <p class="text-xs text-white/60">Combina elementos químicos</p>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <iconify-icon icon="mdi:account-group" style="color: #3b82f6;"></iconify-icon>
                        <div class="text-left">
                            <p class="font-bold text-sm">Trabaja en equipo</p>
                            <p class="text-xs text-white/60">Colabora con otros científicos</p>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <iconify-icon icon="mdi:timer" style="color: #f59e0b;"></iconify-icon>
                        <div class="text-left">
                            <p class="font-bold text-sm">Contra el tiempo</p>
                            <p class="text-xs text-white/60">Más rápido = más puntos</p>
                        </div>
                    </div>
                </div>
                
                <button class="btn-primary w-full flex items-center justify-center gap-3" id="joinBtn">
                    <iconify-icon icon="mdi:flask" style="font-size: 24px;"></iconify-icon>
                    UNIRSE AL LAB
                </button>
                
                <div class="bg-lab-success/20 border-2 border-lab-success rounded-2xl py-3 px-6 mt-4 hidden items-center justify-center gap-3" id="connectingMsg">
                    <div class="w-5 h-5 border-2 border-lab-success rounded-full animate-spin" style="border-top-color: transparent;"></div>
                    <span class="font-bold text-lab-success">Conectando...</span>
                </div>
                
                <div class="bg-lab-danger/20 border-2 border-lab-danger rounded-2xl py-3 px-6 mt-4 hidden text-center" id="errorMsg">
                    <iconify-icon icon="mdi:alert-circle" class="text-3xl text-lab-danger mb-2"></iconify-icon>
                    <p class="font-bold text-lab-danger">Laboratorio lleno</p>
                    <p class="text-sm text-white/60">Ya hay 4 científicos</p>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('joinBtn').addEventListener('click', joinGame);
}


function renderWaitingScreen() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-5 text-center" id="waitingScreen">
            <div class="w-full max-w-sm">
                <div class="player-avatar mx-auto mb-4" id="playerAvatar" style="background: ${playerData.color};">
                    <iconify-icon icon="${playerData.icon}" style="color: white;"></iconify-icon>
                </div>
                
                <p class="text-2xl font-black mb-2" style="color: ${playerData.color};">${playerData.name}</p>
                
                ${isAdmin ? `
                    <div class="bg-lab-warning/20 border-2 border-lab-warning rounded-2xl py-3 px-5 mb-6 inline-flex items-center gap-2">
                        <iconify-icon icon="mdi:crown" class="text-2xl text-lab-warning"></iconify-icon>
                        <span class="font-bold text-lab-warning">ERES EL ADMIN</span>
                    </div>
                ` : ''}
                
                <div class="mb-8">
                    <iconify-icon icon="mdi:flask" class="text-6xl bounce" style="color: #10b981;"></iconify-icon>
                </div>
                
                <div class="bg-lab-success/20 border-2 border-lab-success rounded-2xl py-4 px-6 mb-6">
                    <p class="text-lg font-bold text-lab-success">
                        <iconify-icon icon="mdi:check-circle" class="mr-2"></iconify-icon>
                        ¡Conectado al laboratorio!
                    </p>
                </div>
                
                ${isAdmin ? `
                    <button class="btn-secondary w-full flex items-center justify-center gap-3" id="startGameBtn">
                        <iconify-icon icon="mdi:rocket-launch" style="font-size: 24px;"></iconify-icon>
                        ¡INICIAR EXPERIMENTO!
                    </button>
                ` : `
                    <p class="text-white/50">
                        <iconify-icon icon="mdi:timer-sand" class="mr-2"></iconify-icon>
                        Esperando que el admin inicie...
                    </p>
                `}
            </div>
        </div>
    `;
    
    if (isAdmin) {
        document.getElementById('startGameBtn').addEventListener('click', () => {
            sendMessage({ action: 'startGame' });
        });
    }
}

function renderPlayingScreen() {
    const app = document.getElementById('app');
    
    // Contar elementos necesarios
    const counts = {};
    if (currentCompound) {
        currentCompound.elements.forEach(el => counts[el] = (counts[el] || 0) + 1);
    }
    
    app.innerHTML = `
        <div class="screen active flex-col p-4" id="playingScreen">
            <!-- Header -->
            <div class="text-center mb-3">
                <p class="text-xs text-white/50 mb-1">Ronda ${currentRound} de ${maxRounds}</p>
                <p class="text-sm text-white/70 mb-2">Sintetiza:</p>
                
                <div class="target-card mb-3">
                    <div class="target-formula">${currentCompound?.formula || '???'}</div>
                    <p class="text-lab-accent font-semibold mt-1">${currentCompound?.name || ''}</p>
                </div>
                
                <div class="flex flex-wrap justify-center gap-2 mb-2" id="requiredElements">
                    ${Object.entries(counts).map(([el, count]) => `
                        <span class="required-badge">${count > 1 ? count + '×' : ''} ${el}</span>
                    `).join('')}
                </div>
            </div>
            
            <!-- Elements Grid -->
            <p class="text-xs text-center text-white/50 mb-2">Toca un elemento para añadirlo:</p>
            <div class="grid grid-cols-4 gap-2 justify-items-center flex-1 overflow-y-auto pb-4" id="elementsGrid"></div>
            
            <!-- Player Info -->
            <div class="mini-player mt-3">
                <div class="mini-avatar" style="background: ${playerData?.color || '#6366f1'};">
                    <iconify-icon icon="${playerData?.icon || 'mdi:flask'}"></iconify-icon>
                </div>
                <div class="flex-1">
                    <p class="font-bold text-sm">${playerData?.name || 'Científico'}</p>
                    <p class="text-xs text-white/50">${isAdmin ? '👑 Admin' : 'Científico'}</p>
                </div>
                <div class="score-display" id="scoreDisplay">${myScore}</div>
            </div>
        </div>
        
        <!-- Result Overlay -->
        <div class="result-overlay" id="resultOverlay">
            <div class="text-center p-8" id="resultContent"></div>
        </div>
    `;
    
    setupElementsGrid();
}

function setupElementsGrid() {
    const grid = document.getElementById('elementsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    Object.entries(elements).forEach(([key, el]) => {
        const btn = document.createElement('button');
        btn.className = `element-btn element-${el.group}`;
        btn.innerHTML = `
            <span class="atomic-number">${el.number}</span>
            <span class="symbol">${el.symbol}</span>
            <span class="name">${el.name}</span>
        `;
        btn.addEventListener('click', () => selectElement(key, btn));
        grid.appendChild(btn);
    });
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate('.element-btn', {
            scale: [0, 1],
            opacity: [0, 1],
            delay: window.anime.stagger(30),
            duration: 300,
            easing: 'easeOutBack'
        });
    }
}

function selectElement(element, btn) {
    sendMessage({ action: 'selectElement', element: element });
    
    // Feedback visual
    btn.classList.add('pop-in');
    
    // Vibración si está disponible
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
    
    setTimeout(() => btn.classList.remove('pop-in'), 400);
}


function renderEndScreen(data) {
    const myRank = data.players.findIndex(p => p.id === playerData.id) + 1;
    const myFinalScore = data.players.find(p => p.id === playerData.id)?.score || 0;
    
    const rankEmojis = ['🥇', '🥈', '🥉', '🏅'];
    const rankMessages = [
        '¡Eres el mejor científico!',
        '¡Excelente trabajo!',
        '¡Muy bien hecho!',
        '¡Buen intento!'
    ];
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-5 text-center" id="endScreen">
            <div class="w-full max-w-sm">
                <div class="text-6xl mb-4">${rankEmojis[myRank - 1] || '🧪'}</div>
                
                <div class="text-5xl font-black mb-2" style="color: ${myRank === 1 ? '#f59e0b' : myRank === 2 ? '#9ca3af' : '#b45309'};">
                    ${myRank}°
                </div>
                
                <div class="player-avatar mx-auto mb-4" style="background: ${playerData.color};">
                    <iconify-icon icon="${playerData.icon}" style="color: white;"></iconify-icon>
                </div>
                
                <p class="text-xl font-bold mb-2" style="color: ${playerData.color};">${playerData.name}</p>
                <p class="text-lg text-white/70 mb-4">${rankMessages[myRank - 1] || rankMessages[3]}</p>
                
                <div class="bg-lab-warning/20 border-2 border-lab-warning rounded-2xl py-4 px-6 mb-6">
                    <p class="text-3xl font-black text-lab-warning">${myFinalScore} pts</p>
                </div>
                
                ${myRank === 1 ? `
                    <div class="bg-lab-success/20 border-2 border-lab-success rounded-2xl py-3 px-5 mb-6">
                        <iconify-icon icon="mdi:trophy" class="text-3xl text-lab-success"></iconify-icon>
                        <p class="font-bold text-lab-success mt-2">¡GANADOR!</p>
                    </div>
                ` : ''}
                
                ${isAdmin ? `
                    <button class="btn-primary w-full flex items-center justify-center gap-3" id="playAgainBtn">
                        <iconify-icon icon="mdi:refresh" style="font-size: 24px;"></iconify-icon>
                        JUGAR DE NUEVO
                    </button>
                ` : `
                    <p class="text-white/50 text-sm">
                        <iconify-icon icon="mdi:timer-sand" class="mr-2"></iconify-icon>
                        Esperando al admin...
                    </p>
                `}
            </div>
        </div>
    `;
    
    if (isAdmin) {
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            sendMessage({ action: 'playAgain' });
        });
    }
    
    // Animaciones
    if (window.anime) {
        window.anime.animate('.player-avatar', {
            scale: [0, 1.2, 1],
            duration: 600,
            easing: 'easeOutElastic(1, .5)'
        });
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function joinGame() {
    if (hasJoined) return;
    hasJoined = true;
    
    document.getElementById('joinBtn').classList.add('hidden');
    document.getElementById('connectingMsg').classList.remove('hidden');
    document.getElementById('connectingMsg').classList.add('flex');
    
    sendMessage({ action: 'join' });
}

function handleJoined(data) {
    playerData = data.player;
    isAdmin = data.isAdmin;
    myScore = 0;
    
    renderWaitingScreen();
}

function handleGameFull() {
    document.getElementById('connectingMsg')?.classList.add('hidden');
    document.getElementById('errorMsg')?.classList.remove('hidden');
    hasJoined = false;
}

function handleGameStateUpdate(data) {
    if (data.players && data.players[playerData?.id]) {
        myScore = data.players[playerData.id].score;
        const scoreEl = document.getElementById('scoreDisplay');
        if (scoreEl) scoreEl.textContent = myScore;
    }
}

function handleNewRound(data) {
    currentCompound = data.compound;
    currentRound = data.round;
    maxRounds = data.maxRounds;
    
    renderPlayingScreen();
}

function handleRoundResult(data) {
    const overlay = document.getElementById('resultOverlay');
    const content = document.getElementById('resultContent');
    
    if (!overlay || !content) return;
    
    // Actualizar score
    if (data.players && data.players[playerData?.id]) {
        myScore = data.players[playerData.id].score;
    }
    
    if (data.correct) {
        content.innerHTML = `
            <iconify-icon icon="mdi:check-circle" class="text-7xl text-lab-success mb-4" style="filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.6));"></iconify-icon>
            <h2 class="text-3xl font-black text-lab-success mb-2">¡Síntesis Exitosa!</h2>
            <p class="text-xl text-white/80 mb-4">${data.compound.formula} - ${data.compound.name}</p>
            <div class="bg-lab-success/20 rounded-2xl py-3 px-6 inline-block">
                <p class="text-2xl font-bold text-lab-success">
                    <iconify-icon icon="mdi:star" class="mr-2"></iconify-icon>
                    +${data.compound.points} pts
                </p>
                ${data.timeBonus > 0 ? `<p class="text-sm text-lab-accent">+${data.timeBonus} bonus tiempo</p>` : ''}
            </div>
        `;
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
        content.innerHTML = `
            <iconify-icon icon="mdi:close-circle" class="text-7xl text-lab-danger mb-4" style="filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.6));"></iconify-icon>
            <h2 class="text-3xl font-black text-lab-danger mb-2">Reacción Fallida</h2>
            <p class="text-lg text-white/60 mb-4">La combinación no fue correcta</p>
            <p class="text-sm text-white/40">Se necesitaba: ${data.compound.elements.join(' + ')}</p>
        `;
        
        if (navigator.vibrate) navigator.vibrate(300);
    }
    
    overlay.classList.add('active');
    
    // Animación
    if (window.anime) {
        window.anime.animate('#resultContent iconify-icon', {
            scale: [0, 1.2, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    }
    
    setTimeout(() => overlay.classList.remove('active'), 3000);
}

function handleGameEnd(data) {
    renderEndScreen(data);
}

// ============================================
// INICIAR
// ============================================

init();