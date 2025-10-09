const sounds = {
    // Grupo de Música
    titleMusic: { 
        howl: new Howl({ src: ['assets/audio/title-music.mp3'], loop: true, html5: true }), 
        type: 'music' 
    },

    // Grupo de Efectos (SFX)
    click: { 
        howl: new Howl({ src: ['assets/audio/click.mp3'], pool: 5 }), 
        type: 'sfx' 
    },
    buySuccess: { 
        howl: new Howl({ src: ['assets/audio/success.mp3'] }), 
        type: 'sfx' 
    },
    buyFail: { 
        howl: new Howl({ src: ['assets/audio/fail.mp3'] }), 
        type: 'sfx' 
    },
    menuHover: { 
        howl: new Howl({ src: ['assets/audio/hover.mp3'] }), 
        type: 'sfx' 
    },
    introPowerOn: { 
        howl: new Howl({ src: ['assets/audio/power-on.mp3'] }), 
        type: 'sfx' 
    },
    introCrtHum: { 
        howl: new Howl({ src: ['assets/audio/crt-hum.mp3'], loop: true }), 
        type: 'sfx' 
    },
    introRotaryPhone: { 
        howl: new Howl({ src: ['assets/audio/rotary-phone.mp3'] }), 
        type: 'sfx' 
    },
    introSynthArp: { 
        howl: new Howl({ src: ['assets/audio/synth-arp.mp3'] }), 
        type: 'sfx' 
    }
};

// Función global para reproducir un sonido
function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.howl.play();
    }
}

// Funciones para controlar los volúmenes por grupo
function setMusicVolume(level) {
    for (const key in sounds) {
        if (sounds[key].type === 'music') {
            sounds[key].howl.volume(level);
        }
    }
}

function setSfxVolume(level) {
    for (const key in sounds) {
        if (sounds[key].type === 'sfx') {
            sounds[key].howl.volume(level);
        }
    }
}

// Función para inicializar los volúmenes al cargar el juego
function initializeVolumes(musicVol, sfxVol) {
    setMusicVolume(musicVol);
    setSfxVolume(sfxVol);
}