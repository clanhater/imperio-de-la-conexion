// js/audio.js (VERSIÓN OPTIMIZADA)

// 1. En lugar de crear los Howls, solo definimos la configuración de cada sonido.
//    No se descarga nada en este punto.
const soundConfigs = {
    // Grupo de Música
    titleMusic: { src: ['assets/audio/title-music.mp3'], loop: true, html5: true, type: 'music' },
    era1Music:  { src: ['assets/audio/era1-music.mp3'], loop: true, html5: true, type: 'music' },
    era2Music:  { src: ['assets/audio/era2-music.mp3'], loop: true, html5: true, type: 'music' },

    // Grupo de Efectos (SFX)
    click:            { src: ['assets/audio/click.mp3'], pool: 5, type: 'sfx' },
    buySuccess:       { src: ['assets/audio/success.mp3'], type: 'sfx' },
    buyFail:          { src: ['assets/audio/fail.mp3'], type: 'sfx' },
    menuHover:        { src: ['assets/audio/hover.mp3'], type: 'sfx' },
    introPowerOn:     { src: ['assets/audio/power-on.mp3'], type: 'sfx' },
    introCrtHum:      { src: ['assets/audio/crt-hum.mp3'], loop: true, type: 'sfx' },
    introRotaryPhone: { src: ['assets/audio/rotary-phone.mp3'], type: 'sfx' },
    introSuccess:     { src: ['assets/audio/intro-success.mp3'], type: 'sfx' },
    win95Startup:     { src: ['assets/audio/win95-startup.mp3'], type: 'sfx' },
    modemDialup:      { src: ['assets/audio/modem-dialup.mp3'], type: 'sfx' },
    keyboardTyping:   { src: ['assets/audio/keyboard-typing.mp3'], loop: true, type: 'sfx' },
    shutdown:         { src: ['assets/audio/shutdown.mp3'], type: 'sfx' },
    biosBeep:         { src: ['assets/audio/bios-beep.mp3'], type: 'sfx' }
};

// 2. Creamos un objeto para almacenar los sonidos una vez que se carguen.
const loadedSounds = {};

// 3. Función inteligente que obtiene un sonido. Si no está cargado, lo carga.
function getSound(soundName) {
    // Si el sonido ya se cargó antes, simplemente lo devolvemos.
    if (loadedSounds[soundName]) {
        return loadedSounds[soundName];
    }

    // Si no se ha cargado, buscamos su configuración.
    const config = soundConfigs[soundName];
    if (config) {
        // Creamos la instancia de Howl (AQUÍ es donde se descarga el archivo)
        const sound = new Howl(config);
        // Guardamos la instancia para no volver a cargarla.
        loadedSounds[soundName] = sound;
        // La devolvemos para poder usarla.
        return sound;
    }
    return null;
}

// 4. Modificamos las funciones existentes para que usen nuestro nuevo sistema.
function playSound(soundName) {
    const sound = getSound(soundName);
    if (sound) {
        sound.play();
    }
}

function setMusicVolume(level) {
    // Itera sobre los sonidos YA CARGADOS para ajustar su volumen
    for (const key in loadedSounds) {
        if (soundConfigs[key] && soundConfigs[key].type === 'music') {
            loadedSounds[key].volume(level);
        }
    }
}

function setSfxVolume(level) {
    for (const key in loadedSounds) {
        if (soundConfigs[key] && soundConfigs[key].type === 'sfx') {
            loadedSounds[key].volume(level);
        }
    }
}

// Esta función ahora es mucho menos importante, pero la mantenemos por consistencia
function initializeVolumes(musicVol, sfxVol) {
    setMusicVolume(musicVol);
    setSfxVolume(sfxVol);
}

// 5. Necesitamos una forma de detener los sonidos por su nombre, ya que no tenemos acceso
//    directo a las instancias `howl` todo el tiempo.
function stopSound(soundName) {
    const sound = getSound(soundName);
    if (sound) {
        sound.stop();
    }
}

function fadeSound(soundName, from, to, duration) {
    const sound = getSound(soundName);
    if (sound) {
        sound.fade(from, to, duration);
    }
}

function isSoundPlaying(soundName) {
    const sound = loadedSounds[soundName]; // Solo comprueba si está cargado y sonando
    return sound ? sound.playing() : false;
}