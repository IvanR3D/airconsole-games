// ============================================
// LABORATORIO QUÍMICO - CONTROLLER APP
// Sistema de Dificultades
// ============================================

// ============================================
// CONFIGURACIÓN DE MODOS DE JUEGO
// ============================================

const GAME_MODES = {
    teams: {
        id: 'teams',
        name: 'Equipos',
        icon: 'mdi:account-group',
        color: '#3b82f6',
        description: '2 equipos compiten entre sí'
    },
    individual: {
        id: 'individual',
        name: 'Individual',
        icon: 'mdi:account',
        color: '#8b5cf6',
        description: 'Todos contra todos'
    }
};

let currentGameMode = 'teams';

// ============================================
// CONFIGURACIÓN DE DIFICULTADES
// ============================================

const DIFFICULTY_CONFIG = {
    easy: {
        name: 'Fácil',
        icon: 'mdi:flask-outline',
        color: '#10b981',
        description: 'Fórmula y elementos visibles',
        showFormula: true,
        showRequiredElements: true,
        showHint: true
    },
    medium: {
        name: 'Intermedio',
        icon: 'mdi:flask',
        color: '#f59e0b',
        description: 'Solo nombre, con pista',
        showFormula: false,
        showRequiredElements: false,
        showHint: true
    },
    hard: {
        name: 'Difícil',
        icon: 'mdi:flask-round-bottom',
        color: '#ef4444',
        description: 'Solo nombre, sin pistas',
        showFormula: false,
        showRequiredElements: false,
        showHint: false
    }
};

const ROUNDS_OPTIONS = [4, 6, 8, 10, 12, 15];

// Rondas personalizadas seleccionadas por el admin
let selectedRounds = null; // null = usar defaultRounds de la dificultad

// Estado del wizard de configuración
let configStep = 1; // 1: Modo, 2: Dificultad, 3: Rondas

// ============================================
// ELEMENTOS EXPANDIDOS
// ============================================

const allElements = {
    H: { symbol: 'H', name: 'Hidrógeno', number: 1, group: 'nonmetal' },
    He: { symbol: 'He', name: 'Helio', number: 2, group: 'noble' },
    Li: { symbol: 'Li', name: 'Litio', number: 3, group: 'alkaline' },
    Be: { symbol: 'Be', name: 'Berilio', number: 4, group: 'alkaline-earth' },
    B: { symbol: 'B', name: 'Boro', number: 5, group: 'metalloid' },
    C: { symbol: 'C', name: 'Carbono', number: 6, group: 'nonmetal' },
    N: { symbol: 'N', name: 'Nitrógeno', number: 7, group: 'nonmetal' },
    O: { symbol: 'O', name: 'Oxígeno', number: 8, group: 'nonmetal' },
    F: { symbol: 'F', name: 'Flúor', number: 9, group: 'halogen' },
    Ne: { symbol: 'Ne', name: 'Neón', number: 10, group: 'noble' },
    Na: { symbol: 'Na', name: 'Sodio', number: 11, group: 'alkaline' },
    Mg: { symbol: 'Mg', name: 'Magnesio', number: 12, group: 'alkaline-earth' },
    Al: { symbol: 'Al', name: 'Aluminio', number: 13, group: 'metal' },
    Si: { symbol: 'Si', name: 'Silicio', number: 14, group: 'metalloid' },
    P: { symbol: 'P', name: 'Fósforo', number: 15, group: 'nonmetal' },
    S: { symbol: 'S', name: 'Azufre', number: 16, group: 'nonmetal' },
    Cl: { symbol: 'Cl', name: 'Cloro', number: 17, group: 'halogen' },
    Ar: { symbol: 'Ar', name: 'Argón', number: 18, group: 'noble' },
    K: { symbol: 'K', name: 'Potasio', number: 19, group: 'alkaline' },
    Ca: { symbol: 'Ca', name: 'Calcio', number: 20, group: 'alkaline-earth' },
    Fe: { symbol: 'Fe', name: 'Hierro', number: 26, group: 'transition' },
    Cu: { symbol: 'Cu', name: 'Cobre', number: 29, group: 'transition' },
    Zn: { symbol: 'Zn', name: 'Zinc', number: 30, group: 'transition' },
    Br: { symbol: 'Br', name: 'Bromo', number: 35, group: 'halogen' },
    Kr: { symbol: 'Kr', name: 'Kriptón', number: 36, group: 'noble' },
    Ag: { symbol: 'Ag', name: 'Plata', number: 47, group: 'transition' },
    I: { symbol: 'I', name: 'Yodo', number: 53, group: 'halogen' },
    Au: { symbol: 'Au', name: 'Oro', number: 79, group: 'transition' },
    Hg: { symbol: 'Hg', name: 'Mercurio', number: 80, group: 'transition' },
    Pb: { symbol: 'Pb', name: 'Plomo', number: 82, group: 'metal' }
};

// Elementos disponibles (se actualiza según dificultad)
let elements = { ...allElements };
let availableElementKeys = Object.keys(allElements);

let airconsole;
let playerData = null;
let isAdmin = false;
let hasJoined = false;
let currentCompound = null;
let myScore = 0;
let currentRound = 0;
let maxRounds = 8;
let hasSelectedThisRound = false;
let selectedElement = null;
let currentDifficulty = 'easy';
let difficultyConfig = DIFFICULTY_CONFIG.easy;

// ============================================
// MULTI-ELEMENT SELECTION STATE
// ============================================

let selectedElements = [];
let maxSelections = 5;

function selectElement(element) {
    if (selectedElements.length >= maxSelections) return false;
    selectedElements.push(element);
    return true;
}

function deselectElement(index) {
    if (index < 0 || index >= selectedElements.length) return false;
    selectedElements.splice(index, 1);
    return true;
}

function getSelectionCount(element) {
    return selectedElements.filter(el => el === element).length;
}

function clearSelection() {
    selectedElements = [];
}

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
            case 'gameStarted': handleGameStarted(data); break;
            case 'newRound': handleNewRound(data); break;
            case 'selectionConfirmed': handleSelectionConfirmed(data); break;
            case 'roundResult': handleRoundResult(data); break;
            case 'gameEnd': handleGameEnd(data); break;
            case 'gameReset': handleGameReset(data); break;
            case 'gameError': handleGameError(data); break;
            case 'roundsChanged': handleRoundsChanged(data); break;
        }
    };
    
    // Detectar cambios de orientación
    setupOrientationListener();
}

// Listener para cambios de orientación
function setupOrientationListener() {
    // Usar tanto resize como orientationchange para máxima compatibilidad
    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    // También usar matchMedia para detectar cambios de orientación
    const landscapeQuery = window.matchMedia('(orientation: landscape)');
    landscapeQuery.addEventListener('change', handleOrientationChange);
}

let lastOrientation = null;

function handleOrientationChange() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const currentOrientation = isLandscape ? 'landscape' : 'portrait';
    
    // Solo actuar si realmente cambió la orientación
    if (lastOrientation !== currentOrientation) {
        lastOrientation = currentOrientation;
        console.log('📱 Orientación:', currentOrientation);
        
        // Agregar clase al body para CSS fallback
        document.body.classList.remove('is-landscape', 'is-portrait');
        document.body.classList.add(`is-${currentOrientation}`);
        
        // Forzar re-layout
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }
}

function handleRoundsChanged(data) {
    if (data.rounds) {
        selectedRounds = data.rounds;
        maxRounds = data.rounds;
        // Actualizar UI si estamos en la pantalla de espera
        const roundsDisplay = document.getElementById('roundsDisplay');
        if (roundsDisplay) {
            roundsDisplay.textContent = `${data.rounds} rondas`;
        }
    }
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
            <div class="w-full max-w-sm mx-auto">
                <img src="../LogoSteamRD-Color.webp" alt="STEAM RD" class="w-20 h-20 mx-auto mb-4" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));">
                
                <h1 class="text-3xl font-black mb-1" style="color: #10b981;">LABORATORIO</h1>
                <h2 class="text-xl font-bold mb-6" style="color: #06b6d4;">QUÍMICO</h2>
                
                <div class="space-y-3 mb-6">
                    <div class="info-card">
                        <iconify-icon icon="mdi:flask" style="color: #10b981;"></iconify-icon>
                        <div class="text-left">
                            <p class="info-title">Sintetiza compuestos</p>
                            <p class="info-description">Combina elementos químicos</p>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <iconify-icon icon="mdi:account-group" style="color: #3b82f6;"></iconify-icon>
                        <div class="text-left">
                            <p class="info-title">Trabaja en equipo</p>
                            <p class="info-description">Colabora con otros científicos</p>
                        </div>
                    </div>
                    
                    <div class="info-card">
                        <iconify-icon icon="mdi:timer" style="color: #f59e0b;"></iconify-icon>
                        <div class="text-left">
                            <p class="info-title">Contra el tiempo</p>
                            <p class="info-description">Más rápido = más puntos</p>
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
    
    // Si es admin, mostrar wizard de configuración
    if (isAdmin) {
        renderConfigWizard();
        return;
    }
    
    // Para jugadores normales, mostrar pantalla de espera
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-5 text-center relative" id="waitingScreen">
            <div class="controller-bg"></div>
            
            <!-- Botón salir en esquina superior -->
            <button class="exit-btn-corner" id="exitWaitingBtn" title="Salir del laboratorio">
                <iconify-icon icon="mdi:exit-to-app"></iconify-icon>
            </button>
            
            <div class="relative z-10 w-full max-w-sm">
                <div class="player-avatar mx-auto mb-4" id="playerAvatar" style="background: ${playerData.color};">
                    <iconify-icon icon="${playerData.icon}" style="color: white;"></iconify-icon>
                </div>
                
                <p class="text-2xl font-black mb-2" style="color: ${playerData.color};">${playerData.name}</p>
                
                <div class="current-difficulty mb-4">
                    <p class="text-sm mb-2" style="color: var(--color-text-light);">Configuración actual:</p>
                    
                    <div class="config-summary">
                        <div class="config-item">
                            <iconify-icon icon="${GAME_MODES[currentGameMode].icon}" style="color: ${GAME_MODES[currentGameMode].color};"></iconify-icon>
                            <span>${GAME_MODES[currentGameMode].name}</span>
                        </div>
                        <div class="config-item">
                            <iconify-icon icon="${difficultyConfig.icon}" style="color: ${difficultyConfig.color};"></iconify-icon>
                            <span>${difficultyConfig.name}</span>
                        </div>
                        <div class="config-item">
                            <iconify-icon icon="mdi:counter" style="color: var(--color-primary);"></iconify-icon>
                            <span id="roundsDisplay">${selectedRounds || 8} rondas</span>
                        </div>
                    </div>
                </div>
                
                <div class="mb-6">
                    <iconify-icon icon="mdi:flask" class="text-5xl bounce" style="color: var(--color-accent);"></iconify-icon>
                </div>
                
                <div class="bg-green-50 border-2 border-green-400 rounded-2xl py-3 px-5 mb-4">
                    <p class="text-base font-bold" style="color: var(--color-success);">
                        <iconify-icon icon="mdi:check-circle" class="mr-2"></iconify-icon>
                        ¡Conectado al laboratorio!
                    </p>
                </div>
                
                <p style="color: var(--color-text-light);">
                    <iconify-icon icon="mdi:timer-sand" class="mr-2"></iconify-icon>
                    Esperando que el admin inicie...
                </p>
            </div>
        </div>
    `;
    
    // Event listener para botón de salir
    document.getElementById('exitWaitingBtn')?.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres salir del laboratorio?')) {
            sendMessage({ action: 'playerLeave' });
            hasJoined = false;
            playerData = null;
            isAdmin = false;
            renderJoinScreen();
        }
    });
}

// ============================================
// WIZARD DE CONFIGURACIÓN (Admin)
// ============================================

function renderConfigWizard() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="screen active flex-col p-3 relative config-wizard-screen" id="configWizard">
            <div class="controller-bg"></div>
            
            <!-- Botón salir en esquina superior -->
            <button class="exit-btn-corner" id="exitWaitingBtn" title="Salir del laboratorio">
                <iconify-icon icon="mdi:exit-to-app"></iconify-icon>
            </button>
            
            <div class="relative z-10 w-full max-w-sm mx-auto flex flex-col h-full">
                <!-- Header con info del jugador -->
                <div class="wizard-header">
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <div class="player-avatar-sm" style="background: ${playerData.color};">
                            <iconify-icon icon="${playerData.icon}" style="color: white;"></iconify-icon>
                        </div>
                        <div class="text-left">
                            <p class="font-bold text-sm" style="color: ${playerData.color};">${playerData.name}</p>
                            <div class="flex items-center gap-1">
                                <iconify-icon icon="mdi:crown" style="color: var(--color-warning); font-size: 12px;"></iconify-icon>
                                <span class="text-xs" style="color: var(--color-warning);">Admin</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Indicador de pasos -->
                    <div class="step-indicator">
                        <div class="step-dot ${configStep >= 1 ? 'active' : ''}" data-step="1">
                            <iconify-icon icon="mdi:gamepad-variant"></iconify-icon>
                        </div>
                        <div class="step-line ${configStep >= 2 ? 'active' : ''}"></div>
                        <div class="step-dot ${configStep >= 2 ? 'active' : ''}" data-step="2">
                            <iconify-icon icon="mdi:speedometer"></iconify-icon>
                        </div>
                        <div class="step-line ${configStep >= 3 ? 'active' : ''}"></div>
                        <div class="step-dot ${configStep >= 3 ? 'active' : ''}" data-step="3">
                            <iconify-icon icon="mdi:counter"></iconify-icon>
                        </div>
                    </div>
                </div>
                
                <!-- Contenido del paso actual -->
                <div class="wizard-content" id="wizardContent">
                    ${renderWizardStep()}
                </div>
                
                <!-- Botones de navegación -->
                <div class="wizard-nav">
                    ${configStep > 1 ? `
                        <button class="wizard-btn-back" id="wizardBackBtn">
                            <iconify-icon icon="mdi:arrow-left"></iconify-icon>
                            Atrás
                        </button>
                    ` : '<div></div>'}
                    
                    ${configStep < 3 ? `
                        <button class="wizard-btn-next" id="wizardNextBtn">
                            Siguiente
                            <iconify-icon icon="mdi:arrow-right"></iconify-icon>
                        </button>
                    ` : `
                        <button class="btn-admin" id="startGameBtn">
                            <iconify-icon icon="mdi:rocket-launch" style="font-size: 18px;"></iconify-icon>
                            ¡INICIAR!
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
    
    setupWizardListeners();
}

function renderWizardStep() {
    switch(configStep) {
        case 1:
            return renderStepMode();
        case 2:
            return renderStepDifficulty();
        case 3:
            return renderStepRounds();
        default:
            return '';
    }
}

function renderStepMode() {
    return `
        <div class="wizard-step" id="stepMode">
            <div class="step-title">
                <iconify-icon icon="mdi:gamepad-variant" style="color: var(--color-primary);"></iconify-icon>
                <h2>Modo de Juego</h2>
            </div>
            <p class="step-subtitle">¿Cómo quieres que compitan?</p>
            
            <div class="mode-cards">
                ${Object.entries(GAME_MODES).map(([key, config]) => `
                    <button class="mode-card ${key === currentGameMode ? 'selected' : ''}" 
                            data-mode="${key}"
                            style="--mode-color: ${config.color};">
                        <div class="mode-card-icon">
                            <iconify-icon icon="${config.icon}"></iconify-icon>
                        </div>
                        <div class="mode-card-info">
                            <span class="mode-card-name">${config.name}</span>
                            <span class="mode-card-desc">${config.description}</span>
                        </div>
                        <div class="mode-card-check">
                            <iconify-icon icon="mdi:check-circle"></iconify-icon>
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderStepDifficulty() {
    return `
        <div class="wizard-step" id="stepDifficulty">
            <div class="step-title">
                <iconify-icon icon="mdi:speedometer" style="color: var(--color-secondary);"></iconify-icon>
                <h2>Dificultad</h2>
            </div>
            <p class="step-subtitle">¿Qué tan difícil será el reto?</p>
            
            <div class="difficulty-cards">
                ${Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => `
                    <button class="difficulty-card ${key === currentDifficulty ? 'selected' : ''}" 
                            data-difficulty="${key}"
                            style="--diff-color: ${config.color};">
                        <div class="difficulty-card-icon">
                            <iconify-icon icon="${config.icon}"></iconify-icon>
                        </div>
                        <div class="difficulty-card-info">
                            <span class="difficulty-card-name">${config.name}</span>
                            <span class="difficulty-card-desc">${config.description}</span>
                        </div>
                        <div class="difficulty-card-check">
                            <iconify-icon icon="mdi:check-circle"></iconify-icon>
                        </div>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderStepRounds() {
    const currentRoundsValue = selectedRounds || 8;
    return `
        <div class="wizard-step" id="stepRounds">
            <div class="step-title">
                <iconify-icon icon="mdi:counter" style="color: var(--color-accent);"></iconify-icon>
                <h2>Número de Rondas</h2>
            </div>
            <p class="step-subtitle">¿Cuántos compuestos sintetizarán?</p>
            
            <div class="rounds-grid">
                ${ROUNDS_OPTIONS.map(rounds => `
                    <button class="rounds-card ${currentRoundsValue === rounds ? 'selected' : ''}" 
                            data-rounds="${rounds}">
                        <span class="rounds-number">${rounds}</span>
                        <span class="rounds-label">rondas</span>
                    </button>
                `).join('')}
            </div>
            
            <!-- Resumen de configuración -->
            <div class="config-preview">
                <p class="preview-title">Resumen del juego:</p>
                <div class="preview-items">
                    <div class="preview-item">
                        <iconify-icon icon="${GAME_MODES[currentGameMode].icon}" style="color: ${GAME_MODES[currentGameMode].color};"></iconify-icon>
                        <span>${GAME_MODES[currentGameMode].name}</span>
                    </div>
                    <div class="preview-item">
                        <iconify-icon icon="${difficultyConfig.icon}" style="color: ${difficultyConfig.color};"></iconify-icon>
                        <span>${difficultyConfig.name}</span>
                    </div>
                    <div class="preview-item">
                        <iconify-icon icon="mdi:counter" style="color: var(--color-primary);"></iconify-icon>
                        <span id="previewRounds">${currentRoundsValue} rondas</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setupWizardListeners() {
    // Botón salir
    document.getElementById('exitWaitingBtn')?.addEventListener('click', () => {
        if (confirm('¿Seguro que quieres salir del laboratorio?')) {
            sendMessage({ action: 'playerLeave' });
            hasJoined = false;
            playerData = null;
            isAdmin = false;
            configStep = 1;
            renderJoinScreen();
        }
    });
    
    // Botón atrás
    document.getElementById('wizardBackBtn')?.addEventListener('click', () => {
        if (configStep > 1) {
            configStep--;
            renderConfigWizard();
            if (navigator.vibrate) navigator.vibrate(20);
        }
    });
    
    // Botón siguiente
    document.getElementById('wizardNextBtn')?.addEventListener('click', () => {
        if (configStep < 3) {
            configStep++;
            renderConfigWizard();
            if (navigator.vibrate) navigator.vibrate(20);
        }
    });
    
    // Botón iniciar juego
    document.getElementById('startGameBtn')?.addEventListener('click', () => {
        sendMessage({ 
            action: 'startGame', 
            difficulty: currentDifficulty,
            customRounds: selectedRounds || 8,
            gameMode: currentGameMode
        });
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
    });
    
    // Listeners según el paso actual
    switch(configStep) {
        case 1:
            setupModeListeners();
            break;
        case 2:
            setupDifficultyListeners();
            break;
        case 3:
            setupRoundsListeners();
            break;
    }
}

function setupModeListeners() {
    document.querySelectorAll('.mode-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            currentGameMode = mode;
            
            // Actualizar UI
            document.querySelectorAll('.mode-card').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Notificar a la pantalla
            sendMessage({ action: 'setGameMode', mode: mode });
            
            if (navigator.vibrate) navigator.vibrate(30);
        });
    });
}

function setupDifficultyListeners() {
    document.querySelectorAll('.difficulty-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const diff = btn.dataset.difficulty;
            currentDifficulty = diff;
            difficultyConfig = DIFFICULTY_CONFIG[diff];
            
            // Actualizar UI
            document.querySelectorAll('.difficulty-card').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            if (navigator.vibrate) navigator.vibrate(30);
        });
    });
}

function setupRoundsListeners() {
    document.querySelectorAll('.rounds-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const rounds = parseInt(btn.dataset.rounds);
            selectedRounds = rounds;
            
            // Actualizar UI
            document.querySelectorAll('.rounds-card').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Actualizar preview
            const previewRounds = document.getElementById('previewRounds');
            if (previewRounds) previewRounds.textContent = `${rounds} rondas`;
            
            // Notificar al screen
            sendMessage({ action: 'setRounds', rounds: rounds });
            
            if (navigator.vibrate) navigator.vibrate(30);
        });
    });
}

function selectGameMode(mode) {
    currentGameMode = mode;
    sendMessage({ action: 'setGameMode', mode: mode });
    if (navigator.vibrate) navigator.vibrate(30);
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    difficultyConfig = DIFFICULTY_CONFIG[difficulty];
    if (navigator.vibrate) navigator.vibrate(30);
    playSound('select');
}

function selectRounds(rounds) {
    selectedRounds = rounds;
    sendMessage({ action: 'setRounds', rounds: rounds });
    if (navigator.vibrate) navigator.vibrate(30);
    playSound('select');
}

function renderPlayingScreen() {
    const app = document.getElementById('app');
    
    maxSelections = currentCompound?.elements?.length || 5;
    
    app.innerHTML = `
        <div class="screen active flex-col relative playing-screen-clean" id="playingScreen">
            <div class="controller-bg"></div>
            
            ${isAdmin ? `
                <button class="exit-btn-floating" id="exitGameBtn" title="Salir">
                    <iconify-icon icon="mdi:exit-to-app"></iconify-icon>
                </button>
            ` : ''}
            
            <!-- Área de selección arriba -->
            <div class="selection-display" id="selectionDisplay">
                <div class="selection-chips" id="selectionChips">
                    <span class="selection-placeholder">Toca los elementos</span>
                </div>
                <button class="confirm-btn-inline" id="confirmSelectionBtn" onclick="confirmSelection()" disabled>
                    <iconify-icon icon="mdi:send"></iconify-icon>
                </button>
            </div>
            
            <!-- Grid de elementos -->
            <div class="elements-area" id="elementsContainer">
                <div class="elements-grid-clean" id="elementsGrid"></div>
            </div>
        </div>
        
        <!-- Result Overlay -->
        <div class="result-overlay" id="resultOverlay">
            <div class="text-center p-6" id="resultContent"></div>
        </div>
        
        <!-- Exit Confirmation Modal -->
        <div class="exit-modal" id="exitModal">
            <div class="exit-modal-content">
                <iconify-icon icon="mdi:alert-octagon" class="text-4xl mb-3" style="color: var(--color-danger);"></iconify-icon>
                <h3 class="text-lg font-bold mb-2" style="color: var(--color-text);">¿Terminar el juego?</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-light);">Esto terminará el juego para TODOS</p>
                <div class="flex gap-3">
                    <button class="exit-modal-btn cancel" id="exitCancelBtn">Cancelar</button>
                    <button class="exit-modal-btn confirm" id="exitConfirmBtn" style="background: var(--color-danger);">Terminar</button>
                </div>
            </div>
        </div>
    `;
    
    setupElementsGrid();
    if (isAdmin) setupExitButton();
}

window.confirmSelection = confirmSelection;

function setupExitButton() {
    const exitBtn = document.getElementById('exitGameBtn');
    const exitModal = document.getElementById('exitModal');
    const cancelBtn = document.getElementById('exitCancelBtn');
    const confirmBtn = document.getElementById('exitConfirmBtn');
    
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            exitModal.classList.add('active');
            if (navigator.vibrate) navigator.vibrate(30);
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            exitModal.classList.remove('active');
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            exitModal.classList.remove('active');
            // Enviar mensaje de salida al screen
            sendMessage({ action: 'playerExit' });
            // Volver a la pantalla de espera
            renderWaitingScreen();
        });
    }
}

function setupElementsGrid() {
    const grid = document.getElementById('elementsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Usar solo los elementos disponibles para esta dificultad
    availableElementKeys.forEach(key => {
        const el = allElements[key];
        if (!el) return;
        
        const btn = document.createElement('button');
        btn.className = `element-btn-mini element-${el.group}`;
        
        btn.dataset.element = key;
        btn.innerHTML = `
            <span class="symbol">${el.symbol}</span>
            <span class="name">${el.name}</span>
            <span class="selection-count" id="count-${key}"></span>
        `;
        btn.addEventListener('click', () => handleElementClick(key, btn));
        
        grid.appendChild(btn);
    });
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate('.element-btn-mini', {
            scale: [0, 1],
            opacity: [0, 1],
            delay: window.anime.stagger(15),
            duration: 250,
            easing: 'easeOutBack'
        });
    }
    
    updateSelectionUI();
    
    // Mostrar hint de rotación una vez
    showRotateHint();
}

// Mostrar sugerencia de rotación solo una vez
function showRotateHint() {
    if (sessionStorage.getItem('rotateHintShown')) return;
    
    const hint = document.getElementById('rotateHint');
    if (hint && window.innerHeight < 600 && window.innerWidth < window.innerHeight) {
        hint.classList.add('show');
        sessionStorage.setItem('rotateHintShown', 'true');
        
        setTimeout(() => {
            hint.classList.remove('show');
        }, 4000);
    }
}

function handleElementClick(element, btn) {
    if (hasSelectedThisRound) return;
    
    if (selectedElements.length < maxSelections) {
        selectedElements.push(element);
        playSound('select');
        
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
        
        btn.classList.add('pop-in');
        setTimeout(() => btn.classList.remove('pop-in'), 300);
        
        updateSelectionUI();
    }
}

function removeSelectedElement(index) {
    if (hasSelectedThisRound) return;
    
    selectedElements.splice(index, 1);
    playSound('deselect');
    
    if (navigator.vibrate) {
        navigator.vibrate(20);
    }
    
    updateSelectionUI();
}

function updateSelectionUI() {
    // Actualizar contadores en cada botón
    availableElementKeys.forEach(key => {
        const countEl = document.getElementById(`count-${key}`);
        const count = selectedElements.filter(e => e === key).length;
        if (countEl) {
            countEl.textContent = count > 0 ? count : '';
            countEl.classList.toggle('visible', count > 0);
        }
    });
    
    // Actualizar área de selección
    const selectionChips = document.getElementById('selectionChips');
    if (selectionChips) {
        if (selectedElements.length === 0) {
            selectionChips.innerHTML = `<span class="selection-placeholder">Toca los elementos</span>`;
        } else {
            selectionChips.innerHTML = selectedElements.map((el, i) => `
                <button class="chip element-${allElements[el]?.group || 'nonmetal'}" onclick="removeSelectedElement(${i})">
                    ${el}
                </button>
            `).join('');
        }
    }
    
    // Actualizar botón de confirmar
    const confirmBtn = document.getElementById('confirmSelectionBtn');
    if (confirmBtn) {
        const isComplete = selectedElements.length === maxSelections;
        confirmBtn.disabled = !isComplete;
        confirmBtn.classList.toggle('ready', isComplete);
    }
}

function confirmSelection() {
    if (selectedElements.length === 0 || hasSelectedThisRound) return;
    
    hasSelectedThisRound = true;
    
    sendMessage({ action: 'selectElements', elements: [...selectedElements] });
    
    playSound('confirm');
    
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50]);
    }
    
    // Deshabilitar elementos
    document.querySelectorAll('.element-btn-mini').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.3';
    });
    
    // Mostrar confirmación
    const selectionDisplay = document.getElementById('selectionDisplay');
    if (selectionDisplay) {
        selectionDisplay.innerHTML = `
            <div class="selection-sent">
                <iconify-icon icon="mdi:check"></iconify-icon>
                <span>${selectedElements.join(' + ')}</span>
            </div>
        `;
    }
}

window.removeSelectedElement = removeSelectedElement;

function handleSelectionConfirmed(data) {
    console.log('Selección confirmada:', data.elements);
}

// ============================================
// SOUND EFFECTS
// ============================================

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'select':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
                break;
                
            case 'deselect':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.08);
                gainNode.gain.setValueAtTime(0.08, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.08);
                break;
                
            case 'confirm':
                oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
                gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
                
            case 'success':
                playMelody([523, 659, 784, 1047], 0.12, 0.15);
                break;
                
            case 'error':
                oscillator.type = 'sawtooth';
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.3);
                gainNode.gain.setValueAtTime(0.12, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
                break;
        }
    } catch (e) {
        console.log('Audio not available');
    }
}

function playMelody(frequencies, noteDuration, volume) {
    frequencies.forEach((freq, i) => {
        setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            osc.connect(gain);
            gain.connect(audioContext.destination);
            osc.frequency.setValueAtTime(freq, audioContext.currentTime);
            gain.gain.setValueAtTime(volume, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + noteDuration);
            osc.start(audioContext.currentTime);
            osc.stop(audioContext.currentTime + noteDuration);
        }, i * noteDuration * 1000);
    });
}

function renderEndScreen(data) {
    const myRank = data.players.findIndex(p => p.id === playerData.id) + 1;
    const myFinalScore = data.players.find(p => p.id === playerData.id)?.score || 0;
    
    const rankIcons = ['mdi:medal-outline', 'mdi:medal-outline', 'mdi:medal-outline', 'mdi:medal-outline'];
    const rankColors = ['#fbbf24', '#9ca3af', '#b45309', '#6b7280'];
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
                <div class="text-6xl mb-4"><iconify-icon icon="${rankIcons[myRank - 1] || 'mdi:flask'}" style="color: ${rankColors[myRank - 1] || '#6b7280'};"></iconify-icon></div>
                
                <div class="text-5xl font-black mb-2" style="color: ${myRank === 1 ? '#f59e0b' : myRank === 2 ? '#9ca3af' : '#b45309'};">
                    ${myRank}°
                </div>
                
                <div class="player-avatar mx-auto mb-4" style="background: ${playerData.color};">
                    <iconify-icon icon="${playerData.icon}" style="color: white;"></iconify-icon>
                </div>
                
                <p class="text-xl font-bold mb-2" style="color: ${playerData.color};">${playerData.name}</p>
                <p class="text-lg text-white/70 mb-2">${rankMessages[myRank - 1] || rankMessages[3]}</p>
                
                <div class="difficulty-completed-sm mb-4" style="color: ${difficultyConfig.color};">
                    <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                    ${difficultyConfig.name}
                </div>
                
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
    
    // Actualizar elementos disponibles
    if (data.elements) {
        availableElementKeys = data.elements;
    }
    
    // Actualizar dificultad si viene del servidor
    if (data.difficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
    }
    
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
    
    if (data.difficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
    }
    
    if (data.maxRounds) {
        maxRounds = data.maxRounds;
    }
}

function handleGameStarted(data) {
    if (data.difficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
    }
    
    if (data.elements) {
        availableElementKeys = data.elements;
    }
    
    console.log('🎮 Juego iniciado con dificultad:', difficultyConfig.name);
}

function handleNewRound(data) {
    currentCompound = data.compound;
    currentRound = data.round;
    maxRounds = data.maxRounds;
    
    if (data.difficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
    }
    
    if (data.elements) {
        availableElementKeys = data.elements;
    }
    
    if (data.maxSelections) {
        maxSelections = data.maxSelections;
    }
    
    hasSelectedThisRound = false;
    selectedElement = null;
    clearSelection();
    
    renderPlayingScreen();
}

function handleRoundResult(data) {
    const overlay = document.getElementById('resultOverlay');
    const content = document.getElementById('resultContent');
    
    if (!overlay || !content) return;
    
    // Actualizar puntuación del jugador
    if (data.players && data.players[playerData?.id]) {
        myScore = data.players[playerData.id].score;
    }
    
    // Determinar si ESTE jugador acertó
    const myResult = data.playerResults && data.playerResults[playerData?.id];
    const isCorrect = myResult ? myResult.isCorrect : false;
    
    if (isCorrect) {
        playSound('success');
        
        content.innerHTML = `
            <div class="result-big">
                <div class="result-icon-big success">
                    <iconify-icon icon="mdi:check-circle"></iconify-icon>
                </div>
                <div class="confetti-burst" id="miniConfetti"></div>
            </div>
            <h2 class="result-title success">¡Correcto!</h2>
            <p class="result-formula">${data.compound.formula}</p>
            <p class="result-name">${data.compound.name}</p>
            ${isAdmin ? `
                <button class="btn-next-round" id="nextRoundBtn">
                    <iconify-icon icon="mdi:arrow-right"></iconify-icon>
                    Siguiente
                </button>
            ` : `
                <p class="result-waiting">
                    <iconify-icon icon="mdi:timer-sand"></iconify-icon>
                    Esperando...
                </p>
            `}
        `;
        
        createMiniConfetti();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    } else {
        playSound('error');
        
        content.innerHTML = `
            <div class="result-big">
                <div class="result-icon-big error shake-animation">
                    <iconify-icon icon="mdi:close-circle"></iconify-icon>
                </div>
                <div class="error-x-burst" id="errorBurst"></div>
            </div>
            <h2 class="result-title error">¡Incorrecto!</h2>
            <p class="result-formula">${data.compound.formula}</p>
            <p class="result-answer">Era: ${data.compound.elements.join(' + ')}</p>
            ${isAdmin ? `
                <button class="btn-next-round" id="nextRoundBtn">
                    <iconify-icon icon="mdi:arrow-right"></iconify-icon>
                    Siguiente
                </button>
            ` : `
                <p class="result-waiting">
                    <iconify-icon icon="mdi:timer-sand"></iconify-icon>
                    Esperando...
                </p>
            `}
        `;
        
        createErrorBurst();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    
    overlay.classList.add('active');
    
    if (window.anime) {
        window.anime.animate('.result-icon-big', {
            scale: [0, 1.3, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    }
    
    // Botón siguiente para admin
    if (isAdmin) {
        setTimeout(() => {
            const nextBtn = document.getElementById('nextRoundBtn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => {
                    overlay.classList.remove('active');
                    sendMessage({ action: 'adminNextRound' });
                });
            }
        }, 100);
    }
}

function createMiniConfetti() {
    const container = document.getElementById('miniConfetti');
    if (!container) return;
    
    const colors = ['#10b981', '#3b82f6', '#fbbf24', '#ec4899', '#8b5cf6'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'mini-confetti';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = '50%';
        confetti.style.top = '50%';
        container.appendChild(confetti);
        
        const angle = (Math.PI * 2 * i) / 30;
        const velocity = 50 + Math.random() * 100;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity;
        
        if (window.anime) {
            window.anime.animate(confetti, {
                translateX: [0, targetX],
                translateY: [0, targetY],
                scale: [1, 0],
                opacity: [1, 0],
                duration: 800 + Math.random() * 400,
                easing: 'easeOutCubic',
                complete: () => confetti.remove()
            });
        }
    }
}

function createErrorBurst() {
    const container = document.getElementById('errorBurst');
    if (!container) return;
    
    for (let i = 0; i < 12; i++) {
        const x = document.createElement('div');
        x.className = 'error-x';
        x.innerHTML = '<iconify-icon icon="mdi:close" style="color: var(--color-danger);"></iconify-icon>';
        x.style.left = '50%';
        x.style.top = '50%';
        container.appendChild(x);
        
        const angle = (Math.PI * 2 * i) / 12;
        const velocity = 40 + Math.random() * 60;
        const targetX = Math.cos(angle) * velocity;
        const targetY = Math.sin(angle) * velocity;
        
        if (window.anime) {
            window.anime.animate(x, {
                translateX: [0, targetX],
                translateY: [0, targetY],
                rotate: [0, Math.random() * 360],
                scale: [1, 0],
                opacity: [1, 0],
                duration: 600 + Math.random() * 300,
                easing: 'easeOutCubic',
                complete: () => x.remove()
            });
        }
    }
}

function handleGameEnd(data) {
    if (data.difficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
    }
    renderEndScreen(data);
}

function handleGameReset(data) {
    // Actualizar dificultad si viene del servidor
    if (data.difficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
    }
    
    // Resetear estado local
    myScore = 0;
    currentRound = 0;
    currentCompound = null;
    hasSelectedThisRound = false;
    configStep = 1; // Resetear wizard al paso 1
    clearSelection();
    
    // Volver a la pantalla de espera/selección de dificultad
    renderWaitingScreen();
}

function handleGameError(data) {
    // Mostrar mensaje de error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-20 left-4 right-4 bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl z-50 text-center';
    errorDiv.innerHTML = `
        <iconify-icon icon="mdi:alert-circle" class="mr-2"></iconify-icon>
        ${data.message}
    `;
    document.body.appendChild(errorDiv);
    
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    setTimeout(() => errorDiv.remove(), 3000);
}

// ============================================
// INICIAR
// ============================================

// Esperar a que el DOM esté listo antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
