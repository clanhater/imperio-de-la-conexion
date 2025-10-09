// ---- DEFINICIONES Y ESTADO DEL JUEGO (ESTRUCTURA BALANCEADA Y SINEÉRGICA) ----
let upgrades = {};
let achievements = {};
let missions = {};
let shopItems = {};
let storyData = [];
let currentStoryIndex = 0;

const GAME_VERSION = "1.4"; // Puedes usar el número que quieras. Súbelo cada vez que cambies la estructura de guardado.
const SAVE_KEY = 'imperioConexionSave_v2'; // Cambiamos el nombre para invalidar guardados muy antiguos y evitar errores complejos.

// ==================================================================
// CONSTANTES DE BALANCEO DEL JUEGO
// ==================================================================
// Aquí puedes ajustar fácilmente la dificultad y progresión del juego.

const UPGRADE_COST_GROWTH_RATE = 1.12;  // Factor de encarecimiento de las mejoras (1.12 = +12% por nivel)
const PRESTIGE_MONEY_FACTOR    = 100000; // Dinero necesario para empezar a generar puntos de prestigio
const PRESTIGE_POWER_FACTOR    = 0.4;    // Exponente que suaviza la ganancia de puntos de prestigio (menor = más difícil)
const PRESTIGE_BONUS_PER_POINT = 0.02;    // Bonus de ingresos por cada punto de prestigio (0.02 = +2%)

// AHORA, REEMPLAZA EL OBJETO "gameState" CON ESTE, NOTA LA NUEVA LISTA EN "upgradeLevels"
let gameState = {
	version: GAME_VERSION,
    money: 0,
	totalClicks: 0,
    moneyPerClick: 1,
    moneyPerSecond: 0,
    totalMoneyEver: 0,
    prestigePoints: 0,
	gems: 0,
	currentEra: 'era1',
    unlockedAchievements: [],
    completedMissions: [],
    shopUpgrades: [],
	settings: {
        musicVolume: 0.4,
        sfxVolume: 0.7,
        prestigeConfirmation: true
    },
    upgradeLevels: {
        // Infraestructura
        'lineaCobre': 0,
        'antenaRepetidora': 0,
        'centralitaAnaloga': 0,
        'centralitaDigital': 0,
        'fibraOptica': 0,
        // Equipamiento
        'kitHerramientas': 0,
        'tecladoTonos': 0,
        'modem2400': 0,
        'tarjetaRed': 0,
        // Software
        'marketingLocal': 0,
        'softwareTerminal': 0,
        'servidorBBS': 0,
        'protocoloTCPIP': 0
    },
};

// ---- CARGA Y PROCESAMIENTO DE DATOS DEL JUEGO ----

async function loadGameData(progressCallback) {
    try {
        const dataFiles = [
            { key: 'upgrades', path: 'data/upgrades.json', message: 'Cargando esquemas de mejoras...' },
            { key: 'achievements', path: 'data/achievements.json', message: 'Compilando registros de logros...' },
            { key: 'missions', path: 'data/missions.json', message: 'Descargando directivas de misión...' },
            { key: 'shopItems', path: 'data/shopItems.json', message: 'Accediendo a la tienda de innovación...' },
            { key: 'story', path: 'data/story.json', message: 'Recuperando archivos de la historia...' }
        ];

        const totalFiles = dataFiles.length;
        let loadedFiles = 0;
        const loadedData = {};

        for (const file of dataFiles) {
            const response = await fetch(file.path);
            loadedData[file.key] = await response.json();
            loadedFiles++;
            // Llama al callback para actualizar la UI
            if (progressCallback) {
                progressCallback(loadedFiles / totalFiles, file.message);
            }
        }

        // "Hidratamos" los datos con su lógica
        for (const id in loadedData.achievements.era1) {
            if (dataLogic.achievements[id]) loadedData.achievements.era1[id].check = dataLogic.achievements[id];
        }
        for (const id in loadedData.missions.era1) {
            if (dataLogic.missions[id]) loadedData.missions.era1[id].check = dataLogic.missions[id];
        }
        for (const id in loadedData.shopItems) {
            if (dataLogic.shopItems[id]) loadedData.shopItems[id].isPurchased = dataLogic.shopItems[id];
        }
        
        // Asignamos los datos procesados a nuestras variables globales
        upgrades = loadedData.upgrades;
        achievements = loadedData.achievements;
        missions = loadedData.missions;
        shopItems = loadedData.shopItems;
        storyData = loadedData.story;

        console.log("Todos los datos del juego han sido cargados y procesados.");
        return true;

    } catch (error) {
        console.error("Error fatal al cargar los datos del juego:", error);
        if (progressCallback) {
            progressCallback(-1, 'ERROR: Fallo en la conexión con el servidor.'); // -1 indica error
        }
        return false;
    }
}

// ---- LÓGICA DE GUARDADO, CÁLCULO Y PRINCIPAL (SIN CAMBIOS) ----
let isResetting = false; 
function saveGame() { 
	if (isResetting) 
		return; 
	try { 
		localStorage.setItem(SAVE_KEY, JSON.stringify(gameState)); 
	} catch(e) {} 
} 
function loadGame() {
    try {
        const savedJSON = localStorage.getItem(SAVE_KEY);
        if (!savedJSON) {
            // No hay partida guardada, se usa el gameState por defecto.
            return;
        }

        const savedState = JSON.parse(savedJSON);

        // Si la versión es la misma, simplemente cargamos el estado y listo.
        if (savedState.version === GAME_VERSION) {
            gameState = Object.assign({}, gameState, savedState);
			gameState.settings = Object.assign({}, gameState.settings, savedState.settings);
            return;
        }

        // --- INICIO DE LA MIGRACIÓN ---
        // La versión del guardado es diferente (o no existe), así que migramos los datos.
        console.warn(`Migrando partida guardada desde la versión ${savedState.version || 'antigua'} a ${GAME_VERSION}`);

        // 1. Empezamos con la estructura por defecto de la nueva versión del juego.
        const migratedState = JSON.parse(JSON.stringify(gameState)); // Copia profunda del estado por defecto.

        // 2. Transferimos las propiedades simples (dinero, prestigio, etc.).
        migratedState.money = savedState.money || 0;
        migratedState.totalMoneyEver = savedState.totalMoneyEver || 0;
        migratedState.prestigePoints = savedState.prestigePoints || 0;
		
		if (savedState.settings) {
			migratedState.settings = Object.assign({}, migratedState.settings, savedState.settings);
		}

        // 3. Fusionamos los niveles de las mejoras de forma segura.
        //    Iteramos sobre las mejoras de la NUEVA versión del juego.
        for (const upgradeId in migratedState.upgradeLevels) {
            // Si la mejora existía en la partida GUARDADA, transferimos su nivel.
            if (savedState.upgradeLevels && savedState.upgradeLevels.hasOwnProperty(upgradeId)) {
                migratedState.upgradeLevels[upgradeId] = savedState.upgradeLevels[upgradeId];
            }
            // Si no existía (porque es una mejora nueva), se quedará en 0 (su valor por defecto).
        }
        
        // 4. Actualizamos la versión en el objeto de estado y lo asignamos al juego.
        migratedState.version = GAME_VERSION;
        gameState = migratedState;

        // 5. Guardamos inmediatamente el estado migrado para la próxima vez.
        saveGame();
        console.log("Migración completada con éxito.");

    } catch (e) {
        console.error("Error al cargar o migrar la partida guardada:", e);
        // Opcional: en caso de error crítico, se puede resetear el guardado.
        // resetSave(); 
    }
}
function resetSave() {
    // El mensaje de confirmación sigue siendo una buena práctica.
    const confirmationMessage = "¿Estás seguro de que quieres borrar TODO tu progreso? " +
                              "Esta acción es irreversible y reiniciará el juego a su estado inicial, " +
                              "incluyendo la introducción y el tutorial.";

    if (confirm(confirmationMessage)) {
        isResetting = true; // Previene un posible auto-guardado antes de recargar.

        localStorage.clear();

        // Recarga la página para aplicar los cambios y empezar de cero.
        window.location.reload();
    }
}

function exportSave() {
    try {
        const saveData = btoa(JSON.stringify(gameState));
        navigator.clipboard.writeText(saveData).then(() => {
            showNotification('¡Exportado!', 'Código de guardado copiado al portapapeles.', '💾');
        }, () => {
            alert('No se pudo copiar al portapapeles. Por favor, cópialo manualmente desde la consola.');
            console.log(saveData);
        });
    } catch (error) {
        alert('Error al exportar la partida.');
        console.error("Error exportando:", error);
    }
}

function importSave() {
    const importString = prompt("Pega tu código de guardado aquí:");
    if (!importString) return;

    try {
        const newState = JSON.parse(atob(importString));
        // Validación básica
        if (newState && newState.hasOwnProperty('money') && newState.hasOwnProperty('upgradeLevels')) {
            // Guardamos el nuevo estado en localStorage y recargamos
            localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
            showNotification('¡Importado!', 'La partida se cargará en un momento...', '💾');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            alert('El código de guardado parece ser inválido.');
        }
    } catch (error) {
        alert('Error al importar la partida. El código puede estar corrupto.');
        console.error("Error importando:", error);
    }
}

function findUpgradeById(upgradeId) {
    for (const categoryId in upgrades) {
        if (upgrades[categoryId].items[upgradeId]) {
            return upgrades[categoryId].items[upgradeId];
        }
    }
    return null; // No se encontró la mejora
}

function findNextRequirementHurdle(upgradeId) {
    const upgrade = findUpgradeById(upgradeId);
    if (!upgrade || !upgrade.requirements || upgrade.requirements.length === 0) {
        return null; // Si una mejora no tiene requisitos, nunca se bloquea.
    }

    const currentUpgradeLevel = gameState.upgradeLevels[upgradeId] || 0;
    
    // [NUEVA LÍNEA CLAVE] Calculamos el nivel al que el jugador quiere llegar con su próxima compra.
    const nextLevelToBuy = currentUpgradeLevel + 1;
    
    // Iteramos sobre los requisitos para encontrar el PRIMER hito que NO hemos cumplido aún
    for (const hurdle of upgrade.requirements) {
        // Si el nivel actual de la mejora es MENOR que el nivel requerido para este hito,
        // entonces este hito es un POTENCIAL BLOQUEO.
        if (currentUpgradeLevel < hurdle.level) {
            let allDependenciesMet = true;
            for (const reqId in hurdle.reqs) {
                const requiredLevel = hurdle.reqs[reqId];
                const currentReqLevel = gameState.upgradeLevels[reqId] || 0;
                
                if (currentReqLevel < requiredLevel) {
                    allDependenciesMet = false;
                    break; // Una dependencia no se cumple, este hito está bloqueando.
                }
            }

            if (!allDependenciesMet) {
                // Hemos encontrado el PRIMER hito futuro con dependencias NO cumplidas.
                
                // --- INICIO DE LA CORRECCIÓN DE LÓGICA ---
                // Solo bloqueamos si el próximo nivel a comprar (nextLevelToBuy) alcanza el nivel del hito.
                if (nextLevelToBuy < hurdle.level) {
                    // El bloqueo es lejano (ej. estamos en L1 y el bloqueo es en L25).
                    // Esto significa que las compras no están bloqueadas AHORA,
                    // ya que los hitos anteriores (L10) debieron cumplirse para llegar hasta aquí.
                    // Por lo tanto, devolvemos null para que la compra sea permitida.
                    return null; 
                }
                // --- FIN DE LA CORRECCIÓN DE LÓGICA ---
                
                // Si este hito es el primero que aún no hemos alcanzado (porque currentUpgradeLevel < hurdle.level)
                // Y sus dependencias NO están cumplidas, y la próxima compra lo alcanza, este es el hito que nos bloquea.
                return hurdle;
            }
            // Si las dependencias SÍ están cumplidas, seguimos buscando el siguiente hito,
            // ya que este no nos bloquea más allá del nivel de la mejora.
        }
    }

    // Si hemos revisado todos los requisitos y no encontramos ningún hito bloqueante,
    // significa que todos los requisitos previos han sido superados o sus dependencias están OK.
    return null;
}

function areRequirementsMet(upgradeId) {
    return findNextRequirementHurdle(upgradeId) === null;
}

function calculateUpgradeCost(upgradeId) {
    const upgrade = findUpgradeById(upgradeId);
    const level = gameState.upgradeLevels[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH_RATE, level));
}

function calculatePrestigePointsToGain() {
    let basePoints = Math.floor(Math.pow(gameState.totalMoneyEver / PRESTIGE_MONEY_FACTOR, PRESTIGE_POWER_FACTOR));
    
    // Aplicamos el bonus de la tienda
    let prestigeMultiplier = 1;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'prestige_multiplier') {
            prestigeMultiplier += item.value;
        }
        if (item && item.type === 'all_multiplier') {
            prestigeMultiplier += item.value;
        }
    });

    const totalPoints = Math.floor(basePoints * prestigeMultiplier);
    return totalPoints > 0 ? totalPoints : 0;
}

function recalculateGains() {
    let baseDpc = 1;
    let baseDps = 0;
    let dpcMultiplier = 1;
    let dpsMultiplier = 1;

    // Bucle anidado para recorrer la nueva estructura
    for (const categoryId in upgrades) {
        for (const id in upgrades[categoryId].items) {
            const u = upgrades[categoryId].items[id];
            const l = gameState.upgradeLevels[id] || 0;
            
            if (l > 0) {
                switch (u.type) {
                    case 'dpc':
                        baseDpc += u.baseEffect * l;
                        break;
                    case 'dps':
                        baseDps += u.baseEffect * l;
                        break;
                    case 'dpc_multiplier':
                        dpcMultiplier += u.baseEffect * l;
                        break;
                    case 'dps_multiplier':
                        dpsMultiplier += u.baseEffect * l;
                        break;
                }
            }
        }
    }
	
	// Aplicamos los multiplicadores PERMANENTES de la tienda
    let permanentDpsMultiplier = 1;
    let permanentDpcMultiplier = 1;
    let allMultiplier = 1; // Nuevo multiplicador global

    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item) {
            if (item.type === 'dps_multiplier_permanent') permanentDpsMultiplier += item.value;
            if (item.type === 'dpc_multiplier_permanent') permanentDpcMultiplier += item.value;
            if (item.type === 'all_multiplier') allMultiplier += item.value;
        }
    });

    const prestigeMultiplier = 1 + (gameState.prestigePoints * PRESTIGE_BONUS_PER_POINT);
    
    // Aplicamos todos los multiplicadores, incluyendo el nuevo 'allMultiplier'
    gameState.moneyPerClick = (baseDpc * dpcMultiplier * permanentDpcMultiplier * allMultiplier) * prestigeMultiplier;
    gameState.moneyPerSecond = (baseDps * dpsMultiplier * permanentDpsMultiplier * allMultiplier) * prestigeMultiplier;
}

function buyUpgrade(upgradeId) {
    // Primero, verificamos que la mejora no esté bloqueada por un hito de requisitos.
    if (!areRequirementsMet(upgradeId)) {
        playSound('buyFail'); // El jugador está chocando contra un muro de requisitos.
        return;
    }
    
    const cost = calculateUpgradeCost(upgradeId);
    
    // Si no está bloqueada, entonces verificamos si tiene el dinero.
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.upgradeLevels[upgradeId]++;
        recalculateGains();
        updateUI(); // Actualizamos la UI inmediatamente para que el cambio sea visible.
        playSound('buySuccess');
    } else {
        playSound('buyFail'); // No tiene suficiente dinero.
    }
}
function buyShopItem(itemId) {
    const item = shopItems[itemId];
    // Verificamos que el ítem exista, que se tengan gemas suficientes y que no haya sido comprado ya
    if (item && gameState.gems >= item.cost && !item.isPurchased(gameState)) {
        gameState.gems -= item.cost;
        gameState.shopUpgrades.push(itemId);
        recalculateGains(); // Recalculamos para aplicar el bonus al instante
        updateUI();
        playSound('buySuccess');
    } else {
        playSound('buyFail');
    }
}
function addMoney(amount) { 
	if(typeof amount === 'number' && !isNaN(amount)) { 
		gameState.money += amount; 
		gameState.totalMoneyEver += amount; 
	} 
} 
function generateMoneyOnClick() { 
	gameState.totalClicks++;
	addMoney(gameState.moneyPerClick); 
} 
function prestigeReset() {
    const points = calculatePrestigePointsToGain();
    if (points > 0) {
		const shouldConfirm = gameState.settings.prestigeConfirmation !== false;
        if (!shouldConfirm || confirm(`¿Relanzar para ganar ${points} Puntos de Innovación?`)) {
            gameState.prestigePoints += points;
            gameState.money = 0;
            
            // Resetea los niveles de las mejoras a 0 ANTES de aplicar los bonus
            for (const key in gameState.upgradeLevels) {
                gameState.upgradeLevels[key] = 0;
            }

            // Aplicamos los bonus de la tienda para el nuevo inicio
            gameState.shopUpgrades.forEach(itemId => {
                const item = shopItems[itemId];
                if (item) {
                    if (item.type === 'starting_money') {
                        gameState.money += item.value;
                    }
                    if (item.type === 'keep_upgrades') {
                        gameState.upgradeLevels[item.value.id] = item.value.levels;
                    }
                }
            });

            gameState.totalMoneyEver = gameState.money;
            recalculateGains(); // Recalculamos con las mejoras que se mantuvieron
            saveGame();
            updateUI();
        }
    }
}

function checkAchievements() {
    // Itera sobre las eras definidas en el objeto 'achievements' (por ahora, solo 'era1')
    for (const era in achievements) {
        // Itera sobre cada logro dentro de la era actual
        for (const achievementId in achievements[era]) {
            // Primero, comprueba si el logro NO ha sido desbloqueado todavía
            if (!gameState.unlockedAchievements.includes(achievementId)) {
                const achievement = achievements[era][achievementId];
                
                // Si la condición del logro ('check') se cumple...
                if (achievement.check(gameState)) {
                    console.log(`Logro desbloqueado: ${achievement.name}`);
                    
                    // 1. Añade el ID a la lista de logros desbloqueados para no volver a comprobarlo
                    gameState.unlockedAchievements.push(achievementId);
                    
                    // 2. Otorga la recompensa en Gemas
                    gameState.gems += achievement.reward.gems;
                    
                    playSound('buySuccess'); // Un sonido gratificante
                    showNotification(`¡Logro Desbloqueado!`, `${achievement.name}`, '🏆');
                }
            }
        }
    }
}

function checkMissions() {
    for (const era in missions) {
        for (const missionId in missions[era]) {
            // Condición 1: La misión no debe estar ya completada.
            if (!gameState.completedMissions.includes(missionId)) {
                const mission = missions[era][missionId];

                // Condición 2: Comprobar si la misión está "desbloqueada".
                // Una misión está desbloqueada si no tiene pre-requisitos,
                // O si el pre-requisito ya está en la lista de misiones completadas.
                const isUnlocked = !mission.requires || gameState.completedMissions.includes(mission.requires);

                if (isUnlocked) {
                    // Si la misión está desbloqueada y su condición se cumple...
                    if (mission.check(gameState)) {
                        console.log(`Misión completada: ${mission.name}`);
                        gameState.completedMissions.push(missionId);
                        gameState.gems += mission.reward.gems;
                        playSound('buySuccess');
                        showNotification(`¡Misión Completada!`, `+${mission.reward.gems} 💎 por "${mission.name}"`, '📋');
                    }
                }
            }
        }
    }
}

// ---- BUCLE DEL JUEGO ----
let gameLoopInterval = null; 
function gameLoop() { 
    // Auto-clicker
    let clicksPerSecond = 0;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'auto_clicker') {
            clicksPerSecond += item.value;
        }
    });

    if (clicksPerSecond > 0) {
        // Dividimos entre 10 porque el bucle corre 10 veces por segundo
        addMoney(gameState.moneyPerClick * (clicksPerSecond / 10));
    }

    // Ingresos pasivos
    addMoney(gameState.moneyPerSecond / 10); 

    checkAchievements();
    checkMissions();
    updateUI(); 
}

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
function returnToMainMenu() {
    // 1. Detener el bucle del juego (DPS)
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    
    // 2. Guardar el progreso
    saveGame();
	document.getElementById('game-container').classList.remove('popup-visible');
    
    // 3. Mostrar la pantalla principal del menú
    showScreen('main-menu-screen');
    
    // 4. Reiniciar la música (subir volumen si se bajó antes)
	if (!sounds.titleMusic.howl.playing()) {
        sounds.titleMusic.play();
    }
    sounds.titleMusic.howl.fade(0, gameState.settings.musicVolume, 1500);
}

function transitionToIntro() {
    const introScreen = document.getElementById('intro-animation-screen');
    
    // 1. Creamos un nuevo elemento <p> para el mensaje final
    const promptMessage = document.createElement('p');
    promptMessage.textContent = 'TOCA PARA CONTINUAR...';
    
    // 2. Le añadimos la clase 'blink' que ya existe en nuestro CSS
    //    para que el texto parpadee, invitando al jugador a hacer clic.
    promptMessage.className = 'blink';
    promptMessage.style.marginTop = '40px'; // Añadimos un espacio superior
    promptMessage.style.fontSize = '1.8rem'; // Lo hacemos un poco más grande

    // 3. Añadimos el mensaje a la pantalla de introducción
    introScreen.appendChild(promptMessage);

    // 4. Definimos la acción que ocurrirá cuando el jugador haga clic
    function proceedToGame() {
        // Mostramos la pantalla de "Toca para empezar" y arrancamos la música
        showScreen('tap-to-start-screen');
        sounds.titleMusic.play();
        sounds.titleMusic.fade(0, TITLE_MUSIC_VOLUME, 2000); // Suave fundido de entrada
    }
    
    // 5. Añadimos un listener a toda la pantalla de introducción que espera un solo clic.
    //    Una vez que se hace clic, ejecuta 'proceedToGame' y se elimina a sí mismo.
    introScreen.addEventListener('click', proceedToGame, { once: true });
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
	
	document.getElementById('shop-tab').addEventListener('click', (event) => {
        const button = event.target.closest('.buy-shop-item-button');
        // Si se hizo clic en un botón de compra y NO está deshabilitado...
        if (button && !button.disabled) {
            buyShopItem(button.dataset.itemId);
        }
    });
	
	document.getElementById('top-shortcut-bar').addEventListener('click', (event) => {
		const shortcutButton = event.target.closest('.shortcut-btn');
		if (!shortcutButton) return; // Si no se hizo clic en un botón, no hace nada

		// Si el botón es el de volver al menú, ejecuta la función correspondiente
		if (shortcutButton.id === 'menu-button-shortcut') {
			returnToMainMenu();
		} 
		// Si el botón tiene un atributo 'data-tab', muestra esa pestaña
		else if (shortcutButton.dataset.tab) {
			showTab(shortcutButton.dataset.tab);
		}
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
	renderAchievements();
	renderMissions();
	initializeShop();
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 100);
	
	// 4. Comprobamos si debemos mostrar el tutorial.
    // Usamos otra marca en localStorage para asegurar que el tutorial solo se muestre una vez.
    const tutorialShown = localStorage.getItem('tutorialShown');

    // Si 'tutorialShown' no existe, significa que el jugador nunca lo ha visto.
    if (!tutorialShown) {
        // Ejecutamos el tutorial.
        startInteractiveTutorial();
        // Creamos la marca para que no se vuelva a mostrar en el futuro.
        localStorage.setItem('tutorialShown', 'true');
    }
}

// ---- SECUENCIA DE ARRANQUE GENERAL ----
window.addEventListener('load', async () => {
    // Referencias a los elementos de la UI
    const loadingScreen = document.getElementById('loading-screen');
    const loadingContent = loadingScreen.querySelector('.loading-content');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('loading-status-text');
    showScreen('loading-screen');

    const MIN_LOADING_TIME_MS = 2500; // 2.5 segundos de tiempo mínimo visible

    // [NUEVA LÓGICA DE CARGA VISUAL]
    // 1. Inicia la carga de datos real en segundo plano.
    //    Ya no necesitamos su "progressCallback" para la barra, así que lo eliminamos.
    const loadDataPromise = loadGameData();
    const minimumTimePromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS));

    // 2. Inicia un bucle de animación para la barra de progreso.
    let visualProgress = 0;
    const progressInterval = setInterval(() => {
        // Incrementa el progreso visual suavemente, pero lo detenemos en 99%
        // para dar el golpe final al 100% solo cuando todo esté realmente listo.
        if (visualProgress < 99) {
            visualProgress++;
            progressBar.style.width = `${visualProgress}%`;
        }
    }, MIN_LOADING_TIME_MS / 100); // Se actualiza 100 veces durante el tiempo mínimo.

    // 3. Espera a que AMBAS promesas (carga real y tiempo mínimo) se completen.
    const [dataLoadedResult] = await Promise.all([
        loadDataPromise,
        minimumTimePromise
    ]);

    // 4. Detiene el bucle de animación visual.
    clearInterval(progressInterval);

    // 5. Procesa el resultado.
    if (!dataLoadedResult) {
        // Si hubo un error en la carga de datos
        statusText.textContent = 'ERROR: Fallo en la conexión.';
        progressBar.style.backgroundColor = '#D32F2F'; // Barra roja
        progressBar.style.width = '100%'; // Llena la barra de error
        return;
    }

    // Si todo fue exitoso, da el salto final al 100%
    progressBar.style.width = '100%';
    statusText.textContent = '¡Conexión establecida! Sistema listo.';

    // Carga la partida guardada y los volúmenes
    loadGame();
    initializeVolumes(gameState.settings.musicVolume, gameState.settings.sfxVolume);

    // El resto de la secuencia de transición
    setTimeout(() => {
        loadingContent.classList.add('fade-out');
        setTimeout(() => {
            const tapToStartScreen = document.getElementById('tap-to-start-screen');
            showScreen('tap-to-start-screen');
            tapToStartScreen.addEventListener('click', () => {
                showScreen('main-menu-screen');
                sounds.titleMusic.howl.play();
                sounds.titleMusic.howl.fade(0, gameState.settings.musicVolume, 2000);
            }, { once: true });
        }, 1000);
    }, 800);

    // ---- Pega el resto de tus listeners de menú aquí (play-button, story-button, etc.) ----
	
	document.getElementById('play-button').addEventListener('click', () => {
		sounds.titleMusic.howl.fade(gameState.settings.musicVolume, 0, 1000);
		const introHasBeenShown = localStorage.getItem('introShown');
		if (!introHasBeenShown) {
			localStorage.setItem('introShown', 'true');
			showScreen('intro-animation-screen');
			startIntroAnimation(startGame); 
		} else {
			startGame();
		}
	});

	// ---- Listeners para la pantalla de HISTORIA ----
	document.getElementById('story-button').addEventListener('click', () => {
		showScreen('story-screen');
		currentStoryIndex = 0;
		renderStoryCard(currentStoryIndex);
	});
	document.getElementById('story-next-button').addEventListener('click', () => {
		currentStoryIndex++;
		if (currentStoryIndex >= storyData.length) {
			currentStoryIndex = 0;
		}
		renderStoryCard(currentStoryIndex);
		playSound('menuHover');
	});
	document.getElementById('story-prev-button').addEventListener('click', () => {
		currentStoryIndex--;
		if (currentStoryIndex < 0) {
			currentStoryIndex = storyData.length - 1;
		}
		renderStoryCard(currentStoryIndex);
		playSound('menuHover');
	});

	// ---- Listeners para la pantalla de CRÉDITOS ----
	document.getElementById('credits-button').addEventListener('click', () => {
		showScreen('credits-screen');
		startCreditsSequence();
	});
	document.getElementById('credits-back-button').addEventListener('click', () => {
		stopCreditsSequence();
		showScreen('main-menu-screen');
	});

	// ---- Listeners para la nueva pantalla de OPCIONES ----
	const musicSlider = document.getElementById('music-volume');
	const sfxSlider = document.getElementById('sfx-volume');
	const prestigeToggle = document.getElementById('prestige-confirmation-toggle');

	document.getElementById('options-button-menu').addEventListener('click', () => {
		// Sincroniza la UI con el estado actual cada vez que se abre
		musicSlider.value = gameState.settings.musicVolume;
		sfxSlider.value = gameState.settings.sfxVolume;
		prestigeToggle.checked = gameState.settings.prestigeConfirmation;
		showScreen('options-screen');
	});

	musicSlider.addEventListener('input', (event) => {
		const newVolume = parseFloat(event.target.value);
		gameState.settings.musicVolume = newVolume;
		setMusicVolume(newVolume);
	});

	sfxSlider.addEventListener('input', (event) => {
		const newVolume = parseFloat(event.target.value);
		gameState.settings.sfxVolume = newVolume;
		setSfxVolume(newVolume);
	});

	prestigeToggle.addEventListener('change', (event) => {
		gameState.settings.prestigeConfirmation = event.target.checked;
	});

	document.getElementById('export-save-button').addEventListener('click', exportSave);
	document.getElementById('import-save-button').addEventListener('click', importSave);
	document.getElementById('reset-save-button').addEventListener('click', resetSave);

	// ---- Listeners generales de la aplicación ----

	// Listener para todos los botones "Volver" genéricos (excluyendo el de créditos)
	document.querySelectorAll('.back-button:not(#credits-back-button)').forEach(button => {
		button.addEventListener('click', () => showScreen('main-menu-screen'));
	});
	
	// Listener para los efectos de sonido al pasar el ratón
	const hoverSoundSelectors = [
		'.menu-button',
		'.back-button',
		'.danger-button',
		'.shortcut-btn',
		'.tab-btn',
		'#close-popup-button',
		'.data-button',
		'.story-nav-button'
	].join(',');

	document.body.addEventListener('mouseover', (event) => {
		const targetButton = event.target.closest(hoverSoundSelectors);
		if (targetButton) {
			playSound('menuHover');
		}
	});
	
	// Listener para el guardado al cerrar la página
	window.addEventListener('beforeunload', saveGame);
});