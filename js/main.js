// ---- DEFINICIONES Y ESTADO DEL JUEGO (ACTUALIZADO) ----
const upgrades = {
    // --- Mejoras existentes ---
    'tecladoTonos': {
        name: 'Teclado de Tonos DTMF',
        description: 'Aumenta el dinero por clic.',
        type: 'dpc',
        baseCost: 10,
        baseEffect: 1,
    },
    'lineaCobre': {
        name: 'Instalar Línea de Cobre',
        description: 'Genera ingresos pasivos.',
        type: 'dps',
        baseCost: 15,
        baseEffect: 1,
    },
    // --- NUEVAS MEJORAS ---
    'softwareTerminal': { // NUEVO
        name: 'Software de Terminal',
        description: 'Optimiza cada conexión para procesar datos más rápido.',
        type: 'dpc',
        baseCost: 120,
        baseEffect: 8,
    },
    'antenaRepetidora': {
        name: 'Instalar Antena Repetidora',
        description: 'Aumenta significativamente los ingresos pasivos.',
        type: 'dps',
        baseCost: 100,
        baseEffect: 8,
    },
    'modem2400': { // NUEVO
        name: 'Módem de 2400 baudios',
        description: 'Transmite datos el doble de rápido que los modelos antiguos.',
        type: 'dps',
        baseCost: 550,
        baseEffect: 25,
    },
    'centralitaTelefonica': {
        name: 'Construir Centralita Telefónica',
        description: 'Una gran inversión para un gran retorno pasivo.',
        type: 'dps',
        baseCost: 1100,
        baseEffect: 45,
    },
    'servidorBBS': { // NUEVO
        name: 'Servidor BBS "El Eco Digital"',
        description: 'Crea una comunidad online que genera ingresos por suscripción.',
        type: 'dps',
        baseCost: 6000,
        baseEffect: 140,
    },
    'protocoloTCPIP': { // NUEVO
        name: 'Implementar Protocolo TCP/IP',
        description: 'Estandariza tu red para un tráfico de datos masivo y eficiente.',
        type: 'dpc',
        baseCost: 15000,
        baseEffect: 110,
    },
    'fibraOptica': { // NUEVO
        name: 'Red de Fibra Óptica',
        description: 'Reemplaza el cobre por luz. Un salto cuántico en velocidad y capacidad.',
        type: 'dps',
        baseCost: 48000,
        baseEffect: 750,
    }
};
let gameState = {
    money: 0,
    moneyPerClick: 1,
    moneyPerSecond: 0,
    totalMoneyEver: 0,
    prestigePoints: 0,
    upgradeLevels: {
        'tecladoTonos': 0,
        'lineaCobre': 0,
        'softwareTerminal': 0, // NUEVO
        'antenaRepetidora': 0,
        'modem2400': 0, // NUEVO
        'centralitaTelefonica': 0,
        'servidorBBS': 0, // NUEVO
        'protocoloTCPIP': 0, // NUEVO
        'fibraOptica': 0, // NUEVO
    },
};

// ---- LÓGICA DE GUARDADO, CÁLCULO Y PRINCIPAL (SIN CAMBIOS) ----
const SAVE_KEY = 'imperioConexionSave_v1'; let isResetting = false; function saveGame() { if (isResetting) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(gameState)); } catch (e) {} } function loadGame() { try { const saved = localStorage.getItem(SAVE_KEY); if (saved) { gameState = Object.assign(gameState, JSON.parse(saved)); } } catch (e) {} } function resetSave() { if (confirm("¿Borrar progreso?")) { isResetting = true; localStorage.removeItem(SAVE_KEY); window.location.reload(); } }
function calculateUpgradeCost(upgradeId) { const u = upgrades[upgradeId]; const l = gameState.upgradeLevels[upgradeId]; return Math.floor(u.baseCost * Math.pow(1.12, l)); } function calculatePrestigePointsToGain() { const f = 100000; const p = Math.floor(Math.pow(gameState.totalMoneyEver / f, 0.4)); return p > 0 ? p : 0; } function recalculateGains() { let dpc = 1, dps = 0; for (const id in upgrades) { const u = upgrades[id]; const l = gameState.upgradeLevels[id]; if (l > 0) { if (u.type === 'dpc') dpc += u.baseEffect * l; else if (u.type === 'dps') dps += u.baseEffect * l; } } const mult = 1 + (gameState.prestigePoints * 0.02); gameState.moneyPerClick = dpc * mult; gameState.moneyPerSecond = dps * mult; }
function buyUpgrade(upgradeId) { const cost = calculateUpgradeCost(upgradeId); if (gameState.money >= cost) { gameState.money -= cost; gameState.upgradeLevels[upgradeId]++; recalculateGains(); playSound('buySuccess'); } } function addMoney(amount) { if(typeof amount === 'number' && !isNaN(amount)) { gameState.money += amount; gameState.totalMoneyEver += amount; } } function generateMoneyOnClick() { addMoney(gameState.moneyPerClick); } function prestigeReset() { const points = calculatePrestigePointsToGain(); if (points > 0) { if (confirm(`¿Relanzar para ganar ${points} Puntos?`)) { gameState.prestigePoints += points; gameState.money = 0; gameState.totalMoneyEver = 0; gameState.upgradeLevels = { 'tecladoTonos': 0, 'lineaCobre': 0, 'antenaRepetidora': 0, 'centralitaTelefonica': 0 }; recalculateGains(); saveGame(); } } }

// ---- BUCLE DEL JUEGO ----
let gameLoopInterval = null; function gameLoop() { addMoney(gameState.moneyPerSecond / 10); updateUI(); }

// ---- GESTOR DE PANTALLAS Y PESTAÑAS ----
const allScreens = document.querySelectorAll('.full-screen, .game-container');
const allTabPanels = document.querySelectorAll('.tab-panel');
function showScreen(screenId) { allScreens.forEach(s => s.classList.add('hidden')); document.getElementById(screenId).classList.remove('hidden'); }
function showTab(tabId) {
    allTabPanels.forEach(p => p.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabId);
    });
}

// ---- LÓGICA DE INICIALIZACIÓN ----
let inGameListenersInitialized = false; // Bandera para asegurar que solo se ejecuta una vez

function initializeInGameEventListeners() {
    if (inGameListenersInitialized) return; // Si ya está inicializado, no hace nada

    // Listener para la BARRA DE PESTAÑAS INFERIOR
    document.getElementById('game-tab-bar').addEventListener('click', (event) => {
        const navButton = event.target.closest('.tab-btn');
        if (navButton) showTab(navButton.dataset.tab);
    });

    // Listener para la BARRA DE ATAJOS SUPERIOR
    const gameContainer = document.getElementById('game-container'); // Referencia al contenedor principal

	// Listener para la BARRA DE ATAJOS SUPERIOR
	document.getElementById('top-shortcut-bar').addEventListener('click', (event) => {
		const shortcutButton = event.target.closest('.shortcut-btn');
		if (shortcutButton) {
			// Añadimos la clase al contenedor principal para mostrar el pop-up y el fondo
			gameContainer.classList.add('popup-visible');
		}
	});

	// Listener para el BOTÓN DE CERRAR
	document.getElementById('close-popup-button').addEventListener('click', (event) => {
		event.stopPropagation();
		gameContainer.classList.remove('popup-visible');
	});

    // Listeners para los botones de acción del juego
    document.getElementById('main-click-button').addEventListener('click', (event) => {
        generateMoneyOnClick();
        showFloatingNumber(event);
        playSound('click');
    });

    document.getElementById('upgrades-container').addEventListener('click', (event) => {
        const button = event.target.closest('.buy-button');
        if (!button) return;
        if (button.classList.contains('is-disabled')) { playSound('buyFail'); return; }
        buyUpgrade(button.dataset.upgradeId);
    });
    
    document.getElementById('relaunch-button').addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button.classList.contains('is-disabled')) { playSound('buyFail'); } else { prestigeReset(); }
    });

    inGameListenersInitialized = true; // Marca como inicializado
}

function startGame() {
    // 1. Muestra la pantalla del juego. AHORA los botones son visibles en el DOM.
    showScreen('game-container');
    showTab('main-tab');
    
    // 2. INICIALIZA LOS LISTENERS DEL JUEGO. Ahora sí encontrará los botones.
    initializeInGameEventListeners();

    // 3. Carga datos y arranca el bucle.
    loadGame();
    recalculateGains();
    renderUpgrades();
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 100);
}

// ---- SECUENCIA DE ARRANQUE GENERAL ----
window.addEventListener('load', () => {
    // ---- Listeners para Menús y Navegación General (Fuera del juego) ----
    const loadingScreen = document.getElementById('loading-screen');
    const tapToStartScreen = document.getElementById('tap-to-start-screen');
    const volumeSlider = document.getElementById('master-volume');
    showScreen('loading-screen');
    setTimeout(() => { showScreen('tap-to-start-screen'); }, 2500);
    tapToStartScreen.addEventListener('click', () => { showScreen('main-menu-screen'); sounds.titleMusic.play(); sounds.titleMusic.fade(0, 0.4, 2000); }, { once: true });
    document.getElementById('play-button').addEventListener('click', () => { sounds.titleMusic.fade(0.4, 0, 1000); setTimeout(() => sounds.titleMusic.stop(), 1000); startGame(); });
    document.getElementById('story-button').addEventListener('click', () => showScreen('story-screen'));
    document.getElementById('options-button-menu').addEventListener('click', () => showScreen('options-screen'));
    document.getElementById('credits-button').addEventListener('click', () => showScreen('credits-screen'));
    document.querySelectorAll('.back-button').forEach(button => button.addEventListener('click', () => showScreen('main-menu-screen')));
    document.getElementById('reset-save-button').addEventListener('click', resetSave);
    volumeSlider.addEventListener('input', (event) => { setMasterVolume(event.target.value); localStorage.setItem('masterVolume', event.target.value); });
    const savedVolume = localStorage.getItem('masterVolume');
    if (savedVolume !== null) { volumeSlider.value = savedVolume; setMasterVolume(savedVolume); } else { volumeSlider.value = 1; }
    
    // Listener para el guardado al cerrar la página
    window.addEventListener('beforeunload', saveGame);
});