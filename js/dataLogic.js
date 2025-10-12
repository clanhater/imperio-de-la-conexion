// Este archivo contiene la LÓGICA que se "inyectará" en los datos puros cargados desde los JSON.

const dataLogic = {
    achievements: {
        // --- LOGROS DE ERA 1 ---
        'TOTAL_CLICKS_100': (state) => state.totalClicks >= 100,
        'TOTAL_CLICKS_1000': (state) => state.totalClicks >= 1000,
        'TOTAL_CLICKS_5000': (state) => state.totalClicks >= 5000,
        'TOTAL_MONEY_10000': (state) => state.totalMoneyEver >= 10000,
        'TOTAL_MONEY_1M': (state) => state.totalMoneyEver >= 1000000,
        'TOTAL_MONEY_100M': (state) => state.totalMoneyEver >= 100000000,
        'DPS_100': (state) => state.moneyPerSecond >= 100,
        'DPS_1000': (state) => state.moneyPerSecond >= 1000,
        'UPGRADE_LEVEL_25_COBRE': (state) => (state.upgradeLevels.lineaCobre || 0) >= 25,
        'UPGRADE_LEVEL_50_COBRE': (state) => (state.upgradeLevels.lineaCobre || 0) >= 50,
        'OWN_CENTRALITA_DIGITAL': (state) => (state.upgradeLevels.centralitaDigital || 0) > 0,
        'OWN_FIBRA_OPTICA': (state) => (state.upgradeLevels.fibraOptica || 0) > 0,
        'FIRST_PRESTIGE': (state) => state.prestigePoints > 0,
        'TOTAL_PRESTIGE_POINTS_100': (state) => state.prestigePoints >= 100,

        // --- LOGROS DE ERA 2 ---
		'POPUP_HUNTER': (state) => (state.stats.popupsClicked || 0) >= 50,
		'FRENZY_MASTER': (state) => (state.stats.clickFrenziesActivated || 0) >= 25,
		'DATA_HOARDER': (state) => {
			const vaultCapacity = (state.moneyPerSecond || 1) * VAULT_CAPACITY_DPS_MULTIPLIER;
			return (state.dataVault.currentValue || 0) >= vaultCapacity;
		},
        'TOTAL_MONEY_1T': (state) => state.totalMoneyEver >= 1e12,
        'TOTAL_MONEY_100T': (state) => state.totalMoneyEver >= 1e14,
        'DPS_100K': (state) => state.moneyPerSecond >= 100000,
        'DPS_1M': (state) => state.moneyPerSecond >= 1000000,
        'UPGRADE_LEVEL_50_MODEM': (state) => (state.upgradeLevels.modem56k || 0) >= 50,
        'UPGRADE_LEVEL_50_GSM': (state) => (state.upgradeLevels.torreGSM || 0) >= 50,
        'OWN_PORTAL': (state) => (state.upgradeLevels.portalWeb || 0) > 0,
        'MAX_ISP_DATACENTER': (state) => (state.upgradeLevels.ispDatacenter || 0) >= 10,
        'MAX_PREPAID_SYSTEM': (state) => (state.upgradeLevels.tarjetaPrepago || 0) >= 10,
        'PRESTIGE_POINTS_1K': (state) => state.prestigePoints >= 1000
    },
    missions: {
        // --- MISIONES DE ERA 1 ---
        'GET_STARTED': (state) => (state.upgradeLevels.kitHerramientas || 0) > 0,
        'FIRST_LINE': (state) => (state.upgradeLevels.lineaCobre || 0) >= 5,
        'ESTABLISH_NETWORK': (state) => state.moneyPerSecond >= 10,
        'AUTOMATE_CALLS': (state) => (state.upgradeLevels.centralitaAnaloga || 0) > 0,
        'GO_ONLINE': (state) => (state.upgradeLevels.modem2400 || 0) >= 5,
        'COMMUNITY_BUILDER': (state) => (state.upgradeLevels.servidorBBS || 0) > 0,
        'DIGITAL_SWITCH': (state) => (state.upgradeLevels.centralitaDigital || 0) > 0,
        'INTERNET_PROTOCOLS': (state) => (state.upgradeLevels.protocoloTCPIP || 0) > 0,
        'FIBER_REVOLUTION': (state) => (state.upgradeLevels.fibraOptica || 0) > 0,
        'INNOVATE_AND_RESET': (state) => state.prestigePoints >= 10,

        // --- MISIONES DE ERA 2 ---
        'DIAL_UP_PIONEER': (state) => (state.upgradeLevels.modem56k || 0) >= 5,
        'BASIC_WEB_PRESENCE': (state) => (state.upgradeLevels.htmlBasico || 0) >= 10,
        'BECOME_AN_ISP': (state) => (state.upgradeLevels.ispDatacenter || 0) > 0,
		'MASTER_THE_SURGE': (state) => (state.stats.dpsOverloadsActivated || 0) >= 1,
		'ADVERTISING_PARTNER': (state) => (state.stats.popupsClicked || 0) >= 3,
        'GSM_BREAKTHROUGH': (state) => (state.upgradeLevels.torreGSM || 0) >= 10,
        'SMS_MONETIZATION': (state) => (state.upgradeLevels.centroSMS || 0) > 0,
        'RINGTONE_FEVER': (state) => (state.upgradeLevels.tonosPolifonicos || 0) >= 5,
        'PORTAL_TO_THE_WORLD': (state) => (state.upgradeLevels.portalWeb || 0) > 0,
        'ADVERTISING_EMPIRE': (state) => (state.upgradeLevels.bannerPublicitario || 0) >= 3,
        'FIBER_CONNECTION': (state) => (state.upgradeLevels.backboneFibra || 0) > 0,
        'PREPARING_FOR_BROADBAND': (state) => state.prestigePoints >= 500
    },
    shopItems: {
		'PERMANENT_DPC_BOOST_1': (state) => state.shopUpgrades.includes('PERMANENT_DPC_BOOST_1'),
		'PERMANENT_DPS_BOOST_1': (state) => state.shopUpgrades.includes('PERMANENT_DPS_BOOST_1'),
		'PERMANENT_DPC_BOOST_2': (state) => state.shopUpgrades.includes('PERMANENT_DPC_BOOST_2'),
		'PERMANENT_DPS_BOOST_2': (state) => state.shopUpgrades.includes('PERMANENT_DPS_BOOST_2'),
		'ALL_MULTIPLIER_1': (state) => state.shopUpgrades.includes('ALL_MULTIPLIER_1'),
    
		// --- [AÑADIDO] Lógica faltante para los nuevos ítems de la Era 2 ---
		'POPUP_FREQUENCY_1': (state) => state.shopUpgrades.includes('POPUP_FREQUENCY_1'),
		'CLICK_FRENZY_DURATION_1': (state) => state.shopUpgrades.includes('CLICK_FRENZY_DURATION_1'),
		'VAULT_CAPACITY_1': (state) => state.shopUpgrades.includes('VAULT_CAPACITY_1'),
		'VAULT_FILLER_1': (state) => state.shopUpgrades.includes('VAULT_FILLER_1')
	}
};