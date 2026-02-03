/**
 * STEAM Platformer - Mobile Controller
 * 
 * Handles player input and communicates with the screen via AirConsole messages.
 * 
 * @fileoverview Controller module for the STEAM Platformer game
 * @version 2.0.0
 */

// ==========================================================================
// CONFIGURATION
// ==========================================================================

const CONFIG = {
    COLORS: [
        { hex: '#73A03F', name: 'Verde' },
        { hex: '#AB3D8B', name: 'Morado' },
        { hex: '#0595AE', name: 'Turquesa' },
        { hex: '#EB8225', name: 'Naranja' }
    ],
    VIBRATION: {
        ERROR: [200, 100, 200],
        SELECT: 25,
        BUTTON: 15,
        WIN: [80, 40, 80, 40, 80],
        DISCONNECT: 100
    },
    ANIMATION_DURATION: {
        BLINK: 600,
        JUMP: 500
    }
};

// ==========================================================================
// MESSAGE PROTOCOL
// ==========================================================================

/**
 * Message Protocol Documentation
 * 
 * CONTROLLER → SCREEN:
 * - { action: 'requestJoin' } - Request to join (sent when controller is ready)
 * - { action: 'join' } - User pressed join button
 * - { action: 'selectColor', color: string, colorName: string }
 * - { action: 'startGame' } - Admin only
 * - { action: 'playAgain' } - Admin only
 * - { action: 'nextLevel' } - Admin only
 * - { action: 'goToLevelSelect' } - Admin only
 * - { action: 'move', direction: 'left' | 'right' }
 * - { action: 'stop' }
 * - { action: 'jump', pressed: boolean }
 * 
 * SCREEN → CONTROLLER:
 * - { action: 'canJoin' } - Screen is ready, player can join
 * - { action: 'joined', playerNum, color, colorName, isAdmin }
 * - { action: 'reconnected', playerNum, color, colorName, isAdmin }
 * - { action: 'gameFull' }
 * - { action: 'colorUpdated', color, colorName }
 * - { action: 'gameState', players }
 * - { action: 'levelChanged', level, name }
 * - { action: 'playerDisconnected', playerNum, playerName }
 * - { action: 'gameStart' }
 * - { action: 'gameRestart' }
 * - { action: 'gameResults', results, winner, levelCompleted, hasNextLevel }
 */

// ==========================================================================
// DOM UTILITIES
// ==========================================================================

const DOM = {
    get: (id) => document.getElementById(id),
    
    elements: {
        // Screens
        joinScreen: null,
        selectScreen: null,
        gameScreen: null,
        resultsScreen: null,
        
        // Join screen
        connectingMsg: null,
        joinBtn: null,
        errorMsg: null,
        
        // Select screen
        adminBadge: null,
        avatarDisplay: null,
        colorGrid: null,
        startBtn: null,
        waitingHint: null,
        
        // Game screen
        gameAvatar: null,
        gameName: null,
        jumpBtn: null,
        leftBtn: null,
        rightBtn: null,
        
        // Results screen
        rankDisplay: null,
        resultAvatar: null,
        resultMsg: null,
        resultScore: null,
        nextLevelBtn: null,
        levelSelectBtn: null,
        waitingResult: null
    },
    
    init() {
        // Cache all DOM elements
        this.elements.joinScreen = this.get('joinScreen');
        this.elements.selectScreen = this.get('selectScreen');
        this.elements.gameScreen = this.get('gameScreen');
        this.elements.resultsScreen = this.get('resultsScreen');
        
        this.elements.connectingMsg = this.get('connectingMsg');
        this.elements.joinBtn = this.get('joinBtn');
        this.elements.errorMsg = this.get('errorMsg');
        
        this.elements.adminBadge = this.get('adminBadge');
        this.elements.avatarDisplay = this.get('avatarDisplay');
        this.elements.colorGrid = this.get('colorGrid');
        this.elements.startBtn = this.get('startBtn');
        this.elements.waitingHint = this.get('waitingHint');
        
        this.elements.gameAvatar = this.get('gameAvatar');
        this.elements.gameName = this.get('gameName');
        this.elements.jumpBtn = this.get('jumpBtn');
        this.elements.leftBtn = this.get('leftBtn');
        this.elements.rightBtn = this.get('rightBtn');
        
        this.elements.rankDisplay = this.get('rankDisplay');
        this.elements.resultAvatar = this.get('resultAvatar');
        this.elements.resultMsg = this.get('resultMsg');
        this.elements.resultScore = this.get('resultScore');
        this.elements.nextLevelBtn = this.get('nextLevelBtn');
        this.elements.levelSelectBtn = this.get('levelSelectBtn');
        this.elements.waitingResult = this.get('waitingResult');
    }
};

// ==========================================================================
// VIBRATION MANAGER
// ==========================================================================

const Vibration = {
    trigger(pattern) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }
};

// ==========================================================================
// SCREEN MANAGER
// ==========================================================================

const ScreenManager = {
    screens: ['join', 'select', 'game', 'results'],
    
    show(name) {
        this.screens.forEach(s => {
            const el = DOM.get(s + 'Screen');
            const isTarget = s === name;
            el.classList.toggle('hidden', !isTarget);
            el.classList.toggle('flex', isTarget);
        });
    }
};

// ==========================================================================
// AVATAR MANAGER
// ==========================================================================

const AvatarManager = {
    update(player) {
        DOM.elements.avatarDisplay.style.background = player.color;
        DOM.elements.gameAvatar.style.background = player.color;
        DOM.elements.gameName.textContent = player.name;
        DOM.elements.resultAvatar.style.background = player.color;
    },
    
    playAnimation(type) {
        const avatar = DOM.elements.avatarDisplay;
        
        avatar.classList.remove('jump', 'blink');
        void avatar.offsetWidth; // Force reflow
        
        if (type === 'jump') {
            avatar.classList.add('jump', 'blink');
            setTimeout(() => avatar.classList.remove('blink'), CONFIG.ANIMATION_DURATION.BLINK);
            setTimeout(() => avatar.classList.remove('jump'), CONFIG.ANIMATION_DURATION.JUMP);
        }
    }
};

// ==========================================================================
// CONTROLLER
// ==========================================================================

const Controller = {
    airconsole: null,
    player: { num: null, color: '#73A03F', name: 'Verde', isAdmin: false },
    keys: { left: false, right: false, jump: false },
    controlsBound: false,
    
    send(msg) {
        if (this.airconsole && msg) {
            this.airconsole.message(AirConsole.SCREEN, msg);
        }
    },
    
    _handleMessage(data) {
        const handlers = {
            'canJoin': () => this._onCanJoin(),
            'joined': () => this._onJoined(data),
            'reconnected': () => this._onJoined(data),
            'gameFull': () => this._onGameFull(),
            'colorUpdated': () => this._onColorUpdated(data),
            'gameState': () => {},
            'levelChanged': () => {},
            'playerDisconnected': () => this._onPlayerDisconnected(data),
            'gameStart': () => this._onGameStart(),
            'gameRestart': () => this._onGameRestart(),
            'gameResults': () => this._onGameResults(data)
        };
        
        const handler = handlers[data.action];
        if (handler) handler();
    },
    
    _onCanJoin() {
        // Screen confirmed we can join - ensure button is visible
        DOM.elements.connectingMsg.classList.add('hidden');
        DOM.elements.joinBtn.classList.remove('hidden');
        DOM.elements.errorMsg.classList.add('hidden');
    },
    
    _onJoined(data) {
        // Hide join button
        DOM.elements.joinBtn.classList.add('hidden');
        DOM.elements.connectingMsg.classList.add('hidden');
        DOM.elements.errorMsg.classList.add('hidden');
        
        this.player = {
            num: data.playerNum,
            color: data.color,
            name: data.colorName,
            isAdmin: data.isAdmin
        };
        this._setupSelectScreen();
        ScreenManager.show('select');
    },
    
    _onGameFull() {
        DOM.elements.connectingMsg.classList.add('hidden');
        DOM.elements.joinBtn.classList.add('hidden');
        DOM.elements.errorMsg.classList.remove('hidden');
        Vibration.trigger(CONFIG.VIBRATION.ERROR);
    },
    
    _onColorUpdated(data) {
        this.player.color = data.color;
        this.player.name = data.colorName;
        AvatarManager.update(this.player);
    },
    
    _onPlayerDisconnected(data) {
        if (data.playerNum !== this.player.num) {
            Vibration.trigger(CONFIG.VIBRATION.DISCONNECT);
        }
    },
    
    _onGameStart() {
        ScreenManager.show('game');
        this._setupControls();
    },
    
    _onGameRestart() {
        ScreenManager.show('join');
        // Show join button immediately when restarting
        DOM.elements.connectingMsg.classList.add('hidden');
        DOM.elements.joinBtn.classList.remove('hidden');
        DOM.elements.errorMsg.classList.add('hidden');
        this.player = { num: null, color: '#73A03F', name: 'Verde', isAdmin: false };
        // Request to join again
        this.send({ action: 'requestJoin' });
    },
    
    _onGameResults(data) {
        this._showResults(data.results, data.winner, data.levelCompleted, data.hasNextLevel);
    },
    
    _setupEventListeners() {
        DOM.elements.joinBtn.onclick = () => {
            // User pressed join - send join request
            this.send({ action: 'join' });
            // Show connecting state while waiting for response
            DOM.elements.joinBtn.classList.add('hidden');
            DOM.elements.connectingMsg.classList.remove('hidden');
            DOM.elements.errorMsg.classList.add('hidden');
        };
        DOM.elements.startBtn.onclick = () => this.send({ action: 'startGame' });
        DOM.elements.nextLevelBtn.onclick = () => this.send({ action: 'nextLevel' });
        DOM.elements.levelSelectBtn.onclick = () => this.send({ action: 'goToLevelSelect' });
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
        document.addEventListener('gesturestart', e => e.preventDefault());
    },
    
    _setupSelectScreen() {
        AvatarManager.update(this.player);
        AvatarManager.playAnimation('jump');
        
        DOM.elements.adminBadge.classList.toggle('hidden', !this.player.isAdmin);
        DOM.elements.startBtn.classList.toggle('hidden', !this.player.isAdmin);
        DOM.elements.waitingHint.classList.toggle('hidden', this.player.isAdmin);
        
        this._renderColorPicker();
    },
    
    _renderColorPicker() {
        const grid = DOM.elements.colorGrid;
        grid.innerHTML = '';
        
        CONFIG.COLORS.forEach(color => {
            const wrapper = document.createElement('div');
            wrapper.className = 'flex flex-col items-center gap-2';
            
            const btn = document.createElement('div');
            btn.className = `color-btn ${color.hex === this.player.color ? 'selected' : ''}`;
            btn.style.background = color.hex;
            btn.onclick = () => this._selectColor(color.hex, color.name);
            
            const label = document.createElement('span');
            label.className = 'text-xs font-bold text-gray-600';
            label.textContent = color.name;
            
            wrapper.appendChild(btn);
            wrapper.appendChild(label);
            grid.appendChild(wrapper);
        });
    },
    
    _selectColor(hex, name) {
        this.player.color = hex;
        this.player.name = name;
        AvatarManager.update(this.player);
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.style.background === hex);
        });
        
        AvatarManager.playAnimation('jump');
        this.send({ action: 'selectColor', color: hex, colorName: name });
        Vibration.trigger(CONFIG.VIBRATION.SELECT);
    },
    
    _setupControls() {
        if (this.controlsBound) return;
        this.controlsBound = true;
        
        const buttons = [
            [DOM.elements.leftBtn, 'left'],
            [DOM.elements.rightBtn, 'right'],
            [DOM.elements.jumpBtn, 'jump']
        ];
        
        buttons.forEach(([element, action]) => {
            // Touch events
            ['touchstart', 'touchend', 'touchcancel'].forEach(evt => {
                element.addEventListener(evt, (e) => {
                    e.preventDefault();
                    this._handleInput(action, evt === 'touchstart', element);
                }, { passive: false });
            });
            
            // Mouse events (for testing)
            element.addEventListener('mousedown', () => this._handleInput(action, true, element));
            element.addEventListener('mouseup', () => this._handleInput(action, false, element));
            element.addEventListener('mouseleave', () => this._handleInput(action, false, element));
        });
    },
    
    _handleInput(action, pressed, element) {
        element.classList.toggle('pressed', pressed);
        
        if (pressed) {
            Vibration.trigger(CONFIG.VIBRATION.BUTTON);
        }
        
        if (action === 'jump') {
            this._handleJump(pressed);
        } else {
            this._handleMove(action, pressed);
        }
    },
    
    _handleJump(pressed) {
        if (pressed && !this.keys.jump) {
            this.keys.jump = true;
            this.send({ action: 'jump', pressed: true });
        } else if (!pressed && this.keys.jump) {
            this.keys.jump = false;
            this.send({ action: 'jump', pressed: false });
        }
    },
    
    _handleMove(direction, pressed) {
        const opposite = direction === 'left' ? 'right' : 'left';
        
        if (pressed) {
            this.keys[direction] = true;
            this.keys[opposite] = false;
            this.send({ action: 'move', direction });
        } else if (this.keys[direction]) {
            this.keys[direction] = false;
            this.send(this.keys[opposite] ? { action: 'move', direction: opposite } : { action: 'stop' });
        }
    },
    
    _showResults(results, winner, levelCompleted, hasNextLevel) {
        ScreenManager.show('results');
        
        const me = results.find(r => r.num == this.player.num);
        const rank = me ? results.indexOf(me) + 1 : results.length;
        
        const medals = ['1ro', '2do', '3ro'];
        const colors = ['#EB8225', '#0595AE', '#AB3D8B'];
        
        DOM.elements.rankDisplay.textContent = medals[rank - 1] || `#${rank}`;
        DOM.elements.rankDisplay.style.color = colors[rank - 1] || '#73A03F';
        
        if (winner?.num == this.player.num) {
            DOM.elements.resultMsg.textContent = 'GANASTE!';
            DOM.elements.resultMsg.style.color = '#EB8225';
            Vibration.trigger(CONFIG.VIBRATION.WIN);
        } else {
            DOM.elements.resultMsg.textContent = winner ? `Gano ${winner.name}` : 'Buen juego!';
            DOM.elements.resultMsg.style.color = '#0595AE';
        }
        
        DOM.elements.resultScore.textContent = `${me?.score || 0} pts`;
        
        // Show/hide buttons based on admin status
        if (this.player.isAdmin) {
            const showNextLevel = levelCompleted && hasNextLevel;
            DOM.elements.nextLevelBtn.classList.toggle('hidden', !showNextLevel);
            DOM.elements.levelSelectBtn.classList.remove('hidden');
            DOM.elements.waitingResult.classList.add('hidden');
        } else {
            DOM.elements.nextLevelBtn.classList.add('hidden');
            DOM.elements.levelSelectBtn.classList.add('hidden');
            DOM.elements.waitingResult.classList.remove('hidden');
        }
    },
    
    resetKeys() {
        this.keys = { left: false, right: false, jump: false };
    }
};

// ==========================================================================
// INITIALIZATION (following AirConsole quick-start pattern)
// ==========================================================================

// Initialize DOM
DOM.init();

// Create AirConsole instance
var airconsole = new AirConsole();
Controller.airconsole = airconsole;

// AirConsole ready handler
airconsole.onReady = function() {
    // Controller is connected and ready
    // Button is already visible from HTML, just ensure connecting is hidden
    DOM.elements.connectingMsg.classList.add('hidden');
    DOM.elements.joinBtn.classList.remove('hidden');
    DOM.elements.errorMsg.classList.add('hidden');
};

// Listen for messages from screen
airconsole.onMessage = function(from, data) {
    if (data && data.action) {
        Controller._handleMessage(data);
    }
};

// Setup UI event listeners
Controller._setupEventListeners();
