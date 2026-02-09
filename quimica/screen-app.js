// ============================================
// LABORATORIO QUÍMICO - SCREEN APP
// Sistema de Equipos y Modo Individual
// ============================================

// Cargar estilos
const styleLink = document.createElement('link');
styleLink.rel = 'stylesheet';
styleLink.href = 'screen-styles.css';
document.head.appendChild(styleLink);

// ============================================
// CONFIGURACIÓN DE MODOS DE JUEGO
// ============================================

const GAME_MODES = {
    teams: {
        id: 'teams',
        name: 'Equipos',
        icon: 'mdi:account-group',
        color: '#3b82f6',
        description: '2 equipos compiten entre sí',
        minPlayers: 2,
        maxPlayers: 40
    },
    individual: {
        id: 'individual',
        name: 'Individual',
        icon: 'mdi:account',
        color: '#8b5cf6',
        description: 'Todos contra todos',
        minPlayers: 1,
        maxPlayers: 20
    }
};

let currentGameMode = 'teams'; // 'teams' o 'individual'

// ============================================
// CONFIGURACIÓN DE EQUIPOS
// ============================================

const TEAM_CONFIG = {
    team1: {
        name: 'Equipo Azul',
        color: '#3b82f6',
        icon: 'mdi:flask',
        bgColor: 'rgba(59, 130, 246, 0.15)'
    },
    team2: {
        name: 'Equipo Naranja', 
        color: '#f59e0b',
        icon: 'mdi:atom',
        bgColor: 'rgba(245, 158, 11, 0.15)'
    }
};

// Colores para modo individual (32+ jugadores)
const INDIVIDUAL_COLORS = [
    // Primarios vibrantes
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6366f1',
    // Secundarios
    '#14b8a6', '#eab308', '#a855f7', '#22c55e', '#0ea5e9',
    '#d946ef', '#f43f5e', '#64748b', '#78716c', '#059669',
    // Adicionales para 32+ jugadores
    '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#c026d3',
    '#ea580c', '#4f46e5', '#16a34a', '#dc2626', '#0284c7',
    '#9333ea', '#e11d48', '#0d9488', '#ca8a04', '#7e22ce',
    '#be123c', '#0369a1', '#15803d', '#b91c1c', '#1d4ed8'
];

const INDIVIDUAL_ICONS = [
    'mdi:flask', 'mdi:atom', 'mdi:molecule', 'mdi:test-tube',
    'mdi:beaker', 'mdi:flask-round-bottom', 'mdi:flask-outline',
    'mdi:atom-variant', 'mdi:chemical-weapon', 'mdi:bacteria',
    // Adicionales para más variedad
    'mdi:microscope', 'mdi:dna', 'mdi:virus', 'mdi:biohazard',
    'mdi:radioactive', 'mdi:magnet', 'mdi:lightning-bolt', 'mdi:fire',
    'mdi:water', 'mdi:leaf', 'mdi:diamond-stone', 'mdi:star-four-points'
];

const MAX_PLAYERS = 40; // Máximo de jugadores permitidos

// ============================================
// CONFIGURACIÓN DE DIFICULTADES
// ============================================

const DIFFICULTY_CONFIG = {
    easy: {
        name: 'Fácil',
        icon: 'mdi:flask-outline',
        color: '#10b981',
        description: 'Fórmula y elementos visibles',
        showFormula: true,          // Muestra la fórmula (H₂O)
        showRequiredElements: true, // Muestra qué elementos necesitas
        showHint: true,             // Muestra pista
        timerSeconds: 60,
        pointsMultiplier: 1,
        availableElements: ['H', 'O', 'C', 'N', 'Na', 'Cl', 'S', 'Ca'],
        defaultRounds: 6
    },
    medium: {
        name: 'Intermedio',
        icon: 'mdi:flask',
        color: '#f59e0b',
        description: 'Solo nombre, con pista',
        showFormula: false,         // NO muestra la fórmula (???)
        showRequiredElements: false,// NO muestra elementos
        showHint: true,             // Muestra pista
        timerSeconds: 50,
        pointsMultiplier: 1.5,
        availableElements: ['H', 'O', 'C', 'N', 'Na', 'Cl', 'S', 'Ca', 'K', 'Mg', 'Fe', 'P'],
        defaultRounds: 8
    },
    hard: {
        name: 'Difícil',
        icon: 'mdi:flask-round-bottom',
        color: '#ef4444',
        description: 'Solo nombre, sin pistas',
        showFormula: false,         // NO muestra la fórmula
        showRequiredElements: false,
        showHint: false,            // SIN pistas
        timerSeconds: 40,
        pointsMultiplier: 2.5,
        availableElements: ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Fe', 'Cu', 'Zn', 'Br', 'Kr', 'Ag', 'I', 'Au', 'Hg', 'Pb'],
        defaultRounds: 10
    }
};

// Configuración personalizada del admin
let customRounds = null; // null = usar defaultRounds de la dificultad

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

// Exponer elementos para la animación del laboratorio
window.labElements = elements;

// ============================================
// COMPUESTOS POR DIFICULTAD
// ============================================

// Compuestos FÁCIL: Solo usan H, O, C, N, Na, Cl
const compoundsEasy = [
    { formula: 'H₂O', name: 'Agua', elements: ['H', 'H', 'O'], points: 80, hint: 'Esencial para la vida', icon: 'mdi:water' },
    { formula: 'NaCl', name: 'Sal de mesa', elements: ['Na', 'Cl'], points: 80, hint: 'Sazona tu comida', icon: 'mdi:shaker-outline' },
    { formula: 'CO₂', name: 'Dióxido de carbono', elements: ['C', 'O', 'O'], points: 100, hint: 'Lo exhalas al respirar', icon: 'mdi:molecule-co2' },
    { formula: 'NH₃', name: 'Amoníaco', elements: ['N', 'H', 'H', 'H'], points: 120, hint: 'Olor fuerte característico', icon: 'mdi:spray' },
    { formula: 'CH₄', name: 'Metano', elements: ['C', 'H', 'H', 'H', 'H'], points: 150, hint: 'Gas natural', icon: 'mdi:gas-burner' },
    { formula: 'HCl', name: 'Ácido clorhídrico', elements: ['H', 'Cl'], points: 80, hint: 'Ácido del estómago', icon: 'mdi:flask' },
    { formula: 'N₂O', name: 'Óxido nitroso', elements: ['N', 'N', 'O'], points: 100, hint: 'Gas de la risa', icon: 'mdi:emoticon-happy' },
    { formula: 'CO', name: 'Monóxido de carbono', elements: ['C', 'O'], points: 80, hint: 'Gas tóxico', icon: 'mdi:skull' }
];

// Compuestos INTERMEDIO: Usan los 12 elementos básicos
const compoundsMedium = [
    { formula: 'H₂O', name: 'Agua', elements: ['H', 'H', 'O'], points: 100, hint: 'Esencial para la vida', icon: 'mdi:water' },
    { formula: 'NaCl', name: 'Sal de mesa', elements: ['Na', 'Cl'], points: 100, hint: 'Sazona tu comida', icon: 'mdi:shaker-outline' },
    { formula: 'CO₂', name: 'Dióxido de carbono', elements: ['C', 'O', 'O'], points: 150, hint: 'Lo exhalas al respirar', icon: 'mdi:molecule-co2' },
    { formula: 'NH₃', name: 'Amoníaco', elements: ['N', 'H', 'H', 'H'], points: 150, hint: 'Olor fuerte característico', icon: 'mdi:spray' },
    { formula: 'CH₄', name: 'Metano', elements: ['C', 'H', 'H', 'H', 'H'], points: 200, hint: 'Gas natural', icon: 'mdi:gas-burner' },
    { formula: 'H₂O₂', name: 'Agua oxigenada', elements: ['H', 'H', 'O', 'O'], points: 150, hint: 'Desinfectante común', icon: 'mdi:bottle-tonic-plus' },
    { formula: 'KCl', name: 'Cloruro de potasio', elements: ['K', 'Cl'], points: 100, hint: 'Sustituto de sal', icon: 'mdi:shaker' },
    { formula: 'MgO', name: 'Óxido de magnesio', elements: ['Mg', 'O'], points: 120, hint: 'Antiácido estomacal', icon: 'mdi:pill' },
    { formula: 'CaO', name: 'Cal viva', elements: ['Ca', 'O'], points: 120, hint: 'Usado en construcción', icon: 'mdi:wall' },
    { formula: 'HCl', name: 'Ácido clorhídrico', elements: ['H', 'Cl'], points: 100, hint: 'Ácido del estómago', icon: 'mdi:flask' },
    { formula: 'H₂S', name: 'Sulfuro de hidrógeno', elements: ['H', 'H', 'S'], points: 150, hint: 'Olor a huevo podrido', icon: 'mdi:egg-off' },
    { formula: 'SO₂', name: 'Dióxido de azufre', elements: ['S', 'O', 'O'], points: 150, hint: 'Conservante de vinos', icon: 'mdi:glass-wine' },
    { formula: 'CaCO₃', name: 'Carbonato de calcio', elements: ['Ca', 'C', 'O', 'O', 'O'], points: 250, hint: 'En conchas y huesos', icon: 'mdi:bone' },
    { formula: 'Fe₂O₃', name: 'Óxido de hierro', elements: ['Fe', 'Fe', 'O', 'O', 'O'], points: 250, hint: 'Herrumbre/Óxido', icon: 'mdi:iron' },
    { formula: 'NaOH', name: 'Hidróxido de sodio', elements: ['Na', 'O', 'H'], points: 180, hint: 'Sosa cáustica', icon: 'mdi:flask-outline' }
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
let playerSelections = {}; // { device_id: { hasSelected, elements, isCorrect } }
let playerResults = {};    // Resultados individuales de cada jugador
let gameTimer = 45;
let timerInterval = null;
let roundNumber = 0;
let usedCompounds = [];
let currentDifficulty = 'easy';
let difficultyConfig = DIFFICULTY_CONFIG.easy;

// Estado de equipos
let teams = {
    team1: { score: 0, players: [] },
    team2: { score: 0, players: [] }
};

// ============================================
// SISTEMA DE AUDIO
// ============================================

let bgMusic = null;
let isMusicPlaying = false;

function initBackgroundMusic() {
    // Crear elemento de audio para música de fondo
    bgMusic = new Audio();
    bgMusic.loop = true;
    bgMusic.volume = 0.3;
    // Usar una URL de música libre de derechos o un data URI
    // Por ahora usamos un placeholder - se puede cambiar por una URL real
    bgMusic.src = 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3';
    bgMusic.preload = 'auto';
}

function playBackgroundMusic() {
    if (!bgMusic) initBackgroundMusic();
    if (!isMusicPlaying && bgMusic) {
        bgMusic.play().catch(e => console.log('Audio autoplay blocked:', e));
        isMusicPlaying = true;
    }
}

function stopBackgroundMusic() {
    if (bgMusic && isMusicPlaying) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        isMusicPlaying = false;
    }
}

function toggleBackgroundMusic() {
    if (isMusicPlaying) {
        stopBackgroundMusic();
    } else {
        playBackgroundMusic();
    }
    return isMusicPlaying;
}

// Función para obtener el número de rondas (personalizado o por defecto)
function getMaxRounds() {
    return customRounds || difficultyConfig.defaultRounds;
}

// Función para establecer rondas personalizadas
function setCustomRounds(rounds) {
    customRounds = rounds;
    console.log('🎮 Rondas personalizadas:', rounds);
    
    // Actualizar UI en la pantalla de intro si está visible
    const roundsInfo = document.getElementById('roundsInfo');
    if (roundsInfo) {
        roundsInfo.textContent = `${rounds} rondas`;
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

function init() {
    renderIntroScreen();
    initBackgroundMusic();
    
    airconsole = new AirConsole({ max_players: MAX_PLAYERS });
    
    airconsole.onReady = function() {
        console.log('🧪 Laboratorio Químico listo!');
        console.log(`👥 Máximo de jugadores: ${MAX_PLAYERS}`);
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
                if (data.customRounds) {
                    setCustomRounds(data.customRounds);
                }
                if (data.gameMode) {
                    setGameMode(data.gameMode);
                }
                startGame();
                break;
            case 'setGameMode':
                // Solo el admin puede cambiar el modo de juego
                if (players[from]?.isAdmin && data.mode) {
                    setGameMode(data.mode);
                }
                break;
            case 'setRounds':
                // Solo el admin puede cambiar las rondas
                if (players[from]?.isAdmin && data.rounds) {
                    setCustomRounds(data.rounds);
                    // Notificar a todos del cambio
                    airconsole.broadcast({
                        action: 'roundsChanged',
                        rounds: data.rounds
                    });
                }
                break;
            case 'setDifficulty':
                // Solo el admin puede cambiar la dificultad
                if (players[from]?.isAdmin && data.difficulty) {
                    setDifficulty(data.difficulty);
                    updateDifficultyDisplay(data.difficulty);
                    broadcastGameState();
                }
                break;
            case 'adminNextRound':
                // Solo el admin puede avanzar a la siguiente ronda
                if (players[from]?.isAdmin) {
                    const overlay = document.getElementById('resultOverlay');
                    if (overlay) overlay.classList.remove('active');
                    nextRound();
                }
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
        const wasAdmin = players[device_id].isAdmin;
        
        // Si el admin sale, terminar el juego para todos
        if (wasAdmin) {
            if (timerInterval) clearInterval(timerInterval);
            resetGame();
            return;
        }
        
        // Si no es admin, solo remover al jugador
        delete players[device_id];
        
        // Limpiar selección del jugador que salió
        if (playerSelections[device_id]) {
            delete playerSelections[device_id];
        }
        
        // Remover elementos seleccionados por este jugador
        selectedElements = selectedElements.filter(e => e.player !== device_id);
        
        // Si no quedan suficientes jugadores (mínimo 2), terminar el juego
        if (Object.keys(players).length < 2) {
            if (timerInterval) clearInterval(timerInterval);
            resetGame();
            return;
        }
        
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
        <div class="screen active intro-screen relative" id="introScreen">
            <div class="lab-bg">
                <div class="blob-green"></div>
            </div>
            <div id="floatingMolecules" class="absolute inset-0 pointer-events-none overflow-hidden"></div>
            
            <div class="relative z-10 text-center w-full intro-content">
                <img src="../LogoSteamRD-Color.webp" alt="STEAM RD" class="intro-logo mx-auto float-element" style="filter: drop-shadow(0 4px 12px rgba(0,0,0,0.1));">
                
                <h1 class="intro-title">LABORATORIO</h1>
                <h2 class="subtitle">QUÍMICO</h2>
                
                <!-- Selector de Modo de Juego -->
                <div class="game-mode-selector" id="gameModeSelector">
                    <p class="selector-label" style="color: var(--color-text-light);">
                        <iconify-icon icon="mdi:gamepad-variant"></iconify-icon>
                        Modo de juego:
                    </p>
                    <div class="mode-buttons">
                        <button class="mode-btn active" data-mode="teams" onclick="setGameMode('teams')">
                            <iconify-icon icon="${GAME_MODES.teams.icon}"></iconify-icon>
                            <span>${GAME_MODES.teams.name}</span>
                        </button>
                        <button class="mode-btn" data-mode="individual" onclick="setGameMode('individual')">
                            <iconify-icon icon="${GAME_MODES.individual.icon}"></iconify-icon>
                            <span>${GAME_MODES.individual.name}</span>
                        </button>
                    </div>
                </div>
                
                <div class="formula-demo" id="formulaDemo">
                    <div class="element-card element-nonmetal intro-element">
                        <span class="atomic-number">1</span>
                        <span class="symbol">H</span>
                        <span class="name">Hidrógeno</span>
                    </div>
                    <iconify-icon icon="mdi:plus" class="formula-operator" style="color: var(--color-text-light);"></iconify-icon>
                    <div class="element-card element-nonmetal intro-element">
                        <span class="atomic-number">8</span>
                        <span class="symbol">O</span>
                        <span class="name">Oxígeno</span>
                    </div>
                    <iconify-icon icon="mdi:arrow-right" class="formula-operator" style="color: var(--color-text-light);"></iconify-icon>
                    <div class="compound-result bg-gradient-to-r from-cyan-500 to-blue-500 text-white intro-compound">
                        <iconify-icon icon="mdi:water"></iconify-icon>
                        H₂O
                    </div>
                </div>
                
                <p class="intro-description" style="color: var(--color-text-light);">
                    <iconify-icon icon="mdi:flask" style="color: var(--color-accent);"></iconify-icon>
                    Cada jugador sintetiza individualmente - ¡El equipo con más aciertos gana!
                </p>
                
                <!-- Selector de Dificultad -->
                <div class="difficulty-selector-compact" id="difficultySelector">
                    <p class="difficulty-label" style="color: var(--color-text-light);">
                        <iconify-icon icon="mdi:speedometer"></iconify-icon>
                        Dificultad:
                    </p>
                    <div class="difficulty-display" id="difficultyDisplay">
                        <iconify-icon icon="${DIFFICULTY_CONFIG.easy.icon}" style="color: ${DIFFICULTY_CONFIG.easy.color};"></iconify-icon>
                        <span style="color: ${DIFFICULTY_CONFIG.easy.color};">${DIFFICULTY_CONFIG.easy.name}</span>
                    </div>
                </div>
                
                <p class="waiting-text waiting-dots" style="color: var(--color-primary);">Esperando científicos</p>
                
                <div class="player-slots-row" id="playerSlots">
                    <!-- Se actualiza dinámicamente con updatePlayerSlots() -->
                </div>
                
                <div class="intro-footer" style="color: var(--color-text-light);">
                    <div class="footer-item">
                        <iconify-icon icon="mdi:account-group" style="color: var(--color-primary);"></iconify-icon>
                        <span id="playersRangeInfo">2-${MAX_PLAYERS} jugadores</span>
                    </div>
                    <div class="footer-item">
                        <iconify-icon icon="mdi:timer" style="color: var(--color-warning);"></iconify-icon>
                        <span id="roundsInfo">${DIFFICULTY_CONFIG.easy.defaultRounds} rondas</span>
                    </div>
                    <div class="footer-item" id="modeFooterItem">
                        <iconify-icon icon="mdi:trophy" style="color: var(--color-warning);"></iconify-icon>
                        <span>Equipos VS</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Inicializar slots según modo actual
    updatePlayerSlots();
    
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
        roundsInfo.textContent = `${customRounds || config.defaultRounds} rondas`;
    }
}

function renderPlayingScreen() {
    const app = document.getElementById('app');
    const maxRounds = getMaxRounds();
    
    app.innerHTML = `
        <div class="screen active playing-screen relative" id="playingScreen">
            <div class="lab-bg">
                <div class="blob-green"></div>
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
                
                <div class="flex items-center gap-3">
                    <button class="music-toggle-btn" id="musicToggle" onclick="toggleBackgroundMusic(); this.querySelector('iconify-icon').setAttribute('icon', isMusicPlaying ? 'mdi:volume-high' : 'mdi:volume-off');">
                        <iconify-icon icon="mdi:volume-high"></iconify-icon>
                    </button>
                    <div class="timer-ring" id="timerRing">
                        <span class="time" id="timerDisplay">${difficultyConfig.timerSeconds}</span>
                    </div>
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
                        
                        <!-- Lab Animation Container (siempre visible, animación inicia al responder) -->
                        <div class="lab-animation-container" id="labAnimationZone">
                            <div class="schema-anim">
                                <div id="canvas_line_back"></div>
                                <div id="canvas_line1">
                                    <svg id="svg_line" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                                         x="0px" y="0px" width="500px" height="400px" viewBox="0 0 500 400" 
                                         enable-background="new 0 0 500 400" xml:space="preserve">
                                        <g id="Layer_1">
                                            <path id="line1" fill="none" stroke="#AB3D8B" stroke-width="3" stroke-miterlimit="10" 
                                                  d="M80.193,227.11v-48.02c0-2.209,1.869-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v24.54h0.068c0,3.927,3.184,7.111,7.111,7.111s7.111-3.184,7.111-7.111l-0.097-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111l-0.029-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.442c0-3.928,3.184-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.141,38.442c0,3.927,3.184,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.165v-1.125c0-2.209,1.87-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v112.188">
                                                <animate id="a1" attributeName="stroke-dashoffset" from="0" to="0" dur="1.2s" fill="freeze" calcMode="paced"/>
                                            </path>
                                            <path id="line2" fill="none" stroke="#000000" stroke-width="3" stroke-miterlimit="10" 
                                                  d="M80.193,227.11v-48.02c0-2.209,1.869-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v24.54h0.068c0,3.927,3.184,7.111,7.111,7.111s7.111-3.184,7.111-7.111l-0.097-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111l-0.029-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.442c0-3.928,3.184-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.141,38.442c0,3.927,3.184,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.165v-1.125c0-2.209,1.87-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v112.188">
                                                <animate id="a2" begin="a3.end" attributeName="stroke-dashoffset" from="0" to="0" dur="2.4s" fill="freeze" calcMode="paced"/>
                                            </path>
                                            <path id="line3" fill="none" stroke="#0595AE" stroke-width="3" stroke-miterlimit="10" 
                                                  d="M259.73,317.604L300.209,277.125L300.304,277.061L314.467,277.125L315.262,277.125L331.936,293.8">
                                                <animate id="a3" begin="1.5s" attributeName="stroke-dashoffset" from="0" to="0" dur="0.9s" fill="freeze" calcMode="paced"/>
                                            </path>
                                            <path id="line4" fill="none" stroke="#000000" stroke-width="3" stroke-miterlimit="10" 
                                                  d="M259.73,317.604L300.209,277.125L300.304,277.061L314.467,277.125L315.262,277.125L331.936,293.8">
                                                <animate id="a4" begin="a2.end" attributeName="stroke-dashoffset" from="0" to="0" dur="0.9s" fill="freeze" calcMode="paced"/>
                                            </path>
                                            <path id="line5" fill="none" stroke="#EB8225" stroke-width="3" stroke-miterlimit="10" 
                                                  d="M364.125,266.366L364.125,46.667L371.729,39.062L463,54L463,66.667">
                                                <animate id="a5" begin="a3.end" attributeName="stroke-dashoffset" from="0" to="0" dur="1.5s" fill="freeze" calcMode="paced"/>
                                            </path>
                                            <path id="line6" fill="none" stroke="#000000" stroke-width="3" stroke-miterlimit="10" 
                                                  d="M364.125,266.366L364.125,46.667L371.729,39.062L463,54L463,66.667">
                                                <animate id="a6" begin="a4.end" attributeName="stroke-dashoffset" from="0" to="0" dur="1.5s" fill="freeze" calcMode="paced"/>
                                            </path>
                                        </g>
                                    </svg>
                                </div>
                                <div id="canvas_container"></div>
                            </div>
                        </div>
                        
                        <!-- Contenedor de resultados inline (se muestra después de la animación) -->
                        <div class="inline-results-container hidden" id="inlineResults">
                            <div class="inline-results-content" id="inlineResultsContent"></div>
                        </div>
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

function renderEndScreen(winningTeam, sortedPlayers) {
    const app = document.getElementById('app');
    
    const team1Config = TEAM_CONFIG.team1;
    const team2Config = TEAM_CONFIG.team2;
    
    let winnerHTML = '';
    if (winningTeam === 'team1') {
        winnerHTML = `
            <div class="winner-team-card" style="border-color: ${team1Config.color}; background: ${team1Config.bgColor};">
                <iconify-icon icon="mdi:trophy" class="text-5xl" style="color: ${team1Config.color};"></iconify-icon>
                <h2 style="color: ${team1Config.color};">¡${team1Config.name} Gana!</h2>
                <p class="team-final-score">${teams.team1.score} pts</p>
            </div>
        `;
    } else if (winningTeam === 'team2') {
        winnerHTML = `
            <div class="winner-team-card" style="border-color: ${team2Config.color}; background: ${team2Config.bgColor};">
                <iconify-icon icon="mdi:trophy" class="text-5xl" style="color: ${team2Config.color};"></iconify-icon>
                <h2 style="color: ${team2Config.color};">¡${team2Config.name} Gana!</h2>
                <p class="team-final-score">${teams.team2.score} pts</p>
            </div>
        `;
    } else {
        winnerHTML = `
            <div class="winner-team-card" style="border-color: #9ca3af; background: rgba(156, 163, 175, 0.15);">
                <iconify-icon icon="mdi:scale-balance" class="text-5xl" style="color: #9ca3af;"></iconify-icon>
                <h2 style="color: #9ca3af;">¡Empate!</h2>
                <p class="team-final-score">${teams.team1.score} pts</p>
            </div>
        `;
    }
    
    app.innerHTML = `
        <div class="screen active flex-col items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen relative" id="endScreen">
            <div class="lab-bg"></div>
            <div id="confettiContainer" class="fixed inset-0 pointer-events-none z-50"></div>
            
            <div class="relative z-10 text-center max-w-4xl w-full px-2">
                <h1 class="text-2xl sm:text-4xl lg:text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    ¡Experimento Completado!
                </h1>
                
                <div class="difficulty-completed mb-4" style="color: ${difficultyConfig.color};">
                    <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                    Dificultad: ${difficultyConfig.name} (x${difficultyConfig.pointsMultiplier})
                </div>
                
                ${winnerHTML}
                
                <!-- Comparación de equipos -->
                <div class="teams-final-comparison">
                    <div class="team-final-card" style="border-color: ${team1Config.color}; background: ${team1Config.bgColor};">
                        <iconify-icon icon="${team1Config.icon}" style="color: ${team1Config.color}; font-size: 2rem;"></iconify-icon>
                        <h3 style="color: ${team1Config.color};">${team1Config.name}</h3>
                        <p class="team-score">${teams.team1.score} pts</p>
                        <p class="team-players-count">${teams.team1.players.length} jugadores</p>
                    </div>
                    
                    <div class="vs-final">VS</div>
                    
                    <div class="team-final-card" style="border-color: ${team2Config.color}; background: ${team2Config.bgColor};">
                        <iconify-icon icon="${team2Config.icon}" style="color: ${team2Config.color}; font-size: 2rem;"></iconify-icon>
                        <h3 style="color: ${team2Config.color};">${team2Config.name}</h3>
                        <p class="team-score">${teams.team2.score} pts</p>
                        <p class="team-players-count">${teams.team2.players.length} jugadores</p>
                    </div>
                </div>
                
                <!-- Top jugadores -->
                <h3 class="text-lg font-bold mt-6 mb-3" style="color: var(--color-text);">
                    <iconify-icon icon="mdi:podium"></iconify-icon> Mejores Científicos
                </h3>
                <div class="space-y-2 sm:space-y-3 mb-4" id="leaderboard">
                    ${sortedPlayers.slice(0, 5).map((player, i) => `
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
                
                <p style="color: var(--color-text-light);" class="text-xs sm:text-sm">
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
    if (Object.keys(players).length >= MAX_PLAYERS) {
        airconsole.message(device_id, { action: 'gameFull' });
        return;
    }
    
    const playerNum = Object.keys(players).length;
    
    let playerColor, playerIcon, team = null;
    
    if (currentGameMode === 'teams') {
        // Modo equipos: asignar equipo alternando (balanceado)
        team = (teams.team1.players.length <= teams.team2.players.length) ? 'team1' : 'team2';
        const teamConfig = TEAM_CONFIG[team];
        playerColor = teamConfig.color;
        playerIcon = teamConfig.icon;
        teams[team].players.push(device_id);
    } else {
        // Modo individual: asignar color e icono único
        playerColor = INDIVIDUAL_COLORS[playerNum % INDIVIDUAL_COLORS.length];
        playerIcon = INDIVIDUAL_ICONS[playerNum % INDIVIDUAL_ICONS.length];
    }
    
    players[device_id] = {
        id: device_id,
        name: airconsole.getNickname(device_id) || `Científico ${playerNum + 1}`,
        color: playerColor,
        icon: playerIcon,
        score: 0,
        team: team,
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
        difficultyConfig: difficultyConfig,
        gameMode: currentGameMode,
        team: team,
        teamConfig: team ? TEAM_CONFIG[team] : null
    });
    
    updatePlayerSlots();
    if (currentGameMode === 'teams') updateTeamDisplay();
    broadcastGameState();
    
    const modeText = currentGameMode === 'teams' ? TEAM_CONFIG[team].name : 'Modo Individual';
    console.log(`🧪 Jugador ${players[device_id].name} se unió (${modeText})`);
}

// Validar si los elementos seleccionados son correctos
// Validación por orden exacto - el jugador debe seleccionar los elementos en el orden correcto
function validateElementSelection(playerElements, requiredElements) {
    if (playerElements.length !== requiredElements.length) return false;
    
    // Comparar elemento por elemento en orden
    for (let i = 0; i < requiredElements.length; i++) {
        if (playerElements[i] !== requiredElements[i]) {
            return false;
        }
    }
    
    return true;
}

function getAvailableElements() {
    if (difficultyConfig.availableElements === 'all') {
        // En modo difícil, devolver TODOS los elementos
        return Object.keys(elements);
    }
    return difficultyConfig.availableElements || Object.keys(elements);
}

function updatePlayerSlots() {
    // Actualizar display de equipos en la pantalla de intro
    const slotsContainer = document.getElementById('playerSlots');
    if (!slotsContainer) return;
    
    if (currentGameMode === 'teams') {
        // Modo equipos: mostrar dos equipos
        const team1Players = teams.team1.players.map(id => players[id]).filter(Boolean);
        const team2Players = teams.team2.players.map(id => players[id]).filter(Boolean);
        
        slotsContainer.innerHTML = `
            <div class="team-slots-container">
                <div class="team-slot" style="border-color: ${TEAM_CONFIG.team1.color}; background: ${TEAM_CONFIG.team1.bgColor};">
                    <div class="team-header">
                        <iconify-icon icon="${TEAM_CONFIG.team1.icon}" style="color: ${TEAM_CONFIG.team1.color};"></iconify-icon>
                        <span style="color: ${TEAM_CONFIG.team1.color};">${TEAM_CONFIG.team1.name}</span>
                        <span class="player-count">${team1Players.length}</span>
                    </div>
                    <div class="team-players">
                        ${team1Players.slice(0, 10).map(p => `
                            <div class="mini-player" style="background: ${TEAM_CONFIG.team1.color};">
                                <iconify-icon icon="mdi:account"></iconify-icon>
                            </div>
                        `).join('')}
                        ${team1Players.length > 10 ? `<span class="more-players">+${team1Players.length - 10}</span>` : ''}
                        ${team1Players.length === 0 ? '<span class="waiting-text">Esperando...</span>' : ''}
                    </div>
                </div>
                
                <div class="vs-badge">VS</div>
                
                <div class="team-slot" style="border-color: ${TEAM_CONFIG.team2.color}; background: ${TEAM_CONFIG.team2.bgColor};">
                    <div class="team-header">
                        <iconify-icon icon="${TEAM_CONFIG.team2.icon}" style="color: ${TEAM_CONFIG.team2.color};"></iconify-icon>
                        <span style="color: ${TEAM_CONFIG.team2.color};">${TEAM_CONFIG.team2.name}</span>
                        <span class="player-count">${team2Players.length}</span>
                    </div>
                    <div class="team-players">
                        ${team2Players.slice(0, 10).map(p => `
                            <div class="mini-player" style="background: ${TEAM_CONFIG.team2.color};">
                                <iconify-icon icon="mdi:account"></iconify-icon>
                            </div>
                        `).join('')}
                        ${team2Players.length > 10 ? `<span class="more-players">+${team2Players.length - 10}</span>` : ''}
                        ${team2Players.length === 0 ? '<span class="waiting-text">Esperando...</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    } else {
        // Modo individual: mostrar lista de jugadores
        const playerList = Object.values(players);
        
        slotsContainer.innerHTML = `
            <div class="individual-slots-container">
                <div class="players-grid">
                    ${playerList.slice(0, 12).map(p => `
                        <div class="individual-player-slot" style="background: ${p.color}20; border-color: ${p.color};">
                            <iconify-icon icon="${p.icon}" style="color: ${p.color};"></iconify-icon>
                            <span class="player-name">${p.name.substring(0, 10)}</span>
                        </div>
                    `).join('')}
                    ${playerList.length > 12 ? `<div class="more-players-badge">+${playerList.length - 12} más</div>` : ''}
                    ${playerList.length === 0 ? '<div class="waiting-slot"><iconify-icon icon="mdi:account-plus"></iconify-icon><span>Esperando jugadores...</span></div>' : ''}
                </div>
                <div class="player-count-badge">
                    <iconify-icon icon="mdi:account-group"></iconify-icon>
                    <span>${playerList.length} jugador${playerList.length !== 1 ? 'es' : ''}</span>
                </div>
            </div>
        `;
    }
}

function updateTeamDisplay() {
    // Actualizar contadores de equipos si existen
    const team1Count = document.getElementById('team1Count');
    const team2Count = document.getElementById('team2Count');
    
    if (team1Count) team1Count.textContent = teams.team1.players.length;
    if (team2Count) team2Count.textContent = teams.team2.players.length;
}

function broadcastGameState() {
    airconsole.broadcast({
        action: 'gameStateUpdate',
        players: players,
        teams: teams,
        gameMode: currentGameMode,
        currentCompound: currentCompound,
        selectedElements: selectedElements,
        round: roundNumber,
        maxRounds: getMaxRounds(),
        difficulty: currentDifficulty,
        difficultyConfig: difficultyConfig
    });
}

// Función para cambiar el modo de juego
function setGameMode(mode) {
    if (GAME_MODES[mode]) {
        currentGameMode = mode;
        
        // Resetear equipos si cambiamos de modo
        teams = {
            team1: { score: 0, players: [] },
            team2: { score: 0, players: [] }
        };
        
        // Reasignar jugadores existentes
        Object.keys(players).forEach((pid, index) => {
            if (mode === 'teams') {
                const team = (index % 2 === 0) ? 'team1' : 'team2';
                players[pid].team = team;
                players[pid].color = TEAM_CONFIG[team].color;
                players[pid].icon = TEAM_CONFIG[team].icon;
                teams[team].players.push(pid);
            } else {
                players[pid].team = null;
                players[pid].color = INDIVIDUAL_COLORS[index % INDIVIDUAL_COLORS.length];
                players[pid].icon = INDIVIDUAL_ICONS[index % INDIVIDUAL_ICONS.length];
            }
        });
        
        updatePlayerSlots();
        updateGameModeDisplay();
        broadcastGameState();
        
        console.log(`🎮 Modo de juego cambiado a: ${GAME_MODES[mode].name}`);
    }
}

function updateGameModeDisplay() {
    const modeConfig = GAME_MODES[currentGameMode];
    
    // Actualizar botones de modo
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === currentGameMode) {
            btn.classList.add('active');
        }
    });
    
    // Actualizar descripción
    const introDesc = document.querySelector('.intro-description');
    if (introDesc) {
        if (currentGameMode === 'teams') {
            introDesc.innerHTML = `
                <iconify-icon icon="mdi:flask" style="color: var(--color-accent);"></iconify-icon>
                Cada jugador sintetiza individualmente - ¡El equipo con más aciertos gana!
            `;
        } else {
            introDesc.innerHTML = `
                <iconify-icon icon="mdi:flask" style="color: var(--color-accent);"></iconify-icon>
                Cada jugador compite por sí mismo - ¡El que más puntos acumule gana!
            `;
        }
    }
    
    // Actualizar footer
    const modeFooterItem = document.getElementById('modeFooterItem');
    if (modeFooterItem) {
        if (currentGameMode === 'teams') {
            modeFooterItem.innerHTML = `
                <iconify-icon icon="mdi:trophy" style="color: var(--color-warning);"></iconify-icon>
                <span>Equipos VS</span>
            `;
        } else {
            modeFooterItem.innerHTML = `
                <iconify-icon icon="mdi:trophy" style="color: var(--color-warning);"></iconify-icon>
                <span>Todos vs Todos</span>
            `;
        }
    }
    
    // Actualizar rango de jugadores
    const playersRangeInfo = document.getElementById('playersRangeInfo');
    if (playersRangeInfo) {
        playersRangeInfo.textContent = `${modeConfig.minPlayers}-${modeConfig.maxPlayers} jugadores`;
    }
}

function startGame() {
    const modeConfig = GAME_MODES[currentGameMode];
    const playerCount = Object.keys(players).length;
    
    // Verificar mínimo de jugadores según modo
    if (playerCount < modeConfig.minPlayers) {
        airconsole.broadcast({
            action: 'gameError',
            message: `Se necesitan al menos ${modeConfig.minPlayers} jugador(es) para ${modeConfig.name}`
        });
        return;
    }
    
    // Iniciar música de fondo
    playBackgroundMusic();
    
    renderPlayingScreen();
    roundNumber = 0;
    usedCompounds = [];
    Object.values(players).forEach(p => p.score = 0);
    
    // Inicializar el laboratorio estático después de renderizar
    setTimeout(() => {
        initStaticLab();
    }, 200);
    
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
    
    if (roundNumber > getMaxRounds()) {
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
        maxRounds: getMaxRounds(),
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
    zone.classList.remove('active', 'reacting', 'success', 'error');
    
    // Ocultar resultados inline
    const inlineResults = document.getElementById('inlineResults');
    if (inlineResults) inlineResults.classList.add('hidden');
    
    // Inicializar el laboratorio estático (sin animación activa)
    initStaticLab();
}

// Inicializar el laboratorio de forma estática (sin animaciones activas)
function initStaticLab() {
    const labAnimationZone = document.getElementById('labAnimationZone');
    if (!labAnimationZone) return;
    
    // Resetear la animación si existe
    if (window.labAnimation) {
        window.labAnimation.reset();
    }
    
    // Inicializar el laboratorio pero pausado
    setTimeout(() => {
        if (window.labAnimation) {
            window.labAnimation.initStatic();
        }
    }, 100);
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
    
    // Guardar selección individual del jugador
    playerSelections[device_id].hasSelected = true;
    playerSelections[device_id].elements = elementsArray;
    
    // Verificar si la respuesta individual es correcta
    // Comparamos contando la cantidad de cada elemento (el orden no importa en química)
    const isCorrect = validateElementSelection(elementsArray, currentCompound.elements);
    
    playerSelections[device_id].isCorrect = isCorrect;
    
    // Actualizar UI para mostrar que el jugador ya respondió
    updatePlayersArea(device_id);
    
    // Confirmar al jugador que su selección fue recibida
    airconsole.message(device_id, { 
        action: 'selectionConfirmed', 
        elements: elementsArray,
        waiting: true // Esperando a los demás
    });
    
    const totalPlayers = Object.keys(players).length;
    const playersWhoSelected = Object.values(playerSelections).filter(p => p && p.hasSelected).length;
    
    updateStatusIndicator(playersWhoSelected, totalPlayers);
    
    // Cuando todos han respondido, mostrar resultados
    if (playersWhoSelected >= totalPlayers) {
        clearInterval(timerInterval);
        
        const zone = document.getElementById('mixingZone');
        if (zone) zone.classList.add('reacting');
        
        setTimeout(() => {
            checkAllPlayersResults();
        }, 500);
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
            <span>¡Verificando resultados!</span>
        `;
    } else {
        indicator.className = 'status-indicator waiting inline-flex';
        indicator.innerHTML = `
            <iconify-icon icon="mdi:timer-sand" class="animate-pulse"></iconify-icon>
            <span>${selected}/${total} científicos listos</span>
        `;
    }
}

// Verificar resultados de todos los jugadores
function checkAllPlayersResults() {
    playerResults = {};
    
    const basePoints = currentCompound.points;
    const timeBonus = Math.floor(gameTimer * 2);
    const difficultyBonus = Math.floor((basePoints + timeBonus) * (difficultyConfig.pointsMultiplier - 1));
    const totalPoints = basePoints + timeBonus + difficultyBonus;
    
    let team1Correct = 0;
    let team2Correct = 0;
    let totalCorrect = 0;
    
    // Evaluar cada jugador individualmente
    Object.keys(playerSelections).forEach(pid => {
        const selection = playerSelections[pid];
        if (!selection || !selection.hasSelected) return;
        
        const player = players[pid];
        if (!player) return;
        
        const isCorrect = selection.isCorrect;
        
        playerResults[pid] = {
            isCorrect: isCorrect,
            elements: selection.elements,
            points: isCorrect ? totalPoints : 0
        };
        
        if (isCorrect) {
            totalCorrect++;
            // Dar puntos al jugador
            player.score += totalPoints;
            
            // Sumar al equipo (solo en modo equipos)
            if (currentGameMode === 'teams' && player.team) {
                if (player.team === 'team1') {
                    team1Correct++;
                    teams.team1.score += totalPoints;
                } else if (player.team === 'team2') {
                    team2Correct++;
                    teams.team2.score += totalPoints;
                }
            }
        }
    });
    
    // Mostrar la animación del laboratorio primero
    const anyCorrect = totalCorrect > 0;
    showLabAnimationInMixingZone(anyCorrect);
    
    // Verificar si es la última ronda para mostrar la respuesta correcta
    const isLastRound = currentRound >= totalRounds;
    
    // Después de la animación del lab, mostrar resultados
    setTimeout(() => {
        // Solo mostrar la respuesta correcta al final de la partida
        const showAnswerCallback = () => {
            setTimeout(() => {
                if (currentGameMode === 'teams') {
                    const roundWinner = team1Correct > team2Correct ? 'team1' : 
                                       team2Correct > team1Correct ? 'team2' : 'tie';
                    showTeamResults(team1Correct, team2Correct, roundWinner, totalPoints);
                    
                    airconsole.broadcast({
                        action: 'roundResult',
                        gameMode: 'teams',
                        compound: currentCompound,
                        playerResults: playerResults,
                        teams: teams,
                        roundWinner: roundWinner,
                        team1Correct: team1Correct,
                        team2Correct: team2Correct,
                        pointsAwarded: totalPoints
                    });
                } else {
                    showIndividualResults(totalCorrect, totalPoints);
                    
                    airconsole.broadcast({
                        action: 'roundResult',
                        gameMode: 'individual',
                        compound: currentCompound,
                        playerResults: playerResults,
                        players: players,
                        totalCorrect: totalCorrect,
                        pointsAwarded: totalPoints
                    });
                }
            }, 500);
        };
        
        if (isLastRound) {
            // Última ronda: mostrar respuesta correcta antes del ranking final
            showCorrectAnswer(anyCorrect, showAnswerCallback);
        } else {
            // Rondas intermedias: ir directo al ranking sin mostrar respuesta
            showAnswerCallback();
        }
    }, 2500); // Esperar a que termine la animación del lab
}

// Mostrar la respuesta correcta con animación
function showCorrectAnswer(anyCorrect, callback) {
    const inlineResults = document.getElementById('inlineResults');
    const inlineContent = document.getElementById('inlineResultsContent');
    
    if (!inlineResults || !inlineContent) {
        if (callback) callback();
        return;
    }
    
    // Construir la fórmula con los elementos en orden
    const elementsHTML = currentCompound.elements.map((el, i) => {
        const elementData = elements[el] || { symbol: el, group: 'nonmetal' };
        return `<div class="answer-element element-${elementData.group}" style="animation-delay: ${i * 0.1}s">
            <span class="symbol">${elementData.symbol}</span>
        </div>`;
    }).join('<span class="answer-plus">+</span>');
    
    inlineContent.innerHTML = `
        <div class="correct-answer-reveal ${anyCorrect ? 'success' : 'error'}">
            <div class="answer-label">
                <iconify-icon icon="${anyCorrect ? 'mdi:check-circle' : 'mdi:close-circle'}"></iconify-icon>
                <span>${anyCorrect ? '¡Correcto!' : 'Respuesta correcta:'}</span>
            </div>
            
            <div class="answer-compound">
                <iconify-icon icon="${currentCompound.icon}" class="compound-icon"></iconify-icon>
                <span class="compound-formula">${currentCompound.formula}</span>
                <span class="compound-name">${currentCompound.name}</span>
            </div>
            
            <div class="answer-elements-row">
                ${elementsHTML}
            </div>
            
            ${currentCompound.hint ? `
                <div class="answer-hint">
                    <iconify-icon icon="mdi:lightbulb"></iconify-icon>
                    ${currentCompound.hint}
                </div>
            ` : ''}
        </div>
    `;
    
    inlineResults.classList.remove('hidden');
    
    // Animaciones
    if (window.anime) {
        window.anime.animate('.correct-answer-reveal', {
            scale: [0.8, 1],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
        
        window.anime.animate('.answer-element', {
            scale: [0, 1],
            opacity: [0, 1],
            delay: window.anime.stagger(100, {start: 300}),
            duration: 300,
            easing: 'easeOutBack'
        });
        
        window.anime.animate('.compound-formula', {
            scale: [0.5, 1.1, 1],
            duration: 600,
            delay: 200,
            easing: 'easeOutElastic(1, .5)'
        });
    }
    
    // Sonido
    if (anyCorrect) {
        playSuccessSound();
    } else {
        playErrorSound();
    }
    
    // Llamar al callback después de mostrar la respuesta
    setTimeout(() => {
        if (callback) callback();
    }, 2500); // 2.5 segundos para ver la respuesta
}

// Función legacy para compatibilidad
function checkCompound() {
    checkAllPlayersResults();
}

// Mostrar resultados individuales
function showIndividualResults(totalCorrect, pointsAwarded) {
    const inlineResults = document.getElementById('inlineResults');
    const inlineContent = document.getElementById('inlineResultsContent');
    
    if (!inlineResults || !inlineContent) return;
    
    const totalPlayers = Object.keys(players).length;
    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    const topPlayers = sortedPlayers.slice(0, 5);
    
    inlineContent.innerHTML = `
        <div class="inline-result-header ${totalCorrect > 0 ? 'success' : 'error'}">
            <div class="compound-inline">
                <iconify-icon icon="${currentCompound.icon}"></iconify-icon>
                <span class="formula">${currentCompound.formula}</span>
                <span class="name">${currentCompound.name}</span>
            </div>
            <div class="correct-badge ${totalCorrect > 0 ? 'success' : 'error'}">
                <iconify-icon icon="${totalCorrect > 0 ? 'mdi:check-circle' : 'mdi:close-circle'}"></iconify-icon>
                <span>${totalCorrect}/${totalPlayers} acertaron</span>
            </div>
        </div>
        
        <div class="inline-ranking">
            <h4><iconify-icon icon="mdi:podium"></iconify-icon> Ranking Actual</h4>
            <div class="ranking-list">
                ${topPlayers.map((p, i) => `
                    <div class="ranking-item ${playerResults[p.id]?.isCorrect ? 'correct' : ''}">
                        <span class="rank">${i + 1}</span>
                        <div class="player-dot" style="background: ${p.color};"></div>
                        <span class="name">${p.name}</span>
                        <span class="score">${p.score} pts</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="inline-points-info">
            <iconify-icon icon="mdi:information"></iconify-icon>
            +${pointsAwarded} puntos por respuesta correcta
        </div>
    `;
    
    // Mostrar resultados encima de la animación (sin ocultarla)
    inlineResults.classList.remove('hidden');
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate('.inline-result-header', {
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
        window.anime.animate('.ranking-item', {
            translateX: [-20, 0],
            opacity: [0, 1],
            delay: window.anime.stagger(80, {start: 200}),
            duration: 300
        });
    }
    
    // Sonido según resultado
    if (totalCorrect > 0) {
        playSuccessSound();
    } else {
        playErrorSound();
    }
    
    // Auto-avance a la siguiente ronda después de 4 segundos
    scheduleNextRound();
}

// Mostrar resultados por equipos
function showTeamResults(team1Correct, team2Correct, roundWinner, pointsAwarded) {
    const inlineResults = document.getElementById('inlineResults');
    const inlineContent = document.getElementById('inlineResultsContent');
    
    if (!inlineResults || !inlineContent) return;
    
    const team1Config = TEAM_CONFIG.team1;
    const team2Config = TEAM_CONFIG.team2;
    const totalTeam1 = teams.team1.players.length;
    const totalTeam2 = teams.team2.players.length;
    const anyCorrect = team1Correct > 0 || team2Correct > 0;
    
    let winnerHTML = '';
    if (roundWinner === 'team1') {
        winnerHTML = `<div class="round-winner-inline" style="--winner-color: ${team1Config.color};">
            <iconify-icon icon="mdi:trophy"></iconify-icon> ¡${team1Config.name} gana!
        </div>`;
    } else if (roundWinner === 'team2') {
        winnerHTML = `<div class="round-winner-inline" style="--winner-color: ${team2Config.color};">
            <iconify-icon icon="mdi:trophy"></iconify-icon> ¡${team2Config.name} gana!
        </div>`;
    } else {
        winnerHTML = `<div class="round-winner-inline" style="--winner-color: #9ca3af;">
            <iconify-icon icon="mdi:scale-balance"></iconify-icon> ¡Empate!
        </div>`;
    }
    
    inlineContent.innerHTML = `
        <div class="inline-result-header ${anyCorrect ? 'success' : 'error'}">
            <div class="compound-inline">
                <iconify-icon icon="${currentCompound.icon}"></iconify-icon>
                <span class="formula">${currentCompound.formula}</span>
                <span class="name">${currentCompound.name}</span>
            </div>
            ${winnerHTML}
        </div>
        
        <div class="teams-inline-row">
            <div class="team-inline-card" style="--team-color: ${team1Config.color};">
                <iconify-icon icon="${team1Config.icon}"></iconify-icon>
                <span class="team-name">${team1Config.name}</span>
                <div class="team-correct">
                    <iconify-icon icon="mdi:check-circle"></iconify-icon>
                    ${team1Correct}/${totalTeam1}
                </div>
                <span class="team-score">${teams.team1.score} pts</span>
            </div>
            
            <div class="vs-inline">VS</div>
            
            <div class="team-inline-card" style="--team-color: ${team2Config.color};">
                <iconify-icon icon="${team2Config.icon}"></iconify-icon>
                <span class="team-name">${team2Config.name}</span>
                <div class="team-correct">
                    <iconify-icon icon="mdi:check-circle"></iconify-icon>
                    ${team2Correct}/${totalTeam2}
                </div>
                <span class="team-score">${teams.team2.score} pts</span>
            </div>
        </div>
        
        <div class="inline-points-info">
            <iconify-icon icon="mdi:information"></iconify-icon>
            +${pointsAwarded} puntos por respuesta correcta
        </div>
    `;
    
    // Mostrar resultados encima de la animación (sin ocultarla)
    inlineResults.classList.remove('hidden');
    
    // Animación de entrada
    if (window.anime) {
        window.anime.animate('.inline-result-header', {
            translateY: [-20, 0],
            opacity: [0, 1],
            duration: 400,
            easing: 'easeOutBack'
        });
        window.anime.animate('.team-inline-card', {
            scale: [0.8, 1],
            opacity: [0, 1],
            delay: window.anime.stagger(150, {start: 200}),
            duration: 400,
            easing: 'easeOutBack'
        });
    }
    
    // Sonido según resultado
    if (anyCorrect) {
        playSuccessSound();
    } else {
        playErrorSound();
    }
    
    // Auto-avance a la siguiente ronda después de 4 segundos
    scheduleNextRound();
}

// Programar el avance automático a la siguiente ronda
let nextRoundTimeout = null;

function scheduleNextRound() {
    // Cancelar cualquier timeout previo
    if (nextRoundTimeout) {
        clearTimeout(nextRoundTimeout);
    }
    
    // Avanzar automáticamente después de 4 segundos
    nextRoundTimeout = setTimeout(() => {
        nextRound();
    }, 4000);
}

// Mostrar la animación del laboratorio en la mixing-zone (cuando los jugadores responden)
function showLabAnimationInMixingZone(isCorrect) {
    const labAnimationZone = document.getElementById('labAnimationZone');
    const labWaitingText = document.getElementById('labWaitingText');
    const mixingZone = document.getElementById('mixingZone');
    
    if (!labAnimationZone) {
        console.log('Lab animation zone not found');
        return;
    }
    
    // Ocultar texto de espera
    if (labWaitingText) labWaitingText.classList.add('hidden');
    
    // Agregar clase de éxito o error para efectos visuales
    if (mixingZone) {
        mixingZone.classList.remove('success', 'error', 'reacting');
        mixingZone.classList.add(isCorrect ? 'success' : 'error');
    }
    
    // Iniciar la animación del laboratorio
    if (window.labAnimation) {
        window.labAnimation.startAnimation();
        console.log('Lab animation started');
    } else {
        console.log('Lab animation not available');
    }
}

// Ocultar la animación del laboratorio y resetear la mixing-zone
function hideLabAnimationInMixingZone() {
    const labAnimationZone = document.getElementById('labAnimationZone');
    const inlineResults = document.getElementById('inlineResults');
    const mixingZone = document.getElementById('mixingZone');
    
    // Mostrar animación del lab y ocultar resultados
    if (labAnimationZone) labAnimationZone.classList.remove('hidden');
    if (inlineResults) inlineResults.classList.add('hidden');
    
    if (mixingZone) {
        mixingZone.classList.remove('success', 'error', 'active', 'reacting');
    }
    
    // Reinicializar el laboratorio estático
    initStaticLab();
}

function showResult(isCorrect) {
    const overlay = document.getElementById('resultOverlay');
    const content = document.getElementById('resultContent');
    
    // Usar la animación de laboratorio elaborada
    if (window.LabAnimation) {
        showLabAnimationResult(isCorrect, overlay, content);
    } else {
        // Fallback a la animación simple si no está disponible
        showSimpleResult(isCorrect, overlay, content);
    }
}

// Animación de laboratorio elaborada
function showLabAnimationResult(isCorrect, overlay, content) {
    const basePoints = currentCompound.points;
    const timeBonus = Math.floor(gameTimer * 2);
    const difficultyBonus = Math.floor((basePoints + timeBonus) * (difficultyConfig.pointsMultiplier - 1));
    
    // Crear contenedor para la animación
    content.innerHTML = `
        <div class="lab-animation-wrapper" id="labAnimationWrapper"></div>
        <div class="lab-result-info" id="labResultInfo" style="display: none;">
            <div class="points-display mt-4">
                <iconify-icon icon="mdi:star" class="mr-2 star-spin"></iconify-icon>
                <span class="points-value">+${basePoints}</span>
                <span class="points-label">pts</span>
                ${timeBonus > 0 ? `<span class="bonus-points">+${timeBonus} tiempo</span>` : ''}
                ${difficultyBonus > 0 ? `<span class="bonus-points difficulty-bonus">+${difficultyBonus} ${difficultyConfig.name}</span>` : ''}
            </div>
        </div>
    `;
    
    overlay.classList.add('active');
    
    // Inicializar y ejecutar la animación
    const wrapper = document.getElementById('labAnimationWrapper');
    const labAnim = new window.LabAnimation(wrapper);
    labAnim.init();
    
    // Ejecutar la animación con los elementos seleccionados
    labAnim.playAnimation(selectedElements, currentCompound, isCorrect, () => {
        // Mostrar puntos después de la animación
        const resultInfo = document.getElementById('labResultInfo');
        if (resultInfo && isCorrect) {
            resultInfo.style.display = 'block';
            if (window.anime) {
                window.anime.animate(resultInfo, {
                    translateY: [20, 0],
                    opacity: [0, 1],
                    duration: 400,
                    easing: 'easeOutCubic'
                });
                window.anime.animate('.star-spin', {
                    rotate: [0, 360],
                    duration: 1000,
                    easing: 'easeOutCubic'
                });
            }
        }
        
        // Reproducir sonido
        if (isCorrect) {
            playSuccessSound();
        } else {
            playErrorSound();
        }
    });
}

// Animación simple (fallback)
function showSimpleResult(isCorrect, overlay, content) {
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
    stopBackgroundMusic();
    
    const sorted = Object.values(players).sort((a, b) => b.score - a.score);
    
    if (currentGameMode === 'teams') {
        // Determinar equipo ganador
        const winningTeam = teams.team1.score > teams.team2.score ? 'team1' : 
                           teams.team2.score > teams.team1.score ? 'team2' : 'tie';
        
        renderEndScreen(winningTeam, sorted);
        
        airconsole.broadcast({
            action: 'gameEnd',
            gameMode: 'teams',
            winningTeam: winningTeam,
            teams: teams,
            players: sorted,
            difficulty: currentDifficulty
        });
    } else {
        // Modo individual: el ganador es el jugador con más puntos
        const winner = sorted[0];
        
        renderEndScreenIndividual(winner, sorted);
        
        airconsole.broadcast({
            action: 'gameEnd',
            gameMode: 'individual',
            winner: winner,
            players: sorted,
            difficulty: currentDifficulty
        });
    }
}

// Pantalla final para modo individual
function renderEndScreenIndividual(winner, sortedPlayers) {
    const app = document.getElementById('app');
    
    // Función para obtener el trofeo según la posición
    const getTrophyIcon = (rank) => {
        if (rank === 1) return 'mdi:trophy';
        if (rank === 2) return 'mdi:trophy-outline';
        if (rank === 3) return 'mdi:trophy-variant';
        return '';
    };
    
    const getTrophyColor = (rank) => {
        if (rank === 1) return '#fbbf24'; // Oro
        if (rank === 2) return '#9ca3af'; // Plata
        if (rank === 3) return '#cd7f32'; // Bronce
        return '';
    };
    
    app.innerHTML = `
        <div class="screen active" id="endScreen">
            <div class="lab-bg"></div>
            <div id="confettiContainer" class="fixed inset-0 pointer-events-none z-50"></div>
            
            <div class="end-screen-container">
                <!-- Trofeo principal centrado -->
                <div class="main-trophy-container">
                    <iconify-icon icon="mdi:trophy" class="main-trophy-icon result-icon"></iconify-icon>
                    <div class="trophy-shine"></div>
                </div>
                
                <h1 class="end-title">¡Experimento Completado!</h1>
                
                <div class="difficulty-completed" style="color: ${difficultyConfig.color};">
                    <iconify-icon icon="${difficultyConfig.icon}"></iconify-icon>
                    Dificultad: ${difficultyConfig.name} (x${difficultyConfig.pointsMultiplier})
                </div>
                
                <p class="winner-intro">El mejor científico del laboratorio es...</p>
                
                <div class="winner-individual-card" style="border-color: ${winner.color}; background: ${winner.color}20;">
                    <iconify-icon icon="mdi:crown" class="crown-icon" style="color: #fbbf24;"></iconify-icon>
                    <div class="winner-avatar" style="background: ${winner.color};">
                        <iconify-icon icon="${winner.icon}"></iconify-icon>
                    </div>
                    <h2 class="winner-name">${winner.name}</h2>
                    <p class="winner-score">${winner.score} pts</p>
                </div>
                
                <h3 class="leaderboard-title">
                    <iconify-icon icon="mdi:podium"></iconify-icon> Clasificación Final
                </h3>
                
                <div class="leaderboard-list" id="leaderboard">
                    ${sortedPlayers.slice(0, 10).map((player, i) => `
                        <div class="leaderboard-item ${i === 0 ? 'first' : i === 1 ? 'second' : i === 2 ? 'third' : ''}">
                            <div class="rank-badge ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</div>
                            ${i < 3 ? `<iconify-icon icon="${getTrophyIcon(i + 1)}" class="rank-trophy" style="color: ${getTrophyColor(i + 1)};"></iconify-icon>` : ''}
                            <div class="player-avatar" style="background: ${player.color};">
                                <iconify-icon icon="${player.icon}"></iconify-icon>
                            </div>
                            <div class="player-info">
                                <p class="player-name">${player.name}</p>
                            </div>
                            <div class="score-badge">${player.score} pts</div>
                        </div>
                    `).join('')}
                </div>
                
                <p class="admin-hint">
                    <iconify-icon icon="mdi:information"></iconify-icon>
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
            
            window.anime.animate('.winner-individual-card', {
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

function resetGame() {
    Object.values(players).forEach(p => p.score = 0);
    usedCompounds = [];
    roundNumber = 0;
    currentCompound = null;
    playerSelections = {};
    playerResults = {};
    
    // Resetear equipos
    teams = {
        team1: { score: 0, players: [] },
        team2: { score: 0, players: [] }
    };
    
    // Reasignar jugadores según modo actual
    Object.keys(players).forEach((pid, index) => {
        if (currentGameMode === 'teams') {
            const team = (index % 2 === 0) ? 'team1' : 'team2';
            players[pid].team = team;
            players[pid].color = TEAM_CONFIG[team].color;
            players[pid].icon = TEAM_CONFIG[team].icon;
            teams[team].players.push(pid);
        } else {
            players[pid].team = null;
            players[pid].color = INDIVIDUAL_COLORS[index % INDIVIDUAL_COLORS.length];
            players[pid].icon = INDIVIDUAL_ICONS[index % INDIVIDUAL_ICONS.length];
        }
    });
    
    stopBackgroundMusic();
    
    // Notificar a todos los controllers que vuelvan a la pantalla de espera/dificultad
    airconsole.broadcast({
        action: 'gameReset',
        difficulty: currentDifficulty,
        difficultyConfig: difficultyConfig,
        teams: teams
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

// Esperar a que el DOM esté listo antes de inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
