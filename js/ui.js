// ---- ELEMENTOS DE LA INTERFAZ (UI ELEMENTS) ----
const moneyDisplay = document.getElementById('money-display');
const dpsDisplay = document.getElementById('dps-display');
const dpcDisplay = document.getElementById('dpc-display');
const upgradesContainer = document.getElementById('upgrades-container');
const interactionArea = document.querySelector('.interaction-area');
const prestigePointsDisplay = document.getElementById('prestige-points-display');
const relaunchButton = document.getElementById('relaunch-button'); // CONSTANTE NUEVA

// ... (La función formatNumber y showFloatingNumber no cambian) ...
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