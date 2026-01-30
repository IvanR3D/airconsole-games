// ============================================
// LABORATORIO QUÍMICO - SCREEN APP
// Sistema de Dificultades
// ============================================

// Cargar estilos
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'screen-styles.css';
document.head.appendChild(styleLink);

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
        showHint: true,
        timerSeconds: 60,
        pointsMultiplier: 1,
        availableElements: ['H', 'O', 'C', 'N', 'Na', 'Cl', 'S', 'Ca', 'K', 'Mg', 'Fe', 'P'],
        maxRounds: 8
    },
    medium: {
        name: 'Intermedio',
        icon: 'mdi:flask',
        color: '#f59e0b',
        description: 'Más elementos, sin cantidades',
        showQuantities: false,
        showRequiredElements: true,
        showHint: true,
        timerSeconds: 50,
        pointsMultiplier: 1.5,
        availableElements: ['H', 'O', 'C', 'N', 'Na', 'Cl', 'S', 'Ca', 'K', 'Mg', 'Fe', 'P', 'He', 'Ne', 'Al', 'Si', 'Ar', 'Cu', 'Zn', 'Br', 'I'],
        maxRounds: 10
    },
    hard: {
        name: 'Difícil',
        icon: 'mdi:flask-round-bottom',
        color: '#ef4444',
        description: 'Solo el nombre, tabla completa',
        showQuantities: false,
        showRequiredElements: false,
        showHint: false,
        timerSeconds: 45,
        pointsMultiplier: 2.5,
        availableElements: 'all',
        maxRounds: 12
    }
};

// ============================================
// DATOS DEL JUEGO - ELEMENTOS EXPANDIDOS
// ============================================

const elements = {
    // Periodo 1
    H: { symbol: 'H', name: 'Hidrógeno', number: 1, group: 'nonmetal', icon: 'mdi:atom' },
    He: { symbol: 'He', name: 'Helio', number: 2, group: 'noble', icon: 'mdi:balloon' },
    // Periodo 2
    Li: { symbol: 'Li', name: 'Litio', number: 3, group: 'alkaline', icon: 'mdi:battery' },
    Be: { symbol: 'Be', name: 'Berilio', number: 4, group: 'alkaline-earth', icon: 'mdi:hexagon' },
    B: { symbol: 'B', name: 'Boro', number: 5, group: 'metalloid', icon: 'mdi:triangle' },
    C: { symbol: 'C', name: 'Carbono', number: 6, group: 'nonmetal', icon: 'mdi:diamond-stone' },
    N: { symbol: 'N', name: 'Nitrógeno', number: 7, group: 'nonmetal', icon: 'mdi:cloud' },
    O: { symbol: 'O', name: 'Oxígeno', number: 8, group: 'nonmetal', icon: 'mdi:weather-windy' },
    F: { symbol: 'F', name: 'Flúor', number: 9, group: 'halogen', icon: 'mdi:tooth' },
    Ne: { symbol: 'Ne', name: 'Neón', number: 10, group: 'noble', icon: 'mdi:led-strip' },
    // Periodo 3
    Na: { symbol: 'Na', name: 'Sodio', number: 11, group: 'alkaline', icon: 'mdi:shaker' },
    Mg: { symbol: 'Mg', name: 'Magnesio', number: 12, group: 'alkaline-earth', icon: 'mdi:flash' },
    Al: { symbol: 'Al', name: 'Aluminio', number: 13, group: 'metal', icon: 'mdi:can' },
    Si: { symbol: 'Si', name: 'Silicio', number: 14, group: 'metalloid', icon: 'mdi:chip' },
    P: { symbol: 'P', name: 'Fósforo', number: 15, group: 'nonmetal', icon: 'mdi:lightbulb' },
    S: { symbol: 'S', name: 'Azufre', number: 16, group: 'nonmetal', icon: 'mdi:fire' },
    Cl: { symbol: 'Cl', name: 'Cloro', number: 17, group: 'halogen', icon: 'mdi:water' },
    Ar: { symbol: 'Ar', name: 'Argón', number: 18, group: 'noble', icon: 'mdi:lightbulb-outline' },
    // Periodo 4
    K: { symbol: 'K', name: 'Potasio', number: 19, group: 'alkaline', icon: 'mdi:fruit-bananas' },
    Ca: { symbol: 'Ca', name: 'Calcio', number: 20, group: 'alkaline-earth', icon: 'mdi:bone' },
    Fe: { symbol: 'Fe', name: 'Hierro', number: 26, group: 'transition', icon: 'mdi:anvil' },
    Cu: { symbol: 'Cu', name: 'Cobre', number: 29, group: 'transition', icon: 'mdi:pipe' },
    Zn: { symbol: 'Zn', name: 'Zinc', number: 30, group: 'transition', icon: 'mdi:shield' },
    Br: { symbol: 'Br', name: 'Bromo', number: 35, group: 'halogen', icon: 'mdi:water-opacity' },
    Kr: { symbol: 'Kr', name: 'Kriptón', number: 36, group: 'noble', icon: 'mdi:star-four-points' },
    // Periodo 5
    Ag: { symbol: 'Ag', name: 'Plata', number: 47, group: 'transition', icon: 'mdi:gold' },
    I: { symbol: 'I', name: 'Yodo', number: 53, group: 'halogen', icon: 'mdi:medical-bag' },
    // Periodo 6
    Au: { symbol: 'Au', name: 'Oro', number: 79, group: 'transition', icon: 'mdi:gold' },
    Hg: { symbol: 'Hg', name: 'Mercurio', number: 80, group: 'transition', icon: 'mdi:thermometer' },
    Pb: { symbol: 'Pb', name: 'Plomo', number: 82, group: 'metal', icon: 'mdi:weight' }
};

// ============================================
// COMPUESTOS POR DIFICULTAD
// ============================================

const compoundsEasy = [
    { formula: 'H₂O', name: 'Agua', elements: ['H', 'H', 'O'], points: 100, hint: 'Esencial para la vida', icon: 'mdi:water' },
    { formula: 'NaCl', name: 'Sal de mesa', elements: ['Na', 'Cl'], points: 100, hint: 'Sazona tu comida', icon: 'mdi:shaker-outline' },
    { formula: 'CO₂', name: 'Dióxido de carbono', elements: ['C', 'O', 'O'], points: 150, hint: 'Lo exhalas al respirar', icon: 'mdi:molecule-co2' },
    { formula: 'NH₃', name: 'Amoníaco', elements: ['N', 'H', 'H', 'H'], points: 150, hint: 'Olor fuerte característico', icon: 'mdi:spray' },
    { formula: 'CH₄', name: 'Metano', elements: ['C', 'H', 'H', 'H', 'H'], points: 200, hint: 'Gas natural', icon: 'mdi:gas-burner' },
    { formula: 'H₂O₂', name: 'Agua oxigenada', elements: ['H', 'H', 'O', 'O'], points: 150, hint: 'Desinfectante común', icon: 'mdi:bottle-tonic-plus' },
    { formula: 'KCl', name: 'Cloruro de potasio', elements: ['K', 'Cl'], points: 100, hint: 'Sustituto de sal', icon: 'mdi:shaker' },
    { formula: 'MgO', name: 'Óxido de magnesio', elements: ['Mg', 'O'], points: 120, hint: 'Antiácido estomacal', icon: 'mdi:pill' },
    { formula: 'CaO', name: 'Cal viva', elements: ['Ca', 'O'], points: 120, hint: 'Usado en construcción', icon: 'mdi:wall' },
    { formula: 'HCl', name: 'Ácido clorhídrico', elements: ['H', 'Cl'], points: 100, hint: 'Ácido del estómago', icon: 'mdi:flask' }
];

const compoundsMedium = [
    ...compoundsEasy,
    { formula: 'CaCO₃', name: 'Carbonato de calcio', elements: ['Ca', 'C', 'O', 'O', 'O'], points: 250, hint: 'En conchas y huesos', icon: 'mdi:bone' },
    { formula: 'SiO₂', name: 'Dióxido de silicio', elements: ['Si', 'O', 'O'], points: 150, hint: 'Arena y vidrio', icon: 'mdi:beach' },
    { formula: 'Fe₂O₃', name: 'Óxido de hierro', elements: ['Fe', 'Fe', 'O', 'O', 'O'], points: 250, hint: 'Herrumbre/Óxido', icon: 'mdi:iron' },
    { formula: 'Al₂O₃', name: 'Óxido de aluminio', elements: ['Al', 'Al', 'O', 'O', 'O'], points: 250, hint: 'Corindón/Rubí', icon: 'mdi:diamond' },
    { formula: 'H₂S', name: 'Sulfuro de hidrógeno', elements: ['H', 'H', 'S'], points: 150, hint: 'Olor a huevo podrido', icon: 'mdi:egg-off' },
    { formula: 'SO₂', name: 'Dióxido de azufre', elements: ['S', 'O', 'O'], points: 150, hint: 'Conservante de vinos', icon: 'mdi:glass-wine' },
    { formula: 'CuO', name: 'Óxido de cobre', elements: ['Cu', 'O'], points: 120, hint: 'Color negro/marrón', icon: 'mdi:circle' },
    { formula: 'ZnO', name: 'Óxido de zinc', elements: ['Zn', 'O'], points: 120, hint: 'Protector solar', icon: 'mdi:white-balance-sunny' },
    { formula: 'NaOH', name: 'Hidróxido de sodio', elements: ['Na', 'O', 'H'], points: 180, hint: 'Sosa cáustica', icon: 'mdi:flask-outline' },
    { formula: 'HBr', name: 'Ácido bromhídrico', elements: ['H', 'Br'], points: 120, hint: 'Ácido fuerte', icon: 'mdi:flask' }
];

const compoundsHard = [
    ...compoundsMedium,
    { formula: 'C₆H₁₂O₆', name: 'Glucosa', elements: ['C', 'C', 'C', 'C', 'C', 'C', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'O', 'O', 'O', 'O', 'O', 'O'], points: 500, hint: 'Azúcar de la sangre', icon: 'mdi:candy' },
    { formula: 'C₂H₅OH', name: 'Etanol', elements: ['C', 'C', 'H', 'H', 'H', 'H', 'H', 'O', 'H'], points: 350, hint: 'Alcohol de bebidas', icon: 'mdi:glass-cocktail' },
    { formula: 'CH₃COOH', name: 'Ácido acético', elements: ['C', 'H', 'H', 'H', 'C', 'O', 'O', 'H'], points: 400, hint: 'Vinagre', icon: 'mdi:bottle-wine' },
    { formula: 'NaHCO₃', name: 'Bicarbonato de sodio', elements: ['Na', 'H', 'C', 'O', 'O', 'O'], points: 300, hint: 'Para hornear', icon: 'mdi:cupcake' },
    { formula: 'CaSO₄', name: 'Sulfato de calcio', elements: ['Ca', 'S', 'O', 'O', 'O', 'O'], points: 300, hint: 'Yeso', icon: 'mdi:wall' },
    { formula: 'KNO₃', name: 'Nitrato de potasio', elements: ['K', 'N', 'O', 'O', 'O'], points: 280, hint: 'Pólvora negra', icon: 'mdi:firework' },
    { formula: 'H₂SO₄', name: 'Ácido sulfúrico', elements: ['H', 'H', 'S', 'O', 'O', 'O', 'O'], points: 350, hint: 'Rey de los ácidos', icon: 'mdi:flask-round-bottom' },
    { formula: 'HNO₃', name: 'Ácido nítrico', elements: ['H', 'N', 'O', 'O', 'O'], points: 280, hint: 'Agua fuerte', icon: 'mdi:flask' },
    { formula: 'AgNO₃', name: 'Nitrato de plata', elements: ['Ag', 'N', 'O', 'O', 'O'], points: 320, hint: 'Fotografía antigua', icon: 'mdi:camera' },
    { formula: 'FeCl₃', name: 'Cloruro férrico', elements: ['Fe', 'Cl', 'Cl', 'Cl'], points: 280, hint: 'Grabado de circuitos', icon: 'mdi:chip' },
    { formula: 'CuSO₄', name: 'Sulfato de cobre', elements: ['Cu', 'S', 'O', 'O', 'O', 'O'], points: 320, hint: 'Cristales azules', icon: 'mdi:diamond-stone' },
    { formula: 'PbO₂', name: 'Dióxido de plomo', elements: ['Pb', 'O', 'O'], points: 200, hint: 'Baterías de auto', icon: 'mdi:car-battery' }
];

// Función para obtener compuestos según dificultad
function getCompoundsForDifficulty(difficulty) {
    switch(difficulty) {
        case 'easy': return compoundsEasy;
        case 'medium': return compoundsMedium;
        case 'hard': return compoundsHard;
        default: return compoundsEasy;
    }
}

// ============================================
// ESTADO DEL JUEGO
// ============================================

let airconsole;
let players = {};
let currentCompound = null;
let selectedElements = [];
let playerSelections = {};
let gameTimer = 45;
let timerInterval = null;
let roundNumber = 0;
let usedCompounds = [];
let currentDifficulty = 'easy';
let difficultyConfig = DIFFICULTY_CONFIG.easy;

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
                handleElementSelection(from, [data.element]);
                break;
            case 'selectElements':
                handleElementSelection(from, data.elements);
                break;
            case 'startGame':
                if (data.difficulty) {
                    setDifficulty(data.difficulty);
                }
                startGame();
                break;
            case 'playAgain':
                resetGame();
                break;
            case 'playerExit':
                handlePlayerExit(from);
                break;
            case 'playerLeave':
                handlePlayerLeave(from);
                break;
        }
    };
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
    difficultyConfig = DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.easy;
    console.log('🎮 Dificultad establecida:', difficultyConfig.name);
}

function handlePlayerExit(device_id) {
    // El jugador decidió salir durante el juego
    if (players[device_id]) {
        delete players[device_id];
        
        // Si no quedan jugadores suficientes, terminar el juego
        if (Object.keys(players).length < 1) {
            if (timerInterval) clearInterval(timerInterval);
            resetGame();
            return;
        }
        
        // Limpiar selección del jugador que salió
        if (playerSelections[device_id]) {
            delete playerSelections[device_id];
        }
        
        // Remover elementos seleccionados por este jugador
        selectedElements = selectedElements.filter(e => e.player !== device_id);
        
        // Actualizar UI
        updatePlayerSlots();
        updatePlayersArea();
        broadcastGameState();
        
        // Verificar si todos los jugadores restantes ya seleccionaron
        const totalPlayers = Object.keys(players).length;
        const playersWhoSelected = Object.values(playerSelections).filter(p => p && p.hasSelected).length;
        
        if (playersWhoSelected >= totalPlayers && totalPlayers > 0) {
            clearInterval(timerInterval);
            const zone = document.getElementById('mixingZone');
            if (zone) zone.classList.add('reacting');
            setTimeout(() => checkCompound(), 1000);
        }
    }
}

function handlePlayerLeave(device_id) {
    // El jugador abandonó desde la pantalla de espera
    if (players[device_id]) {
        delete players[device_id];
        updatePlayerSlots();
        updatePlayersArea();
        broadcastGameState();
    }
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
                
                <!-- Selector de Dificultad -->
                <div class="difficulty-selector mb-6" id="difficultySelector">
                    <p class="text-sm mb-3" style="color: var(--color-text-light);">
                        <iconify-icon icon="mdi:speedometer" class="mr-1"></iconify-icon>
                        Dificultad seleccionada:
                    </p>
                    <div class="difficulty-display" id="difficultyDisplay">
                        <iconify-icon icon="${DIFFICULTY_CONFIG.easy.icon}" style="color: ${DIFFICULTY_CONFIG.easy.color};"></iconify-icon>
                        <span style="color: ${DIFFICULTY_CONFIG.easy.color};">${DIFFICULTY_CONFIG.easy.name}</span>
                    </div>
                    <p class="text-xs mt-2" style="color: var(--color-text-light); opacity: 0.7;">
                        El admin puede cambiar la dificultad desde su control
                    </p>
                </div>
                
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
                        <span id="roundsInfo">${DIFFICULTY_CONFIG.easy.maxRounds} rondas</span>
                    </div>
                    <div class="flex items-center gap-1 sm:gap-2">
                        <iconify-icon icon="mdi:trophy" class="text-base sm:text-lg lg:text-xl" style="color: var(--color-warning);"></iconify-icon>
                        <span>Gana puntos</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
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

function updateDifficultyDisplay(difficulty) {
    const config = DIFFICULTY_CONFIG[difficulty];
    const display = document.getElementById('difficultyDisplay');
    const roundsInfo = document.getElementById('roundsInfo');
    
    if (display) {
        display.innerHTML = `
            <iconify-icon icon="${config.icon}" style="color: ${config.color};"></iconify-icon>
            <span style="color: ${config.color};">${config.name}</span>
        `;
        
        if (window.anime) {
            window.anime.animate(display, {
                scale: [0.8, 1.1, 1],
                duration: 400,
                easing: 'easeOutBack'
            });
        }
    }
    
    if (roundsInfo) {
        roundsInfo.textContent = `${config.maxRounds} rondas`;
    }
}

function renderPlayingScreen() {
    const app = document.getElementById('app');
    const maxRounds = difficultyConfig.maxRounds;
    
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
            
            <!-- Header -->
            <div class="relative z-10 header-row">
                <div class="flex items-center gap-2 sm:gap-3">
                    <iconify-icon icon="mdi:flask-round-bottom" class="text-xl sm:text-2xl lg:text-3xl" style="color: var(--color-accent);"></iconify-icon>
                    <div>
                        <div class="flex items-center gap-2">
                            <h1 class="text-sm sm:text-lg lg:text-xl font-bold" style="color: var(--color-text);">Laboratorio Químico</h1>
                            <span class="difficulty-badge" style="background: ${difficultyConfig.color}20; color: ${difficultyConfig.color}; border: 1px solid ${difficultyConfig.color};">
                                <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                                ${difficultyConfig.name}
                            </span>
                        </div>
                        <div class="round-indicator mt-1" id="roundIndicator">
                            ${Array(maxRounds).fill(0).map((_, i) => `<div class="round-dot" data-round="${i+1}"></div>`).join('')}
                        </div>
                    </div>
                </div>
                
                <div class="timer-ring" id="timerRing">
                    <span class="time" id="timerDisplay">${difficultyConfig.timerSeconds}</span>
                </div>
            </div>
            
            <!-- Main content -->
            <div class="playing-content relative z-10">
                <div class="target-column">
                    <div class="target-display" id="targetDisplay">
                        <p class="text-xs sm:text-sm mb-1" style="color: var(--color-text-light);">
                            <iconify-icon icon="mdi:target" class="mr-1"></iconify-icon>
                            Sintetiza:
                        </p>
                        <div class="target-formula" id="targetFormula">???</div>
                        <p class="text-base sm:text-lg font-semibold mt-1" style="color: var(--color-primary);" id="targetName">Cargando...</p>
                        <p class="text-xs mt-1 hint-text" style="color: var(--color-text-light);" id="targetHint">
                            <iconify-icon icon="mdi:lightbulb-outline" class="mr-1"></iconify-icon>
                            <span></span>
                        </p>
                    </div>
                    
                    <div class="text-center mt-2">
                        <div class="status-indicator waiting inline-flex" id="statusIndicator">
                            <iconify-icon icon="mdi:timer-sand" class="animate-pulse"></iconify-icon>
                            <span>0/${Object.keys(players).length} listos</span>
                        </div>
                    </div>
                    
                    <div class="mt-2 text-center required-hint-container" id="requiredHintContainer">
                        <p class="text-xs mb-1" style="color: var(--color-text-light);" id="requiredLabel">Elementos necesarios:</p>
                        <div class="flex justify-center gap-1 flex-wrap" id="requiredElements"></div>
                    </div>
                </div>
                
                <div class="mixing-column">
                    <div class="mixing-zone" id="mixingZone">
                        <div id="bubblesContainer" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
                        
                        <div class="text-center" id="mixingContent">
                            <iconify-icon icon="mdi:beaker-question" class="text-3xl sm:text-4xl lg:text-5xl mb-2" style="color: var(--color-text-light); opacity: 0.4;"></iconify-icon>
                            <p class="text-xs sm:text-sm" style="color: var(--color-text-light);">Los científicos están seleccionando...</p>
                        </div>
                        
                        <div class="hidden mixing-elements flex-wrap justify-center gap-2" id="selectedElements"></div>
                    </div>
                </div>
            </div>
            
            <div class="players-area relative z-10" id="playersArea"></div>
        </div>
        
        <div class="result-overlay" id="resultOverlay">
            <div class="result-content" id="resultContent"></div>
        </div>
    `;
    
    setupResizeHandler();
}

let resizeTimeout = null;

function setupResizeHandler() {
    window.removeEventListener('resize', handleScreenResize);
    window.addEventListener('resize', handleScreenResize);
}

function handleScreenResize() {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => recalculatePlayersGrid(), 150);
}

function recalculatePlayersGrid() {
    const playersArea = document.getElementById('playersArea');
    if (!playersArea) return;
    playersArea.style.display = 'none';
    playersArea.offsetHeight;
    playersArea.style.display = '';
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
                
                <div class="difficulty-completed mb-4" style="color: ${difficultyConfig.color};">
                    <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                    Dificultad: ${difficultyConfig.name} (x${difficultyConfig.pointsMultiplier})
                </div>
                
                <p class="text-base sm:text-lg lg:text-xl text-white/70 mb-4 sm:mb-6 lg:mb-8">El mejor científico del laboratorio es...</p>
                
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
    
    // Enviar elementos disponibles según dificultad actual
    const availableElements = getAvailableElements();
    
    airconsole.message(device_id, {
        action: 'joined',
        player: players[device_id],
        isAdmin: players[device_id].isAdmin,
        elements: availableElements,
        difficulty: currentDifficulty,
        difficultyConfig: difficultyConfig
    });
    
    updatePlayerSlots();
    broadcastGameState();
    
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

function getAvailableElements() {
    if (difficultyConfig.availableElements === 'all') {
        return Object.keys(elements);
    }
    return difficultyConfig.availableElements;
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
        maxRounds: difficultyConfig.maxRounds,
        difficulty: currentDifficulty,
        difficultyConfig: difficultyConfig
    });
}

function startGame() {
    renderPlayingScreen();
    roundNumber = 0;
    usedCompounds = [];
    Object.values(players).forEach(p => p.score = 0);
    
    // Broadcast elementos disponibles para esta dificultad
    const availableElements = getAvailableElements();
    airconsole.broadcast({
        action: 'gameStarted',
        difficulty: currentDifficulty,
        difficultyConfig: difficultyConfig,
        elements: availableElements
    });
    
    nextRound();
}

function nextRound() {
    roundNumber++;
    
    if (roundNumber > difficultyConfig.maxRounds) {
        endGame();
        return;
    }
    
    selectedElements = [];
    playerSelections = {};
    
    Object.keys(players).forEach(pid => {
        playerSelections[pid] = { hasSelected: false, elements: [] };
    });
    
    // Seleccionar compuesto según dificultad
    const compounds = getCompoundsForDifficulty(currentDifficulty);
    const availableCompounds = compounds.filter(c => !usedCompounds.includes(c.formula));
    currentCompound = availableCompounds[Math.floor(Math.random() * availableCompounds.length)];
    usedCompounds.push(currentCompound.formula);
    
    updateRoundIndicator();
    updateTargetDisplay();
    updateRequiredElements();
    resetMixingZone();
    updatePlayersArea();
    
    gameTimer = difficultyConfig.timerSeconds;
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
    
    // Broadcast con info según dificultad
    const broadcastData = {
        action: 'newRound',
        round: roundNumber,
        maxRounds: difficultyConfig.maxRounds,
        elements: getAvailableElements(),
        difficulty: currentDifficulty,
        maxSelections: currentCompound.elements.length
    };
    
    // En modo fácil, enviar toda la info
    if (currentDifficulty === 'easy') {
        broadcastData.compound = currentCompound;
    } 
    // En modo intermedio, enviar sin cantidades
    else if (currentDifficulty === 'medium') {
        broadcastData.compound = {
            ...currentCompound,
            elementsUnique: [...new Set(currentCompound.elements)]
        };
    }
    // En modo difícil, solo nombre
    else {
        broadcastData.compound = {
            name: currentCompound.name,
            formula: currentCompound.formula,
            icon: currentCompound.icon,
            points: currentCompound.points
        };
    }
    
    airconsole.broadcast(broadcastData);
    
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
    const formulaEl = document.getElementById('targetFormula');
    const nameEl = document.getElementById('targetName');
    const hintEl = document.getElementById('targetHint');
    
    // En modo difícil, mostrar solo el nombre prominentemente
    if (currentDifficulty === 'hard') {
        formulaEl.textContent = '???';
        formulaEl.classList.add('mystery-formula');
        nameEl.textContent = currentCompound.name;
        nameEl.classList.add('prominent-name');
        hintEl.style.display = 'none';
    } else {
        formulaEl.textContent = currentCompound.formula;
        formulaEl.classList.remove('mystery-formula');
        nameEl.textContent = currentCompound.name;
        nameEl.classList.remove('prominent-name');
        
        if (difficultyConfig.showHint) {
            hintEl.style.display = 'block';
            hintEl.querySelector('span').textContent = currentCompound.hint;
        } else {
            hintEl.style.display = 'none';
        }
    }
}

function updateRequiredElements() {
    const container = document.getElementById('requiredElements');
    const label = document.getElementById('requiredLabel');
    const hintContainer = document.getElementById('requiredHintContainer');
    
    // En modo difícil, ocultar completamente
    if (!difficultyConfig.showRequiredElements) {
        hintContainer.style.display = 'none';
        return;
    }
    
    hintContainer.style.display = 'block';
    
    const counts = {};
    currentCompound.elements.forEach(el => counts[el] = (counts[el] || 0) + 1);
    
    // En modo fácil, mostrar cantidades
    if (difficultyConfig.showQuantities) {
        label.textContent = 'Elementos necesarios:';
        container.innerHTML = Object.entries(counts).map(([el, count]) => `
            <span class="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/20">
                ${count > 1 ? count + '×' : ''} ${el}
            </span>
        `).join('');
    } 
    // En modo intermedio, solo símbolos sin cantidades
    else {
        label.textContent = 'Elementos involucrados:';
        container.innerHTML = Object.keys(counts).map(el => `
            <span class="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/20">
                ${el}
            </span>
        `).join('');
    }
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
    const progress = (gameTimer / difficultyConfig.timerSeconds) * 100;
    ring.style.setProperty('--progress', `${progress}%`);
    
    ring.classList.remove('warning', 'danger');
    if (gameTimer <= 10) ring.classList.add('danger');
    else if (gameTimer <= 20) ring.classList.add('warning');
}

function handleElementSelection(device_id, elementsArray) {
    if (!currentCompound) return;
    if (!playerSelections[device_id]) return;
    if (playerSelections[device_id].hasSelected) return;
    
    playerSelections[device_id].hasSelected = true;
    playerSelections[device_id].elements = elementsArray;
    
    elementsArray.forEach(element => {
        selectedElements.push({ element, player: device_id });
    });
    
    const zone = document.getElementById('mixingZone');
    const content = document.getElementById('mixingContent');
    const container = document.getElementById('selectedElements');
    
    content.classList.add('hidden');
    container.classList.remove('hidden');
    zone.classList.add('active');
    
    elementsArray.forEach((element, index) => {
        const el = elements[element];
        if (!el) return;
        
        const card = document.createElement('div');
        card.className = `element-card element-${el.group}`;
        card.innerHTML = `
            <span class="atomic-number">${el.number}</span>
            <span class="symbol">${el.symbol}</span>
            <span class="name">${el.name}</span>
        `;
        container.appendChild(card);
        
        if (window.anime) {
            window.anime.animate(card, {
                scale: [0, 1.2, 1],
                rotate: [Math.random() * 20 - 10, 0],
                duration: 400,
                delay: index * 100,
                easing: 'easeOutBack'
            });
        }
    });
    
    createBubbles();
    updatePlayersArea(device_id);
    
    airconsole.message(device_id, { 
        action: 'selectionConfirmed', 
        elements: elementsArray 
    });
    
    const totalPlayers = Object.keys(players).length;
    const playersWhoSelected = Object.values(playerSelections).filter(p => p.hasSelected).length;
    
    updateStatusIndicator(playersWhoSelected, totalPlayers);
    
    if (playersWhoSelected >= totalPlayers) {
        clearInterval(timerInterval);
        zone.classList.add('reacting');
        
        setTimeout(() => {
            checkCompound();
        }, 1000);
    }
    
    broadcastGameState();
}

function updateStatusIndicator(selected, total) {
    const indicator = document.getElementById('statusIndicator');
    if (!indicator) return;
    
    if (selected >= total) {
        indicator.className = 'status-indicator ready inline-flex';
        indicator.innerHTML = `
            <iconify-icon icon="mdi:flask-round-bottom"></iconify-icon>
            <span>¡Mezclando elementos!</span>
        `;
    } else {
        indicator.className = 'status-indicator waiting inline-flex';
        indicator.innerHTML = `
            <iconify-icon icon="mdi:timer-sand" class="animate-pulse"></iconify-icon>
            <span>${selected}/${total} científicos listos</span>
        `;
    }
}

function checkCompound() {
    const selected = selectedElements.map(e => e.element).sort();
    const required = [...currentCompound.elements].sort();
    
    const isCorrect = selected.length === required.length && 
                     selected.every((el, i) => el === required[i]);
    
    showResult(isCorrect);
    
    if (isCorrect) {
        const participants = [...new Set(selectedElements.map(e => e.player))];
        const basePoints = currentCompound.points;
        const timeBonus = Math.floor(gameTimer * 2);
        const difficultyBonus = Math.floor((basePoints + timeBonus) * (difficultyConfig.pointsMultiplier - 1));
        const totalPoints = basePoints + timeBonus + difficultyBonus;
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
        timeBonus: isCorrect ? Math.floor(gameTimer * 2) : 0,
        difficultyMultiplier: difficultyConfig.pointsMultiplier
    });
    
    setTimeout(nextRound, 3500);
}

function showResult(isCorrect) {
    const overlay = document.getElementById('resultOverlay');
    const content = document.getElementById('resultContent');
    
    if (isCorrect) {
        playSuccessSound();
        
        const basePoints = currentCompound.points;
        const timeBonus = Math.floor(gameTimer * 2);
        const difficultyBonus = Math.floor((basePoints + timeBonus) * (difficultyConfig.pointsMultiplier - 1));
        
        content.innerHTML = `
            <div class="success-container">
                <div class="success-icon-wrapper">
                    <iconify-icon icon="mdi:check-circle" class="result-icon success-glow" style="color: var(--color-success);"></iconify-icon>
                </div>
                <div id="successConfetti" class="confetti-burst-container"></div>
            </div>
            <h2 class="text-3xl sm:text-4xl font-black mb-4" style="color: var(--color-success);">¡Síntesis Exitosa!</h2>
            <div class="compound-result bg-gradient-to-r from-emerald-500 to-teal-500 text-white inline-block mb-4">
                <iconify-icon icon="${currentCompound.icon}" class="mr-2 sm:mr-3"></iconify-icon>
                ${currentCompound.formula}
            </div>
            <p class="text-xl sm:text-2xl" style="color: var(--color-text);">${currentCompound.name}</p>
            <div class="points-display mt-4">
                <iconify-icon icon="mdi:star" class="mr-2 star-spin"></iconify-icon>
                <span class="points-value">+${basePoints}</span>
                <span class="points-label">pts</span>
                ${timeBonus > 0 ? `<span class="bonus-points">+${timeBonus} tiempo</span>` : ''}
                ${difficultyBonus > 0 ? `<span class="bonus-points difficulty-bonus">+${difficultyBonus} ${difficultyConfig.name}</span>` : ''}
            </div>
        `;
        
        createConfetti();
        createSuccessParticles();
        
    } else {
        playErrorSound();
        
        content.innerHTML = `
            <div class="error-container shake-screen">
                <div class="error-icon-wrapper">
                    <iconify-icon icon="mdi:close-circle" class="result-icon error-pulse" style="color: var(--color-danger);"></iconify-icon>
                </div>
                <div id="errorParticles" class="error-particles-container"></div>
            </div>
            <h2 class="text-3xl sm:text-4xl font-black mb-4" style="color: var(--color-danger);">Reacción Fallida</h2>
            <div class="compound-result bg-gradient-to-r from-red-500 to-orange-500 text-white inline-block mb-4">
                <iconify-icon icon="mdi:flask-empty-off" class="mr-2 sm:mr-3"></iconify-icon>
                ???
            </div>
            <p class="text-lg sm:text-xl mt-4" style="color: var(--color-text-light);">La combinación no fue correcta</p>
            <p class="text-base sm:text-lg mt-2" style="color: var(--color-text-light); opacity: 0.7;">
                Se necesitaba: ${currentCompound.formula} (${currentCompound.elements.join(' + ')})
            </p>
        `;
        
        createErrorParticles();
    }
    
    overlay.classList.add('active');
    
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
        
        if (isCorrect) {
            window.anime.animate('.star-spin', {
                rotate: [0, 360],
                duration: 1000,
                easing: 'easeOutCubic'
            });
        }
    }
    
    setTimeout(() => {
        overlay.classList.remove('active');
    }, 3000);
}

// ============================================
// AUDIO EFFECTS
// ============================================

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

function playSuccessSound() {
    try {
        const ctx = getAudioContext();
        const notes = [523.25, 659.25, 783.99, 1046.50];
        
        notes.forEach((freq, i) => {
            setTimeout(() => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
                
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.3);
            }, i * 100);
        });
    } catch (e) {
        console.log('Audio not available');
    }
}

function playErrorSound() {
    try {
        const ctx = getAudioContext();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
        
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            
            osc2.type = 'square';
            osc2.frequency.setValueAtTime(150, ctx.currentTime);
            gain2.gain.setValueAtTime(0.08, ctx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            
            osc2.start(ctx.currentTime);
            osc2.stop(ctx.currentTime + 0.2);
        }, 150);
    } catch (e) {
        console.log('Audio not available');
    }
}

function createSuccessParticles() {
    const container = document.getElementById('successConfetti');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '<iconify-icon icon="mdi:star-four-points" style="color: #fbbf24;"></iconify-icon>';
        particle.style.position = 'absolute';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.fontSize = (12 + Math.random() * 16) + 'px';
        container.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 20;
        const velocity = 80 + Math.random() * 80;
        
        if (window.anime) {
            window.anime.animate(particle, {
                translateX: [0, Math.cos(angle) * velocity],
                translateY: [0, Math.sin(angle) * velocity],
                rotate: [0, Math.random() * 360],
                scale: [1, 0],
                opacity: [1, 0],
                duration: 1000 + Math.random() * 500,
                easing: 'easeOutCubic',
                complete: () => particle.remove()
            });
        }
    }
}

function createErrorParticles() {
    const container = document.getElementById('errorParticles');
    if (!container) return;
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '<iconify-icon icon="mdi:close-thick" style="color: #ef4444;"></iconify-icon>';
        particle.style.position = 'absolute';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.fontSize = (14 + Math.random() * 12) + 'px';
        container.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / 15;
        const velocity = 60 + Math.random() * 60;
        
        if (window.anime) {
            window.anime.animate(particle, {
                translateX: [0, Math.cos(angle) * velocity],
                translateY: [0, Math.sin(angle) * velocity],
                rotate: [0, Math.random() * 180 - 90],
                scale: [1, 0],
                opacity: [1, 0],
                duration: 800 + Math.random() * 400,
                easing: 'easeOutCubic',
                complete: () => particle.remove()
            });
        }
    }
}

function updatePlayersArea(activePlayer = null) {
    const area = document.getElementById('playersArea');
    if (!area) return;
    
    area.innerHTML = Object.values(players).map(player => {
        const hasSelected = playerSelections[player.id]?.hasSelected || false;
        const selectedEls = playerSelections[player.id]?.elements || [];
        
        return `
            <div class="player-card ${hasSelected ? 'ready' : 'waiting'}" style="--player-color: ${player.color};">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="player-avatar" style="background: ${player.color};">
                        <iconify-icon icon="${player.icon}" style="color: white;"></iconify-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold truncate text-sm sm:text-base">${player.name}</p>
                        <p class="text-xs sm:text-sm" style="color: ${hasSelected ? 'var(--color-success)' : 'var(--color-text-light)'};">
                            ${hasSelected 
                                ? `<iconify-icon icon="mdi:check-circle" style="color: var(--color-success);"></iconify-icon> ${selectedEls.length > 0 ? selectedEls.join(', ') : 'Listo'}` 
                                : '<iconify-icon icon="mdi:timer-sand" class="animate-pulse"></iconify-icon> Seleccionando...'}
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
        players: sorted,
        difficulty: currentDifficulty
    });
}

function resetGame() {
    Object.values(players).forEach(p => p.score = 0);
    usedCompounds = [];
    roundNumber = 0;
    currentCompound = null;
    playerSelections = {};
    
    // Notificar a todos los controllers que vuelvan a la pantalla de espera/dificultad
    airconsole.broadcast({
        action: 'gameReset',
        difficulty: currentDifficulty,
        difficultyConfig: difficultyConfig
    });
    
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
