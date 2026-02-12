const categories = {
    general: { name: "General", icon: "mdi:earth" },
    science: { name: "Ciencia", icon: "mdi:microscope" },
    mathematics: { name: "Matemáticas", icon: "mdi:compass-outline" },
    robotics: { name: "Robótica", icon: "mdi:robot-outline" },
    chemistry: { name: "Química", icon: "mdi:flask-outline" },
    technology: { name: "Tecnología", icon: "mdi:laptop" },
    history: { name: "Historia", icon: "mdi:book-open-outline" },
    geography: { name: "Geografía", icon: "mdi:map-outline" }
};

const categoryColors = {
    general: '#0595AE',
    science: '#73A03F',
    mathematics: '#0595AE',
    robotics: '#AB3D8B',
    chemistry: '#EB8225',
    technology: '#AB3D8B',
    history: '#EB8225',
    geography: '#0595AE'
};

let airconsole;
let playerName = '';
let playerColor = '';
let isAdmin = false;
let hasAnswered = false;
let myScore = 0;
let myRank = 1;
let selectedCategory = 'general';
let selectedQuestionCount = 10;
let hasJoined = false;
let currentStep = 1;
let questionReceivedAt = 0; // Momento en que este controlador recibe la pregunta (reloj local)

const domCache = {};

function cacheDom() {
    domCache.playerAvatar = document.getElementById('playerAvatar');
    domCache.playerNameDisplay = document.getElementById('playerNameDisplay');
    domCache.adminAvatar = document.getElementById('adminAvatar');
    domCache.adminNameDisplay = document.getElementById('adminNameDisplay');
    domCache.miniAvatar = document.getElementById('miniAvatar');
    domCache.miniName = document.getElementById('miniName');
    domCache.miniScore = document.getElementById('miniScore');
    domCache.miniRank = document.getElementById('miniRank');
    domCache.resultAvatar = document.getElementById('resultAvatar');
    domCache.questionIndicator = document.getElementById('questionIndicator');
    domCache.resultOverlay = document.getElementById('resultOverlay');
    domCache.resultContent = document.getElementById('resultContent');
    domCache.answerButtons = document.querySelectorAll('.answer-btn');
}

function sendMessage(msg) {
    airconsole.message(AirConsole.SCREEN, msg);
}

function init() {
    airconsole = new AirConsole();
    cacheDom();

    airconsole.onReady = function() {
        setupCategoryGrid();
        setupAnswerButtons();
        setupStepNavigation();
        playerName = airconsole.getNickname() || `Player ${airconsole.device_id}`;
    };

    airconsole.onMessage = function(from, data) {
        switch(data.action) {
            case 'joined':
                handleJoined(data);
                break;
            case 'reconnected':
                handleReconnected(data);
                break;
            case 'gameFull':
                handleGameFull();
                break;
            case 'gameInProgress':
                handleGameInProgress(data.message);
                break;
            case 'gameStateUpdate':
                handleGameStateUpdate(data);
                break;
            case 'categorySelected':
                updateSelectedCategory(data.category);
                break;
            case 'gameStart':
                handleGameStart(data);
                break;
            case 'showQuestion':
                handleShowQuestion(data);
                break;
            case 'result':
                showResult(data.correct, data.points);
                break;
            case 'showAnswer':
                handleShowAnswer(data.correctIndex);
                break;
            case 'nextQuestion':
                handleNextQuestion(data);
                break;
            case 'leaderboardUpdate':
                updateRank(data.players);
                break;
            case 'gameEnd':
                showEndScreen(data.winner, data.players);
                break;
            case 'reset':
            case 'exitGame':
                handleReset(data);
                break;
        }
    };

    // Join button
    document.getElementById('joinBtn').addEventListener('click', () => {
        if (!hasJoined) {
            hasJoined = true;
            document.getElementById('joinBtn').classList.add('hidden');
            document.getElementById('connectingMsg').classList.remove('hidden');
            sendMessage({ action: 'join', name: playerName });
        }
    });
    
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
    document.getElementById('exitGameBtn').addEventListener('click', exitGame);
    
    // Question count buttons
    document.getElementById('decreaseQuestions').addEventListener('click', () => {
        if (selectedQuestionCount > 5) {
            selectedQuestionCount -= 5;
            updateQuestionCountDisplay();
            sendMessage({ action: 'setQuestionCount', count: selectedQuestionCount });
        }
    });
    
    document.getElementById('increaseQuestions').addEventListener('click', () => {
        if (selectedQuestionCount < 50) {
            selectedQuestionCount += 5;
            updateQuestionCountDisplay();
            sendMessage({ action: 'setQuestionCount', count: selectedQuestionCount });
        }
    });
}

function updateQuestionCountDisplay() {
    const countDisplay = document.getElementById('questionCountValue');
    if (countDisplay) {
        countDisplay.textContent = selectedQuestionCount;
    }
}

function createJoinParticles() {
    // Particles disabled - clean background
}

function createWaitingControllerParticles() {
    createControllerParticles(selectedCategory, 'waitingControllerBgParticles');
}

function setupCategoryGrid() {
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
        geography: '#0595AE'
    };
    
    // Image mapping - using local webp assets
    const categoryImages = {
        general: '../assets/images/globo.webp',
        science: '../assets/images/microscopio.webp',
        mathematics: '../assets/images/calculadora.webp',
        robotics: '../assets/images/programacion.webp',
        chemistry: '../assets/images/estructura quimica.webp',
        technology: '../assets/images/programacion.webp',
        history: '../assets/images/libro.webp',
        geography: '../assets/images/planeta.webp'
    };
    
    Object.entries(categories).forEach(([key, cat]) => {
        const btnColor = categoryColors[key] || categoryColors.general;
        const isSelected = key === selectedCategory;
        const btn = document.createElement('div');
        btn.className = 'category-btn rounded-xl p-2 text-center cursor-pointer transition-all active:scale-95';
        btn.dataset.category = key;
        btn.dataset.color = btnColor;
        
        if (isSelected) {
            btn.classList.add('selected');
            btn.style.background = 'transparent';
            btn.style.borderColor = btnColor;
        } else {
            btn.style.background = 'transparent';
            btn.style.borderColor = '';
        }
        
        btn.innerHTML = `
            <img src="${categoryImages[key]}" alt="${cat.name}" class="category-icon-img mb-1">
            <div class="category-name text-xs font-bold">${cat.name}</div>
        `;
        btn.addEventListener('click', () => selectCategory(key));
        grid.appendChild(btn);
    });
    
    // Initialize particles for selected category (not just if admin)
    createControllerParticles(selectedCategory);
}

function setupAnswerButtons() {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (!hasAnswered && !btn.disabled) {
                selectAnswer(parseInt(btn.dataset.option));
            }
        });
    });
}

function setupStepNavigation() {
    // Step 1 -> Step 2
    document.getElementById('nextStep1Btn').addEventListener('click', () => {
        goToStep(2);
    });
    
    // Step 2 -> Step 1
    document.getElementById('prevStep2Btn').addEventListener('click', () => {
        goToStep(1);
    });
    
    // Step 2 -> Step 3
    document.getElementById('nextStep2Btn').addEventListener('click', () => {
        goToStep(3);
    });
    
    // Step 3 -> Step 2
    document.getElementById('prevStep3Btn').addEventListener('click', () => {
        goToStep(2);
    });
}

function goToStep(step) {
    currentStep = step;
    
    // Update progress bar
    const progressBar = document.getElementById('wizardProgress');
    if (progressBar) {
        const progressWidth = (step / 3) * 100;
        progressBar.style.width = progressWidth + '%';
    }
    
    // Update step label items (new style)
    document.querySelectorAll('.step-label-item').forEach((item, index) => {
        const stepNum = index + 1;
        item.classList.remove('active', 'completed');
        if (stepNum < step) {
            item.classList.add('completed');
        } else if (stepNum === step) {
            item.classList.add('active');
        }
    });
    
    // Update legacy step indicators (for compatibility)
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');
        if (stepNum < step) {
            indicator.classList.add('completed');
        } else if (stepNum === step) {
            indicator.classList.add('active');
        }
    });
    
    // Update step lines
    document.querySelectorAll('.step-line').forEach((line, index) => {
        if (index < step - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });
    
    // Show correct step content
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById('step' + step).classList.add('active');
    
    // Update step 2 preview
    if (step === 2) {
        const cat = categories[selectedCategory];
        document.getElementById('selectedCatIcon').setAttribute('icon', cat.icon);
        document.getElementById('selectedCatName').textContent = cat.name;
    }
    
    // Update step 3 summary
    if (step === 3) {
        const cat = categories[selectedCategory];
        document.getElementById('finalCatIcon').setAttribute('icon', cat.icon);
        document.getElementById('finalCatName').textContent = cat.name;
        document.getElementById('finalQuestionCount').textContent = selectedQuestionCount;
    }
}

function handleJoined(data) {
    playerColor = data.color;
    isAdmin = data.isAdmin;
    
    if (data.score !== undefined) {
        myScore = data.score;
    }
    
    updateAvatarDisplays();
    
    if (data.selectedCategory) {
        updateSelectedCategory(data.selectedCategory);
    }
    
    // Ocultar mensaje de conexión cuando se conecta exitosamente
    document.getElementById('connectingMsg').classList.add('hidden');
    document.getElementById('errorMsg').classList.add('hidden');
    
    if (isAdmin) {
        currentStep = 1;
        goToStep(1);
        setupCategoryGrid();
        showScreen('categorySelect');
    } else {
        createWaitingControllerParticles();
        showScreen('waiting');
    }
}

function handleReconnected(data) {
    playerColor = data.color;
    isAdmin = data.isAdmin;
    
    if (data.score !== undefined) {
        myScore = data.score;
        if (domCache.miniScore) domCache.miniScore.textContent = myScore;
    }
    
    updateAvatarDisplays();
    
    if (data.selectedCategory) {
        updateSelectedCategory(data.selectedCategory);
    }
    
    // Ocultar mensaje de conexión cuando se reconecta exitosamente
    document.getElementById('connectingMsg').classList.add('hidden');
    document.getElementById('errorMsg').classList.add('hidden');
    
    // Resume appropriate screen based on game state
    if (data.gameState === 'playing') {
        showScreen('playing');
        resetAnswer();
    } else if (data.gameState === 'gameEnd') {
        // Will receive gameEnd message separately
        showScreen('waiting');
    } else if (data.gameState === 'categorySelect') {
        if (isAdmin) {
            setupCategoryGrid();
            showScreen('categorySelect');
        } else {
            createWaitingControllerParticles();
            showScreen('waiting');
        }
    } else {
        if (isAdmin) {
            setupCategoryGrid();
            showScreen('categorySelect');
        } else {
            createWaitingControllerParticles();
            showScreen('waiting');
        }
    }
}

function handleGameFull() {
    document.getElementById('connectingMsg').classList.add('hidden');
    document.getElementById('errorMsg').classList.remove('hidden');
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function handleGameInProgress(message) {
    document.getElementById('connectingMsg').classList.add('hidden');
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.classList.remove('hidden');
    
    // Update error message text
    const errorText = errorMsg.querySelector('p');
    if (errorText) {
        errorText.textContent = message || 'El juego ya está en progreso. Espera a que termine.';
    }
    
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}

function updateAvatarDisplays() {
    if (domCache.playerAvatar) {
        domCache.playerAvatar.style.backgroundColor = playerColor;
    }
    if (domCache.playerNameDisplay) domCache.playerNameDisplay.textContent = playerName;
    
    if (domCache.adminAvatar) {
        domCache.adminAvatar.style.backgroundColor = playerColor;
    }
    if (domCache.adminNameDisplay) domCache.adminNameDisplay.textContent = playerName;
    
    if (domCache.miniAvatar) {
        domCache.miniAvatar.style.backgroundColor = playerColor;
    }
    if (domCache.miniName) domCache.miniName.textContent = playerName;
    
    if (domCache.resultAvatar) {
        domCache.resultAvatar.style.backgroundColor = playerColor;
    }
}

function handleGameStateUpdate(data) {
    if (data.selectedCategory) {
        updateSelectedCategory(data.selectedCategory);
    }
}

function selectCategory(category) {
    selectedCategory = category;
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnCategory = btn.dataset.category;
        const btnColor = btn.dataset.color;
        const isSelected = btnCategory === category;
        
        if (isSelected) {
            btn.classList.add('selected');
            btn.style.background = btnColor;
            btn.style.borderColor = btnColor;
        } else {
            btn.classList.remove('selected');
            btn.style.background = '';
            btn.style.borderColor = '';
        }
        
        const text = btn.querySelector('.category-name');
        if (text) text.style.color = isSelected ? '#FFFFFF' : '';
        
        if (isSelected) {
            const icon = btn.querySelector('.category-icon-img');
            if (icon && anime && anime.animate) {
                anime.animate(icon, {
                    scale: [1, 1.2, 0.95, 1.05, 1],
                    duration: 700,
                    ease: 'easeOutElastic(1, .6)'
                });
            }
        }
    });
    
    // Create background particles
    createControllerParticles(category);
    
    sendMessage({ action: 'selectCategory', category: category });
}

function createControllerParticles(category, containerId) {
    const container = document.getElementById(containerId || 'controllerBgParticles');
    if (!container) return;
    container.innerHTML = '';
}

function updateSelectedCategory(category) {
    selectedCategory = category;
    
    const cat = categories[category];
    const catColor = categoryColors[category] || '#0595AE';
    
    if (cat) {
        const emojiEl = document.getElementById('selectedCategoryEmoji');
        emojiEl.innerHTML = `<iconify-icon icon="${cat.icon}" style="font-size: clamp(3rem, 10vw, 4rem); color: ${catColor};"></iconify-icon>`;
        document.getElementById('selectedCategoryName').textContent = cat.name;
        document.getElementById('selectedCategoryDisplay').classList.remove('hidden');
    }
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        const btnCategory = btn.dataset.category;
        const btnColor = btn.dataset.color;
        const isSelected = btnCategory === category;
        
        if (isSelected) {
            btn.classList.add('selected');
            btn.style.background = btnColor;
            btn.style.borderColor = btnColor;
        } else {
            btn.classList.remove('selected');
            btn.style.background = '';
            btn.style.borderColor = '';
        }
        
        const text = btn.querySelector('.category-name');
        if (text) text.style.color = isSelected ? '#FFFFFF' : '';
    });
    
    // Update background particles (admin and waiting screens)
    createControllerParticles(category);
    createControllerParticles(category, 'waitingControllerBgParticles');
}

function startGame() {
    sendMessage({ action: 'startGame' });
}

function handleGameStart(data) {
    myScore = 0;
    myRank = 1;
    if (domCache.miniScore) domCache.miniScore.textContent = '0';
    if (domCache.miniRank) domCache.miniRank.textContent = 'Rank 1';
    
    // Show exit button for admin
    if (isAdmin) {
        document.getElementById('adminExitContainer').style.display = 'block';
    }
    
    showScreen('playing');
    resetAnswer();
}

function handleShowQuestion(data) {
    questionReceivedAt = Date.now(); // Cada controlador mide desde que recibe la pregunta (evita desincronización de relojes)
    if (domCache.questionIndicator) {
        domCache.questionIndicator.textContent = `Pregunta ${data.questionIndex + 1} de ${data.totalQuestions}`;
    }
    resetAnswer();
}

function handleNextQuestion(data) {
    questionReceivedAt = Date.now();
    if (domCache.questionIndicator) {
        domCache.questionIndicator.textContent = `Pregunta ${data.question.index + 1} de ${data.question.total}`;
    }
    resetAnswer();
}

function selectAnswer(optionIndex) {
    if (hasAnswered) return;
    hasAnswered = true;
    
    // Usar tiempo medido en este dispositivo (evita problemas con relojes desincronizados TV vs teléfono)
    const timeElapsed = Math.max(0, Date.now() - questionReceivedAt);
    
    sendMessage({
        action: 'answer',
        option: optionIndex,
        timeElapsed: timeElapsed
    });
    
    if (domCache.answerButtons) {
        domCache.answerButtons.forEach(btn => {
            btn.disabled = true;
            if (parseInt(btn.dataset.option) === optionIndex) {
                btn.classList.add('selected');
            }
        });
    }
    
    if (navigator.vibrate) navigator.vibrate(40);
}

function resetAnswer() {
    hasAnswered = false;
    if (domCache.answerButtons) {
        domCache.answerButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected', 'correct-highlight', 'wrong-highlight');
        });
    }
    if (domCache.resultOverlay) {
        domCache.resultOverlay.classList.add('hidden');
        domCache.resultOverlay.classList.remove('flex');
    }
}

function showResult(correct, points) {
    const overlay = domCache.resultOverlay;
    const content = domCache.resultContent;
    if (!overlay || !content) return;
    
    if (correct) {
        content.innerHTML = `
            <div class="text-5xl sm:text-6xl mb-3 sm:mb-4 text-steam-verde">✓</div>
            <div class="text-xl sm:text-2xl font-bold mb-2 text-steam-verde">Correcto!</div>
            <div class="text-lg sm:text-xl text-steam-naranja">+${points} pts</div>
        `;
        myScore += points;
        if (domCache.miniScore) domCache.miniScore.textContent = myScore;
        if (navigator.vibrate) navigator.vibrate([40, 20, 40]);
    } else {
        content.innerHTML = `
            <div class="text-5xl sm:text-6xl mb-3 sm:mb-4 text-steam-morado">✗</div>
            <div class="text-xl sm:text-2xl font-bold mb-2 text-steam-morado">Incorrecto</div>
            <div class="text-lg sm:text-xl text-gray-500">0 pts</div>
        `;
        if (navigator.vibrate) navigator.vibrate(150);
    }
    
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    
    setTimeout(() => {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
    }, 1200);
}

function handleShowAnswer(correctIndex) {
    if (domCache.answerButtons) {
        domCache.answerButtons.forEach(btn => {
            const idx = parseInt(btn.dataset.option);
            if (idx === correctIndex) {
                btn.classList.add('correct-highlight');
            } else if (btn.classList.contains('selected')) {
                btn.classList.add('wrong-highlight');
            }
        });
    }
}

function updateRank(players) {
    const myPlayer = players.find(p => p.name === playerName);
    if (myPlayer) {
        myRank = players.indexOf(myPlayer) + 1;
        myScore = myPlayer.score;
        if (domCache.miniRank) domCache.miniRank.textContent = `Rank ${myRank}`;
        if (domCache.miniScore) domCache.miniScore.textContent = myScore;
    }
}

function showEndScreen(winner, players) {
    showScreen('end');
    
    const myPlayer = players.find(p => p.name === playerName);
    const rank = myPlayer ? players.indexOf(myPlayer) + 1 : players.length;
    
    const medals = ['1ro', '2do', '3ro'];
    document.getElementById('finalRank').textContent = medals[rank - 1] || `#${rank}`;
    
    if (winner && winner.name === playerName) {
        document.getElementById('finalMessage').textContent = 'GANASTE!';
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 100]);
    } else if (winner) {
        document.getElementById('finalMessage').textContent = `Gano ${winner.name}`;
    }
    
    document.getElementById('finalScore').textContent = `${myPlayer?.score || 0} puntos`;
    
    document.getElementById('playAgainBtn').classList.toggle('hidden', !isAdmin);
    document.getElementById('waitingNextText').classList.toggle('hidden', isAdmin);
}

function playAgain() {
    sendMessage({ action: 'playAgain' });
}

function exitGame() {
    if (confirm('¿Estás seguro de que quieres salir del juego? Se perderá el progreso actual.')) {
        sendMessage({ action: 'exitGame' });
    }
}

function handleReset(data) {
    hasAnswered = false;
    myScore = 0;
    myRank = 1;
    currentStep = 1;
    if (domCache.miniScore) domCache.miniScore.textContent = '0';
    if (domCache.miniRank) domCache.miniRank.textContent = 'Rank 1';
    
    // Hide exit button
    document.getElementById('adminExitContainer').style.display = 'none';
    
    // Reset error messages
    document.getElementById('connectingMsg').classList.remove('hidden');
    document.getElementById('errorMsg').classList.add('hidden');
    
    // Reset to step 1 for admin
    if (isAdmin) {
        goToStep(1);
        setupCategoryGrid();
        showScreen('categorySelect');
    } else {
        showScreen('waiting');
    }
    resetAnswer();
}

const screenCache = {};
function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    if (!screenCache[screen]) {
        screenCache[screen] = document.getElementById(screen + 'Screen');
    }
    if (screenCache[screen]) {
        screenCache[screen].classList.add('active');
    }
    // Evitar que el overlay de resultado bloquee clics al volver a categorías u otras pantallas
    if (domCache.resultOverlay) {
        domCache.resultOverlay.classList.add('hidden');
        domCache.resultOverlay.classList.remove('flex');
    }
}

window.onload = init;
