// ============================================
// LABORATORIO QUÍMICO - CONTROLLER APP
// Sistema de Dificultades
// ============================================

// ============================================
// CONFIGURACIÓN DE DIFICULTADES
// ============================================

const DIFFICULTY_CONFIG = {
    easy: {
        name: 'Fácil',
        icon: 'mdi:flask-outline',
        color: '#10b981',
        description: 'Elementos básicos con cantidades',
        showQuantities: true,
        showRequiredElements: true,
        showHint: true
    },
    medium: {
        name: 'Intermedio',
        icon: 'mdi:flask',
        color: '#f59e0b',
        description: 'Más elementos, sin cantidades',
        showQuantities: false,
        showRequiredElements: true,
        showHint: true
    },
    hard: {
        name: 'Difícil',
        icon: 'mdi:flask-round-bottom',
        color: '#ef4444',
        description: 'Solo el nombre, tabla completa',
        showQuantities: false,
        showRequiredElements: false,
        showHint: false
    }
};

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
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-5 text-center relative" id="waitingScreen">
            <div class="controller-bg"></div>
            <div class="relative z-10 w-full max-w-sm">
                <div class="player-avatar mx-auto mb-4" id="playerAvatar" style="background: ${playerData.color};">
                    <iconify-icon icon="${playerData.icon}" style="color: white;"></iconify-icon>
                </div>
                
                <p class="text-2xl font-black mb-2" style="color: ${playerData.color};">${playerData.name}</p>
                
                ${isAdmin ? `
                    <div class="bg-orange-50 border-2 border-orange-400 rounded-2xl py-3 px-5 mb-4 inline-flex items-center gap-2">
                        <iconify-icon icon="mdi:crown" class="text-2xl" style="color: var(--color-warning);"></iconify-icon>
                        <span class="font-bold" style="color: var(--color-warning);">ERES EL ADMIN</span>
                    </div>
                    
                    <!-- Selector de Dificultad para Admin -->
                    <div class="difficulty-selector-admin mb-6">
                        <p class="text-sm mb-3" style="color: var(--color-text-light);">
                            <iconify-icon icon="mdi:speedometer" class="mr-1"></iconify-icon>
                            Selecciona la dificultad:
                        </p>
                        <div class="difficulty-options" id="difficultyOptions">
                            ${Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => `
                                <button class="difficulty-option ${key === currentDifficulty ? 'selected' : ''}" 
                                        data-difficulty="${key}"
                                        style="--diff-color: ${config.color};">
                                    <iconify-icon icon="${config.icon}"></iconify-icon>
                                    <span class="diff-name">${config.name}</span>
                                    <span class="diff-desc">${config.description}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div class="current-difficulty mb-4">
                        <p class="text-sm mb-2" style="color: var(--color-text-light);">Dificultad:</p>
                        <div class="difficulty-badge-large" style="background: ${difficultyConfig.color}20; border-color: ${difficultyConfig.color}; color: ${difficultyConfig.color};">
                            <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                            ${difficultyConfig.name}
                        </div>
                    </div>
                `}
                
                <div class="mb-6">
                    <iconify-icon icon="mdi:flask" class="text-5xl bounce" style="color: var(--color-accent);"></iconify-icon>
                </div>
                
                <div class="bg-green-50 border-2 border-green-400 rounded-2xl py-3 px-5 mb-4">
                    <p class="text-base font-bold" style="color: var(--color-success);">
                        <iconify-icon icon="mdi:check-circle" class="mr-2"></iconify-icon>
                        ¡Conectado al laboratorio!
                    </p>
                </div>
                
                ${isAdmin ? `
                    <button class="btn-admin w-full flex items-center justify-center gap-3" id="startGameBtn">
                        <iconify-icon icon="mdi:rocket-launch" style="font-size: 24px;"></iconify-icon>
                        ¡INICIAR EXPERIMENTO!
                    </button>
                ` : `
                    <p style="color: var(--color-text-light);">
                        <iconify-icon icon="mdi:timer-sand" class="mr-2"></iconify-icon>
                        Esperando que el admin inicie...
                    </p>
                `}
            </div>
        </div>
    `;
    
    if (isAdmin) {
        // Event listeners para selector de dificultad
        document.querySelectorAll('.difficulty-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const diff = btn.dataset.difficulty;
                selectDifficulty(diff);
            });
        });
        
        document.getElementById('startGameBtn').addEventListener('click', () => {
            sendMessage({ action: 'startGame', difficulty: currentDifficulty });
        });
    }
}

function selectDifficulty(difficulty) {
    currentDifficulty = difficulty;
    difficultyConfig = DIFFICULTY_CONFIG[difficulty];
    
    // Actualizar UI
    document.querySelectorAll('.difficulty-option').forEach(btn => {
        btn.classList.toggle('selected', btn.dataset.difficulty === difficulty);
    });
    
    // Vibración de feedback
    if (navigator.vibrate) {
        navigator.vibrate(30);
    }
    
    playSound('select');
}

function renderPlayingScreen() {
    const app = document.getElementById('app');
    
    // Contar elementos necesarios según dificultad
    let requiredHtml = '';
    
    if (currentCompound) {
        if (difficultyConfig.showRequiredElements) {
            const counts = {};
            if (currentCompound.elements) {
                currentCompound.elements.forEach(el => counts[el] = (counts[el] || 0) + 1);
            } else if (currentCompound.elementsUnique) {
                currentCompound.elementsUnique.forEach(el => counts[el] = 1);
            }
            
            if (difficultyConfig.showQuantities) {
                requiredHtml = Object.entries(counts).map(([el, count]) => `
                    <span class="required-badge-sm">${el}${count > 1 ? '×' + count : ''}</span>
                `).join('');
            } else {
                requiredHtml = Object.keys(counts).map(el => `
                    <span class="required-badge-sm">${el}</span>
                `).join('');
            }
        }
    }
    
    maxSelections = currentCompound?.elements?.length || 5;
    
    app.innerHTML = `
        <div class="screen active flex-col p-3 relative" id="playingScreen">
            <div class="controller-bg"></div>
            
            <!-- Header compacto -->
            <div class="relative z-10 text-center mb-2">
                <div class="flex items-center justify-center gap-2 mb-2">
                    <img src="../LogoSteamRD-Color.webp" alt="STEAM RD" class="w-8 h-8">
                    <span class="text-xs px-2 py-1 rounded-full" style="background: var(--color-bg-soft); color: var(--color-text-light);">
                        Ronda ${currentRound}/${maxRounds}
                    </span>
                    <span class="difficulty-badge-sm" style="background: ${difficultyConfig.color}20; color: ${difficultyConfig.color};">
                        <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                    </span>
                </div>
                
                <p class="text-xs mb-1" style="color: var(--color-text-light);">Sintetiza:</p>
                
                <div class="target-card-compact mb-2">
                    ${currentDifficulty === 'hard' ? `
                        <div class="target-formula-compact mystery">???</div>
                        <p class="text-base font-bold" style="color: var(--color-danger);">${currentCompound?.name || ''}</p>
                        <p class="text-xs mt-1" style="color: var(--color-text-light);">¡Descubre la fórmula!</p>
                    ` : `
                        <div class="target-formula-compact">${currentCompound?.formula || '???'}</div>
                        <p class="text-sm font-semibold" style="color: var(--color-primary);">${currentCompound?.name || ''}</p>
                    `}
                </div>
                
                ${requiredHtml ? `
                    <div class="flex flex-wrap justify-center gap-1 mb-2" id="requiredElements">
                        ${requiredHtml}
                    </div>
                ` : (currentDifficulty === 'hard' ? `
                    <p class="text-xs mb-2" style="color: var(--color-text-light); opacity: 0.7;">
                        <iconify-icon icon="mdi:help-circle" class="mr-1"></iconify-icon>
                        Sin pistas - ¡Buena suerte!
                    </p>
                ` : '')}
            </div>
            
            <!-- Área de selección -->
            <div class="relative z-10 selection-area mb-2" id="selectionArea">
                <p class="text-sm" style="color: var(--color-text-light);">
                    <iconify-icon icon="mdi:hand-pointing-up" class="mr-1"></iconify-icon>
                    Toca los elementos para seleccionar
                </p>
            </div>
            
            <!-- Elements Grid -->
            <div class="relative z-10 elements-grid flex-1 overflow-y-auto" id="elementsGrid"></div>
            
            <!-- Botón confirmar -->
            <button class="relative z-10 confirm-btn mt-2" id="confirmSelectionBtn" onclick="confirmSelection()" disabled>
                <iconify-icon icon="mdi:flask-round-bottom" class="mr-2"></iconify-icon>
                CONFIRMAR MEZCLA
            </button>
            
            <!-- Player Info compacto -->
            <div class="relative z-10 mini-player-compact mt-2">
                <div class="mini-avatar-sm" style="background: ${playerData?.color || '#6366f1'};">
                    <iconify-icon icon="${playerData?.icon || 'mdi:flask'}" style="color: white;"></iconify-icon>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-xs truncate" style="color: var(--color-text);">${playerData?.name || 'Científico'}</p>
                </div>
                <div class="score-display-sm" id="scoreDisplay">${myScore}</div>
            </div>
        </div>
        
        <!-- Result Overlay -->
        <div class="result-overlay" id="resultOverlay">
            <div class="text-center p-6" id="resultContent"></div>
        </div>
    `;
    
    setupElementsGrid();
}

window.confirmSelection = confirmSelection;

function setupElementsGrid() {
    const grid = document.getElementById('elementsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Usar solo los elementos disponibles para esta dificultad
    availableElementKeys.forEach(key => {
        const el = allElements[key];
        if (!el) return;
        
        const btn = document.createElement('button');
        btn.className = `element-btn element-${el.group}`;
        btn.dataset.element = key;
        btn.innerHTML = `
            <span class="atomic-number">${el.number}</span>
            <span class="symbol">${el.symbol}</span>
            <span class="name">${el.name}</span>
            <span class="selection-count" id="count-${key}"></span>
        `;
        btn.addEventListener('click', () => handleElementClick(key, btn));
        
        grid.appendChild(btn);
    });
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate('.element-btn', {
            scale: [0, 1],
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
    const selectionArea = document.getElementById('selectionArea');
    if (selectionArea) {
        if (selectedElements.length === 0) {
            selectionArea.innerHTML = `
                <p class="text-sm" style="color: var(--color-text-light);">
                    <iconify-icon icon="mdi:hand-pointing-up" class="mr-1"></iconify-icon>
                    Toca los elementos para seleccionar
                </p>
            `;
        } else {
            selectionArea.innerHTML = `
                <div class="selected-elements-row">
                    ${selectedElements.map((el, i) => `
                        <button class="selected-element-chip element-${allElements[el]?.group || 'nonmetal'}" onclick="removeSelectedElement(${i})">
                            ${el}
                            <iconify-icon icon="mdi:close" class="remove-icon"></iconify-icon>
                        </button>
                    `).join('')}
                </div>
                <p class="text-xs mt-2" style="color: var(--color-text-light);">
                    ${selectedElements.length}/${maxSelections} • Toca para quitar
                </p>
            `;
        }
    }
    
    // Actualizar botón de confirmar
    const confirmBtn = document.getElementById('confirmSelectionBtn');
    if (confirmBtn) {
        confirmBtn.disabled = selectedElements.length === 0;
        confirmBtn.classList.toggle('ready', selectedElements.length > 0);
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
    
    document.querySelectorAll('.element-btn').forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
    });
    
    const selectionArea = document.getElementById('selectionArea');
    if (selectionArea) {
        selectionArea.innerHTML = `
            <div class="selection-confirmed">
                <iconify-icon icon="mdi:check-circle" class="text-3xl" style="color: var(--color-success);"></iconify-icon>
                <p class="font-bold mt-2" style="color: var(--color-success);">¡Selección enviada!</p>
                <div class="selected-elements-row mt-2">
                    ${selectedElements.map(el => `<span class="final-element-chip">${el}</span>`).join('')}
                </div>
                <p class="text-sm mt-2" style="color: var(--color-text-light);">Esperando a los demás...</p>
            </div>
        `;
    }
    
    const confirmBtn = document.getElementById('confirmSelectionBtn');
    if (confirmBtn) {
        confirmBtn.style.display = 'none';
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
    
    if (data.players && data.players[playerData?.id]) {
        myScore = data.players[playerData.id].score;
    }
    
    if (data.correct) {
        playSound('success');
        
        const basePoints = data.compound.points;
        const timeBonus = data.timeBonus || 0;
        const multiplier = data.difficultyMultiplier || 1;
        const difficultyBonus = Math.floor((basePoints + timeBonus) * (multiplier - 1));
        
        content.innerHTML = `
            <div class="success-animation">
                <div class="success-icon-container">
                    <iconify-icon icon="mdi:check-circle" class="text-7xl success-icon" style="color: var(--color-success);"></iconify-icon>
                </div>
                <div class="confetti-burst" id="miniConfetti"></div>
            </div>
            <h2 class="text-2xl font-black mb-2" style="color: var(--color-success);">¡Síntesis Exitosa!</h2>
            <p class="text-lg mb-3" style="color: var(--color-text);">${data.compound.formula} - ${data.compound.name}</p>
            <div class="points-earned">
                <iconify-icon icon="mdi:star" class="mr-2"></iconify-icon>
                +${basePoints} pts
                ${timeBonus > 0 ? `<span class="bonus">+${timeBonus} tiempo</span>` : ''}
                ${difficultyBonus > 0 ? `<span class="bonus diff-bonus">+${difficultyBonus} ${difficultyConfig.name}</span>` : ''}
            </div>
        `;
        
        createMiniConfetti();
        
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    } else {
        playSound('error');
        
        content.innerHTML = `
            <div class="error-animation">
                <div class="error-icon-container shake-animation">
                    <iconify-icon icon="mdi:close-circle" class="text-7xl" style="color: var(--color-danger);"></iconify-icon>
                </div>
                <div class="error-x-burst" id="errorBurst"></div>
            </div>
            <h2 class="text-2xl font-black mb-2" style="color: var(--color-danger);">Reacción Fallida</h2>
            <p class="text-base mb-3" style="color: var(--color-text-light);">La combinación no fue correcta</p>
            <p class="text-sm" style="color: var(--color-text-light); opacity: 0.7;">
                Se necesitaba: ${data.compound.formula}<br>
                (${data.compound.elements.join(' + ')})
            </p>
        `;
        
        createErrorBurst();
        
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    }
    
    overlay.classList.add('active');
    
    if (window.anime) {
        window.anime.animate('#resultContent .success-icon, #resultContent .error-icon-container', {
            scale: [0, 1.2, 1],
            duration: 500,
            easing: 'easeOutElastic(1, .5)'
        });
    }
    
    setTimeout(() => overlay.classList.remove('active'), 3000);
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

// ============================================
// INICIAR
// ============================================

init();
