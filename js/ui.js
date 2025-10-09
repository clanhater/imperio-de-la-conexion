// ---- ELEMENTOS DE LA INTERFAZ (UI ELEMENTS) ----
const moneyDisplay = document.getElementById('money-display');
const dpsDisplay = document.getElementById('dps-display');
const dpcDisplay = document.getElementById('dpc-display');
const upgradesContainer = document.getElementById('upgrades-container');
const prestigePointsDisplay = document.getElementById('prestige-points-display');
const relaunchButton = document.getElementById('relaunch-button'); // CONSTANTE NUEVA

function formatNumber(number) { if (Math.abs(number) < 1000) return number.toFixed(0); const suffixes = ["", "k", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc"]; const tier = Math.floor(Math.log10(Math.abs(number)) / 3); if (tier >= suffixes.length) return number.toExponential(2).replace('+', ''); const suffix = suffixes[tier]; const scale = Math.pow(10, tier * 3); const scaled = number / scale; return scaled.toFixed(2) + suffix; }
function showFloatingNumber(event) {
    const container = document.querySelector('.main-click-area');
    if (!container) return; // Si no encuentra el contenedor, no hace nada para evitar errores.

    const floatingNumber = document.createElement('span');
    floatingNumber.className = 'floating-number';
    floatingNumber.textContent = `+$${formatNumber(gameState.moneyPerClick)}`;
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
        'capacitacion': '🎓'
    };

    let html = '';
    // El primer bucle itera sobre las CATEGORÍAS (ej. 'infraestructura', 'equipamiento').
    for (const categoryId in upgrades) {
        const category = upgrades[categoryId];
        
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
        currentPhase = eraMissions[missionIds[missionIds.length - 1]].phase;
    }

    // 2. Construir el HTML
    let html = '';
    const phaseNames = ["FASE 1: EL INICIO", "FASE 2: EXPANSIÓN INICIAL", "FASE 3: LA ERA DIGITAL", "FASE 4: PREPARANDO EL FUTURO"];
    
    html += `<h3 class="mission-phase-title">${phaseNames[currentPhase - 1]}</h3>`;

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

// ---- FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN DE UI ----
function updateUI() {
    moneyDisplay.textContent = `Capital: $${formatNumber(gameState.money)}`;
    dpsDisplay.textContent = `Flujo de Red: +$${formatNumber(gameState.moneyPerSecond)}/s`;
    dpcDisplay.textContent = `Ancho de Banda: +$${formatNumber(gameState.moneyPerClick)}/conexión`;

    const bonus = gameState.prestigePoints * 2;
    prestigePointsDisplay.textContent = `Puntos de Innovación: ${gameState.prestigePoints} (+${bonus}%)`;
    
    // LÓGICA NUEVA PARA EL BOTÓN 'relaunch-button'
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
	
	renderAchievements();
	renderMissions();
	updateShopUI();

    for (const categoryId in upgrades) {
		for (const upgradeId in upgrades[categoryId].items) {
			const cost = calculateUpgradeCost(upgradeId);
			const buyButton = document.getElementById(`buy-${upgradeId}`);
			const upgradeContainer = document.getElementById(`upgrade-container-${upgradeId}`);
			const upgradeInfoDiv = upgradeContainer.querySelector('.upgrade-info');

			if (!buyButton || !upgradeContainer || !upgradeInfoDiv) continue;

			const levelSpan = document.getElementById(`level-${upgradeId}`);
			if(levelSpan) levelSpan.textContent = gameState.upgradeLevels[upgradeId] || 0;
        
			const costSpan = document.getElementById(`cost-${upgradeId}`);
			if(costSpan) costSpan.textContent = formatNumber(cost);

			// Eliminamos el div de requisitos anterior para evitar duplicados
			const oldReqsDiv = upgradeInfoDiv.querySelector('.requirements-list');
			if (oldReqsDiv) oldReqsDiv.remove();

			const hurdle = findNextRequirementHurdle(upgradeId);
        
			if (hurdle) {
				// --- HAY UN BLOQUEO ACTIVO: Mostramos los requisitos ---
				upgradeContainer.classList.add('is-locked');
				buyButton.classList.add('is-disabled');
				buyButton.classList.remove('can-afford-glow');

				let requirementsHtml = `<div class="requirements-list is-locked-info">`;
				requirementsHtml += `<p class="unmet">Bloqueado en Nivel ${hurdle.level}</p>`;

				for (const reqId in hurdle.reqs) {
					// --- LA CORRECCIÓN ESTÁ AQUÍ ---
					// ANTES: findById(reqId) --> INCORRECTO
					// AHORA: findUpgradeById(reqId) --> CORRECTO
					const requiredUpgrade = findUpgradeById(reqId); 
					const requiredLevel = hurdle.reqs[reqId];
					const currentReqLevel = gameState.upgradeLevels[reqId] || 0;
					const isMet = currentReqLevel >= requiredLevel;
					const statusClass = isMet ? 'met' : 'unmet';
                
					// Aseguramos que 'requiredUpgrade' no sea nulo antes de intentar acceder a su nombre
					if(requiredUpgrade) {
						requirementsHtml += `
							<p class="${statusClass}">
								- ${requiredUpgrade.name} (${currentReqLevel}/${requiredLevel})
							</p>`;
					}
				}
				requirementsHtml += '</div>';
				upgradeInfoDiv.insertAdjacentHTML('beforeend', requirementsHtml);
				buyButton.title = 'Requisitos no cumplidos';

			} else {
				// --- NO HAY BLOQUEO ACTIVO: La mejora se ve normal ---
				upgradeContainer.classList.remove('is-locked');
				const canAfford = gameState.money >= cost;
				buyButton.classList.toggle('is-disabled', !canAfford);
				buyButton.classList.toggle('can-afford-glow', canAfford);
				buyButton.title = '';
			}
		}
	}
}

// ---- LÓGICA PARA LA ANIMACIÓN DE INTRODUCCIÓN (VERSIÓN SOLO TEXTO) ----

// Función de ayuda para crear pausas
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función de ayuda para escribir texto con efecto máquina de escribir
async function typeWriter(element, text, speed = 60) {
    element.innerHTML = ''; // Limpia el contenedor
    // Aplica una clase para la animación de entrada
    element.className = 'fade-in'; 
    for (let i = 0; i < text.length; i++) {
        // Corta el cursor, añade el carácter y vuelve a poner el cursor
        let currentHtml = element.innerHTML;
        const cursorIndex = currentHtml.lastIndexOf('<span class="cursor">');
        if (cursorIndex !== -1) {
            currentHtml = currentHtml.substring(0, cursorIndex);
        }
        element.innerHTML = currentHtml + text.charAt(i) + '<span class="cursor">_</span>';
        await sleep(speed);
    }
	let finalHtml = element.innerHTML;
    const cursorIndex = finalHtml.lastIndexOf('<span class="cursor">');
    if (cursorIndex !== -1) {
        element.innerHTML = finalHtml.substring(0, cursorIndex);
    }
}

// La función principal que orquesta la introducción
async function startIntroAnimation(onComplete) {
    // Referencias a los elementos del DOM
    const yearContainer = document.getElementById('intro-year-container');
    const textContainer = document.getElementById('intro-text-container');
    const skipButton = document.getElementById('skip-intro-button');
    
    let isSkipped = false;
    const skipIntro = () => {
        isSkipped = true;
        sounds.introCrtHum.howl.stop(); 
    };
    skipButton.addEventListener('click', skipIntro, { once: true });
    skipButton.classList.remove('hidden');

    const runStep = async (stepFunction) => {
        if (isSkipped) return;
        await stepFunction();
    };

    // --- INICIO DE LA SECUENCIA ---
    playSound('introCrtHum');

    await runStep(async () => {
        // Fase 1: El Eco del Pasado
        playSound('introPowerOn');
        yearContainer.textContent = 'AÑO: 1985';
        yearContainer.classList.add('fade-in', 'flicker');
        await sleep(3000);
        yearContainer.classList.replace('fade-in', 'fade-out');
    });

    await runStep(async () => {
        // Fase 2: El Contexto
        await sleep(1500); // Pausa dramática
        await typeWriter(textContainer, 'LOS TELÉFONOS SON DE DISCO. LAS CONEXIONES, UN LUJO.');
        await sleep(2500);
        textContainer.className = 'fade-out'; // Desvanece el texto actual
    });

    await runStep(async () => {
        // Fase 3: La Visión
        await sleep(1500);
        playSound('introSynthArp');
        await typeWriter(textContainer, 'PERO TÚ TIENES UNA VISIÓN... CONECTAR EL MUNDO ENTERO.');
        await sleep(3000);
    });

    await runStep(async () => {
        // Fase 4: La Llamada a la Acción
        textContainer.className = 'fade-out';
        await sleep(1500);
        await typeWriter(textContainer, 'COMIENZA LA CONSTRUCCIÓN DE TU IMPERIO.');
        await sleep(3000);
    });

    // --- FINALIZACIÓN ---
    if (!isSkipped) {
        sounds.introCrtHum.howl.stop();
    }
    
    skipButton.classList.add('hidden');
    if (onComplete) onComplete();
}

// ---- LÓGICA PARA EL TUTORIAL INTERACTIVO (SISTEMA GUIADO V2) ----

let currentTutorialStep = 0;
let highlightedElement = null;
let tutorialResizeHandler = null;

// Los pasos del tutorial no cambian
const tutorialSteps = [
    {
        elementId: 'main-click-button',
        text: '¡Bienvenido a tu imperio! Este es el botón principal. Haz clic en él para establecer conexiones y ganar tu primer dinero.',
        position: 'top',
        isClickable: true
    },
    {
        elementId: 'money-display',
        text: 'Aquí verás tu Capital. ¡El dinero que ganas de cada conexión aparecerá aquí!',
        position: 'bottom'
    },
    {
        elementId: 'dps-display',
        text: 'Y aquí verás tu Flujo de Red. Representa los ingresos pasivos que ganas cada segundo gracias a tus mejoras.',
        position: 'bottom'
    },
    {
        elementId: 'game-tab-bar',
        text: 'Esta es tu barra de navegación principal. Te permite cambiar entre diferentes paneles del juego.',
        position: 'top'
    },
    {
        elementId: 'upgrades-tab-button',
        text: 'Toca aquí para ir a la pestaña de Mejoras, donde podrás invertir tu dinero para aumentar tus ganancias.',
        position: 'top'
    },
    {
        elementId: 'evolution-tab-button',
        text: 'Y esta es la pestaña de Evolución. Cuando progreses lo suficiente, aquí podrás relanzar tu imperio para obtener grandes bonificaciones.',
        position: 'top'
    },
    {
        text: '¡Ya sabes lo básico! Explora, invierte y haz crecer tu red. ¡El mundo está esperando a ser conectado!',
        position: 'center'
    }
];

function startInteractiveTutorial() {
    // Crea los elementos del tutorial una sola vez si no existen
    if (!document.getElementById('tutorial-overlay-container')) {
        // Contenedor para los 4 paneles
        const overlayContainer = document.createElement('div');
        overlayContainer.id = 'tutorial-overlay-container';
        // Crea los 4 paneles
        for (const position of ['top', 'bottom', 'left', 'right']) {
            const panel = document.createElement('div');
            panel.id = `tutorial-overlay-${position}`;
            panel.className = 'tutorial-overlay-panel';
            overlayContainer.appendChild(panel);
        }

        const tooltip = document.createElement('div');
        tooltip.id = 'tutorial-tooltip';
        tooltip.innerHTML = `
            <p id="tutorial-text"></p>
            <button id="tutorial-next-button">Continuar</button>
        `;
        
        document.body.appendChild(overlayContainer);
        document.body.appendChild(tooltip);

        document.getElementById('tutorial-next-button').addEventListener('click', advanceTutorial);
    }
	
	// [NUEVO] Definimos la función que se ejecutará al redimensionar la ventana.
    // Solo recalculamos la posición si el tutorial está visible.
    tutorialResizeHandler = () => {
        if (document.getElementById('tutorial-overlay-container').classList.contains('visible')) {
            showTutorialStep(currentTutorialStep);
        }
    };

    // [NUEVO] Le decimos a la ventana que ejecute nuestra función cada vez que cambie de tamaño.
    window.addEventListener('resize', tutorialResizeHandler);

    currentTutorialStep = 0;
    showTutorialStep(currentTutorialStep);
}

function showTutorialStep(stepIndex) {
    const overlayContainer = document.getElementById('tutorial-overlay-container');
    const tooltip = document.getElementById('tutorial-tooltip');
    const nextButton = document.getElementById('tutorial-next-button');

    // Limpia el brillo y los listeners del paso anterior
    if (highlightedElement) {
        highlightedElement.classList.remove('tutorial-glow-effect');
        highlightedElement.removeEventListener('click', advanceTutorial);
    }
    
    // Si el tutorial ha terminado, lo cerramos
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
        // Para pasos sin elemento (mensaje final)
        updateOverlayPanels(null); // Cubre toda la pantalla
        positionTooltip(tooltip, null, 'center');
        nextButton.style.display = 'block';
    }
}

// NUEVA FUNCIÓN para posicionar los 4 paneles del overlay
function updateOverlayPanels(element) {
    const topPanel = document.getElementById('tutorial-overlay-top');
    const bottomPanel = document.getElementById('tutorial-overlay-bottom');
    const leftPanel = document.getElementById('tutorial-overlay-left');
    const rightPanel = document.getElementById('tutorial-overlay-right');
    
    if (!element) {
        // Si no hay elemento, cubre toda la pantalla con el panel superior
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

    // [NUEVO] Eliminamos el listener para no gastar recursos innecesariamente.
    if (tutorialResizeHandler) {
        window.removeEventListener('resize', tutorialResizeHandler);
    }
}

function positionTooltip(tooltip, element, position) {
    // 1. Constante para el espacio entre el borde de la pantalla y el tooltip.
    const screenPadding = 10;

    // 2. Lógica para el paso final (centrado en pantalla), no necesita cambios.
    if (!element) {
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        // Usamos translate para un centrado perfecto sin importar el tamaño del tooltip
        tooltip.style.transform = 'translate(-50%, -50%)'; 
        return;
    }

    // 3. Obtenemos las dimensiones del elemento resaltado y del viewport (la pantalla visible).
    const rect = element.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Reseteamos cualquier transform anterior para evitar conflictos de cálculo
    tooltip.style.transform = '';

    // 4. Lógica de "auto-flipping": si no hay espacio arriba, lo pone abajo (y viceversa).
    // Esto previene que el tooltip se salga por la parte superior o inferior.
    if (position === 'top' && rect.top - tooltip.offsetHeight < 0) {
        position = 'bottom';
    } else if (position === 'bottom' && rect.bottom + tooltip.offsetHeight > vh) {
        position = 'top';
    }

    // 5. Calcula la posición vertical (top) basada en la posición (ya corregida si era necesario).
    const spacing = 15;
    if (position === 'top') {
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - spacing}px`;
    } else { // 'bottom'
        tooltip.style.top = `${rect.bottom + spacing}px`;
    }

    // 6. Calcula la posición horizontal (left) idealmente centrada con el elemento.
    let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);

    // 7. [LA MAGIA] Corrige la posición horizontal si se sale de la pantalla.
    // Si se va muy a la izquierda...
    if (left < screenPadding) {
        left = screenPadding;
    }
    // Si se va muy a la derecha...
    if (left + tooltip.offsetWidth > vw - screenPadding) {
        left = vw - tooltip.offsetWidth - screenPadding;
    }

    // 8. Aplica la posición final y ya corregida.
    tooltip.style.left = `${left}px`;
}

// ---- LÓGICA DEL SISTEMA DE NOTIFICACIONES ----
function showNotification(title, rewardText, icon) {
    const container = document.getElementById('notification-container');
    if (!container) return;

    // 1. Crear el elemento de la notificación
    const notification = document.createElement('div');
    notification.className = 'notification slide-in-down'; // Inicia con la animación de entrada

    // 2. Definir su contenido HTML
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-text">
            <h5>${title}</h5>
            <p>${rewardText}</p>
        </div>
    `;

    // 3. Añadirlo al contenedor
    container.appendChild(notification);

    // 4. Programar su eliminación
    setTimeout(() => {
        // Primero, aplica la animación de salida
        notification.classList.remove('slide-in-down');
        notification.classList.add('fade-out-up');

        // Después de que la animación de salida termine (500ms), elimina el elemento del DOM
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 4000); // La notificación permanecerá visible por 4 segundos
}

function renderStoryCard(index) {
    const cardData = storyData[index];
    if (!cardData) return;

    // Elementos del DOM
    const eraDisplay = document.getElementById('story-era-display');
    const titleDisplay = document.getElementById('story-title-display');
    const textDisplay = document.getElementById('story-text-display');
    const indicator = document.getElementById('story-card-indicator');
    const container = document.getElementById('story-card-container');

    // Animación de fundido para suavizar la transición
    container.style.opacity = 0;

    setTimeout(() => {
        // Actualizar contenido
        eraDisplay.textContent = cardData.era;
        titleDisplay.textContent = cardData.title;
        textDisplay.textContent = cardData.text;
        indicator.textContent = `${index + 1} / ${storyData.length}`;
        
        // Hacer visible de nuevo
        container.style.opacity = 1;
    }, 300); // Coincide con la duración de la transición en el CSS
}

// ---- LÓGICA PARA LA PANTALLA DE CRÉDITOS ----

let isCreditsRunning = false;
let isCreditsSkipped = false;

// Definimos el contenido de los créditos como una lista de líneas.
// ¡Puedes modificar y añadir lo que quieras aquí!
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

// Función principal que controla la secuencia de tipeo
async function startCreditsSequence() {
    if (isCreditsRunning) return;

    isCreditsRunning = true;
    isCreditsSkipped = false;
    const container = document.getElementById('credits-content-container');
    container.innerHTML = ''; // Limpiamos el contenedor

    for (const line of creditsLines) {
        if (isCreditsSkipped) {
            // Si se omite, muestra todo el texto restante instantáneamente
            const remainingLines = creditsLines.slice(creditsLines.indexOf(line)).join('\n');
            container.innerHTML += remainingLines;
            break; // Sal del bucle
        }
        
        // Crea un nuevo párrafo para cada línea
        const p = document.createElement('p');
        container.appendChild(p);
        
        // Escribe la línea con efecto de máquina de escribir
        await typeWriter(p, line, 20); // Usamos una velocidad más rápida para los créditos
        
        // Mueve el scroll hacia abajo para mantener visible la última línea
        container.scrollTop = container.scrollHeight;
    }

    // Limpieza final
    const cursor = container.querySelector('.cursor');
    if (cursor) cursor.remove(); // Elimina el cursor al final
    isCreditsRunning = false;
}

// Función para detener y limpiar la secuencia
function stopCreditsSequence() {
    isCreditsSkipped = true;
}