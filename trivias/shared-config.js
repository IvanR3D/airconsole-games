// Configuración compartida para STEAM Trivia (pantalla y controlador)
// Reúne categorías, imágenes y colores para evitar duplicados.

// Categorías y textos
const categories = {
    general: { name: "General" },
    science: { name: "Ciencia" },
    mathematics: { name: "Matemáticas" },
    robotics: { name: "Robótica" },
    chemistry: { name: "Química" },
    technology: { name: "Tecnología" },
    history: { name: "Historia" },
    geography: { name: "Geografía" }
};

// Imágenes por categoría (regla trivias-styling: usar assets/images)
const categoryImages = {
    general: 'assets/images/globo.webp',
    science: 'assets/images/microscopio.webp',
    mathematics: 'assets/images/calculadora.webp',
    robotics: 'assets/images/Robot.webp',
    chemistry: 'assets/images/test tube.webp',
    technology: 'assets/images/programacion.webp',
    history: 'assets/images/libro.webp',
    geography: 'assets/images/planeta.webp'
};

// Colores: separados para respetar estilos actuales
const categoryColorsController = {
    general: '#0595AE',
    science: '#73A03F',
    mathematics: '#0595AE',
    robotics: '#AB3D8B',
    chemistry: '#EB8225',
    technology: '#AB3D8B',
    history: '#EB8225',
    geography: '#0595AE'
};

const categoryColorsScreen = {
    general: '#0595AE',    // turquesa
    science: '#73A03F',    // verde
    mathematics: '#6366F1', // índigo
    robotics: '#AB3D8B',   // morado
    chemistry: '#EB8225',  // naranja
    technology: '#0D9488', // esmeralda
    history: '#B45309',    // ámbar
    geography: '#2563EB'   // azul
};

// Colores para jugadores y límite
const playerColors = [
    '#0595AE', '#73A03F', '#EB8225', '#AB3D8B',
    '#6366F1', '#0D9488', '#B45309', '#2563EB',
    '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899',
    '#14b8a6', '#eab308', '#a855f7', '#22c55e',
    '#0ea5e9', '#d946ef', '#f43f5e', '#64748b'
];

const MAX_PLAYERS = 32;

// Rutas de iconos locales (usados en html/js). Si añades nuevos, decláralos aquí.
const iconPaths = {
    crown: 'assets/images/crown.webp',
    gamepad: 'assets/images/gamepad-white.webp',
    clock: 'assets/images/clock.webp',
    soundOn: 'assets/images/sound-on.webp',
    soundOff: 'assets/images/sound-off.webp'
};
