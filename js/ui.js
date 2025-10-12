const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
let activePopupElement = null; // Para rastrear el elemento del pop-up en la UI
let popupTimeoutId = null;     // Para rastrear el temporizador que lo oculta

// ---- ELEMENTOS DE LA INTERFAZ (UI ELEMENTS) ----
const moneyDisplay = document.getElementById('money-display');
const dpsDisplay = document.getElementById('dps-display');
const dpcDisplay = document.getElementById('dpc-display');
const upgradesContainer = document.getElementById('upgrades-container');
const prestigePointsDisplay = document.getElementById('prestige-points-display');
const relaunchButton = document.getElementById('relaunch-button'); // CONSTANTE NUEVA

function formatNumber(number) { if (Math.abs(number) < 1000) return number.toFixed(0); const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"]; const tier = Math.floor(Math.log10(Math.abs(number)) / 3); if (tier >= suffixes.length) return number.toExponential(2).replace('+', ''); const suffix = suffixes[tier]; const scale = Math.pow(10, tier * 3); const scaled = number / scale; return scaled.toFixed(2) + suffix; }
function showFloatingNumber(event, amount) {
    const container = document.querySelector('.main-click-area');
    if (!container) return;

    // Si no se pasa una cantidad, usamos el valor por defecto como antes
    const displayAmount = amount || gameState.moneyPerClick;

    const floatingNumber = document.createElement('span');
    floatingNumber.className = 'floating-number';
    
    // Usamos 'displayAmount' para mostrar siempre el valor correcto
    floatingNumber.textContent = `+$${formatNumber(displayAmount)}`;
    
    floatingNumber.style.left = `${event.pageX - container.getBoundingClientRect().left}px`;
    floatingNumber.style.top = `${event.pageY - container.getBoundingClientRect().top}px`;
    container.appendChild(floatingNumber);
    setTimeout(() => {
        floatingNumber.remove();
    }, 1000);
}

function renderUpgrades() {
    // Los iconos ahora incluyen las nuevas mejoras que hemos añadido.
    const icons = {
        // --- Era 1 ---
        'lineaCobre': '🔗',
        'antenaRepetidora': '📡',
        'centralitaAnaloga': '🏢',
        'centralitaDigital': '🤖',
        'fibraOptica': '✨',
        'kitHerramientas': '🛠️',
        'tecladoTonos': '⌨️',
        'modem2400': '📠',
        'tarjetaRed': '🔌',
        'softwareTerminal': '👨‍💻',
        'servidorBBS': '💾',
        'protocoloTCPIP': '🌐',
        'tecnicoJunior': '👷',
        'marketingLocal': '📰',
        'capacitacion': '🎓',

        // --- Era 2 ---
        'modem56k': '📞',
        'torreGSM': '🗼',
        'ispDatacenter': '🎛️',
        'redISDN': '📟',
        'backboneFibra': '🌍',
        'htmlBasico': '✍️',
        'cgiScripts': '⚙️',
        'servidorEmail': '📧',
        'portalWeb': '📰',
        'bannerPublicitario': '📈',
        'algoritmoCompresion': '📦',
        'centroSMS': '💬',
        'roamingAcuerdo': '🤝',
        'tonosPolifonicos': '🎵',
        'tarjetaPrepago': '💳'
    };

    let html = '';
	const currentEraUpgrades = upgrades[gameState.currentEra];
    if (!currentEraUpgrades) {
        upgradesContainer.innerHTML = "<p>No hay mejoras disponibles en esta era.</p>";
        return;
    }
    // El primer bucle itera sobre las CATEGORÍAS (ej. 'infraestructura', 'equipamiento').
    for (const categoryId in currentEraUpgrades) {
        const category = currentEraUpgrades[categoryId];
        
        // Añadimos un encabezado H3 para cada categoría.
        html += `<h3 class="category-header">${category.name}</h3>`;

        // El segundo bucle (anidado) itera sobre las MEJORAS dentro de esa categoría.
        for (const upgradeId in category.items) {
            const upgrade = category.items[upgradeId];
            // Generamos el HTML para cada mejora, igual que antes.
            // Hemos añadido un ID al div contenedor principal para poder seleccionarlo más tarde.
            html += `
                <div class="upgrade" id="upgrade-container-${upgradeId}">
                    <div class="upgrade-icon">${icons[upgradeId] || '⚙️'}</div>
                    <div class="upgrade-info">
                        <h4>${upgrade.name} (Nivel <span id="level-${upgradeId}">0</span>)</h4>
                        <p>${upgrade.description}</p>
                        <strong class="upgrade-gain" id="gain-${upgradeId}"></strong>
                    </div>
                    <button id="buy-${upgradeId}" class="buy-button" data-upgrade-id="${upgradeId}">
                        $<span id="cost-${upgradeId}">0</span>
                    </button>
                </div>`;
        }
    }
    // Finalmente, inyectamos todo el HTML generado en el contenedor.
    upgradesContainer.innerHTML = html;
}

function renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    // [NUEVO] Obtenemos los datos de la era actual de forma dinámica.
    const eraAchievements = achievements[gameState.currentEra];
    if (!eraAchievements) {
        container.innerHTML = '<p>No hay logros disponibles para esta era.</p>';
        return;
    }

    let html = '';
    
    // Iteramos sobre los logros de la era actual
    for (const achievementId in eraAchievements) {
        const achievement = eraAchievements[achievementId];
        const isUnlocked = gameState.unlockedAchievements.includes(achievementId);
        
        html += `
            <div class="achievement ${isUnlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">${isUnlocked ? '🏆' : '❓'}</div>
                <div class="achievement-info">
                    <h4>${achievement.name}</h4>
                    <p>${achievement.description}</p>
                </div>
                <div class="achievement-reward">
                    <span>+${achievement.reward.gems} 💎</span>
                </div>
            </div>
        `;
    }
    container.innerHTML = html;
}

function renderMissions() {
    const container = document.getElementById('missions-container');
    if (!container) return;

    // [NUEVO] Obtenemos los datos de la era actual de forma dinámica.
    const eraMissions = missions[gameState.currentEra];
    if (!eraMissions) {
        container.innerHTML = '<p>No hay misiones disponibles para esta era.</p>';
        return;
    }

    let currentPhase = 1;
    let allMissionsCompleted = true;

    // 1. Determinar la fase actual del jugador
    for (const missionId in eraMissions) {
        const mission = eraMissions[missionId];
        if (!gameState.completedMissions.includes(missionId)) {
            allMissionsCompleted = false;
            currentPhase = mission.phase;
            break;
        }
        currentPhase = mission.phase;
    }
    
    if (allMissionsCompleted) {
        // Busca la última misión para obtener la última fase
        const missionIds = Object.keys(eraMissions);
        if (missionIds.length > 0) {
            currentPhase = eraMissions[missionIds[missionIds.length - 1]].phase;
        }
    }

    // 2. Construir el HTML
    let html = '';
    const phaseNames = ["FASE 1: EL INICIO", "FASE 2: EXPANSIÓN INICIAL", "FASE 3: LA ERA DIGITAL", "FASE 4: PREPARANDO EL FUTURO"];
    
    // Asegurarse de que no intentamos acceder a un índice de phaseNames que no existe
    const phaseTitle = phaseNames[currentPhase - 1] || `FASE ${currentPhase}`;
    html += `<h3 class="mission-phase-title">${phaseTitle}</h3>`;

    for (const missionId in eraMissions) {
        const mission = eraMissions[missionId];

        if (mission.phase === currentPhase) {
            const isCompleted = gameState.completedMissions.includes(missionId);
            
            html += `
                <div class="mission ${isCompleted ? 'completed' : ''}">
                    <div class="mission-icon">${isCompleted ? '✅' : '📋'}</div>
                    <div class="mission-info">
                        <h4>${mission.name}</h4>
                        <p>${mission.description}</p>
                    </div>
                    <div class="mission-reward">
                        <span>+${mission.reward.gems} 💎</span>
                    </div>
                </div>
            `;
        }
    }
    
    if (allMissionsCompleted) {
         html += '<p style="text-align: center; color: #99FF99; margin-top: 20px;">¡Has completado todas las misiones de esta Era!</p>';
    }

    container.innerHTML = html;
}

// FUNCIÓN 1: Se ejecuta UNA SOLA VEZ para construir la estructura de la tienda.
function initializeShop() {
    const container = document.getElementById('shop-container');
    if (!container) return;

    let html = '';
    for (const itemId in shopItems) {
        const item = shopItems[itemId];

        // La clave es añadir IDs únicos a los elementos que necesitaremos actualizar después.
        html += `
            <div class="shop-item" id="shop-item-${itemId}">
                <h4>${item.name}</h4>
                <p>${item.description}</p>
                <button class="buy-shop-item-button" id="buy-shop-item-${itemId}" data-item-id="${itemId}">
                    <!-- El texto del botón se actualizará dinámicamente -->
                </button>
            </div>
        `;
    }
    container.innerHTML = html;
}

// FUNCIÓN 2: Se ejecuta en CADA CICLO para actualizar los elementos existentes.
function updateShopUI() {
    const gemsDisplay = document.getElementById('shop-gems-display');
    if (!gemsDisplay) return;

    gemsDisplay.textContent = gameState.gems;

    for (const itemId in shopItems) {
        const item = shopItems[itemId];
        const container = document.getElementById(`shop-item-${itemId}`);
        const button = document.getElementById(`buy-shop-item-${itemId}`);

        // Si los elementos no existen, no hagas nada (salida segura)
        if (!container || !button) continue;

        const canAfford = gameState.gems >= item.cost;
        const isPurchased = item.isPurchased(gameState);

        // Actualiza la clase del contenedor
        container.classList.toggle('purchased', isPurchased);

        if (isPurchased) {
            button.textContent = 'Comprado ✔️';
            button.disabled = true;
        } else {
            button.textContent = `Coste: ${item.cost} 💎`;
            button.disabled = !canAfford;
        }
    }
}

function updateVaultUI() {
	const container = document.getElementById('data-vault-container');
	const fill = document.getElementById('vault-progress-fill');
	const statusDisplay = document.getElementById('vault-status-display');
    const collectButton = document.getElementById('vault-collect-button');
    
    if (!container) return; // Si no existe el contenedor, no hagas nada
    
    // Lógica de visibilidad: La bóveda solo existe a partir de la Era 2
    const currentEraNumber = parseInt(gameState.currentEra.replace('era', ''));
	if (currentEraNumber < 2) {
		container.classList.add('hidden');
		return;
	}
	container.classList.remove('hidden');
    
	// Calcula la capacidad máxima de la bóveda
	let capacityBonus = 0;
	gameState.shopUpgrades.forEach(itemId => {
		const item = shopItems[itemId];
		if (item && item.type === 'vault_capacity') capacityBonus += item.value;
	});
	const vaultCapacity = (gameState.moneyPerSecond || 1) * (VAULT_CAPACITY_DPS_MULTIPLIER + capacityBonus);
    
	// Actualiza la barra de progreso
	const progress = Math.min((gameState.dataVault.currentValue / vaultCapacity) * 100, 100);
	fill.style.width = `${progress}%`;
    
	// Actualiza el texto de estado
	statusDisplay.textContent = `Contenido: $${formatNumber(gameState.dataVault.currentValue)} / $${formatNumber(vaultCapacity)}`;
    
	// Lógica del botón de recoger
	const now = Date.now();
	const cooldownEndTime = gameState.dataVault.cooldownTimestamp;
    
	if (now < cooldownEndTime) {
		// Si está en cooldown
		collectButton.disabled = true;
		const timeLeftSeconds = Math.round((cooldownEndTime - now) / 1000);
		const minutes = Math.floor(timeLeftSeconds / 60);
        const seconds = timeLeftSeconds % 60;
        collectButton.textContent = `Enfriamiento (${minutes}:${seconds.toString().padStart(2, '0')})`;
	} else {
		// Si no está en cooldown
		collectButton.textContent = 'Recoger';
        // El botón se activa solo si hay algo que recoger
		collectButton.disabled = gameState.dataVault.currentValue <= 0;
	}
}

// ---- FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN DE UI ----
function updateUI() {
    // === Actualización de Recursos Principales ===
    moneyDisplay.textContent = `Capital: $${formatNumber(gameState.money)}`;
    dpsDisplay.textContent = `Flujo de Red: +$${formatNumber(gameState.moneyPerSecond)}/s`;
    dpcDisplay.textContent = `Ancho de Banda: +$${formatNumber(gameState.moneyPerClick)}/conexión`;

	updateActiveBuffsUI();
	updateVaultUI();

    // === Actualización de Puntos de Innovación y Era Actual ===
    const bonus = gameState.prestigePoints * 2;
    prestigePointsDisplay.textContent = `Puntos de Innovación: ${gameState.prestigePoints} (+${bonus}%)`;
    
	const eraNameDisplay = document.getElementById('current-era-name');
    const eraDescriptionDisplay = document.getElementById('current-era-description');
    const currentEraData = ERA_DATA[gameState.currentEra];

    if (currentEraData) {
        eraNameDisplay.textContent = currentEraData.name;
        eraDescriptionDisplay.textContent = currentEraData.description;
    }
	
    // === Lógica para el botón de Relanzamiento (Prestigio) ===
    const pointsToGain = calculatePrestigePointsToGain();
    if (pointsToGain > 0) {
        relaunchButton.classList.remove('is-disabled');
        relaunchButton.textContent = `Relanzar por ${pointsToGain} Puntos`;
        relaunchButton.classList.add('can-afford-glow');
    } else {
        relaunchButton.classList.add('is-disabled');
        relaunchButton.textContent = 'Relanzar';
        relaunchButton.classList.remove('can-afford-glow');
    }
	
	const evolveButton = document.getElementById('evolve-era-button');
	const evolutionRequirements = document.getElementById('era-evolution-requirements');
	const evolutionStatus = document.getElementById('era-evolution-status');
	let nextEraId = null;

	for (const eraId in ERA_DATA) {
		if (!gameState.unlockedEras.includes(eraId)) {
			nextEraId = eraId;
			break;
		}
	}

	if (nextEraId) {
		const nextEra = ERA_DATA[nextEraId];
		if (gameState.currentEra === nextEra.requiredEra) {
			// Mostramos los elementos principales y ocultamos el mensaje de "era final"
			evolveButton.classList.remove('hidden');
			evolutionRequirements.classList.remove('hidden');
			evolutionStatus.classList.add('hidden');

			// El texto del botón ahora es constante y no cambia
			evolveButton.innerHTML = `Evolucionar a ${nextEra.name}`;

			// Verificamos todas las condiciones necesarias para evolucionar
			const hasEnoughPoints = gameState.prestigePoints >= nextEra.prestigeCost;
			const allMissionsDone = areAllMissionsCompletedForEra(gameState.currentEra);
			const allAchievementsDone = areAllAchievementsUnlockedForEra(gameState.currentEra);
			
			// Construimos la lista de requisitos dinámicamente
			let requirementsHtml = '';
			
			// Requisito 1: Puntos de Innovación
			const pointsClass = hasEnoughPoints ? 'met' : 'unmet';
			requirementsHtml += `<p class="${pointsClass}">- Tener ${nextEra.prestigeCost} Puntos de Innovación (${gameState.prestigePoints}/${nextEra.prestigeCost})</p>`;
			
			// Requisito 2: Misiones
			const missionsClass = allMissionsDone ? 'met' : 'unmet';
			requirementsHtml += `<p class="${missionsClass}">- Completar todas las misiones de la era actual</p>`;

			// Requisito 3: Logros
			const achievementsClass = allAchievementsDone ? 'met' : 'unmet';
			requirementsHtml += `<p class="${achievementsClass}">- Desbloquear todos los logros de la era actual</p>`;
			
			// Actualizamos el contenedor con la lista de requisitos
			evolutionRequirements.innerHTML = requirementsHtml;

			// El botón solo se activa si TODAS las condiciones son verdaderas
			const allConditionsMet = hasEnoughPoints && allMissionsDone && allAchievementsDone;
			
			evolveButton.classList.toggle('is-disabled', !allConditionsMet);
			evolveButton.classList.toggle('can-afford-glow', allConditionsMet);

		} else {
			// Si no estamos en la era correcta para evolucionar, ocultamos todo
			evolveButton.classList.add('hidden');
			evolutionRequirements.classList.add('hidden');
			evolutionStatus.classList.add('hidden');
		}
	} else {
		// Si no hay más eras, mostramos el mensaje de "era final"
		evolveButton.classList.add('hidden');
		evolutionRequirements.classList.add('hidden');
		evolutionStatus.classList.remove('hidden');
		evolutionStatus.textContent = '¡Has alcanzado la última era tecnológica disponible!';
	}
	
	// === Actualización de la Tienda ===
	updateShopUI();
	
	// === Actualización de todas las Mejoras Individuales ===
	const currentEraUpgrades = upgrades[gameState.currentEra];
    if (!currentEraUpgrades) return;

    for (const categoryId in currentEraUpgrades) {
		for (const upgradeId in currentEraUpgrades[categoryId].items) {
			const buyButton = document.getElementById(`buy-${upgradeId}`);
			const upgradeContainer = document.getElementById(`upgrade-container-${upgradeId}`);
			const upgradeInfoDiv = upgradeContainer ? upgradeContainer.querySelector('.upgrade-info') : null;

			if (!buyButton || !upgradeContainer || !upgradeInfoDiv) continue;
			
			const upgradeData = findUpgradeById(upgradeId);
            const currentLevel = gameState.upgradeLevels[upgradeId] || 0;
            const isMaxed = upgradeData.maxLevel && currentLevel >= upgradeData.maxLevel;

            // Actualiza la ganancia que se muestra
            const gainSpan = document.getElementById(`gain-${upgradeId}`);
            if (upgradeData && gainSpan) {
                const effect = upgradeData.baseEffect;
                let gainText = '';
				switch (upgradeData.type) {
					case 'dpc':
						gainText = `(Añade +$${formatNumber(effect)}/clic)`;
						break;
					case 'dps':
						gainText = `(Añade +$${formatNumber(effect)}/s)`;
						break;
					case 'dpc_multiplier':
						gainText = `(Bonus de +${effect * 100}% por clic)`;
						break;
					case 'dps_multiplier':
						gainText = `(Bonus de +${effect * 100}% pasivo)`;
						break;
				}
                gainSpan.textContent = gainText;
            }

			// Actualiza el nivel que se muestra
			const levelSpan = document.getElementById(`level-${upgradeId}`);
			if(levelSpan) levelSpan.textContent = currentLevel;
        
            // Limpia los requisitos antiguos para evitar duplicados
			const oldReqsDiv = upgradeInfoDiv.querySelector('.requirements-list');
			if (oldReqsDiv) oldReqsDiv.remove();

            // CASO 1: La mejora está al nivel máximo
            if (isMaxed) {
                buyButton.innerHTML = 'NIVEL MÁX.';
                buyButton.classList.add('is-disabled');
                buyButton.classList.remove('can-afford-glow');
                upgradeContainer.classList.remove('is-locked');
                buyButton.title = 'Esta mejora ha alcanzado su nivel máximo';

            } else {
                // CASO 2: La mejora no está al máximo
                const cost = calculateUpgradeCost(upgradeId);
                buyButton.innerHTML = `$<span id="cost-${upgradeId}">${formatNumber(cost)}</span>`;

                const hurdle = findNextRequirementHurdle(upgradeId);
            
                // Sub-caso 2.1: La mejora está bloqueada por requisitos
                if (hurdle) {
                    upgradeContainer.classList.add('is-locked');
                    buyButton.classList.add('is-disabled');
                    buyButton.classList.remove('can-afford-glow');
                    buyButton.title = 'Requisitos no cumplidos';

                    let requirementsHtml = `<div class="requirements-list is-locked-info">`;
                    requirementsHtml += `<p class="unmet">Bloqueado en Nivel ${hurdle.level}</p>`;

                    for (const reqId in hurdle.reqs) {
                        const requiredUpgrade = findUpgradeById(reqId); 
                        const requiredLevel = hurdle.reqs[reqId];
                        const currentReqLevel = gameState.upgradeLevels[reqId] || 0;
                        const isMet = currentReqLevel >= requiredLevel;
                        const statusClass = isMet ? 'met' : 'unmet';
                    
                        if(requiredUpgrade) {
                            requirementsHtml += `
                                <p class="${statusClass}">
                                    - ${requiredUpgrade.name} (${currentReqLevel}/${requiredLevel})
                                </p>`;
                        }
                    }
                    requirementsHtml += '</div>';
                    upgradeInfoDiv.insertAdjacentHTML('beforeend', requirementsHtml);

                } else {
                    // Sub-caso 2.2: La mejora está disponible para comprar
                    upgradeContainer.classList.remove('is-locked');
                    const canAfford = gameState.money >= cost;
                    buyButton.classList.toggle('is-disabled', !canAfford);
                    buyButton.classList.toggle('can-afford-glow', canAfford);
                    buyButton.title = '';
                }
            }
		}
	}
}

// ---- LÓGICA PARA LA ANIMACIÓN DE INTRODUCCIÓN ----

// Función de ayuda para escribir texto con efecto de máquina de escribir
async function typeWriter(element, text, speed = 50) {
    let content = element.innerHTML.replace(/<span class="cursor">_<\/span>/g, '');
    for (let i = 0; i < text.length; i++) {
        content += text.charAt(i);
        element.innerHTML = content + '<span class="cursor">_</span>';
        await sleep(speed);
    }
    element.innerHTML = content;
}

// La función principal que orquesta la nueva introducción
async function startIntroAnimation(onComplete) {
    const terminalScreen = document.getElementById('intro-terminal-screen');
    const terminalContent = document.getElementById('intro-terminal-content');
    const skipButton = document.getElementById('skip-intro-button');

    terminalContent.innerHTML = '';
    showScreen('intro-terminal-screen');
    skipButton.classList.remove('hidden');

    let isSkipped = false;
    const skipIntro = () => {
        if(isSkipped) return;
        isSkipped = true;
        stopSound('introCrtHum');
        stopSound('keyboardTyping');
        skipButton.classList.add('hidden');
        if (onComplete) onComplete();
    };
    skipButton.addEventListener('click', skipIntro, { once: true });

    const runStep = async (stepFunction) => {
        if (isSkipped) return;
        await stepFunction();
    };

    // --- INICIO DE LA SECUENCIA ---
    await runStep(async () => {
        playSound('introPowerOn');
        await sleep(500);
        playSound('introCrtHum');
    });

    // ACTO 1: EL ENCENDIDO
    await runStep(async () => {
        playSound('keyboardTyping');
        await typeWriter(terminalContent, 'IDC-DOS v1.0 - (C) 1985 Imperio de la Conexión\n');
        await typeWriter(terminalContent, 'Iniciando desde el Garaje...\n\n');
        stopSound('keyboardTyping');
    });

    // ACTO 2: EL INTENTO
    await runStep(async () => {
        await sleep(1000);
        await typeWriter(terminalContent, '<span class="prompt">> </span>');
        playSound('keyboardTyping');
        await typeWriter(terminalContent, 'connect 555-1985');
        stopSound('keyboardTyping');

        await sleep(500);
        terminalContent.innerHTML += '\n';
        playSound('introRotaryPhone');
        await typeWriter(terminalContent, 'MARCANDO...', 100);
        await sleep(3000);

        await typeWriter(terminalContent, ' <span class="status-fail">ERROR: LÍNEA OCUPADA</span>\n');
    });

    await runStep(async () => {
        await sleep(1500);
        await typeWriter(terminalContent, '<span class="prompt">> </span>');
        playSound('keyboardTyping');
        await typeWriter(terminalContent, 'connect 555-2024 --override');
        stopSound('keyboardTyping');

        await sleep(500);
        terminalContent.innerHTML += '\n';
        playSound('introRotaryPhone');
        await typeWriter(terminalContent, 'MARCANDO...', 100);
        await sleep(4000);
        
        await typeWriter(terminalContent, ' <span class="status-fail">ERROR: SEÑAL DÉBIL</span>\n');
    });

    // ACTO 3: EL ÉXITO
    await runStep(async () => {
        await sleep(1500);
        await typeWriter(terminalContent, '<span class="prompt">> </span>');
        playSound('keyboardTyping');
        await typeWriter(terminalContent, 'connect mundial --protocolo=genesis');
        stopSound('keyboardTyping');
        
        await sleep(500);
        terminalContent.innerHTML += '\n';
        playSound('introRotaryPhone');
        await typeWriter(terminalContent, 'MARCANDO...', 100);
        await sleep(5000);
        
        playSound('introSuccess');
        await typeWriter(terminalContent, ' <span class="status-success">CONEXIÓN ESTABLECIDA</span>\n\n');
        
        const asciiArt = `
     _________
    / ======= \\
   / __________\\
  | ___________ |
  | | -       | |
  | |         | |
  | |_________| |
  \\=____________/
  / """"""""""" \\
 / ::::::::::::: \\
(_________________)
`;
        await typeWriter(terminalContent, `<span class="ascii-art">${asciiArt}</span>`, 5);
        await typeWriter(terminalContent, '\nBIENVENIDO A IMPERIO DE LA CONEXIÓN\n');
    });

    // Finalización
    await runStep(async () => {
        stopSound('introCrtHum');
        const finalPrompt = document.createElement('div');
        finalPrompt.className = 'final-prompt';
        finalPrompt.textContent = 'TOCA PARA EMPEZAR TU IMPERIO';
        terminalContent.appendChild(finalPrompt);

        skipButton.classList.add('hidden');
        
        terminalScreen.addEventListener('click', () => {
            if (!isSkipped) {
                isSkipped = true;
                if (onComplete) onComplete();
            }
        }, { once: true });
    });
}

// ---- LÓGICA PARA EL TUTORIAL INTERACTIVO (SISTEMA GUIADO V2) ----

let currentTutorialStep = 0;
let highlightedElement = null;
let tutorialResizeHandler = null;

const tutorialSteps = [
    { elementId: 'main-click-button', text: '¡Bienvenido a tu imperio! Este es el botón principal. Haz clic en él para establecer conexiones y ganar tu primer dinero.', position: 'top', isClickable: true },
    { elementId: 'money-display', text: 'Aquí verás tu Capital. ¡El dinero que ganas de cada conexión aparecerá aquí!', position: 'bottom' },
    { elementId: 'dps-display', text: 'Y aquí verás tu Flujo de Red. Representa los ingresos pasivos que ganas cada segundo gracias a tus mejoras.', position: 'bottom' },
    { elementId: 'game-tab-bar', text: 'Esta es tu barra de navegación principal. Te permite cambiar entre diferentes paneles del juego.', position: 'top' },
    { elementId: 'upgrades-tab-button', text: 'Toca aquí para ir a la pestaña de Mejoras, donde podrás invertir tu dinero para aumentar tus ganancias.', position: 'top' },
    { elementId: 'evolution-tab-button', text: 'Y esta es la pestaña de Evolución. Cuando progreses lo suficiente, aquí podrás relanzar tu imperio para obtener grandes bonificaciones.', position: 'top' },
    { text: '¡Ya sabes lo básico! Explora, invierte y haz crecer tu red. ¡El mundo está esperando a ser conectado!', position: 'center' }
];

function startInteractiveTutorial() {
    if (!document.getElementById('tutorial-overlay-container')) {
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'tutorial-overlay-container';
        for (const position of ['top', 'bottom', 'left', 'right']) {
            const panel = document.createElement('div');
            panel.id = `tutorial-overlay-${position}`;
            panel.className = 'tutorial-overlay-panel';
            overlayContainer.appendChild(panel);
        }

        const tooltip = document.createElement('div');
        tooltip.id = 'tutorial-tooltip';
        tooltip.innerHTML = `<p id="tutorial-text"></p><button id="tutorial-next-button">Continuar</button>`;
        
        document.body.appendChild(overlayContainer);
        document.body.appendChild(tooltip);

        document.getElementById('tutorial-next-button').addEventListener('click', advanceTutorial);
    }
	
    tutorialResizeHandler = () => {
        if (document.getElementById('tutorial-overlay-container').classList.contains('visible')) {
            showTutorialStep(currentTutorialStep);
        }
    };

    window.addEventListener('resize', tutorialResizeHandler);
    currentTutorialStep = 0;
    showTutorialStep(currentTutorialStep);
}

function showTutorialStep(stepIndex) {
    const overlayContainer = document.getElementById('tutorial-overlay-container');
    const tooltip = document.getElementById('tutorial-tooltip');
    const nextButton = document.getElementById('tutorial-next-button');

    if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-glow-effect');
        highlightedElement.removeEventListener('click', advanceTutorial);
    }
    
    if (stepIndex >= tutorialSteps.length) {
        endTutorial();
        return;
    }

    overlayContainer.classList.add('visible');
    tooltip.classList.add('visible');

    const step = tutorialSteps[stepIndex];
    document.getElementById('tutorial-text').textContent = step.text;

    if (step.elementId) {
        highlightedElement = document.getElementById(step.elementId);
        if (highlightedElement) {
            highlightedElement.classList.add('tutorial-glow-effect');
            positionTooltip(tooltip, highlightedElement, step.position);
            updateOverlayPanels(highlightedElement);
            
            if (step.isClickable) {
                nextButton.style.display = 'none';
                highlightedElement.addEventListener('click', advanceTutorial, { once: true });
            } else {
                nextButton.style.display = 'block';
            }
        }
    } else {
        updateOverlayPanels(null);
        positionTooltip(tooltip, null, 'center');
        nextButton.style.display = 'block';
    }
}

function updateOverlayPanels(element) {
    const topPanel = document.getElementById('tutorial-overlay-top');
    const bottomPanel = document.getElementById('tutorial-overlay-bottom');
    const leftPanel = document.getElementById('tutorial-overlay-left');
    const rightPanel = document.getElementById('tutorial-overlay-right');
    
    if (!element) {
        topPanel.style.height = '100vh';
        bottomPanel.style.height = '0';
        leftPanel.style.height = '0';
        rightPanel.style.height = '0';
        return;
    }

    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    topPanel.style.height = `${rect.top}px`;
    topPanel.style.width = '100vw';

    bottomPanel.style.top = `${rect.bottom}px`;
    bottomPanel.style.height = `${vh - rect.bottom}px`;
    bottomPanel.style.width = '100vw';

    leftPanel.style.top = `${rect.top}px`;
    leftPanel.style.height = `${rect.height}px`;
    leftPanel.style.width = `${rect.left}px`;
    
    rightPanel.style.top = `${rect.top}px`;
    rightPanel.style.left = `${rect.right}px`;
    rightPanel.style.height = `${rect.height}px`;
    rightPanel.style.width = `${vw - rect.right}px`;
}

function advanceTutorial() {
    currentTutorialStep++;
    showTutorialStep(currentTutorialStep);
}

function endTutorial() {
    document.getElementById('tutorial-overlay-container').classList.remove('visible');
    document.getElementById('tutorial-tooltip').classList.remove('visible');
    if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-glow-effect');
    }
    localStorage.setItem('tutorialShown', 'true');

    if (tutorialResizeHandler) {
        window.removeEventListener('resize', tutorialResizeHandler);
    }
}

function positionTooltip(tooltip, element, position) {
    const screenPadding = 10;

    if (!element) {
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)'; 
        return;
    }

    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    tooltip.style.transform = '';

    if (position === 'top' && rect.top - tooltip.offsetHeight < 0) {
        position = 'bottom';
    } else if (position === 'bottom' && rect.bottom + tooltip.offsetHeight > vh) {
        position = 'top';
    }

    const spacing = 15;
    if (position === 'top') {
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - spacing}px`;
    } else {
        tooltip.style.top = `${rect.bottom + spacing}px`;
    }

    let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);

    if (left < screenPadding) {
        left = screenPadding;
    }
    if (left + tooltip.offsetWidth > vw - screenPadding) {
        left = vw - tooltip.offsetWidth - screenPadding;
    }
    tooltip.style.left = `${left}px`;
}

// ---- LÓGICA DEL SISTEMA DE NOTIFICACIONES ----
function showNotification(title, rewardText, icon) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'notification slide-in-down';

    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-text">
            <h5>${title}</h5>
            <p>${rewardText}</p>
        </div>
    `;
    container.appendChild(notification);
    setTimeout(() => {
        notification.classList.remove('slide-in-down');
        notification.classList.add('fade-out-up');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 4000);
}

function renderStoryCard(index) {
    const cardData = storyData[index];
    if (!cardData) return;

    const eraDisplay = document.getElementById('story-era-display');
    const titleDisplay = document.getElementById('story-title-display');
    const textDisplay = document.getElementById('story-text-display');
    const indicator = document.getElementById('story-card-indicator');
    const container = document.getElementById('story-card-container');

    container.style.opacity = 0;

    setTimeout(() => {
        eraDisplay.textContent = cardData.era;
        titleDisplay.textContent = cardData.title;
        textDisplay.textContent = cardData.text;
        indicator.textContent = `${index + 1} / ${storyData.length}`;
        container.style.opacity = 1;
    }, 300);
}

// ---- LÓGICA PARA LA PANTALLA DE CRÉDITOS ----

let isCreditsRunning = false;
let isCreditsSkipped = false;

const creditsLines = [
    'INICIANDO TRANSMISIÓN DE CRÉDITOS...',
    'IDC_OS v1.0 - REGISTRO DE PRODUCCIÓN',
    '========================================',
    '',
    'ROL               : DESARROLLO PRINCIPAL',
    'NOMBRE            : ClanHater',
    '',
    'ROL               : CONTROL DE CALIDAD Y DEPURACIÓN',
    'NOMBRE            : ClanHater',
    '',
    '----------------------------------------',
    'RECURSOS EXTERNOS:',
    '----------------------------------------',
    '',
    'ACTIVOS DE SONIDO : Pixabay',
    'ACTIVOS VISUALES  : Nanobanana & Google Fonts',
    'BIBLIOTECA DE AUDIO: Howler.js',
    '',
    '========================================',
    '...Se han transmitido 1.337 terabytes de datos de gatitos durante la creación de este juego...',
    '...Ningún teclado fue dañado permanentemente en el proceso...',
    '',
    'GRACIAS POR JUGAR',
    '',
    '>>> FIN DE LA TRANSMISIÓN <<<'
];

async function startCreditsSequence() {
    if (isCreditsRunning) return;

    isCreditsRunning = true;
    isCreditsSkipped = false;
    const container = document.getElementById('credits-content-container');
    container.innerHTML = '';

    for (const line of creditsLines) {
        if (isCreditsSkipped) {
            const remainingLines = creditsLines.slice(creditsLines.indexOf(line)).join('\n');
            container.innerHTML += remainingLines;
            break;
        }
        
        const p = document.createElement('p');
        container.appendChild(p);
        await typeWriter(p, line, 20);
        container.scrollTop = container.scrollHeight;
    }

    const cursor = container.querySelector('.cursor');
    if (cursor) cursor.remove();
    isCreditsRunning = false;
}

function stopCreditsSequence() {
    isCreditsSkipped = true;
}

// ---- LÓGICA DEL GESTOR DE CINEMÁTICAS DE ERA (V2 - NARRATIVA) ----

const cinematics = {
    'era2': async function() {
        return new Promise(async (resolve) => {
            const cinematicScreen = document.getElementById('era-cinematic-screen');
            const era1Terminal = document.getElementById('cinematic-era1-shutdown');
            const biosScreen = document.getElementById('cinematic-bios');
            const desktopScreen = document.getElementById('cinematic-desktop');
            const welcomeBox = document.getElementById('cinematic-welcome-box');

            showScreen('era-cinematic-screen');
            biosScreen.classList.add('hidden');
            desktopScreen.classList.add('hidden');
            era1Terminal.classList.remove('hidden');
            era1Terminal.innerHTML = '';
            
            // ACTO 1
            await sleep(1000);
            playSound('keyboardTyping');
            await typeWriter(era1Terminal, '> ANÁLISIS DE RED COMPLETO...\n> EFICIENCIA DE LÍNEAS DE COBRE: 3.4%\n> SATURACIÓN DE RED INMINENTE.\n\n');
            await sleep(1500);
            await typeWriter(era1Terminal, '> INICIANDO PROTOCOLO DE ACTUALIZACIÓN "NUEVO MILENIO".\n> INICIANDO APAGADO DEL SISTEMA...');
            stopSound('keyboardTyping');

            await sleep(2000);
            playSound('shutdown');
            cinematicScreen.style.transition = 'transform 0.3s';
            cinematicScreen.style.transform = 'scale(0.01, 0.2)';
            
            await sleep(300);

            // ACTO 2
            cinematicScreen.style.transform = 'scale(1)';
            era1Terminal.classList.add('hidden');
            biosScreen.classList.remove('hidden');
            biosScreen.innerHTML = 'IDC BIOS v2.0, (c) 1995 Imperio de la Conexión Corp.<br>';
            await sleep(1000);
            playSound('biosBeep');
            biosScreen.innerHTML += 'Memory Test: 16384K OK<br><br>';
            await sleep(1500);
            biosScreen.innerHTML += 'Detecting Primary Master... IDC Hard Disk 500MB<br>';
            biosScreen.innerHTML += 'Detecting Primary Slave... None<br>';
            await sleep(1500);
            biosScreen.innerHTML += '<br>Booting from Hard Disk...<br>';
            
            await sleep(2000);

            // ACTO 3
            biosScreen.classList.add('hidden');
            desktopScreen.classList.remove('hidden');
            desktopScreen.style.backgroundImage = "url('assets/images/win95-desktop.png')";
            playSound('win95Startup');

            await sleep(3000);

            welcomeBox.innerHTML = `
                <h2>Bienvenido a los 90</h2>
                <p>La red global es una realidad. El sonido del módem es la puerta de entrada a la Autopista de la Información...</p>
            `;
            welcomeBox.classList.add('visible');

            await sleep(2000);
            playSound('modemDialup');

            await sleep(9000);

            // FINALIZACIÓN
            cinematicScreen.classList.add('hidden');
            welcomeBox.classList.remove('visible');
            resolve();
        });
    }
};

function renderPopup(popupType) {
    if (activePopupElement) return;

    // El contenedor ahora está dentro del área de spawn, simplificando todo.
    const spawnArea = document.querySelector('.main-click-area');
    const container = document.getElementById('popup-container');
    const template = document.getElementById(`popup-template-${popupType}`);

    if (!container || !template || !spawnArea) {
        console.error("Faltan elementos de la UI para el pop-up.");
        return;
    }

    const popupClone = template.cloneNode(true);
    popupClone.id = `active-popup-${popupType}`;
    activePopupElement = popupClone;

    // --- [NUEVA LÓGICA DE POSICIONAMIENTO SIMPLIFICADA] ---

    // 1. Obtener la altura del área de spawn (nuestro "mundo")
    const areaHeight = spawnArea.offsetHeight;
    const popupHeight = 45; // Altura fija del pop-up

    // 2. Calcular una posición vertical aleatoria directamente dentro de este "mundo"
    const randomTop = Math.random() * (areaHeight - popupHeight);

    // 3. Decidir aleatoriamente de qué lado aparecerá
    const side = Math.random() < 0.5 ? 'left' : 'right';

    // 4. Aplicar los estilos y la clase de animación
    popupClone.style.top = `${randomTop}px`;

    if (side === 'left') {
        popupClone.style.left = '0px';
        popupClone.classList.add('popup-slide-in-left');
    } else {
        popupClone.style.right = '0px';
        popupClone.classList.add('popup-slide-in-right');
    }
    // --- FIN DE LA NUEVA LÓGICA ---

    popupClone.addEventListener('click', () => {
        switch (popupType) {
            case 'jackpot': applyJackpot(); break;
            case 'clickFrenzy': applyClickFrenzy(); break;
            case 'dpsOverload': applyDpsOverload(); break;
        }
        hidePopup();
    }, { once: true });

    container.appendChild(popupClone);

    if (popupTimeoutId) clearTimeout(popupTimeoutId);
    popupTimeoutId = setTimeout(hidePopup, POPUP_LIFESPAN_SECONDS * 1000);
}

function hidePopup() {
    if (activePopupElement) {
        activePopupElement.remove(); // Elimina el elemento del DOM
        activePopupElement = null;     // Limpia la referencia
    }
    if (popupTimeoutId) {
        clearTimeout(popupTimeoutId); // Limpia el temporizador
        popupTimeoutId = null;
    }
}

// ---- RENDERIZADO DE BUFFS ACTIVOS ----
function updateActiveBuffsUI() {
    const container = document.getElementById('active-buffs-container');
    if (!container) return;

    // Itera sobre los buffs que queremos mostrar
    for (const buffKey in gameState.activeBuffs) {
        const buff = gameState.activeBuffs[buffKey];
        const buffElement = document.getElementById(`buff-${buffKey}`);
        
        // Si el buff está activo pero no existe su icono, lo creamos
        if (buff.timeLeft > 0 && !buffElement) {
            const buffIcons = {
                clickFrenzy: '🖱️💨',
                dpsOverload: '📈'
            };
            const iconHTML = `
                <div class="buff-icon" id="buff-${buffKey}">
                    <svg viewBox="0 0 36 36">
                        <path class="progress-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="progress-ring-fg" stroke-dasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <span class="buff-icon-emoji">${buffIcons[buffKey] || '❓'}</span>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', iconHTML);
        }
        // Si el buff ya no está activo pero su icono todavía existe, lo eliminamos
        else if (buff.timeLeft <= 0 && buffElement) {
            buffElement.remove();
        }

        // Si el icono existe, actualizamos su barra de progreso
        if (buffElement) {
            const constants = {
                clickFrenzy: CLICK_FRENZY_DURATION_SECONDS,
                dpsOverload: DPS_OVERLOAD_DURATION_SECONDS
            };
            const totalDuration = constants[buffKey];
            const progress = (buff.timeLeft / totalDuration) * 100;
            const progressBar = buffElement.querySelector('.progress-ring-fg');
            if (progressBar) {
                progressBar.style.strokeDasharray = `${progress}, 100`;
            }
        }
    }
}