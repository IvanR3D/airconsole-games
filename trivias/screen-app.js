const categories = {
    general: { name: "General", icon: "mdi:earth", color: "general" },
    science: { name: "Ciencia", icon: "mdi:microscope", color: "science" },
    mathematics: { name: "Matematicas", icon: "mdi:math-compass", color: "mathematics" },
    robotics: { name: "Robotica", icon: "mdi:robot", color: "robotics" },
    chemistry: { name: "Quimica", icon: "mdi:flask", color: "chemistry" },
    technology: { name: "Tecnologia", icon: "mdi:laptop", color: "technology" },
    history: { name: "Historia", icon: "mdi:book-open-page-variant", color: "history" },
    geography: { name: "Geografia", icon: "mdi:map", color: "geography" }
};

// Colores únicos por categoría - mismo que controller para consistencia
const categoryColors = {
    general: '#0595AE',    // turquesa
    science: '#73A03F',    // verde
    mathematics: '#6366F1', // indigo
    robotics: '#AB3D8B',   // morado
    chemistry: '#EB8225',  // naranja
    technology: '#0D9488', // esmeralda
    history: '#B45309',    // ámbar
    geography: '#2563EB'   // azul
};

// Usar la base de datos de preguntas del archivo externo
const questions = questionsDatabase;

const playerColors = ['#0595AE', '#73A03F', '#EB8225', '#AB3D8B'];

let airconsole;
let players = {};
let gameState = 'waiting';
let currentQuestion = 0;
let gameQuestions = [];
let questionStartTime = 0;
let answers = {};
let selectedCategory = 'general';
let selectedQuestionCount = 10; // Cantidad de preguntas seleccionada (por defecto 10)
let timer = null;
let timeLeft = 20;
let soundEnabled = true;
let adminDeviceId = null;
let resultsShown = false; // Evita mostrar resultados múltiples veces

const domCache = {};

function cacheDomElements() {
    domCache.timerCircle = document.getElementById('timerCircle');
    domCache.questionNumber = document.getElementById('questionNumber');
    domCache.questionText = document.getElementById('questionText');
    domCache.optionsGrid = document.getElementById('optionsGrid');
    domCache.playersGrid = document.getElementById('playersGrid');
    domCache.adminHint = document.getElementById('adminHint');
}

let audioContext;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
        case 'join':
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(784, audioContext.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.2);
            break;
        case 'correct':
            [523, 659, 784].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.15, audioContext.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.15);
                osc.start(audioContext.currentTime + i * 0.08);
                osc.stop(audioContext.currentTime + i * 0.08 + 0.15);
            });
            break;
        case 'wrong':
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.3);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.3);
            break;
        case 'tick':
            oscillator.frequency.value = 800;
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
            oscillator.start();
            oscillator.stop(audioContext.currentTime + 0.05);
            break;
        case 'victory':
            [523, 659, 784, 1047].forEach((freq, i) => {
                const osc = audioContext.createOscillator();
                const gain = audioContext.createGain();
                osc.connect(gain);
                gain.connect(audioContext.destination);
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.3);
                osc.start(audioContext.currentTime + i * 0.15);
                osc.stop(audioContext.currentTime + i * 0.15 + 0.3);
            });
            break;
    }
}

function createConfetti() {
    const container = document.getElementById('confettiContainer');
    container.innerHTML = '';
    const colors = ['#0595AE', '#AB3D8B', '#EB8225', '#73A03F'];
    
    for (let i = 0; i < 150; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
        container.appendChild(confetti);
    }
    
    setTimeout(() => container.innerHTML = '', 5000);
}

function setCategoryBackground(category) {
    document.body.className = 'cat-' + (categories[category]?.color || 'default') + ' font-sans text-steam-negro overflow-hidden';
}

function init() {
    airconsole = new AirConsole();
    cacheDomElements();
    
    // Initialize particle network background
    initParticleNetwork();
    
    function animateIntroScreen() {
        // Simple fade in for intro screen
        const introScreen = document.getElementById('introScreen');
        if (introScreen) {
            introScreen.style.opacity = '1';
        }
    }

    airconsole.onReady = function() {
        setupCategories();
        
        // Start on intro screen, stay there until players join
        showScreen('intro');
    };

    airconsole.onConnect = function(deviceId) {
        // Don't auto-join, wait for explicit join message
    };

    airconsole.onDisconnect = function(deviceId) {
        if (players[deviceId]) {
            const player = players[deviceId];
            
            player.disconnected = true;
            updatePlayersDisplay();
            
            airconsole.broadcast({
                action: 'playerDisconnected',
                playerId: deviceId,
                playerName: player.name
            });
        } else {
            // Device was not in active players
        }
    };

    airconsole.onMessage = function(deviceId, data) {
        
        if (data.action === 'join') {
            // Check if player already exists
            if (players[deviceId]) {
                if (players[deviceId].disconnected) {
                    // Reconnecting player
                    const existingPlayer = players[deviceId];
                    existingPlayer.disconnected = false;
                    
                    airconsole.message(deviceId, {
                        action: 'reconnected',
                        color: existingPlayer.color,
                        isAdmin: existingPlayer.isAdmin,
                        gameState: gameState,
                        selectedCategory: selectedCategory,
                        score: existingPlayer.score
                    });
                    
                    updatePlayersDisplay();
                    broadcastGameState();
                } else {
                    // Already joined, just confirm
                    const p = players[deviceId];
                    airconsole.message(deviceId, {
                        action: 'joined',
                        color: p.color,
                        isAdmin: p.isAdmin,
                        gameState: gameState,
                        selectedCategory: selectedCategory
                    });
                }
            } else {
                // New player trying to join
                
                // Check if game is already in progress
                if (gameState === 'playing' || gameState === 'gameEnd') {
                    airconsole.message(deviceId, {
                        action: 'gameInProgress',
                        message: 'El juego ya está en progreso. Espera a que termine.'
                    });
                    return;
                }
                
                const connectedPlayersCount = Object.keys(players).filter(
                    id => !players[id].disconnected
                ).length;
                
                if (connectedPlayersCount < 4) {
                    const isAdmin = adminDeviceId === null;
                    if (isAdmin) {
                        adminDeviceId = deviceId;
                    }
                    
                    const playerColor = playerColors[Object.keys(players).length % playerColors.length];
                    const playerName = airconsole.getNickname(deviceId) || `Jugador ${Object.keys(players).length + 1}`;
                    
                    players[deviceId] = {
                        id: deviceId,
                        name: playerName,
                        score: 0,
                        color: playerColor,
                        isAdmin: isAdmin,
                        disconnected: false
                    };
                    
                    playSound('join');
                    
                    airconsole.message(deviceId, {
                        action: 'joined',
                        color: playerColor,
                        isAdmin: isAdmin,
                        gameState: gameState,
                        selectedCategory: selectedCategory
                    });
                    
                    updatePlayersDisplay();
                    
                    // First player joins - transition from intro to category selection
                    if (isAdmin && (gameState === 'waiting' || gameState === 'intro')) {
                        showScreen('category');
                        gameState = 'categorySelect';
                    }
                    
                    broadcastGameState();
                } else {
                    airconsole.message(deviceId, {
                        action: 'gameFull'
                    });
                }
            }
            
        } else if (data.action === 'selectCategory' && deviceId === adminDeviceId) {
            selectedCategory = data.category;
            
            // Find and click the corresponding category card
            const targetCard = document.querySelector(`.category-card[data-category="${data.category}"]`);
            if (targetCard) {
                targetCard.click();
            }
            
        } else if (data.action === 'setQuestionCount' && deviceId === adminDeviceId) {
            selectedQuestionCount = data.count;
            // Actualizar el display de cantidad de preguntas si existe
            const countDisplay = document.getElementById('questionCountDisplay');
            if (countDisplay) {
                countDisplay.textContent = data.count + ' preguntas';
            }
            
        } else if (data.action === 'startGame' && deviceId === adminDeviceId) {
            startGame();
            
        } else if (data.action === 'answer' && gameState === 'playing') {
            handleAnswer(deviceId, data.option, data.timestamp);
            
        } else if (data.action === 'playAgain' && deviceId === adminDeviceId) {
            resetGame();
            
        } else if (data.action === 'exitGame' && deviceId === adminDeviceId) {
            exitToCategories();
        }
    };

    document.getElementById('soundToggle').addEventListener('click', toggleSound);
}

function broadcastGameState() {
    airconsole.broadcast({
        action: 'gameStateUpdate',
        gameState: gameState,
        selectedCategory: selectedCategory,
        players: players,
        adminId: adminDeviceId
    });
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    document.getElementById('soundToggle').textContent = soundEnabled ? '🔊' : '🔇';
}

// Particle Network Animation - Disabled for clean background
function initParticleNetwork() {
    // Clean white background - no particles
}

function setupCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';
    
    const categoryColors = {
        general: '#0595AE',
        science: '#73A03F',
        mathematics: '#0595AE',
        robotics: '#AB3D8B',
        chemistry: '#EB8225',
        technology: '#AB3D8B',
        history: '#EB8225',
        geography: '#73A03F'
    };
    
    // Icon mapping - same as controller for unified design
    const categoryIcons = {
        general: 'mdi:earth',
        science: 'mdi:microscope',
        mathematics: 'mdi:compass-outline',
        robotics: 'mdi:robot-outline',
        chemistry: 'mdi:flask-outline',
        technology: 'mdi:laptop',
        history: 'mdi:book-open-outline',
        geography: 'mdi:map-outline'
    };
    
    Object.entries(categories).forEach(([key, category], index) => {
        const card = document.createElement('div');
        const categoryColor = categoryColors[key] || categoryColors.general;
        
        card.className = 'category-card rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 text-center cursor-pointer transition-all relative power-up';
        card.style.animationDelay = `${index * 0.1}s`;
        card.style.background = '#f0f9ff';
        card.style.border = '2px solid #BFDBFE';
        card.dataset.category = key;
        card.dataset.categoryColor = categoryColor;
        
        card.innerHTML = `
            <div class="mb-3 sm:mb-4">
                <iconify-icon icon="${categoryIcons[key]}" class="category-icon" style="color: ${categoryColor};"></iconify-icon>
            </div>
            <div class="text-base sm:text-lg lg:text-xl font-bold category-name" style="color: #0595AE;">
                ${category.name}
            </div>
            <div class="selection-check absolute top-2 right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 bg-white/90 hidden items-center justify-center text-sm font-bold" style="border-color: ${categoryColor}; color: ${categoryColor};">
                ✓
            </div>
        `;

        // Add click handler with animation
        card.addEventListener('click', () => {
            // Remove selection from all cards - vuelven a fondo claro
            document.querySelectorAll('.category-card').forEach(c => {
                c.classList.remove('selected', 'scale-105');
                const check = c.querySelector('.selection-check');
                if (check) {
                    check.classList.add('hidden');
                    check.classList.remove('flex');
                }
                const catColor = c.dataset.categoryColor;
                c.style.background = '#f0f9ff';
                c.style.borderColor = '#BFDBFE';
                const icon = c.querySelector('.category-icon');
                const text = c.querySelector('.category-name');
                if (icon) icon.style.color = catColor;
                if (text) text.style.color = '#0595AE';
            });
            
            // Add selection to clicked card - fondo del color de la categoría
            card.classList.add('selected', 'scale-105');
            const check = card.querySelector('.selection-check');
            if (check) {
                check.classList.remove('hidden');
                check.classList.add('flex');
            }
            const selectedColor = card.dataset.categoryColor;
            card.style.background = selectedColor;
            card.style.borderColor = selectedColor;
            const icon = card.querySelector('.category-icon');
            const text = card.querySelector('.category-name');
            if (icon) icon.style.color = '#FFFFFF';
            if (text) text.style.color = '#FFFFFF';
            
            // Update selected category
            selectedCategory = key;
            
            // Change background with animation
            setCategoryBackground(key);
            createBackgroundParticles(key);
            
            // Animate icon with anime.js (reduced height)
            if (anime && anime.animate) {
                anime.animate(card.querySelector('.category-icon'), {
                    scale: [1, 1.2, 0.95, 1.05, 1],
                    duration: 700,
                    ease: 'easeOutElastic(1, .6)'
                });
            }
            
            // Animate card
            if (anime && anime.animate) {
                anime.animate(card, {
                    scale: [1, 1.05, 1.02],
                    duration: 400,
                    ease: 'outElastic(1, .8)'
                });
            }
            
            // Play selection sound
            playSound('join');
            
            // Send message to controllers
            if (airconsole) {
                airconsole.broadcast({ action: 'categorySelected', category: key });
            }
        });
        
        grid.appendChild(card);
    });
    
    // Select first category by default with animation
    setTimeout(() => {
        const firstCard = document.querySelector('.category-card');
        if (firstCard) {
            firstCard.click();
        }
    }, 500);
}

function createStarBurst(element) {
    // Simplified - no star burst for child-friendly design
}

function createBackgroundParticles(category) {
    const container = document.getElementById('bgParticles');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Colores para partículas - mismo que controller
    const colorMap = {
        general: ['#0595AE', '#73A03F', '#EB8225', '#AB3D8B'],
        science: ['#73A03F', '#0595AE', '#EB8225'],
        mathematics: ['#6366F1', '#8B5CF6', '#A78BFA'],
        robotics: ['#AB3D8B', '#EB8225', '#0595AE'],
        chemistry: ['#EB8225', '#F59E0B', '#F97316'],
        technology: ['#0D9488', '#14B8A6', '#2DD4BF'],
        history: ['#B45309', '#D97706', '#F59E0B'],
        geography: ['#2563EB', '#3B82F6', '#60A5FA']
    };
    
    // Outline icons for each category
    const iconMap = {
        general: ['mdi:earth-outline', 'mdi:lightbulb-outline', 'mdi:star-outline', 'mdi:book-outline', 'mdi:school-outline'],
        science: ['mdi:microscope', 'mdi:test-tube-outline', 'mdi:dna', 'mdi:atom-variant', 'mdi:leaf-outline', 'mdi:bacteria-outline'],
        mathematics: ['mdi:compass-outline', 'mdi:calculator-variant-outline', 'mdi:chart-line', 'mdi:function-variant', 'mdi:pi', 'mdi:sigma'],
        robotics: ['mdi:robot-outline', 'mdi:cog-outline', 'mdi:chip', 'mdi:memory', 'mdi:robot-industrial-outline', 'mdi:robot-happy-outline'],
        chemistry: ['mdi:flask-outline', 'mdi:beaker-outline', 'mdi:molecule', 'mdi:atom', 'mdi:water-outline', 'mdi:fire'],
        technology: ['mdi:laptop', 'mdi:cellphone', 'mdi:code-tags', 'mdi:wifi', 'mdi:cloud-outline', 'mdi:lan'],
        history: ['mdi:book-open-outline', 'mdi:castle', 'mdi:crown-outline', 'mdi:sword', 'mdi:scroll-text-outline', 'mdi:pyramid'],
        geography: ['mdi:map-outline', 'mdi:compass-outline', 'mdi:mountain', 'mdi:waves', 'mdi:island', 'mdi:pine-tree']
    };
    
    const colors = colorMap[category] || colorMap.general;
    const icons = iconMap[category] || iconMap.general;
    
    // Icon sizes: small, medium, large, extra-large
    const sizes = [
        { min: 30, max: 45, opacity: 0.15 },   // small
        { min: 50, max: 70, opacity: 0.18 },   // medium
        { min: 75, max: 100, opacity: 0.22 },  // large
        { min: 110, max: 150, opacity: 0.25 }  // extra-large
    ];
    
    // Create soft colored blob particles (background)
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 150 + 80;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.className = 'particle';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.borderRadius = '50%';
        particle.style.background = `${color}15`; // 15 = ~8% opacity in hex
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 20 + 20) + 's';
        particle.style.filter = 'blur(40px)';
        particle.style.opacity = '0.15';
        
        container.appendChild(particle);
    }
    
    // Create floating outline icons with varied sizes
    for (let i = 0; i < 25; i++) {
        const iconEl = document.createElement('iconify-icon');
        const icon = icons[Math.floor(Math.random() * icons.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const sizeConfig = sizes[Math.floor(Math.random() * sizes.length)];
        const iconSize = Math.random() * (sizeConfig.max - sizeConfig.min) + sizeConfig.min;
        
        iconEl.setAttribute('icon', icon);
        iconEl.className = 'particle icon-particle';
        iconEl.style.color = `${color}40`; // 40 = ~25% opacity in hex
        iconEl.style.fontSize = iconSize + 'px';
        iconEl.style.left = Math.random() * 100 + '%';
        iconEl.style.top = Math.random() * 100 + '%';
        iconEl.style.animationDelay = Math.random() * 5 + 's';
        iconEl.style.animationDuration = (Math.random() * 25 + 25) + 's';
        iconEl.style.opacity = sizeConfig.opacity.toString();
        iconEl.style.position = 'absolute';
        
        container.appendChild(iconEl);
    }
    
    // Animate particles entrance with anime.js
    if (anime && anime.animate && anime.stagger) {
        anime.animate('.particle', {
            opacity: [0, 0.15],
            scale: [0, 1],
            duration: 1000,
            delay: anime.stagger(30),
            ease: 'outElastic(1, .8)'
        });
    }
}

function updatePlayersDisplay() {
    const grid = domCache.playersGrid || document.getElementById('playersGrid');
    const fragment = document.createDocumentFragment();
    
    const playerColors = ['#0595AE', '#73A03F', '#EB8225', '#AB3D8B'];
    
    Object.values(players).forEach((player, index) => {
        const card = document.createElement('div');
        const cardColor = playerColors[index % playerColors.length];
        
        card.className = 'bg-white rounded-2xl py-4 px-5 flex items-center gap-3 shadow-lg transition-all hover:scale-105 relative overflow-hidden';
        
        if (player.disconnected) {
            card.style.background = '#f3f4f6';
            card.style.border = '2px solid #d1d5db';
            card.style.opacity = '0.6';
        } else {
            card.style.border = `3px solid ${cardColor}`;
        }
        
        // Avatar
        const avatar = document.createElement('div');
        avatar.className = 'w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center relative flex-shrink-0 shadow-md';
        avatar.style.background = player.disconnected ? '#9ca3af' : player.color;
        avatar.style.border = `3px solid ${player.disconnected ? '#6b7280' : '#fff'}`;
        
        if (player.isAdmin && !player.disconnected) {
            avatar.innerHTML = '<iconify-icon icon="mdi:crown" style="font-size: 1.5rem; color: white;"></iconify-icon>';
        } else if (player.disconnected) {
            avatar.innerHTML = '<iconify-icon icon="mdi:close-circle" style="font-size: 1.5rem; color: white;"></iconify-icon>';
        } else {
            avatar.innerHTML = '<iconify-icon icon="mdi:gamepad-variant" style="font-size: 1.5rem; color: white;"></iconify-icon>';
        }
        card.appendChild(avatar);
        
        // Info
        const info = document.createElement('div');
        info.className = 'flex-1 min-w-0';
        info.innerHTML = `
            <div class="text-base sm:text-lg font-black truncate" style="color: ${player.disconnected ? '#6b7280' : '#010101'};">${player.name}</div>
            <div class="text-xs sm:text-sm font-bold" style="color: ${player.disconnected ? '#9ca3af' : cardColor};">
                ${player.disconnected ? 'Desconectado' : (player.isAdmin ? '👑 Admin' : '✓ Conectado')}
            </div>
        `;
        card.appendChild(info);
        
        fragment.appendChild(card);
    });
    
    grid.innerHTML = '';
    grid.appendChild(fragment);

    // Create waiting particles
    createWaitingParticles();

    const adminHint = domCache.adminHint || document.getElementById('adminHint');
    if (adminHint && Object.keys(players).length >= 1) {
        adminHint.classList.remove('hidden');
    }

    updatePlayersStatus();
}

function createWaitingParticles() {
    // Particles disabled - clean white background
}

function updatePlayersStatus() {
    const footerContainer = document.getElementById('playersFooter');
    if (!footerContainer) return;
    
    const footerFragment = document.createDocumentFragment();
    
    Object.values(players).forEach((player, index) => {
        const hasAnswered = answers[player.id] !== undefined;
        
        // Player colors for the card
        const cardColors = ['#0595AE', '#73A03F', '#EB8225', '#AB3D8B'];
        const cardColor = cardColors[index % cardColors.length];
        
        // Footer card (with score)
        const footerCard = document.createElement('div');
        footerCard.className = 'flex flex-col items-center gap-2 bg-white rounded-xl py-3 px-4 transition-all border-3';
        footerCard.style.borderColor = player.disconnected ? '#E0E0E0' : cardColor;
        footerCard.style.boxShadow = player.disconnected ? 'none' : `0 2px 8px ${cardColor}33`;
        footerCard.style.minWidth = 'clamp(80px, 12vw, 120px)';
        footerCard.style.opacity = player.disconnected ? '0.5' : '1';
        
        // Avatar
        const footerAvatar = document.createElement('div');
        footerAvatar.className = 'w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative';
        footerAvatar.style.background = player.disconnected ? '#BDBDBD' : player.color;
        footerAvatar.style.border = `3px solid ${player.disconnected ? '#9E9E9E' : '#fff'}`;
        footerAvatar.style.boxShadow = player.disconnected ? 'none' : `0 2px 8px ${cardColor}44`;
        
        // Status indicator
        if (hasAnswered) {
            footerAvatar.innerHTML = '<span class="text-base sm:text-lg">✓</span>';
        } else if (player.disconnected) {
            footerAvatar.innerHTML = '<span class="text-base sm:text-lg">❌</span>';
        } else {
            footerAvatar.innerHTML = '<span class="text-base sm:text-lg">⏳</span>';
        }
        footerCard.appendChild(footerAvatar);
        
        // Name
        const footerName = document.createElement('div');
        footerName.className = 'font-bold text-xs sm:text-sm truncate text-center';
        footerName.style.color = player.disconnected ? '#9E9E9E' : '#424242';
        footerName.textContent = player.name;
        footerCard.appendChild(footerName);
        
        // Score
        const score = document.createElement('div');
        score.className = 'text-sm sm:text-base font-bold px-2 py-1 rounded-lg';
        score.style.background = player.disconnected ? '#E0E0E0' : cardColor;
        score.style.color = '#fff';
        score.textContent = `${player.score} pts`;
        footerCard.appendChild(score);
        
        footerFragment.appendChild(footerCard);
    });
    
    footerContainer.innerHTML = '';
    footerContainer.appendChild(footerFragment);
}

function startGame() {
    gameState = 'playing';
    currentQuestion = 0;
    
    const categoryQuestions = questions[selectedCategory] || questions.general;
    // Usar la cantidad de preguntas seleccionada, limitada al máximo disponible
    const maxQuestions = Math.min(selectedQuestionCount, categoryQuestions.length);
    gameQuestions = [...categoryQuestions].sort(() => Math.random() - 0.5).slice(0, maxQuestions);
    
    Object.keys(players).forEach(id => {
        players[id].score = 0;
    });

    setCategoryBackground(selectedCategory);
    showScreen('playing');
    
    airconsole.broadcast({ 
        action: 'gameStart',
        category: selectedCategory,
        question: { index: currentQuestion, total: gameQuestions.length }
    });
    
    setTimeout(() => showQuestion(), 300);
}

function showQuestion() {
    answers = {};
    resultsShown = false; // Resetear para la nueva pregunta
    questionStartTime = Date.now();
    timeLeft = 20;
    
    const question = gameQuestions[currentQuestion];
    if (domCache.questionNumber) domCache.questionNumber.textContent = `Pregunta ${currentQuestion + 1} de ${gameQuestions.length}`;
    if (domCache.questionText) domCache.questionText.textContent = question.question;
    
    displayOptions(question);
    updatePlayersStatus();
    updateScoreboard();
    startTimer();
    createPlayingParticles();
    
    airconsole.broadcast({
        action: 'showQuestion',
        questionIndex: currentQuestion,
        totalQuestions: gameQuestions.length
    });
}

function createPlayingParticles() {
    const container = document.getElementById('playingBgParticles');
    if (!container) return;
    
    container.innerHTML = '';
    
    const colors = ['rgba(0, 255, 136, 0.1)', 'rgba(0, 217, 255, 0.1)', 'rgba(255, 153, 0, 0.1)'];
    
    // Create subtle floating particles
    for (let i = 0; i < 8; i++) {
        const particle = document.createElement('div');
        const size = Math.random() * 40 + 20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.className = 'particle';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.borderRadius = '50%';
        particle.style.background = `radial-gradient(circle, ${color}, transparent)`;
        particle.style.boxShadow = `0 0 ${size}px ${color}`;
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.animationDuration = (Math.random() * 15 + 15) + 's';
        particle.style.opacity = '0.3';
        
        container.appendChild(particle);
    }
}

function displayOptions(question) {
    const container = domCache.optionsGrid || document.getElementById('optionsGrid');
    container.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    const categoryColor = categoryColors[selectedCategory] || '#0595AE';
    
    const fragment = document.createDocumentFragment();
    question.options.forEach((option, index) => {
        const card = document.createElement('div');
        const letter = letters[index];
        
        card.className = 'option-card flex items-center rounded-2xl overflow-hidden border-3 shadow-lg transition-all cursor-pointer hover:scale-105 relative';
        card.style.background = categoryColor;
        card.style.borderColor = categoryColor;
        card.style.boxShadow = `0 4px 15px ${categoryColor}66`;
        card.dataset.index = index;
        
        // Letter badge - cuadrado oscuro a la izquierda
        const badge = document.createElement('div');
        badge.className = 'flex items-center justify-center text-lg sm:text-2xl lg:text-3xl font-black flex-shrink-0 relative z-10';
        badge.style.width = 'clamp(60px, 10vw, 90px)';
        badge.style.height = 'clamp(60px, 10vw, 90px)';
        badge.style.background = categoryColor;
        badge.style.filter = 'brightness(0.7)';
        badge.style.color = '#fff';
        badge.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        badge.textContent = letter;
        card.appendChild(badge);
        
        // Option text
        const text = document.createElement('div');
        text.className = 'flex-1 p-3 sm:p-4 lg:p-5 text-sm sm:text-base lg:text-lg font-bold relative z-10';
        text.style.color = '#fff';
        text.style.textShadow = '0 2px 4px rgba(0,0,0,0.3)';
        text.textContent = option;
        card.appendChild(text);
        
        fragment.appendChild(card);
    });
    container.appendChild(fragment);
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 20;
    
    // Resetear la barra al 100% instantáneamente (sin transición)
    const timerBar = document.getElementById('timerBar');
    if (timerBar) {
        timerBar.classList.remove('animating', 'warning', 'danger');
        timerBar.style.transition = 'none';
        timerBar.style.width = '100%';
        // Forzar reflow para aplicar el cambio inmediatamente
        timerBar.offsetHeight;
        // Restaurar la transición después de que la barra esté al 100%
        timerBar.style.transition = '';
        timerBar.classList.add('animating');
    }
    
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        updateProgressBar();
        
        if (timeLeft <= 5) {
            playSound('tick');
        }
        
        if (timeLeft <= 0 && !resultsShown) {
            resultsShown = true;
            clearInterval(timer);
            showResults();
        }
    }, 1000);
}

function updateProgressBar() {
    const timerBar = document.getElementById('timerBar');
    
    if (timerBar) {
        const percentage = (timeLeft / 20) * 100;
        timerBar.style.width = percentage + '%';
        
        // Remove all classes first
        timerBar.classList.remove('warning', 'danger');
        
        // Add appropriate class based on time
        if (timeLeft <= 5) {
            timerBar.classList.add('danger');
        } else if (timeLeft <= 10) {
            timerBar.classList.add('warning');
        }
    }
}

function updateTimerDisplay() {
    const circle = domCache.timerCircle || document.getElementById('timerCircle');
    if (!circle) return;
    
    circle.textContent = timeLeft;
    
    // Change color based on time left
    if (timeLeft <= 5) {
        circle.style.background = '#E53935';
        circle.style.boxShadow = '0 4px 12px rgba(229, 57, 53, 0.4)';
        circle.classList.add('timer-danger');
    } else if (timeLeft <= 10) {
        circle.style.background = '#FFA726';
        circle.style.boxShadow = '0 4px 12px rgba(255, 167, 38, 0.4)';
        circle.classList.add('timer-warning');
        circle.classList.remove('timer-danger');
    } else {
        circle.style.background = '#0595AE';
        circle.style.boxShadow = '0 4px 12px rgba(5, 149, 174, 0.3)';
        circle.classList.remove('timer-warning', 'timer-danger');
    }
}

function handleAnswer(playerId, optionIndex, timestamp) {
    // Ignorar si ya se mostraron los resultados o el jugador ya respondió
    if (resultsShown || answers[playerId] || players[playerId]?.disconnected) return;

    const timeElapsed = timestamp - questionStartTime;
    const isCorrect = optionIndex === gameQuestions[currentQuestion].correct;

    answers[playerId] = {
        option: optionIndex,
        correct: isCorrect,
        time: timeElapsed
    };

    if (isCorrect) {
        const points = Math.max(100, Math.floor(1000 - (timeElapsed / 20)));
        players[playerId].score += points;
        playSound('correct');
        
        airconsole.message(playerId, { 
            action: 'result', 
            correct: true, 
            points: points
        });
    } else {
        playSound('wrong');
        airconsole.message(playerId, { 
            action: 'result', 
            correct: false, 
            points: 0
        });
    }

    updatePlayersStatus();

    // Verificar si todos los jugadores activos han respondido
    const activePlayers = Object.values(players).filter(p => !p.disconnected);
    const answersCount = Object.keys(answers).length;
    
    if (answersCount >= activePlayers.length && !resultsShown) {
        resultsShown = true;
        clearInterval(timer);
        setTimeout(() => showResults(), 800);
    }
}

function showResults() {
    // Protección contra llamadas múltiples
    if (resultsShown === false) {
        resultsShown = true;
    }
    
    clearInterval(timer);
    const question = gameQuestions[currentQuestion];
    
    const options = document.querySelectorAll('.option-card');
    options.forEach((opt, index) => {
        const badge = opt.querySelector('div:first-child');
        
        // Limpiar cualquier indicador previo
        const existingIndicators = opt.querySelectorAll('.answer-indicator');
        existingIndicators.forEach(ind => ind.remove());
        
        if (index === question.correct) {
            // Respuesta correcta - Verde
            opt.style.background = '#00cc66';
            opt.style.borderColor = '#00cc66';
            opt.style.boxShadow = '0 0 30px rgba(0, 204, 102, 0.6), 0 4px 15px rgba(0, 204, 102, 0.4)';
            opt.classList.add('option-correct');
            
            if (badge) {
                badge.style.background = '#009944';
                badge.style.color = '#fff';
            }
            
            // Agregar indicador de respuesta correcta
            const textDiv = opt.querySelector('.flex-1');
            if (textDiv) {
                const indicator = document.createElement('div');
                indicator.className = 'answer-indicator text-xs sm:text-sm font-bold mt-2';
                indicator.style.color = '#fff';
                indicator.textContent = '✓ Respuesta correcta';
                textDiv.appendChild(indicator);
            }
        } else {
            const wasSelected = Object.values(answers).some(a => a.option === index);
            if (wasSelected) {
                // Tu respuesta incorrecta - Rojo
                opt.style.background = '#ff4444';
                opt.style.borderColor = '#ff4444';
                opt.style.boxShadow = '0 0 30px rgba(255, 68, 68, 0.6), 0 4px 15px rgba(255, 68, 68, 0.4)';
                opt.classList.add('option-incorrect');
                
                if (badge) {
                    badge.style.background = '#cc3333';
                    badge.style.color = '#fff';
                }
                
                // Agregar indicador de tu respuesta
                const textDiv = opt.querySelector('.flex-1');
                if (textDiv) {
                    const indicator = document.createElement('div');
                    indicator.className = 'answer-indicator text-xs sm:text-sm font-bold mt-2';
                    indicator.style.color = '#fff';
                    indicator.textContent = '✗ Tu respuesta';
                    textDiv.appendChild(indicator);
                }
            } else {
                // No seleccionada - Gris
                opt.style.background = '#9E9E9E';
                opt.style.borderColor = '#9E9E9E';
                opt.style.boxShadow = '0 2px 8px rgba(158, 158, 158, 0.3)';
                
                if (badge) {
                    badge.style.background = '#757575';
                    badge.style.color = '#fff';
                }
            }
        }
    });

    updateScoreboard();
    
    airconsole.broadcast({
        action: 'showAnswer',
        correctIndex: question.correct
    });

    setTimeout(() => {
        if (currentQuestion < gameQuestions.length - 1) {
            currentQuestion++;
            showQuestion();
            airconsole.broadcast({ 
                action: 'nextQuestion', 
                question: { index: currentQuestion, total: gameQuestions.length }
            });
        } else {
            endGame();
        }
    }, 3500);
}

function updateScoreboard() {
    // Scoreboard is now integrated into the player header cards
    // Just update the player cards with new scores
    updatePlayersStatus();
    
    const sortedPlayers = Object.values(players)
        .filter(p => !p.disconnected)
        .sort((a, b) => b.score - a.score);
    
    airconsole.broadcast({ action: 'leaderboardUpdate', players: sortedPlayers });
}

function endGame() {
    gameState = 'gameEnd';
    showScreen('end');
    
    const sortedPlayers = Object.values(players)
        .filter(p => !p.disconnected)
        .sort((a, b) => b.score - a.score);
    
    const winnerSection = document.getElementById('winnerSection');
    if (sortedPlayers.length > 0) {
        const winner = sortedPlayers[0];
        winnerSection.innerHTML = `
            <div class="text-3xl sm:text-5xl lg:text-6xl mb-2 sm:mb-4">1er Lugar</div>
            <div class="flex justify-center mb-2 sm:mb-4">
                <div class="player-avatar-visual-large" style="background-color: ${winner.color};"></div>
            </div>
            <div class="text-xl sm:text-2xl lg:text-3xl font-bold text-steam-naranja">${winner.name}</div>
            <div class="text-base sm:text-lg lg:text-xl text-steam-verde mt-1 sm:mt-2">${winner.score} puntos</div>
        `;
        
        playSound('victory');
        createConfetti();
    }
    
    const podium = document.getElementById('podium');
    podium.innerHTML = '';
    
    const medals = ['1ro', '2do', '3ro'];
    const podiumBg = ['bg-gradient-to-r from-yellow-100 to-amber-100 border-steam-naranja', 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400', 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-400'];
    
    sortedPlayers.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = `flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl border-2 sm:border-[3px] shadow-md ${podiumBg[index] || 'bg-white border-gray-200'}`;
        item.innerHTML = `
            <div class="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <span class="text-lg sm:text-xl lg:text-2xl font-bold">${medals[index] || `#${index + 1}`}</span>
                <div class="player-avatar-visual" style="background-color: ${player.color};"></div>
                <span class="text-sm sm:text-base lg:text-lg font-bold">${player.name}</span>
            </div>
            <span class="text-base sm:text-lg lg:text-xl font-bold text-steam-turquesa">${player.score} pts</span>
        `;
        podium.appendChild(item);
    });

    airconsole.broadcast({ 
        action: 'gameEnd', 
        winner: sortedPlayers[0],
        players: sortedPlayers
    });
}

function resetGame() {
    gameState = 'categorySelect';
    currentQuestion = 0;
    answers = {};
    clearInterval(timer);
    
    Object.keys(players).forEach(id => {
        players[id].score = 0;
    });
    
    showScreen('category');
    airconsole.broadcast({ action: 'reset', gameState: 'categorySelect' });
}

function exitToCategories() {
    // Stop current game and return to category selection
    gameState = 'categorySelect';
    currentQuestion = 0;
    answers = {};
    clearInterval(timer);
    
    // Reset scores
    Object.keys(players).forEach(id => {
        players[id].score = 0;
    });
    
    showScreen('category');
    
    // Notify all players to return to appropriate screen
    airconsole.broadcast({ action: 'reset', gameState: 'categorySelect' });
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(screen + 'Screen');
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

window.onload = init;