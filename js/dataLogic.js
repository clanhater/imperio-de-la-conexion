// Este archivo contiene la LÓGICA que se "inyectará" en los datos puros cargados desde los JSON.

const dataLogic = {
    achievements: {
        // Clics
        'TOTAL_CLICKS_100': (state) => state.totalClicks >= 100,
        'TOTAL_CLICKS_1000': (state) => state.totalClicks >= 1000,
        'TOTAL_CLICKS_5000': (state) => state.totalClicks >= 5000,

        // Dinero
        'TOTAL_MONEY_10000': (state) => state.totalMoneyEver >= 10000,
        'TOTAL_MONEY_1M': (state) => state.totalMoneyEver >= 1000000,
        'TOTAL_MONEY_100M': (state) => state.totalMoneyEver >= 100000000,

        // DPS
        'DPS_100': (state) => Math.round(state.moneyPerSecond) >= 100,
        'DPS_1000': (state) => Math.round(state.moneyPerSecond) >= 1000,

        // Mejoras
        'UPGRADE_LEVEL_25_COBRE': (state) => state.upgradeLevels.lineaCobre >= 25,
        'UPGRADE_LEVEL_50_COBRE': (state) => state.upgradeLevels.lineaCobre >= 50,
        'OWN_CENTRALITA_DIGITAL': (state) => state.upgradeLevels.centralitaDigital > 0,
        'OWN_FIBRA_OPTICA': (state) => state.upgradeLevels.fibraOptica > 0,

        // Prestigio
        'FIRST_PRESTIGE': (state) => state.prestigePoints > 0,
        'TOTAL_PRESTIGE_POINTS_100': (state) => state.prestigePoints >= 100
    },
    missions: {
        // Fase 1
        'GET_STARTED': (state) => state.upgradeLevels.kitHerramientas > 0,
        'FIRST_LINE': (state) => state.upgradeLevels.lineaCobre >= 5,
        'ESTABLISH_NETWORK': (state) => Math.round(state.moneyPerSecond) >= 10,
        
        // Fase 2
        'AUTOMATE_CALLS': (state) => state.upgradeLevels.centralitaAnaloga > 0,
        'GO_ONLINE': (state) => state.upgradeLevels.modem2400 >= 5,
        'COMMUNITY_BUILDER': (state) => state.upgradeLevels.servidorBBS > 0,

        // Fase 3
        'DIGITAL_SWITCH': (state) => state.upgradeLevels.centralitaDigital > 0,
        'INTERNET_PROTOCOLS': (state) => state.upgradeLevels.protocoloTCPIP > 0,
        'FIBER_REVOLUTION': (state) => state.upgradeLevels.fibraOptica > 0,

        // Fase 4
        'INNOVATE_AND_RESET': (state) => state.prestigePoints >= 10
    },
    shopItems: {
        'PERMANENT_DPC_BOOST_1': (state) => state.shopUpgrades.includes('PERMANENT_DPC_BOOST_1'),
        'PERMANENT_DPS_BOOST_1': (state) => state.shopUpgrades.includes('PERMANENT_DPS_BOOST_1'),
        'PERMANENT_DPC_BOOST_2': (state) => state.shopUpgrades.includes('PERMANENT_DPC_BOOST_2'),
        'PERMANENT_DPS_BOOST_2': (state) => state.shopUpgrades.includes('PERMANENT_DPS_BOOST_2'),
        'STARTING_MONEY_1': (state) => state.shopUpgrades.includes('STARTING_MONEY_1'),
        'PRESTIGE_BOOST_1': (state) => state.shopUpgrades.includes('PRESTIGE_BOOST_1'),
        'AUTO_CLICKER_1': (state) => state.shopUpgrades.includes('AUTO_CLICKER_1'),
        'ALL_MULTIPLIER_1': (state) => state.shopUpgrades.includes('ALL_MULTIPLIER_1'),
        'KEEP_UPGRADES_1': (state) => state.shopUpgrades.includes('KEEP_UPGRADES_1')
    }
};