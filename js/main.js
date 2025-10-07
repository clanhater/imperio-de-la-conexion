// ---- DEFINICIONES Y ESTADO DEL JUEGO (ESTRUCTURA BALANCEADA Y SINEÉRGICA) ----
const upgrades = {
    'infraestructura': {
        name: 'Infraestructura y Expansión',
        items: {
            'lineaCobre': {
                name: 'Instalar Línea de Cobre',
                description: 'El primer paso. Conecta clientes y genera ingresos pasivos.',
                type: 'dps', 
                baseCost: 20,         // Coste Alto
                baseEffect: 0.5,      // Efecto Bajo
                requirements: [
                    // Nivel 10: Requisitos iniciales de sinergia para obligar a diversificar
                    { level: 10, reqs: { 'kitHerramientas': 5, 'marketingLocal': 1 } }, 
                    // Nivel 30: El negocio crece, se necesita más equipamiento de cliente
                    { level: 30, reqs: { 'tecladoTonos': 15 } }, 
                    // Nivel 75: Cierre del capítulo analógico. Requiere un gran despliegue de software y hardware.
                    { level: 75, reqs: { 'centralitaAnaloga': 10, 'softwareTerminal': 40 } } 
                ]
            },
            'antenaRepetidora': {
                name: 'Instalar Antena Repetidora',
                description: 'Amplifica la señal para llegar a las afueras de la ciudad.',
                type: 'dps', 
                baseCost: 180,        // Coste Alto
                baseEffect: 5,        // Efecto Bajo
                requirements: [
                    // Nivel 1: Infraestructura base para poder repetir
                    { level: 1, reqs: { 'lineaCobre': 25 } },
                    // Nivel 15: Requiere software de gestión de nodos para ser eficiente
                    { level: 15, reqs: { 'softwareTerminal': 10 } }, 
                    // Nivel 35: Requiere la centralita como hub de gestión y modems para el alcance
                    { level: 35, reqs: { 'centralitaAnaloga': 5, 'modem2400': 15 } } 
                ]
            },
            'centralitaAnaloga': {
                name: 'Construir Centralita Analógica',
                description: 'Un conmutador que gestiona docenas de líneas automáticamente.',
                type: 'dps', 
                baseCost: 1800,       // Coste Alto
                baseEffect: 30,       // Efecto Bajo
                requirements: [
                    // Nivel 1: BLOQUEO PRINCIPAL - Requiere red, modems y software de gestión. TRIPLE REQUISITO.
                    { level: 1, reqs: { 'lineaCobre': 50, 'modem2400': 5, 'softwareTerminal': 20 } }, 
                    // Nivel 15: La Centralita requiere contenido (BBS) para generar tráfico masivo
                    { level: 15, reqs: { 'servidorBBS': 5 } },
                    // Nivel 40: Requiere despliegue avanzado de red y hardware de cliente de alta calidad
                    { level: 40, reqs: { 'tarjetaRed': 5, 'antenaRepetidora': 25 } } 
                ]
            },
            'centralitaDigital': {
                name: 'Actualizar a Centralita Digital',
                description: 'Reemplaza relés por microchips para una eficiencia sin precedentes.',
                type: 'dps', 
                baseCost: 50000,      // Coste Muy Alto
                baseEffect: 220,      // Efecto Bajo
                requirements: [
                    // Nivel 1: BLOQUEO DE ERA - Requiere la base de la red antigua, el protocolo y el contenido. TRIPLE REQUISITO.
                    { level: 1, reqs: { 'centralitaAnaloga': 35, 'protocoloTCPIP': 5, 'servidorBBS': 15 } }, 
                    // Nivel 25: Exige una base masiva de clientes con hardware digital (tarjeta de red)
                    { level: 25, reqs: { 'tarjetaRed': 50 } } 
                ]
            },
            'fibraOptica': {
                name: 'Red de Fibra Óptica',
                description: 'Tecnología experimental que usa pulsos de luz. Un salto cuántico.',
                type: 'dps', 
                baseCost: 250000,     // Coste Extremo
                baseEffect: 500,      // Efecto Bajo
                requirements: [
                    // Nivel 1: Exige el dominio completo de la red digital (Centralita Digital) y el estándar (TCP/IP)
                    { level: 1, reqs: { 'centralitaDigital': 15, 'protocoloTCPIP': 20 } }, 
                    // Nivel 20: Requiere la cobertura total (Antenas) y la adopción de hardware extremo (Tarjeta de Red)
                    { level: 20, reqs: { 'tarjetaRed': 100, 'antenaRepetidora': 50 } }
                ]
            }
        }
    },
    'equipamiento': {
        name: 'Equipamiento y Terminales',
        items: {
            'kitHerramientas': {
                name: 'Kit de Herramientas Básico',
                description: 'Un buen soldador y alicates. Cada conexión manual es más limpia.',
                type: 'dpc', 
                baseCost: 15,
                baseEffect: 1,
                requirements: [] // El DPC inicial no tiene requisitos
            },
            'tecladoTonos': {
                name: 'Teclado de Tonos DTMF',
                description: 'Reemplaza el dial rotatorio, optimizando cada clic.',
                type: 'dpc', 
                baseCost: 100,
                baseEffect: 3,
                requirements: [
                    // Nivel 5: Necesitas más que las herramientas, necesitas la red básica
                    { level: 5, reqs: { 'kitHerramientas': 10, 'lineaCobre': 5 } },
                    // Nivel 25: Necesitas gestión de línea para manejar el tráfico DPC optimizado
                    { level: 25, reqs: { 'centralitaAnaloga': 1, 'softwareTerminal': 10 } } 
                ]
            },
            'modem2400': {
                name: 'Módem 2400 baudios',
                description: 'Permite a los ordenadores comunicarse por vía telefónica.',
                type: 'dps', 
                baseCost: 800,        // Coste Alto
                baseEffect: 12,       // Efecto Bajo
                requirements: [
                    // Nivel 1: Requiere alcance de red para que los modems sean útiles
                    { level: 1, reqs: { 'antenaRepetidora': 15 } }, 
                    // Nivel 20: Exige software de terminal para un uso eficiente de los datos
                    { level: 20, reqs: { 'softwareTerminal': 25 } }, 
                    // Nivel 40: Requiere la centralita analógica para manejar múltiples conexiones
                    { level: 40, reqs: { 'centralitaAnaloga': 10 } }
                ]
            },
            'tarjetaRed': {
                name: 'Tarjeta de Red ISA',
                description: 'Una placa para PCs que permite conexiones directas y eficientes.',
                type: 'dpc', 
                baseCost: 15000,      // Coste Alto
                baseEffect: 25,       // Efecto Bajo
                requirements: [
                    // Nivel 1: BLOQUEO - Necesitas el protocolo digital y un software de terminal muy maduro
                    { level: 1, reqs: { 'softwareTerminal': 50, 'protocoloTCPIP': 1 } }, 
                    // Nivel 15: Requiere una centralita digital para que el hardware se conecte a alta velocidad
                    { level: 15, reqs: { 'centralitaDigital': 5 } }
                ]
            }
        }
    },
    'software': {
        name: 'Software y Protocolos',
        items: {
            'marketingLocal': {
                name: 'Campaña de Marketing Local',
                description: 'Anuncios en periódicos. Atrae demanda para tu red de cobre.',
                type: 'dps', 
                baseCost: 300,        // Coste Alto
                baseEffect: 3,        // Efecto Bajo
                requirements: [
                    // Nivel 1: Requiere tener una red mínima antes de publicitar
                    { level: 1, reqs: { 'lineaCobre': 10 } }, 
                    // Nivel 15: Necesita un equipo de cliente mejor (DPC) para manejar la afluencia
                    { level: 15, reqs: { 'tecladoTonos': 10 } }
                ]
            },
            'softwareTerminal': {
                name: 'Software de Terminal',
                description: 'Un código más limpio para procesar datos más rápido en cada clic.',
                type: 'dpc', 
                baseCost: 180,
                baseEffect: 5,
                requirements: [
                    // Nivel 1: Software inicial requiere hardware de cliente (Teclados de Tonos)
                    { level: 1, reqs: { 'tecladoTonos': 5 } },
                    // Nivel 20: Se necesita una red de cobre extensa para justificar el software avanzado
                    { level: 20, reqs: { 'lineaCobre': 30 } }, 
                    // Nivel 40: Requiere el módem para la transferencia de datos y la centralita para el proceso
                    { level: 40, reqs: { 'modem2400': 10, 'centralitaAnaloga': 5 } } 
                ]
            },
            'servidorBBS': {
                name: 'Servidor BBS "El Eco Digital"',
                description: 'Crea una comunidad online. Los usuarios pagan una cuota por acceso.',
                type: 'dps', 
                baseCost: 9000,        // Coste Alto
                baseEffect: 80,       // Efecto Bajo
                requirements: [
                    // Nivel 1: Requiere la Centralita Analógica como base de hosting
                    { level: 1, reqs: { 'centralitaAnaloga': 5 } }, 
                    // Nivel 10: Requiere un software de terminal muy depurado para su gestión
                    { level: 10, reqs: { 'softwareTerminal': 30 } },
                    // Nivel 25: Necesita la base de la red digital (TCP/IP) para escalar su contenido
                    { level: 25, reqs: { 'protocoloTCPIP': 5 } } 
                ]
            },
            'protocoloTCPIP': {
                name: 'Implementar Protocolo TCP/IP',
                description: 'Estandariza tu red para un tráfico masivo. La base de Internet.',
                type: 'dpc', 
                baseCost: 65000,      // Coste Muy Alto
                baseEffect: 60,       // Efecto Bajo
                requirements: [
                    // Nivel 1: BLOQUEO DE ERA - Requiere contenido (BBS), red digital (Centralita Digital) y hardware de cliente (Tarjeta de Red). TRIPLE REQUISITO.
                    { level: 1, reqs: { 'servidorBBS': 15, 'centralitaDigital': 1, 'tarjetaRed': 5 } }, 
                    // Nivel 10: Requiere una base masiva de la red antigua que el nuevo protocolo va a reemplazar
                    { level: 10, reqs: { 'centralitaAnaloga': 50 } }
                ]
            }
        }
    }
};

// AHORA, REEMPLAZA EL OBJETO "gameState" CON ESTE, NOTA LA NUEVA LISTA EN "upgradeLevels"
let gameState = {
    money: 0,
    moneyPerClick: 1,
    moneyPerSecond: 0,
    totalMoneyEver: 0,
    prestigePoints: 0,
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

// ---- LÓGICA DE GUARDADO, CÁLCULO Y PRINCIPAL (SIN CAMBIOS) ----
const SAVE_KEY = 'imperioConexionSave_v1'; 
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
		const saved = localStorage.getItem(SAVE_KEY); 
		if (saved) { 
			gameState = Object.assign(gameState, JSON.parse(saved)); 
		} 
	} catch(e) {} 
} 
function resetSave() { 
	if (confirm("¿Borrar progreso?")) { 
		isResetting = true; 
		localStorage.removeItem(SAVE_KEY); 
		window.location.reload(); 
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
    return Math.floor(upgrade.baseCost * Math.pow(1.12, level));
}

function calculatePrestigePointsToGain() {
    const f = 100000;
    const p = Math.floor(Math.pow(gameState.totalMoneyEver / f, 0.4));
    return p > 0 ? p : 0;
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

    const prestigeMultiplier = 1 + (gameState.prestigePoints * 0.02);
    
    gameState.moneyPerClick = (baseDpc * dpcMultiplier) * prestigeMultiplier;
    gameState.moneyPerSecond = (baseDps * dpsMultiplier) * prestigeMultiplier;
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
function addMoney(amount) { 
	if(typeof amount === 'number' && !isNaN(amount)) { 
		gameState.money += amount; 
		gameState.totalMoneyEver += amount; 
	} 
} 
function generateMoneyOnClick() { 
	addMoney(gameState.moneyPerClick); 
} 
function prestigeReset() { 
	const points = calculatePrestigePointsToGain(); 
	if (points > 0) { 
		if (confirm(`¿Relanzar para ganar ${points} Puntos?`)) { 
			gameState.prestigePoints += points; 
			gameState.money = 0; 
			gameState.totalMoneyEver = 0; 
			gameState.upgradeLevels = { 'tecladoTonos': 0, 'lineaCobre': 0, 'antenaRepetidora': 0, 'centralitaTelefonica': 0 }; 
			recalculateGains(); 
			saveGame(); 
		} 
	} 
}

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
function returnToMainMenu() {
    // 1. Detener el bucle del juego (DPS)
    if (gameLoopInterval) {
        clearInterval(gameLoopInterval);
        gameLoopInterval = null;
    }
    
    // 2. Guardar el progreso
    saveGame();
    
    // 3. Mostrar la pantalla principal del menú
    showScreen('main-menu-screen');
    
    // 4. Reiniciar la música (subir volumen si se bajó antes)
    sounds.titleMusic.volume(parseFloat(localStorage.getItem('masterVolume')) || 1.0);
    
    // Opcional: Pausar la música si quieres que se reanude en el menú, 
    // pero si está en bucle, solo nos aseguramos del volumen.
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
	
	document.getElementById('top-shortcut-bar').addEventListener('click', (event) => {
        const shortcutButton = event.target.closest('.shortcut-btn');
        const shortcutId = shortcutButton ? shortcutButton.id : null;

        if (shortcutId === 'menu-button-shortcut') {
            returnToMainMenu(); // Llama a la nueva función
            return; // Sale de la función para no activar el pop-up de "Próximamente"
        }
        
        if (shortcutButton) {
            // Añadimos la clase al contenedor principal para mostrar el pop-up y el fondo
            gameContainer.classList.add('popup-visible');
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
    document.getElementById('play-button').addEventListener('click', () => { sounds.titleMusic.volume(0.2); startGame(); });
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