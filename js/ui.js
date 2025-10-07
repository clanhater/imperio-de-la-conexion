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
    const icons = {
		'tecladoTonos': '⌨️',
		'lineaCobre': '🔗',
		'softwareTerminal': '👨‍💻', // NUEVO
		'antenaRepetidora': '📡',
		'modem2400': '📠', // NUEVO
		'centralitaTelefonica': '🏢',
		'servidorBBS': '💾', // NUEVO
		'protocoloTCPIP': '🌐', // NUEVO
		'fibraOptica': '✨' // NUEVO
	};
    let html = '';
    for (const upgradeId in upgrades) {
        const upgrade = upgrades[upgradeId];
        html += `<div class="upgrade"><div class="upgrade-icon">${icons[upgradeId] || '⚙️'}</div><div class="upgrade-info"><h4>${upgrade.name} (Nivel <span id="level-${upgradeId}">0</span>)</h4><p>${upgrade.description}</p></div><button id="buy-${upgradeId}" class="buy-button" data-upgrade-id="${upgradeId}">Comprar: $<span id="cost-${upgradeId}">0</span></button></div>`;
    }
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

    for (const upgradeId in upgrades) {
        const cost = calculateUpgradeCost(upgradeId);
        document.getElementById(`level-${upgradeId}`).textContent = gameState.upgradeLevels[upgradeId];
        document.getElementById(`cost-${upgradeId}`).textContent = formatNumber(cost);
        const buyButton = document.getElementById(`buy-${upgradeId}`);
        const canAfford = gameState.money >= cost;
        buyButton.classList.toggle('is-disabled', !canAfford);
        buyButton.classList.toggle('can-afford-glow', canAfford);
    }
}