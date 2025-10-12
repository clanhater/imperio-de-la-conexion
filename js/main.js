// ---- DEFINICIONES Y ESTADO DEL JUEGO (ESTRUCTURA BALANCEADA Y SINEÉRGICA) ----
let upgrades = {};
let achievements = {};
let missions = {};
let shopItems = {};
let storyData = [];
let currentStoryIndex = 0;

const GAME_VERSION = "1.4";
const SAVE_KEY = 'imperioConexionSave_v2';

// ==================================================================
// CONSTANTES DE BALANCEO DEL JUEGO
// ==================================================================
const UPGRADE_COST_GROWTH_RATE = 1.12;
const PRESTIGE_MONEY_FACTOR    = 50000;
const PRESTIGE_POWER_FACTOR    = 0.45;
const PRESTIGE_BONUS_PER_POINT = 0.02;

// ---- CONSTANTES PARA POP-UPS (ERA 2+) ----
const POPUP_MIN_SECONDS = 45;   // El tiempo mínimo antes de que pueda aparecer un pop-up
const POPUP_MAX_SECONDS = 120;  // El tiempo máximo que puede tardar en aparecer un pop-up
const POPUP_LIFESPAN_SECONDS = 15;   // Cuántos segundos permanece el pop-up en pantalla

const JACKPOT_DPS_EQUIVALENT = 60;  // Recompensa: valor de 600 segundos (10 minutos) de DPS
const CLICK_FRENZY_DURATION_SECONDS = 13; // Duración del buff de clics
const CLICK_FRENZY_MULTIPLIER = 77;      // Multiplicador del buff de clics
const DPS_OVERLOAD_DURATION_SECONDS = 77; // Duración del buff de DPS
const DPS_OVERLOAD_MULTIPLIER = 7;        // Multiplicador del buff de DPS

// ---- CONSTANTES PARA BÓVEDA DE DATOS (ERA 2+) ----
const VAULT_CLICKS_TO_TRIGGER = 10;      // Número de clics manuales para añadir dinero a la bóveda
const VAULT_REWARD_CLICK_MULTIPLIER = 100; // Multiplica el valor del clic para determinar cuánto se guarda
const VAULT_CAPACITY_DPS_MULTIPLIER = 1800; // La capacidad máxima será valor de 1800s (30 min) de DPS
const VAULT_OPEN_COOLDOWN_SECONDS = 3600;  // Cooldown para abrir la bóveda: 3600 segundos (1 hora)

// ==================================================================
// CONSTANTES DE PROGRESIÓN DE ERAS
// ==================================================================
const ERA_DATA = {
    // La Era 1 no tiene coste, es el punto de partida.
    'era1': {
        name: '1G: Los Inicios',
        description: 'La era de la telefonía analógica y las conexiones conmutadas. ¡El primer paso hacia un mundo conectado!'
    },
    'era2': { 
        name: '2G: Los 90',
        description: 'La revolución digital llega con la telefonía móvil GSM, el SMS y el nacimiento de la World Wide Web.', // Descripción de ejemplo
        prestigeCost: 100,
        requiredEra: 'era1'
    },
    // 'era3': { ... }
};

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
	unlockedEras: ['era1'],
    unlockedAchievements: [],
    completedMissions: [],
    shopUpgrades: [],
	activeBuffs: {
        clickFrenzy: { timeLeft: 0 },
        dpsOverload: { timeLeft: 0 }
    },
    nextPopupTimestamp: 0,
	dataVault: {
        currentValue: 0,
        clickCounter: 0,
        cooldownTimestamp: 0
    },
	stats: {
        popupsClicked: 0,
        dpsOverloadsActivated: 0,
		clickFrenziesActivated: 0
    },
	settings: {
        musicVolume: 0.4,
        sfxVolume: 0.7,
        prestigeConfirmation: true
    },
    upgradeLevels: {
        // --- Era 1 ---
        'lineaCobre': 0, 'antenaRepetidora': 0, 'centralitaAnaloga': 0, 'nodoRegional': 0, 'centralitaDigital': 0, 'fibraOptica': 0,
        'kitHerramientas': 0, 'tecladoTonos': 0, 'modem2400': 0, 'tarjetaRed': 0,
        'marketingLocal': 0, 'softwareTerminal': 0, 'servidorBBS': 0, 'protocoloTCPIP': 0,

        // --- Era 2 ---
        'modem56k': 0, 'torreGSM': 0, 'ispDatacenter': 0, 'redISDN': 0, 'backboneFibra': 0,
        'htmlBasico': 0, 'cgiScripts': 0, 'servidorEmail': 0, 'portalWeb': 0, 'bannerPublicitario': 0,
        'algoritmoCompresion': 0, 'centroSMS': 0, 'roamingAcuerdo': 0, 'tonosPolifonicos': 0, 'tarjetaPrepago': 0
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
            if (progressCallback) {
                progressCallback(loadedFiles / totalFiles, file.message);
            }
        }
        // "Hidratamos" los datos con su lógica
        for (const eraId in loadedData.achievements) {
            for (const id in loadedData.achievements[eraId]) {
                if (dataLogic.achievements[id]) loadedData.achievements[eraId][id].check = dataLogic.achievements[id];
            }
        }
        for (const eraId in loadedData.missions) {
            for (const id in loadedData.missions[eraId]) {
                if (dataLogic.missions[id]) loadedData.missions[eraId][id].check = dataLogic.missions[id];
            }
        }
        for (const id in loadedData.shopItems) {
            if (dataLogic.shopItems[id]) loadedData.shopItems[id].isPurchased = dataLogic.shopItems[id];
        }
        
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
            progressCallback(-1, 'ERROR: Fallo en la conexión con el servidor.');
        }
        return false;
    }
}

// ---- LÓGICA DE GUARDADO, CÁLCULO Y PRINCIPAL ----
let isResetting = false; 
function saveGame() { 
	if (isResetting) return; 
	try { 
		localStorage.setItem(SAVE_KEY, JSON.stringify(gameState)); 
	} catch(e) {} 
} 

function loadGame() {
    try {
        const savedJSON = localStorage.getItem(SAVE_KEY);
        if (!savedJSON) return;

        const savedState = JSON.parse(savedJSON);

        if (savedState.version === GAME_VERSION) {
            gameState = Object.assign({}, gameState, savedState);
			gameState.settings = Object.assign({}, gameState.settings, savedState.settings);
            return;
        }

        // Migración de guardado
        console.warn(`Migrando partida guardada desde la versión ${savedState.version || 'antigua'} a ${GAME_VERSION}`);
        const migratedState = JSON.parse(JSON.stringify(gameState));
        migratedState.money = savedState.money || 0;
        migratedState.totalMoneyEver = savedState.totalMoneyEver || 0;
        migratedState.prestigePoints = savedState.prestigePoints || 0;
        if (savedState.settings) {
			migratedState.settings = Object.assign({}, migratedState.settings, savedState.settings);
		}
        for (const upgradeId in migratedState.upgradeLevels) {
            if (savedState.upgradeLevels && savedState.upgradeLevels.hasOwnProperty(upgradeId)) {
                migratedState.upgradeLevels[upgradeId] = savedState.upgradeLevels[upgradeId];
            }
        }
        migratedState.version = GAME_VERSION;
        gameState = migratedState;
        saveGame();
        console.log("Migración completada con éxito.");

    } catch (e) {
        console.error("Error al cargar o migrar la partida guardada:", e);
    }
}

function resetSave() {
    const confirmationMessage = "¿Estás seguro de que quieres borrar TODO tu progreso? Esta acción es irreversible.";
    if (confirm(confirmationMessage)) {
        isResetting = true;
        localStorage.clear();
        window.location.reload();
    }
}

function exportSave() {
    try {
        const saveData = btoa(JSON.stringify(gameState));
        navigator.clipboard.writeText(saveData).then(() => {
            showNotification('¡Exportado!', 'Código de guardado copiado.', '💾');
        });
    } catch (error) {
        alert('Error al exportar la partida.');
    }
}

function importSave() {
    const importString = prompt("Pega tu código de guardado aquí:");
    if (!importString) return;
    try {
        const newState = JSON.parse(atob(importString));
        if (newState && newState.hasOwnProperty('money') && newState.hasOwnProperty('upgradeLevels')) {
            localStorage.setItem(SAVE_KEY, JSON.stringify(newState));
            showNotification('¡Importado!', 'La partida se cargará...', '💾');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            alert('El código de guardado parece ser inválido.');
        }
    } catch (error) {
        alert('Error al importar la partida.');
    }
}

function findUpgradeById(upgradeId) {
    const currentEraUpgrades = upgrades[gameState.currentEra];
    if (!currentEraUpgrades) return null;
    for (const categoryId in currentEraUpgrades) {
        if (currentEraUpgrades[categoryId].items[upgradeId]) {
            return currentEraUpgrades[categoryId].items[upgradeId];
        }
    }
    return null;
}

function findNextRequirementHurdle(upgradeId) {
    const upgrade = findUpgradeById(upgradeId);
    if (!upgrade || !upgrade.requirements || upgrade.requirements.length === 0) return null;
    const currentUpgradeLevel = gameState.upgradeLevels[upgradeId] || 0;
    const nextLevelToBuy = currentUpgradeLevel + 1;
    for (const hurdle of upgrade.requirements) {
        if (currentUpgradeLevel < hurdle.level) {
            let allDependenciesMet = true;
            for (const reqId in hurdle.reqs) {
                if ((gameState.upgradeLevels[reqId] || 0) < hurdle.reqs[reqId]) {
                    allDependenciesMet = false;
                    break;
                }
            }
            if (!allDependenciesMet) {
                if (nextLevelToBuy < hurdle.level) return null;
                return hurdle;
            }
        }
    }
    return null;
}

function areRequirementsMet(upgradeId) {
    return findNextRequirementHurdle(upgradeId) === null;
}

function calculateUpgradeCost(upgradeId) {
    const upgrade = findUpgradeById(upgradeId);
    if (!upgrade) return Infinity;
    const level = gameState.upgradeLevels[upgradeId] || 0;
    return Math.floor(upgrade.baseCost * Math.pow(UPGRADE_COST_GROWTH_RATE, level));
}

function calculatePrestigePointsToGain() {
    let basePoints = Math.floor(Math.pow(gameState.totalMoneyEver / PRESTIGE_MONEY_FACTOR, PRESTIGE_POWER_FACTOR));
    let prestigeMultiplier = 1;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'prestige_multiplier') prestigeMultiplier += item.value;
        if (item && item.type === 'all_multiplier') prestigeMultiplier += item.value;
    });
    const totalPoints = Math.floor(basePoints * prestigeMultiplier);
    return totalPoints > 0 ? totalPoints : 0;
}

function areAllMissionsCompletedForEra(eraId) {
    const eraMissions = missions[eraId];
    if (!eraMissions) return true; // Si no hay misiones para la era, se considera completado.

    const missionIds = Object.keys(eraMissions);
    for (const missionId of missionIds) {
        if (!gameState.completedMissions.includes(missionId)) {
            return false; // Se encontró una misión sin completar.
        }
    }
    return true; // Todas las misiones fueron encontradas en el estado del jugador.
}

function areAllAchievementsUnlockedForEra(eraId) {
    const eraAchievements = achievements[eraId];
    if (!eraAchievements) return true;

    const achievementIds = Object.keys(eraAchievements);
    for (const achievementId of achievementIds) {
        if (!gameState.unlockedAchievements.includes(achievementId)) {
            return false; // Se encontró un logro sin desbloquear.
        }
    }
    return true; // Todos los logros fueron encontrados en el estado del jugador.
}

function recalculateGains() {
    let baseDpc = 1, baseDps = 0, dpcMultiplier = 1, dpsMultiplier = 1;
	const currentEraUpgrades = upgrades[gameState.currentEra];
    if (currentEraUpgrades) {
		for (const categoryId in currentEraUpgrades) {
			for (const id in currentEraUpgrades[categoryId].items) {
				const u = currentEraUpgrades[categoryId].items[id];
				const l = gameState.upgradeLevels[id] || 0;
				if (l > 0) {
					switch (u.type) {
						case 'dpc': baseDpc += u.baseEffect * l; break;
						case 'dps': baseDps += u.baseEffect * l; break;
						case 'dpc_multiplier': dpcMultiplier += u.baseEffect * l; break;
						case 'dps_multiplier': dpsMultiplier += u.baseEffect * l; break;
					}
				}
			}
		}
	}
    let permanentDpsMultiplier = 1, permanentDpcMultiplier = 1, allMultiplier = 1;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item) {
            if (item.type === 'dps_multiplier_permanent') permanentDpsMultiplier += item.value;
            if (item.type === 'dpc_multiplier_permanent') permanentDpcMultiplier += item.value;
            if (item.type === 'all_multiplier') allMultiplier += item.value;
        }
    });
    const prestigeMultiplier = 1 + (gameState.prestigePoints * PRESTIGE_BONUS_PER_POINT);
    gameState.moneyPerClick = (baseDpc * dpcMultiplier * permanentDpcMultiplier * allMultiplier) * prestigeMultiplier;
    gameState.moneyPerSecond = (baseDps * dpsMultiplier * permanentDpsMultiplier * allMultiplier) * prestigeMultiplier;
}

function buyUpgrade(upgradeId) {
	const upgradeData = findUpgradeById(upgradeId);
    const currentLevel = gameState.upgradeLevels[upgradeId] || 0;
    if (upgradeData.maxLevel && currentLevel >= upgradeData.maxLevel) {
        playSound('buyFail');
        return; 
    }
    if (!areRequirementsMet(upgradeId)) {
        playSound('buyFail');
        return;
    }
    const cost = calculateUpgradeCost(upgradeId);
    if (gameState.money >= cost) {
        gameState.money -= cost;
        gameState.upgradeLevels[upgradeId]++;
        recalculateGains();
        updateUI();
        playSound('buySuccess');
    } else {
        playSound('buyFail');
    }
}

function buyShopItem(itemId) {
    const item = shopItems[itemId];
    if (item && gameState.gems >= item.cost && !item.isPurchased(gameState)) {
        gameState.gems -= item.cost;
        gameState.shopUpgrades.push(itemId);
        recalculateGains();
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

    // Aplica el multiplicador de Frenesí de Clics si está activo
    const clickMultiplier = gameState.activeBuffs.clickFrenzy.timeLeft > 0 ? CLICK_FRENZY_MULTIPLIER : 1;
    const moneyFromClick = gameState.moneyPerClick * clickMultiplier;

    // Se suma directamente al dinero para no ser afectado por otros buffs
	gameState.money += moneyFromClick; 
	gameState.totalMoneyEver += moneyFromClick;
	
	showFloatingNumber(event, moneyFromClick); 
    playSound('click');

    // ---- GESTIÓN DE LA BÓVEDA ----
    const currentEraNumber = parseInt(gameState.currentEra.replace('era', ''));
    if (currentEraNumber >= 2) {
        gameState.dataVault.clickCounter++;
        if (gameState.dataVault.clickCounter >= VAULT_CLICKS_TO_TRIGGER) {
            addToVault();
            gameState.dataVault.clickCounter = 0; // Resetea el contador
        }
    }
}

function addToVault() {
    let capacityBonus = 0;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'vault_capacity') {
            capacityBonus += item.value;
        }
    });
    const vaultCapacity = (gameState.moneyPerSecond || 1) * (VAULT_CAPACITY_DPS_MULTIPLIER + capacityBonus);

    if (gameState.dataVault.currentValue >= vaultCapacity) return;

    let fillerBonus = 1;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'vault_filler') {
            fillerBonus += item.value;
        }
    });
    const prestigeBonus = 1 + (gameState.prestigePoints * PRESTIGE_BONUS_PER_POINT);
    const clickValueForVault = gameState.moneyPerClick * VAULT_REWARD_CLICK_MULTIPLIER;
    const amountToAdd = (clickValueForVault * prestigeBonus) * fillerBonus; // [MODIFICADO]

    gameState.dataVault.currentValue += amountToAdd;

    if (gameState.dataVault.currentValue > vaultCapacity) {
        gameState.dataVault.currentValue = vaultCapacity;
    }
}

function openVault() {
    const now = Date.now();
    const cooldownEndTime = gameState.dataVault.cooldownTimestamp;

    // 1. Verificar si el cooldown de 1 hora ha pasado
    if (now < cooldownEndTime) {
        // Calcula el tiempo restante para mostrar un mensaje útil (opcional pero recomendado)
        const timeLeftSeconds = Math.round((cooldownEndTime - now) / 1000);
        const timeLeftMinutes = Math.ceil(timeLeftSeconds / 60);
        console.log(`La bóveda no está lista. Faltan aproximadamente ${timeLeftMinutes} minutos.`);
        playSound('buyFail'); // Sonido de error
        return; // Termina la función si está en cooldown
    }

    // 2. Verificar si hay algo que recoger
    const amountToCollect = gameState.dataVault.currentValue;
    if (amountToCollect <= 0) {
        console.log("La bóveda está vacía.");
        playSound('buyFail');
        return;
    }

    // 3. Otorgar la recompensa
    addMoney(amountToCollect);

    // 4. Resetear la bóveda y establecer el nuevo cooldown
    gameState.dataVault.currentValue = 0;
    gameState.dataVault.cooldownTimestamp = Date.now() + (VAULT_OPEN_COOLDOWN_SECONDS * 1000);

    // 5. Dar feedback al jugador
    showNotification("¡Bóveda Abierta!", `¡Has recolectado ${formatNumber(amountToCollect)}!`, '🏦');
    playSound('buySuccess'); // Sonido de gran éxito
}

async function prestigeReset() {
    const points = calculatePrestigePointsToGain();
    if (points <= 0) return;

    const shouldConfirm = gameState.settings.prestigeConfirmation !== false;
    if (!shouldConfirm || confirm(`¿Relanzar para ganar ${points} Puntos de Innovación?`)) {
        
        gameState.prestigePoints += points;
        const currentEraIndex = gameState.unlockedEras.indexOf(gameState.currentEra);
        const canAdvance = currentEraIndex < gameState.unlockedEras.length - 1;
        let newEraId = null;

        if (canAdvance) {
            newEraId = gameState.unlockedEras[currentEraIndex + 1];
        }

        // --- TRANSICIÓN VISUAL ---
        if (newEraId && typeof cinematics[newEraId] === 'function') {
            await cinematics[newEraId]();
        } else {
            const transitionOverlay = document.getElementById('transition-overlay');
            transitionOverlay.classList.add('active');
            await new Promise(resolve => setTimeout(resolve, 500));
            transitionOverlay.classList.remove('active');
        }

        // --- [NUEVO] PASO 1: DETECTAR SI ES LA PRIMERA VEZ EN UNA NUEVA ERA ---
        let isFirstTimeInNewEra = false;

        // --- ACTUALIZACIÓN DEL ESTADO DEL JUEGO (POST-TRANSICIÓN) ---
        if (newEraId) {
            // Comparamos la "era más alta" guardada con la nueva era a la que estamos entrando
            if (newEraId !== gameState.highestEraReached) {
                isFirstTimeInNewEra = true;
                gameState.highestEraReached = newEraId; // Actualizamos el progreso máximo del jugador
            }
            
            gameState.currentEra = newEraId;
            showNotification("¡Nueva Era!", `Bienvenido a ${ERA_DATA[gameState.currentEra].name}.`, '✨');
        }

        gameState.money = 0;
        for (const key in gameState.upgradeLevels) {
            gameState.upgradeLevels[key] = 0;
        }

        // --- [NUEVO] PASO 2: APLICAR EL CAPITAL SEMILLA SI CORRESPONDE ---
        if (isFirstTimeInNewEra) {
            let seedCapital = 0;
            switch (gameState.currentEra) {
                case 'era2':
                    seedCapital = 1000000; // Capital inicial para la Era 2
                    break;
                // case 'era3': 
                //     seedCapital = 1e12; // Ejemplo para una futura Era 3
                //     break;
            }

            if (seedCapital > 0) {
                gameState.money += seedCapital;
                showNotification("¡Inversión Tecnológica!", `Comienzas con $${formatNumber(seedCapital)} para impulsar la nueva era.`, '🚀');
            }
        }
        
        // Se aplica el dinero de las mejoras de la tienda DESPUÉS del capital semilla
        gameState.shopUpgrades.forEach(itemId => {
            const item = shopItems[itemId];
            if (item) {
                if (item.type === 'starting_money') gameState.money += item.value;
                if (item.type === 'keep_upgrades') gameState.upgradeLevels[item.value.id] = item.value.levels;
            }
        });

        gameState.totalMoneyEver = gameState.money; // El total ahora incluye el capital semilla
        recalculateGains();
        
        // --- RENDERIZADO FINAL Y VISUALIZACIÓN ---
        showScreen('game-container'); 

        loadEraStyle(gameState.currentEra);
        stopAllEraMusic();
        playEraMusic(gameState.currentEra);
        renderUpgrades();
        renderAchievements();
        renderMissions();
        updateUI();
        saveGame();
    }
}

function evolveToNextEra() {
    let nextEraId = null;
    // Busca la primera era en ERA_DATA que aún no ha sido desbloqueada.
    for (const eraId in ERA_DATA) {
        if (!gameState.unlockedEras.includes(eraId)) {
            nextEraId = eraId;
            break;
        }
    }

    // Si encontramos una era para desbloquear...
    if (nextEraId) {
        const nextEra = ERA_DATA[nextEraId];
        // Verificamos por segunda vez que se tengan los puntos (seguridad).
        if (gameState.prestigePoints >= nextEra.prestigeCost) {
            // 1. Restamos el coste.
            gameState.prestigePoints -= nextEra.prestigeCost;

            // 2. Añadimos la nueva era a la lista de desbloqueadas.
            gameState.unlockedEras.push(nextEraId);

            // 3. Informamos al jugador del éxito.
            playSound('buySuccess');
            showNotification('¡Evolución Desbloqueada!', `Avanza a la ${nextEra.name} en tu próximo relanzamiento.`, '✨');
            
            // 4. Actualizamos la UI para que el botón desaparezca o cambie.
            updateUI();
        }
    }
}

function checkAchievements() {
    const eraAchievements = achievements[gameState.currentEra];
    if (!eraAchievements) return;

    for (const achievementId in eraAchievements) {
        if (!gameState.unlockedAchievements.includes(achievementId)) {
            const achievement = eraAchievements[achievementId];
            if (achievement.check(gameState)) {
                console.log(`Logro desbloqueado: ${achievement.name}`);
                gameState.unlockedAchievements.push(achievementId);
                gameState.gems += achievement.reward.gems;
                playSound('buySuccess');
                showNotification(`¡Logro Desbloqueado!`, `${achievement.name}`, '🏆');
				renderAchievements(); 
            }
        }
    }
}

function checkMissions() {
    const eraMissions = missions[gameState.currentEra];
    if (!eraMissions) return;

    for (const missionId in eraMissions) {
        if (!gameState.completedMissions.includes(missionId)) {
            const mission = eraMissions[missionId];
            const isUnlocked = !mission.requires || gameState.completedMissions.includes(mission.requires);
            if (isUnlocked && mission.check(gameState)) {
                console.log(`Misión completada: ${mission.name}`);
                gameState.completedMissions.push(missionId);
                gameState.gems += mission.reward.gems;
                playSound('buySuccess');
                showNotification(`¡Misión Completada!`, `+${mission.reward.gems} 💎 por "${mission.name}"`, '📋');
				renderMissions();
            }
        }
    }
}

// ---- BUCLE DEL JUEGO ----
let gameLoopInterval = null; 
function gameLoop() { 
    const deltaTime = 0.1; // El bucle se ejecuta cada 100ms (0.1s)

    // ---- LÓGICA DE TEMPORIZADORES (POPUPS Y BUFFS) ----
    const currentEraNumber = parseInt(gameState.currentEra.replace('era', ''));
    if (currentEraNumber >= 2) {
        if (gameState.nextPopupTimestamp === 0) {
            scheduleNextPopup();
        }
        if (Date.now() >= gameState.nextPopupTimestamp) {
            triggerPopup();
            scheduleNextPopup();
        }
    }

    for (const buffKey in gameState.activeBuffs) {
        const buff = gameState.activeBuffs[buffKey];
        if (buff.timeLeft > 0) {
            buff.timeLeft -= deltaTime;
        } else if (buff.timeLeft < 0) {
            buff.timeLeft = 0;
        }
    }

    // ---- CÁLCULO DE GANANCIAS ----
    // Auto-clickers
    let clicksPerSecond = 0;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'auto_clicker') {
            clicksPerSecond += item.value;
        }
    });
    if (clicksPerSecond > 0) {
        // La ganancia de los auto-clickers también se beneficia del Frenesí de Clics
        const autoClickMultiplier = gameState.activeBuffs.clickFrenzy.timeLeft > 0 ? CLICK_FRENZY_MULTIPLIER : 1;
        const autoClickGain = (gameState.moneyPerClick * autoClickMultiplier) * (clicksPerSecond * deltaTime);
        addMoney(autoClickGain);
    }
    
    // Ganancias pasivas (DPS)
    const dpsMultiplier = gameState.activeBuffs.dpsOverload.timeLeft > 0 ? DPS_OVERLOAD_MULTIPLIER : 1;
    const passiveGain = (gameState.moneyPerSecond * dpsMultiplier) * deltaTime; // Se multiplica por deltaTime (0.1)
    addMoney(passiveGain);

    // ---- ACTUALIZACIONES FINALES ----
    checkAchievements();
    checkMissions();
    updateUI(); 
}

// Esta función calcula y establece cuándo aparecerá el próximo Pop-up.
function scheduleNextPopup() {
    let frequencyMultiplier = 1;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'popup_frequency') {
            frequencyMultiplier += item.value;
        }
    });

    const minSeconds = POPUP_MIN_SECONDS / frequencyMultiplier;
    const maxSeconds = POPUP_MAX_SECONDS / frequencyMultiplier;

    const randomIntervalSeconds = Math.random() * (maxSeconds - minSeconds) + minSeconds;
    gameState.nextPopupTimestamp = Date.now() + randomIntervalSeconds * 1000;
    console.log(`Próximo pop-up programado en ${Math.round(randomIntervalSeconds)} segundos.`);
}

// 1. Decide qué pop-up mostrar y llama a la UI para renderizarlo
function triggerPopup() {
	// Si la pestaña principal no está activa, no hagas nada.
    if (!document.getElementById('main-tab').classList.contains('active')) return;
    // Evita que aparezcan pop-ups si ya hay un buff activo para no solaparlos
    const buffs = gameState.activeBuffs;
    if (buffs.clickFrenzy.timeLeft > 0 || buffs.dpsOverload.timeLeft > 0) {
        console.log("Se omitió un pop-up porque ya hay un beneficio activo.");
        return; 
    }

    const popupTypes = ['jackpot', 'clickFrenzy', 'dpsOverload'];
    const randomType = popupTypes[Math.floor(Math.random() * popupTypes.length)];
    
    // Llamamos a una función de la UI que crearemos en el Sprint 2
    renderPopup(randomType);
    console.log(`¡Pop-up de tipo "${randomType}" activado!`);
}

// 2. Aplica los efectos cuando el jugador hace clic en el pop-up
function applyJackpot() {
	gameState.stats.popupsClicked++;
    // Calcula la recompensa basándose en el DPS base (sin multiplicadores de buffs)
    const baseDps = gameState.moneyPerSecond; // No necesitamos dividir, ya que el buff se aplica en el gameLoop
    const reward = baseDps * JACKPOT_DPS_EQUIVALENT;
    addMoney(reward);
    
    // Muestra una notificación visual
    showNotification("¡Jackpot!", `+${formatNumber(reward)}`, '💰');
    playSound('buySuccess');
}

function applyClickFrenzy() {
    let durationBonus = 0;
    gameState.shopUpgrades.forEach(itemId => {
        const item = shopItems[itemId];
        if (item && item.type === 'buff_duration' && item.value.buff === 'clickFrenzy') {
            durationBonus += item.value.seconds;
        }
    });
    
    gameState.activeBuffs.clickFrenzy.timeLeft = CLICK_FRENZY_DURATION_SECONDS + durationBonus; // [MODIFICADO]
    gameState.stats.clickFrenziesActivated++;
    
    showNotification("¡Frenesí de Clics!", `¡Valor de clics x${CLICK_FRENZY_MULTIPLIER} por ${CLICK_FRENZY_DURATION_SECONDS + durationBonus}s!`, '🖱️💨');
    playSound('buySuccess');
}

function applyDpsOverload() {
	gameState.stats.popupsClicked++;
	gameState.stats.dpsOverloadsActivated++;
    gameState.activeBuffs.dpsOverload.timeLeft = DPS_OVERLOAD_DURATION_SECONDS;

    showNotification("¡Sobrecarga de Red!", `¡DPS x${DPS_OVERLOAD_MULTIPLIER} por ${DPS_OVERLOAD_DURATION_SECONDS}s!`, '📈');
    playSound('buySuccess');
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
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    saveGame();
	document.getElementById('game-container').classList.remove('popup-visible');
    showScreen('main-menu-screen');
    stopAllEraMusic();

    if (!isSoundPlaying('titleMusic')) {
        playSound('titleMusic');
        // El volumen se establece al cargar por primera vez en getSound(),
        // pero podemos asegurarlo aquí también si es necesario.
        const sound = getSound('titleMusic');
        if(sound) sound.volume(gameState.settings.musicVolume);
    }
    // El fade necesita el volumen actual. getSound() nos da acceso a la instancia cargada.
    const currentTitleMusic = getSound('titleMusic');
    if (currentTitleMusic) {
        fadeSound('titleMusic', currentTitleMusic.volume(), gameState.settings.musicVolume, 1500);
    }
}

// ---- LÓGICA DE INICIALIZACIÓN ----
let inGameListenersInitialized = false;

function initializeInGameEventListeners() {
    if (inGameListenersInitialized) return;
    document.getElementById('game-tab-bar').addEventListener('click', (event) => {
        const navButton = event.target.closest('.tab-btn');
        if (navButton) showTab(navButton.dataset.tab);
    });
    document.getElementById('main-click-button').addEventListener('click', (event) => {
        generateMoneyOnClick();
        showFloatingNumber(event);
        playSound('click');
    });
	document.getElementById('vault-collect-button').addEventListener('click', openVault);
    document.getElementById('upgrades-container').addEventListener('click', (event) => {
        const button = event.target.closest('.buy-button');
        if (!button || button.classList.contains('is-disabled')) {
            playSound('buyFail');
            return;
        }
        buyUpgrade(button.dataset.upgradeId);
    });
    document.getElementById('evolution-tab').addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (!button) return; // Si el clic no fue en un botón, no hacemos nada.

        // Comprobamos el ID del botón presionado
        if (button.id === 'relaunch-button') {
            if (button.classList.contains('is-disabled')) {
                playSound('buyFail');
            } else {
                prestigeReset();
            }
        } else if (button.id === 'evolve-era-button') {
            if (button.classList.contains('is-disabled')) {
                playSound('buyFail');
            } else {
                evolveToNextEra();
            }
        }
    });
	document.getElementById('shop-tab').addEventListener('click', (event) => {
        const button = event.target.closest('.buy-shop-item-button');
        if (button && !button.disabled) buyShopItem(button.dataset.itemId);
    });
	document.getElementById('top-shortcut-bar').addEventListener('click', (event) => {
		const shortcutButton = event.target.closest('.shortcut-btn');
		if (!shortcutButton) return;
		if (shortcutButton.id === 'menu-button-shortcut') returnToMainMenu();
		else if (shortcutButton.dataset.tab) showTab(shortcutButton.dataset.tab);
	});
    inGameListenersInitialized = true;
}

function startGame() {
    showScreen('game-container');
    showTab('main-tab');
    initializeInGameEventListeners();
    loadGame();
	loadEraStyle(gameState.currentEra);
    
	stopSound('titleMusic');

    playEraMusic(gameState.currentEra);
    recalculateGains();
    renderUpgrades();
	renderAchievements();
	renderMissions();
	initializeShop();
    if(gameLoopInterval) clearInterval(gameLoopInterval);
    gameLoopInterval = setInterval(gameLoop, 100);
	
    const tutorialShown = localStorage.getItem('tutorialShown');
    if (!tutorialShown) {
        startInteractiveTutorial();
        localStorage.setItem('tutorialShown', 'true');
    }
}

function loadEraStyle(eraId) {
    const styleLink = document.getElementById('era-style');
    if (styleLink && eraId) {
        const eraNumber = eraId.replace('era', ''); 
        styleLink.href = `css/eras/era-${eraNumber}g.css`; 
    }
}

function playEraMusic(eraId) {
    const musicName = `${eraId}Music`;
    if (!isSoundPlaying(musicName)) {
        playSound(musicName);
        const sound = getSound(musicName);
        if(sound) sound.volume(gameState.settings.musicVolume);
    }
}

function stopAllEraMusic() {
    stopSound('era1Music');
    stopSound('era2Music');
    // Añadir futuras músicas de era aquí...
    // stopSound('era3Music');
}

// ---- SECUENCIA DE ARRANQUE GENERAL ----
window.addEventListener('load', async () => {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingContent = loadingScreen.querySelector('.loading-content');
    const progressBar = document.getElementById('progress-bar');
    const statusText = document.getElementById('loading-status-text');
    showScreen('loading-screen');

    const MIN_LOADING_TIME_MS = 2500; // 2.5 segundos de tiempo mínimo visible
    const loadDataPromise = loadGameData();
    const minimumTimePromise = new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME_MS));
    let visualProgress = 0;
    const progressInterval = setInterval(() => {
        if (visualProgress < 99) {
            visualProgress++;
            progressBar.style.width = `${visualProgress}%`;
        }
    }, MIN_LOADING_TIME_MS / 100);

    const [dataLoadedResult] = await Promise.all([loadDataPromise, minimumTimePromise]);
    clearInterval(progressInterval);

    if (!dataLoadedResult) {
        statusText.textContent = 'ERROR: Fallo en la conexión.';
        progressBar.style.backgroundColor = '#D32F2F'; // Barra roja
        progressBar.style.width = '100%'; // Llena la barra de error
        return;
    }

    progressBar.style.width = '100%';
    statusText.textContent = '¡Conexión establecida! Sistema listo.';
    loadGame();
    initializeVolumes(gameState.settings.musicVolume, gameState.settings.sfxVolume);

    setTimeout(() => {
        loadingContent.classList.add('fade-out');
        setTimeout(() => {
            const tapToStartScreen = document.getElementById('tap-to-start-screen');
            showScreen('tap-to-start-screen');
            tapToStartScreen.addEventListener('click', () => {
                showScreen('main-menu-screen');
                playSound('titleMusic');
                fadeSound('titleMusic', 0, gameState.settings.musicVolume, 2000);
            }, { once: true });
        }, 1000);
    }, 800);
	
	document.getElementById('play-button').addEventListener('click', () => {
		fadeSound('titleMusic', gameState.settings.musicVolume, 0, 1000);
		const introHasBeenShown = localStorage.getItem('introShown');
		if (!introHasBeenShown) {
			localStorage.setItem('introShown', 'true');
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

// ==================================================================
//               FUNCIONES DE DESARROLLO (CHEAT CODES)
//      (Eliminar o comentar antes de subir a producción)
// ==================================================================

/**
 * Función de trampa para desbloquear instantáneamente la Era 2.
 * Otorga los puntos de prestigio necesarios y completa todos los
 * logros y misiones de la Era 1.
 */
function dev_unlockEra2() {
    // 1. Otorga los puntos de prestigio necesarios
    const requiredPrestige = 100;
    if (gameState.prestigePoints < requiredPrestige) {
        gameState.prestigePoints = requiredPrestige;
        console.log(`DEV: Se han establecido los Puntos de Innovación a ${requiredPrestige}.`);
    }

    // 2. Completa todas las misiones de la Era 1
    const era1Missions = Object.keys(missions.era1);
    era1Missions.forEach(missionId => {
        if (!gameState.completedMissions.includes(missionId)) {
            gameState.completedMissions.push(missionId);
        }
    });
    console.log('DEV: Todas las misiones de la Era 1 han sido completadas.');

    // 3. Desbloquea todos los logros de la Era 1
    const era1Achievements = Object.keys(achievements.era1);
    era1Achievements.forEach(achievementId => {
        if (!gameState.unlockedAchievements.includes(achievementId)) {
            gameState.unlockedAchievements.push(achievementId);
        }
    });
    console.log('DEV: Todos los logros de la Era 1 han sido desbloqueados.');

    // 4. Actualiza la interfaz de usuario para reflejar los cambios
    updateUI();
    renderMissions(); // Vuelve a renderizar para que aparezcan como completadas
    renderAchievements(); // Vuelve a renderizar para que aparezcan como desbloqueados

    // 5. Mensaje de confirmación
    const message = "¡DESBLOQUEO DE ERA 2 LISTO! El botón 'Evolucionar' ya debería estar activo en la pestaña de Evolución.";
    console.log(`%c${message}`, 'color: #00FF00; font-weight: bold; font-size: 14px;');
    
    // Opcional: Notificación en el juego
    showNotification('¡Modo Dios!', 'Requisitos de la Era 2 cumplidos.', '👑');
}