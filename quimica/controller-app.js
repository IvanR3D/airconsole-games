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
        
        // Forzar orientación horizontal (landscape) en el controlador
        airconsole.setOrientation(AirConsole.ORIENTATION_LANDSCAPE);
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
    
    if (lastOrientation !== currentOrientation) {
        lastOrientation = currentOrientation;
        console.log('📱 Orientación:', currentOrientation);
        
        document.body.classList.remove('is-landscape', 'is-portrait');
        document.body.classList.add(`is-${currentOrientation}`);
        
        document.body.style.display = 'none';
        document.body.offsetHeight;
        document.body.style.display = '';
    }
    
    // Actualizar hint de rotación cuando hay playing screen
    if (document.getElementById('playingScreen')) {
        showRotateHint();
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
        <div class="screen active" id="joinScreen">
            <div class="controller-bg"></div>
            
            <div class="join-content">
                <h1 class="join-title">LABORATORIO</h1>
                <h2 class="join-subtitle">QUÍMICO</h2>
                
                <button class="btn-join" id="joinBtn">
                    <iconify-icon icon="mdi:flask"></iconify-icon>
                    UNIRSE AL LAB
                </button>
                
                <div class="connecting-msg" id="connectingMsg">
                    <div class="spinner"></div>
                    <span>Conectando...</span>
                </div>
                
                <div class="error-msg" id="errorMsg">
                    <iconify-icon icon="mdi:alert-circle"></iconify-icon>
                    <p>Laboratorio lleno</p>
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
    
    // Para jugadores normales, mostrar pantalla de espera simple
    app.innerHTML = `
        <div class="screen active" id="waitingScreen">
            <div class="controller-bg"></div>
            
            <button class="exit-btn-corner" id="exitWaitingBtn">
                <iconify-icon icon="mdi:exit-to-app"></iconify-icon>
            </button>
            
            <div class="waiting-content">
                <div class="player-avatar-big" style="background: ${playerData.color};">
                    <iconify-icon icon="${playerData.icon}"></iconify-icon>
                </div>
                
                <p class="player-name" style="color: ${playerData.color};">${playerData.name}</p>
                
                <div class="config-badges">
                    <span class="config-badge">
                        <iconify-icon icon="${GAME_MODES[currentGameMode].icon}"></iconify-icon>
                        ${GAME_MODES[currentGameMode].name}
                    </span>
                    <span class="config-badge">
                        <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                        ${difficultyConfig.name}
                    </span>
                    <span class="config-badge" id="roundsDisplay">
                        <iconify-icon icon="mdi:counter"></iconify-icon>
                        ${selectedRounds || 8}
                    </span>
                </div>
                
                <div class="waiting-status">
                    <iconify-icon icon="mdi:flask" class="bounce"></iconify-icon>
                    <span>Esperando inicio...</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('exitWaitingBtn')?.addEventListener('click', () => {
        if (confirm('¿Salir?')) {
            sendMessage({ action: 'playerLeave' });
            hasJoined = false;
            playerData = null;
            isAdmin = false;
            renderJoinScreen();
        }
    });
}

// ============================================
// WIZARD DE CONFIGURACIÓN (Admin) - Simplificado
// ============================================

function renderConfigWizard() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="screen active config-wizard-screen" id="configWizard">
            <div class="controller-bg"></div>
            
            <button class="exit-btn-corner" id="exitWaitingBtn">
                <iconify-icon icon="mdi:exit-to-app"></iconify-icon>
            </button>
            
            <div class="wizard-container">
                <!-- Header compacto -->
                <div class="wizard-header">
                    <div class="admin-badge" style="background: ${playerData.color};">
                        <iconify-icon icon="${playerData.icon}"></iconify-icon>
                        <span>${playerData.name}</span>
                        <iconify-icon icon="mdi:crown" class="crown"></iconify-icon>
                    </div>
                    
                    <div class="step-indicator">
                        <div class="step-dot ${configStep >= 1 ? 'active' : ''}">1</div>
                        <div class="step-line ${configStep >= 2 ? 'active' : ''}"></div>
                        <div class="step-dot ${configStep >= 2 ? 'active' : ''}">2</div>
                        <div class="step-line ${configStep >= 3 ? 'active' : ''}"></div>
                        <div class="step-dot ${configStep >= 3 ? 'active' : ''}">3</div>
                    </div>
                </div>
                
                <!-- Contenido -->
                <div class="wizard-content">
                    ${renderWizardStep()}
                </div>
                
                <!-- Navegación -->
                <div class="wizard-nav">
                    ${configStep > 1 ? `
                        <button class="btn-back" id="wizardBackBtn">
                            <iconify-icon icon="mdi:arrow-left"></iconify-icon>
                        </button>
                    ` : '<div></div>'}
                    
                    ${configStep < 3 ? `
                        <button class="btn-next" id="wizardNextBtn">
                            Siguiente
                            <iconify-icon icon="mdi:arrow-right"></iconify-icon>
                        </button>
                    ` : `
                        <button class="btn-start" id="startGameBtn">
                            <iconify-icon icon="mdi:play"></iconify-icon>
                            INICIAR
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
        case 1: return renderStepMode();
        case 2: return renderStepDifficulty();
        case 3: return renderStepRounds();
        default: return '';
    }
}

function renderStepMode() {
    return `
        <div class="wizard-step">
            <h2 class="step-title">Modo</h2>
            
            <div class="mode-cards">
                ${Object.entries(GAME_MODES).map(([key, config]) => `
                    <button class="option-card ${key === currentGameMode ? 'selected' : ''}" 
                            data-mode="${key}" style="--card-color: ${config.color};">
                        <iconify-icon icon="${config.icon}"></iconify-icon>
                        <span>${config.name}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderStepDifficulty() {
    return `
        <div class="wizard-step">
            <h2 class="step-title">Dificultad</h2>
            
            <div class="difficulty-cards">
                ${Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => `
                    <button class="option-card ${key === currentDifficulty ? 'selected' : ''}" 
                            data-difficulty="${key}" style="--card-color: ${config.color};">
                        <iconify-icon icon="${config.icon}"></iconify-icon>
                        <span>${config.name}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;
}

function renderStepRounds() {
    const currentRoundsValue = selectedRounds || 8;
    return `
        <div class="wizard-step">
            <h2 class="step-title">Rondas</h2>
            
            <div class="rounds-grid">
                ${ROUNDS_OPTIONS.map(rounds => `
                    <button class="rounds-btn ${currentRoundsValue === rounds ? 'selected' : ''}" 
                            data-rounds="${rounds}">
                        ${rounds}
                    </button>
                `).join('')}
            </div>
            
            <div class="summary-bar">
                <span><iconify-icon icon="${GAME_MODES[currentGameMode].icon}"></iconify-icon> ${GAME_MODES[currentGameMode].name}</span>
                <span><iconify-icon icon="${difficultyConfig.icon}"></iconify-icon> ${difficultyConfig.name}</span>
                <span id="previewRounds">${currentRoundsValue} rondas</span>
            </div>
        </div>
    `;
}

function setupWizardListeners() {
    // Botón salir
    document.getElementById('exitWaitingBtn')?.addEventListener('click', () => {
        if (confirm('¿Salir?')) {
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
        case 1: setupModeListeners(); break;
        case 2: setupDifficultyListeners(); break;
        case 3: setupRoundsListeners(); break;
    }
}

function setupModeListeners() {
    document.querySelectorAll('.option-card[data-mode]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentGameMode = btn.dataset.mode;
            document.querySelectorAll('.option-card[data-mode]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            sendMessage({ action: 'setGameMode', mode: currentGameMode });
            if (navigator.vibrate) navigator.vibrate(30);
        });
    });
}

function setupDifficultyListeners() {
    document.querySelectorAll('.option-card[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentDifficulty = btn.dataset.difficulty;
            difficultyConfig = DIFFICULTY_CONFIG[currentDifficulty];
            document.querySelectorAll('.option-card[data-difficulty]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            sendMessage({ action: 'setDifficulty', difficulty: currentDifficulty });
            if (navigator.vibrate) navigator.vibrate(30);
        });
    });
}

function setupRoundsListeners() {
    document.querySelectorAll('.rounds-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            selectedRounds = parseInt(btn.dataset.rounds);
            document.querySelectorAll('.rounds-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            const preview = document.getElementById('previewRounds');
            if (preview) preview.textContent = `${selectedRounds} rondas`;
            sendMessage({ action: 'setRounds', rounds: selectedRounds });
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
}

function selectRounds(rounds) {
    selectedRounds = rounds;
    sendMessage({ action: 'setRounds', rounds: rounds });
    if (navigator.vibrate) navigator.vibrate(30);
}

function renderPlayingScreen() {
    const app = document.getElementById('app');
    
    maxSelections = currentCompound?.elements?.length || 5;
    
    // Obtener info del compuesto para mostrar
    const compoundName = currentCompound?.name || 'Compuesto';
    const compoundFormula = difficultyConfig.showFormula ? currentCompound?.formula : '';
    const compoundHint = difficultyConfig.showHint ? currentCompound?.hint : '';
    
    app.innerHTML = `
        <div class="screen active playing-screen-optimized" id="playingScreen">
            <div class="controller-bg"></div>
            
            <!-- Botón salir discreto en esquina superior izquierda -->
            <button class="exit-btn-corner-small" id="exitGameBtn" title="Salir">
                <iconify-icon icon="mdi:close"></iconify-icon>
            </button>
            
            <!-- Header con objetivo del compuesto -->
            <div class="compound-objective-header">
                <div class="compound-target-card">
                    <div class="compound-icon-wrapper">
                        <iconify-icon icon="mdi:flask-round-bottom"></iconify-icon>
                    </div>
                    <div class="compound-info">
                        <span class="compound-label">Sintetiza:</span>
                        <span class="compound-name-target">${compoundName}</span>
                        ${compoundFormula ? `<span class="compound-formula-hint">${compoundFormula}</span>` : ''}
                    </div>
                </div>
                ${compoundHint ? `
                    <div class="compound-hint-badge">
                        <iconify-icon icon="mdi:lightbulb-outline"></iconify-icon>
                        <span>${compoundHint}</span>
                    </div>
                ` : ''}
            </div>
            
            <!-- Área de selección mejorada -->
            <div class="selection-area-improved" id="selectionBar">
                <div class="selection-slots-container" id="selectionChips">
                    ${renderSelectionSlots()}
                </div>
            </div>
            
            <!-- Grid de elementos -->
            <div class="elements-fullscreen" id="elementsContainer">
                <div class="elements-grid-optimized" id="elementsGrid"></div>
            </div>
            
            <!-- Botón confirmar GRANDE en la parte inferior -->
            <button class="confirm-btn-large" id="confirmBtn" onclick="confirmSelection()" disabled>
                <iconify-icon icon="mdi:flask-round-bottom"></iconify-icon>
                <span>SINTETIZAR</span>
            </button>
        </div>
        
        <!-- Result Overlay -->
        <div class="result-overlay" id="resultOverlay">
            <div class="text-center p-6" id="resultContent"></div>
        </div>
        
        <!-- Exit Confirmation Modal -->
        <div class="exit-modal" id="exitModal">
            <div class="exit-modal-content">
                <iconify-icon icon="mdi:alert-octagon" class="text-4xl mb-3" style="color: var(--color-danger);"></iconify-icon>
                <h3 class="text-lg font-bold mb-2" style="color: var(--color-text);">¿Salir del juego?</h3>
                <p class="text-sm mb-4" style="color: var(--color-text-light);">Perderás tu progreso en esta ronda</p>
                <div class="flex gap-3">
                    <button class="exit-modal-btn cancel" id="exitCancelBtn">Cancelar</button>
                    <button class="exit-modal-btn confirm" id="exitConfirmBtn">Salir</button>
                </div>
            </div>
        </div>
    `;
    
    setupElementsGrid();
    setupExitButton();
}

function renderSelectionSlots() {
    let html = '';
    for (let i = 0; i < maxSelections; i++) {
        const element = selectedElements[i];
        if (element) {
            const elData = allElements[element];
            html += `
                <button class="selection-slot filled element-${elData?.group || 'nonmetal'}" onclick="removeSelectedElement(${i})">
                    <span class="slot-symbol">${element}</span>
                    <iconify-icon icon="mdi:close-circle" class="slot-remove"></iconify-icon>
                </button>
            `;
        } else {
            html += `
                <div class="selection-slot empty">
                    <iconify-icon icon="mdi:help"></iconify-icon>
                </div>
            `;
        }
        // Agregar signo + entre slots (excepto el último)
        if (i < maxSelections - 1) {
            html += `<span class="slot-plus">+</span>`;
        }
    }
    return html;
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
        btn.className = `element-btn-large element-${el.group}`;
        
        btn.dataset.element = key;
        btn.innerHTML = `
            <span class="symbol">${el.symbol}</span>
            <span class="name">${el.name}</span>
            <span class="selection-badge" id="count-${key}"></span>
        `;
        btn.addEventListener('click', () => handleElementClick(key, btn));
        
        grid.appendChild(btn);
    });
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate('.element-btn-large', {
            scale: [0.8, 1],
            opacity: [0, 1],
            delay: window.anime.stagger(20),
            duration: 300,
            easing: 'easeOutBack'
        });
    }
    
    updateSelectionUI();
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
    // Actualizar contadores y estado visual en cada botón
    availableElementKeys.forEach(key => {
        const countEl = document.getElementById(`count-${key}`);
        const count = selectedElements.filter(e => e === key).length;
        const btn = document.querySelector(`[data-element="${key}"]`);
        if (countEl) {
            countEl.textContent = count > 0 ? count : '';
            countEl.classList.toggle('visible', count > 0);
        }
        if (btn) {
            btn.classList.toggle('selected', count > 0);
        }
    });
    
    // Actualizar slots de selección
    const selectionChips = document.getElementById('selectionChips');
    if (selectionChips) {
        selectionChips.innerHTML = renderSelectionSlots();
    }
    
    // Actualizar botón de confirmar grande
    const isComplete = selectedElements.length === maxSelections;
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = !isComplete;
        confirmBtn.classList.toggle('ready', isComplete);
        
        if (isComplete) {
            confirmBtn.innerHTML = `
                <iconify-icon icon="mdi:flask-round-bottom"></iconify-icon>
                <span>¡SINTETIZAR!</span>
            `;
        } else {
            confirmBtn.innerHTML = `
                <iconify-icon icon="mdi:flask-outline"></iconify-icon>
                <span>Faltan ${maxSelections - selectedElements.length} elementos</span>
            `;
        }
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
    document.querySelectorAll('.element-btn-large').forEach(btn => {
        btn.disabled = true;
        btn.classList.add('disabled');
    });
    
    // Mostrar confirmación en el botón
    const confirmBtn = document.getElementById('confirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.classList.remove('ready');
        confirmBtn.classList.add('sent');
        confirmBtn.innerHTML = `
            <iconify-icon icon="mdi:check-circle"></iconify-icon>
            <span>¡Enviado! Esperando...</span>
        `;
    }
    
    // Actualizar barra de selección
    const selectionChips = document.getElementById('selectionChips');
    if (selectionChips) {
        selectionChips.innerHTML = `
            <div class="selection-confirmed">
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
    
    // Trofeos para los 3 primeros puestos
    const getTrophyIcon = (rank) => {
        if (rank === 1) return 'mdi:trophy';
        if (rank === 2) return 'mdi:trophy-outline';
        if (rank === 3) return 'mdi:trophy-variant';
        return 'mdi:medal-outline';
    };
    
    const getTrophyColor = (rank) => {
        if (rank === 1) return '#fbbf24'; // Oro
        if (rank === 2) return '#9ca3af'; // Plata
        if (rank === 3) return '#cd7f32'; // Bronce
        return '#6b7280';
    };
    
    const rankMessages = [
        '¡Eres el mejor científico!',
        '¡Excelente trabajo!',
        '¡Muy bien hecho!',
        '¡Buen intento!'
    ];
    
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="screen active" id="endScreen">
            <div class="controller-bg"></div>
            
            <div class="end-screen-content">
                <!-- Trofeo centrado -->
                <div class="trophy-container">
                    <iconify-icon icon="${getTrophyIcon(myRank)}" class="trophy-icon" style="color: ${getTrophyColor(myRank)};"></iconify-icon>
                    ${myRank <= 3 ? `<div class="trophy-glow" style="background: ${getTrophyColor(myRank)};"></div>` : ''}
                </div>
                
                <!-- Posición -->
                <div class="rank-display" style="color: ${getTrophyColor(myRank)};">
                    ${myRank}°
                </div>
                
                <!-- Avatar y nombre -->
                <div class="player-result-card" style="border-color: ${playerData.color};">
                    <div class="player-avatar-end" style="background: ${playerData.color};">
                        <iconify-icon icon="${playerData.icon}"></iconify-icon>
                    </div>
                    <p class="player-name-end" style="color: ${playerData.color};">${playerData.name}</p>
                </div>
                
                <!-- Mensaje -->
                <p class="rank-message">${rankMessages[Math.min(myRank - 1, 3)]}</p>
                
                <!-- Dificultad -->
                <div class="difficulty-badge-end" style="color: ${difficultyConfig.color};">
                    <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                    ${difficultyConfig.name}
                </div>
                
                <!-- Puntuación -->
                <div class="score-card-end">
                    <span class="score-value">${myFinalScore}</span>
                    <span class="score-label">pts</span>
                </div>
                
                <!-- Botón admin -->
                ${isAdmin ? `
                    <button class="btn-play-again" id="playAgainBtn">
                        <iconify-icon icon="mdi:refresh"></iconify-icon>
                        JUGAR DE NUEVO
                    </button>
                ` : `
                    <p class="waiting-admin">
                        <iconify-icon icon="mdi:timer-sand"></iconify-icon>
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
        window.anime.animate('.trophy-icon', {
            scale: [0, 1.3, 1],
            rotate: [0, 15, -15, 0],
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });
        
        window.anime.animate('.player-result-card', {
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 500,
            delay: 300,
            easing: 'easeOutBack'
        });
        
        window.anime.animate('.score-card-end', {
            translateY: [20, 0],
            opacity: [0, 1],
            duration: 400,
            delay: 500,
            easing: 'easeOutCubic'
        });
    }
}

// ============================================
// EVENT HANDLERS
// ============================================

function joinGame() {
    if (hasJoined) return;
    hasJoined = true;
    
    // Ocultar botón y mostrar mensaje de conectando
    const joinBtn = document.getElementById('joinBtn');
    const connectingMsg = document.getElementById('connectingMsg');
    
    if (joinBtn) joinBtn.style.display = 'none';
    if (connectingMsg) connectingMsg.classList.add('show');
    
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
    const connectingMsg = document.getElementById('connectingMsg');
    const errorMsg = document.getElementById('errorMsg');
    
    if (connectingMsg) connectingMsg.classList.remove('show');
    if (errorMsg) errorMsg.classList.add('show');
    
    hasJoined = false;
}

function handleGameStateUpdate(data) {
    if (data.players && data.players[playerData?.id]) {
        myScore = data.players[playerData.id].score;
        const scoreEl = document.getElementById('scoreDisplay');
        if (scoreEl) scoreEl.textContent = myScore;
    }
    
    let configChanged = false;
    
    if (data.difficulty && data.difficulty !== currentDifficulty) {
        currentDifficulty = data.difficulty;
        difficultyConfig = DIFFICULTY_CONFIG[data.difficulty] || DIFFICULTY_CONFIG.easy;
        configChanged = true;
    }
    
    if (data.maxRounds && data.maxRounds !== maxRounds) {
        maxRounds = data.maxRounds;
        selectedRounds = data.maxRounds;
        configChanged = true;
    }
    
    if (data.gameMode && data.gameMode !== currentGameMode) {
        currentGameMode = data.gameMode;
        configChanged = true;
    }
    
    // Si cambió la configuración y estamos en pantalla de espera, actualizar UI
    if (configChanged && !isAdmin && document.getElementById('waitingScreen')) {
        updateWaitingScreenConfig();
    }
}

// Actualizar la configuración mostrada en la pantalla de espera (para no-admins)
function updateWaitingScreenConfig() {
    const badges = document.querySelector('.config-badges');
    if (badges) {
        badges.innerHTML = `
            <span class="config-badge">
                <iconify-icon icon="${GAME_MODES[currentGameMode].icon}"></iconify-icon>
                ${GAME_MODES[currentGameMode].name}
            </span>
            <span class="config-badge">
                <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                ${difficultyConfig.name}
            </span>
            <span class="config-badge" id="roundsDisplay">
                <iconify-icon icon="mdi:counter"></iconify-icon>
                ${selectedRounds || maxRounds || 8}
            </span>
        `;
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
