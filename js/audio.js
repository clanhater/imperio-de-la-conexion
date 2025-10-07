// ---- MANEJADOR DE AUDIO (VERSIÓN CON ARCHIVOS LOCALES) ----

// Estado para saber si el sonido está activado o desactivado.
let isMuted = false;

// Definimos todos nuestros sonidos usando Howler.js, apuntando a nuestros archivos locales.
const sounds = {
	titleMusic: new Howl({
        src: ['assets/audio/title-music.mp3'],
        volume: 0.4,
        loop: true,
		preload: true,
        html5: true 
    }),
    click: new Howl({
        src: ['assets/audio/click.mp3'],
        volume: 0.7,
        pool: 5
    }),
    buySuccess: new Howl({
        src: ['assets/audio/success.mp3'],
        volume: 0.2
    }),
    buyFail: new Howl({
        src: ['assets/audio/fail.mp3'],
        volume: 0.2
    })
};

// Función global para reproducir un sonido por su nombre.
function playSound(soundName) {
    if (!isMuted && sounds[soundName]) {
        sounds[soundName].play();
    }
}

// Función para alternar el sonido.
function toggleMute() {
    isMuted = !isMuted;
    // Actualiza el estado visual del botón de opciones
    const optionsButton = document.getElementById('options-button');
    optionsButton.textContent = isMuted ? '🔇' : '⚙️';
    console.log(isMuted ? "Sonido Silenciado" : "Sonido Activado");
}

// NUEVA FUNCIÓN para controlar el volumen de todos los sonidos
function setMasterVolume(level) {
    Howler.volume(level);
}