// --- NUEVO: Bandera para controlar la reproducción de clips ---
// Evita que se dispare un nuevo clip si otro ya está sonando.
let isClipPlaying = false;

// --- NUEVO: Volumen base para la música durante el juego ---
// Lo definimos aquí para que sea fácil de ajustar y reutilizar.
const GAME_MUSIC_VOLUME = 0.2;
const TITLE_MUSIC_VOLUME = 0.4;

// Definimos todos nuestros sonidos usando Howler.js
const sounds = {
    // La música de fondo no cambia
    titleMusic: new Howl({
        src: ['assets/audio/title-music.mp3'],
        volume: TITLE_MUSIC_VOLUME,
        loop: true,
        preload: true,
        html5: true
    }),
    
    // --- NUEVO: Array para tus clips de audio aleatorios ---
    randomClips: [
        new Howl({
            src: ['assets/audio/clips/Rikisisisimo.wav'],
            volume: 0.7
        }),
        new Howl({
            src: ['assets/audio/clips/Corazon_de_zeda.wav'],
            volume: 0.7
        }),
        new Howl({
            src: ['assets/audio/clips/bebesita.mp3'],
            volume: 0.7
        }),
		new Howl({
            src: ['assets/audio/clips/shakira.mp3'],
            volume: 0.7
        })
    ],

    // Los sonidos de la UI no cambian
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
        volume: 0.6
    })
};

// Función global para reproducir un sonido por su nombre (sin cambios).
function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName].play();
    }
}

// --- NUEVA FUNCIÓN PRINCIPAL ---
// Esta es la función que orquesta todo el efecto de "audio ducking".
function playRandomSoundClip() {
    // 1. Si ya hay un clip sonando o si no hay clips definidos, no hacemos nada.
    if (isClipPlaying || sounds.randomClips.length === 0) {
        return;
    }
    
    // 2. Activamos la bandera para bloquear otros clips.
    isClipPlaying = true;

    // 3. Elegimos un clip de audio al azar del array.
    const clip = sounds.randomClips[Math.floor(Math.random() * sounds.randomClips.length)];

    // 4. Bajamos suavemente el volumen de la música de fondo.
    //    El método .fade() va de un volumen a otro en un tiempo determinado (en milisegundos).
    sounds.titleMusic.fade(GAME_MUSIC_VOLUME, 0.05, 800); // Baja a 5% de volumen en 0.8s

    // 5. Escuchamos el evento 'end' del clip. Esto es clave.
    //    .once() se asegura de que esta función solo se ejecute una vez, cuando el clip termine.
    clip.once('end', () => {
        // Cuando el clip ha terminado, subimos el volumen de la música de vuelta a su nivel original.
        sounds.titleMusic.fade(0.05, GAME_MUSIC_VOLUME, 1200); // Sube de vuelta al volumen de juego en 1.2s
        
        // Liberamos la bandera para que otro clip pueda sonar en el futuro.
        isClipPlaying = false;
    });

    // 6. ¡Reproducimos el clip elegido!
    clip.play();
}

// NUEVA FUNCIÓN para controlar el volumen de todos los sonidos
function setMasterVolume(level) {
    Howler.volume(level);
}