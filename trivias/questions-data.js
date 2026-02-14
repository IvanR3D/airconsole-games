// Banco de preguntas STEAM Trivia
// -------------------------------------------------------------
// Cómo está organizado este archivo
// 1) Helpers: shuffle, buildFromData, padTo100
//    - shuffle(array): devuelve copia mezclada (Fisher-Yates)
//    - buildFromData([ [pregunta, opciones[], correctaLabel], ... ]):
//         crea objetos { question, options, correct } calculando el índice
//    - padTo100(base, fillers): asegura mínimo 100 items por categoría
//      usando fillers repetibles si faltan.
//
// 2) Secciones por categoría (GENERAL, SCIENCE, MATHEMATICS, ROBOTICS,
//    CHEMISTRY, TECHNOLOGY, HISTORY, GEOGRAPHY)
//    Cada sección define:
//       - una base curada (buildFromData)
//       - grupos adicionales generados (listas mapeadas o for)
//       - se combinan y se pasan por padTo100
//
// 3) Ensamble final:
//    const questionsDatabase = { general, science, ... }
//    Se congela con Object.freeze para evitar mutaciones en runtime.
//
// Resumen rápido:
// - Cada pregunta tiene 4 opciones y un número que dice cuál es la correcta (empieza en 0).
// - Las categorías se llaman igual que en el juego: general, science, mathematics, etc.
// - Al final se arma un objeto llamado questionsDatabase con TODAS las preguntas.
// - El juego elige al azar dentro de la categoría seleccionada.
// Cómo agregar preguntas sin romper nada:
//   1) Ve a la sección de la categoría (busca el título en mayúsculas).
//   2) Copia una línea existente dentro de la lista base y cambia texto y opciones.
//   3) La opción correcta debe escribirse igual en el tercer campo de buildFromData.
//   4) No importa el orden: el código mezcla las opciones automáticamente.
//   5) Guarda. No necesitas tocar nada más.
// Nota: El archivo ya mete preguntas “de relleno” para llegar a 100 por categoría.

// Helper: mezcla simple para variar orden de opciones
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFromData(data) {
  return data.map(([q, opts, correctLabel]) => {
    const optsShuffled = shuffle(opts);
    return { question: q, options: optsShuffled, correct: optsShuffled.indexOf(correctLabel) };
  });
}

// ------------------ GENERAL ------------------
const generalBase = buildFromData([
  ["¿Cuál de estos países NO tiene costa?", ["Bolivia", "Perú", "Ecuador", "Chile"], "Bolivia"],
  ["Si en Nueva York son las 12:00 PM, ¿dónde es más probable que sean las 5:00 PM?", ["Lisboa", "Londres", "Madrid", "Buenos Aires"], "Madrid"],
  ["¿Qué idioma es oficial en más países?", ["Árabe", "Francés", "Inglés", "Español"], "Inglés"],
  ["¿Qué objeto pesa más? (mismo volumen)", ["1L de agua", "1L de mercurio", "1L de aceite", "1L de aire"], "1L de mercurio"],
  ["¿Cuál invento se comercializó primero?", ["Teléfono", "Bombilla incandescente", "Automóvil de gasolina", "Radio"], "Teléfono"],
  ["Un año bisiesto es divisible por 4, excepto si…", ["Es primo", "Termina en 00", "Es múltiplo de 100 pero no de 400", "Cae en domingo"], "Es múltiplo de 100 pero no de 400"],
  ["¿Qué ciudad queda más al norte?", ["Beijing", "Roma", "Nueva York", "Madrid"], "Beijing"],
  ["¿Cuántos países hay en la Unión Europea en 2026?", ["25", "27", "28", "30"], "27"],
  ["¿Cuál es la capital real de Turquía?", ["Estambul", "Ankara", "Esmirna", "Antalya"], "Ankara"],
  ["Si mezclas azul y amarillo obtienes…", ["Cian", "Verde", "Magenta", "Naranja"], "Verde"],
  ["¿Qué pesa más?", ["1 kg de plumas", "1 kg de hierro", "1 kg de oro", "Todos pesan lo mismo"], "Todos pesan lo mismo"],
  ["¿Qué país tiene más islas registradas?", ["Suecia", "Indonesia", "Filipinas", "Canadá"], "Suecia"],
  ["¿Cuál es la moneda de Corea del Sur?", ["Won", "Yen", "Ringgit", "Baht"], "Won"],
  ["¿Qué animal no puede saltar?", ["Elefante", "Canguro", "Gato", "Rana"], "Elefante"],
  ["¿Cuál es la capital de Australia?", ["Sídney", "Melbourne", "Canberra", "Perth"], "Canberra"],
  ["¿Cuál es el océano más pequeño?", ["Índico", "Atlántico", "Ártico", "Pacífico"], "Ártico"],
  ["¿Dónde está el Everest?", ["China", "India", "Tíbet/Nepal", "Pakistán"], "Tíbet/Nepal"],
  ["¿Qué país usa el franco suizo?", ["Suiza", "Suecia", "Finlandia", "Noruega"], "Suiza"],
  ["¿Cuál es la capital de Marruecos?", ["Casablanca", "Rabat", "Marrakech", "Fez"], "Rabat"],
  ["¿Cuál es la capital de Canadá?", ["Toronto", "Ottawa", "Vancouver", "Montreal"], "Ottawa"]
]);

const generalComparisons = buildFromData([
  ["¿Cuál país tiene mayor población?", ["Nigeria", "Egipto", "Sudáfrica", "Ghana"], "Nigeria"],
  ["¿Cuál país tiene mayor superficie?", ["Argentina", "Kazajistán", "Argelia", "Arabia Saudita"], "Kazajistán"],
  ["¿Qué ciudad está más al oeste?", ["Reikiavik", "Lisboa", "Dublín", "Londres"], "Reikiavik"],
  ["¿Qué ciudad está más alta sobre el nivel del mar?", ["La Paz", "Ciudad de México", "Quito", "Bogotá"], "La Paz"],
  ["¿Qué bandera tiene círculo rojo sobre fondo blanco?", ["Japón", "Bangladés", "Palau", "Groenlandia"], "Japón"],
  ["¿Quién tiene mayor PIB per cápita?", ["Noruega", "Suiza", "Qatar", "Singapur"], "Qatar"],
  ["¿Cuál lago es más profundo?", ["Baikal", "Tanganica", "Superior", "Victoria"], "Baikal"],
  ["¿Qué desierto es más grande?", ["Sahara", "Arábigo", "Gobi", "Kalahari"], "Sahara"],
  ["¿Cuál mar es más salado?", ["Muerto", "Rojo", "Caspio", "Báltico"], "Muerto"],
  ["¿Qué país tiene más husos horarios?", ["Rusia", "EEUU", "Francia", "China"], "Francia"],
  ["¿Cuál montaña es más alta fuera de Asia?", ["Aconcagua", "Kilimanjaro", "Denali", "Mont Blanc"], "Aconcagua"],
  ["¿Cuál río es más largo?", ["Nilo", "Amazonas", "Yangtsé", "Misisipi"], "Nilo"],
  ["¿Qué ciudad tiene más habitantes?", ["Tokio", "Delhi", "São Paulo", "Shanghái"], "Tokio"],
  ["¿Cuál continente tiene más países?", ["África", "Europa", "Asia", "América"], "África"],
  ["¿Qué isla es más grande?", ["Groenlandia", "Nueva Guinea", "Borneo", "Madagascar"], "Groenlandia"],
  ["¿Cuál país produce más café?", ["Brasil", "Colombia", "Vietnam", "Etiopía"], "Brasil"],
  ["¿Qué país consume más chocolate per cápita?", ["Suiza", "Bélgica", "Alemania", "Reino Unido"], "Suiza"],
  ["¿Qué ciudad es más antigua?", ["Jerusalén", "Atenas", "Roma", "Estambul"], "Jerusalén"],
  ["¿Cuál es más ancho?", ["Canal de Panamá", "Canal de Suez", "Canal de Corinto", "Canal de Kiel"], "Canal de Suez"],
  ["¿Dónde llueve más al año?", ["Cherrapunji", "Londres", "Seattle", "Bogotá"], "Cherrapunji"],
  ["¿Qué capital está más cerca del ecuador?", ["Quito", "Nairobi", "Brasilia", "Yakarta"], "Quito"],
  ["¿Cuál país tiene más volcanes activos?", ["Indonesia", "Japón", "Chile", "EEUU"], "Indonesia"],
  ["¿Cuál país tiene mayor densidad de población?", ["India", "Bangladés", "Japón", "Corea del Sur"], "Bangladés"],
  ["¿Qué océano es más cálido en promedio?", ["Índico", "Atlántico", "Pacífico", "Ártico"], "Índico"],
  ["¿Qué ciudad está más al sur?", ["Ushuaia", "Punta Arenas", "Christchurch", "Hobart"], "Ushuaia"]
]);

const generalLogic = [];
for (let n = 1; n <= 55; n++) {
  const litres = n * 3;
  generalLogic.push({
    question: `Tienes ${litres}L de agua y ${litres}L de aceite. ¿Cuál ocupa más espacio?`,
    options: ["Agua", "Aceite", "Ocupan lo mismo", "Depende de la temperatura"],
    correct: 2
  });
}
const generalQuestions = padTo100([...generalBase, ...generalComparisons], generalLogic);

// ------------------ SCIENCE ------------------
const scienceBase = buildFromData([
  ["¿Qué partícula tiene carga negativa?", ["Protón", "Electrón", "Neutrón", "Bosón W"], "Electrón"],
  ["¿Qué planeta rota 'al revés' respecto a la mayoría?", ["Venus", "Marte", "Júpiter", "Mercurio"], "Venus"],
  ["El ADN se encuentra en…", ["Cloroplastos", "Mitocondrias", "Núcleo", "Todas las anteriores"], "Todas las anteriores"],
  ["Unidad SI de presión:", ["Bar", "Atm", "Pascal", "Torr"], "Pascal"],
  ["¿Qué detecta LIGO?", ["Materia oscura", "Ondas gravitacionales", "Rayos gamma", "Neutrinos"], "Ondas gravitacionales"],
  ["¿Qué variable permanece constante en un proceso isocórico?", ["Volumen", "Presión", "Temperatura", "Moles"], "Volumen"],
  ["Velocidad de la luz en vacío aprox:", ["3e5 km/s", "3e6 km/s", "3e7 m/s", "3e5 m/s"], "3e5 km/s"],
  ["¿Quién predijo los agujeros negros con relatividad general?", ["Newton", "Einstein", "Hawking", "Chandrasekhar"], "Einstein"],
  ["¿Cuál es la partícula portadora de la fuerza fuerte?", ["Fotón", "Gluón", "Bosón Z", "Gravitón"], "Gluón"],
  ["pH 3 es:", ["Neutro", "Ácido fuerte", "Ácido débil", "Básico"], "Ácido fuerte"],
  ["¿Qué gas es más abundante en la atmósfera terrestre?", ["Oxígeno", "Nitrógeno", "CO2", "Argón"], "Nitrógeno"],
  ["¿Qué órgano bombea la linfa?", ["Corazón", "Pulmones", "Músculos esqueléticos", "Hígado"], "Músculos esqueléticos"],
  ["Energía de un fotón depende de:", ["Amplitud", "Frecuencia", "Fase", "Polarización"], "Frecuencia"],
  ["¿Qué capa protege de rayos UV?", ["Troposfera", "Estratosfera (ozono)", "Mesosfera", "Ionosfera"], "Estratosfera (ozono)"],
  ["¿Qué unidad mide energía?", ["Watt", "Joule", "Volt", "Ohm"], "Joule"],
  ["¿Qué tipo de onda es la luz?", ["Transversal", "Longitudinal", "Ambas", "No es onda"], "Transversal"],
  ["¿Qué organismo no es célula?", ["Virus", "Bacteria", "Hongo", "Protozoo"], "Virus"],
  ["¿Qué vitamina sintetiza la piel con sol?", ["A", "B12", "C", "D"], "D"],
  ["¿Qué elemento es líquido a 25°C?", ["Mercurio", "Cesio", "Galio", "Bromo"], "Mercurio"],
  ["¿Qué tejido almacena glucógeno?", ["Muscular", "Adiposo", "Hepático", "Óseo"], "Hepático"]
]);

const elements = [
  ["Hidrógeno", 1], ["Helio", 2], ["Litio", 3], ["Berilio", 4], ["Boro", 5], ["Carbono", 6],
  ["Nitrógeno", 7], ["Oxígeno", 8], ["Flúor", 9], ["Neón", 10], ["Sodio", 11], ["Magnesio", 12],
  ["Aluminio", 13], ["Silicio", 14], ["Fósforo", 15], ["Azufre", 16], ["Cloro", 17], ["Argón", 18],
  ["Potasio", 19], ["Calcio", 20], ["Hierro", 26], ["Cobre", 29], ["Zinc", 30], ["Plata", 47],
  ["Yodo", 53], ["Oro", 79], ["Mercurio", 80], ["Plomo", 82], ["Uranio", 92]
];
const scienceElements = elements.map(([name, z]) => {
  const distractors = [z - 1, z + 1, z + 2].map(v => Math.max(1, v));
  const opts = shuffle([z.toString(), ...distractors.map(String)]);
  return { question: `Número atómico de ${name}:`, options: opts, correct: opts.indexOf(z.toString()) };
});

const scienceTemps = [
  ["Agua hierve (1 atm)", 100],
  ["Agua se congela", 0],
  ["Cero absoluto", -273],
  ["Cuerpo humano", 37]
].map(([label, val]) => {
  const opts = shuffle([`${val}°C`, `${val + 5}°C`, `${val - 5}°C`, `${val + 10}°C`]);
  return { question: `${label} ≈`, options: opts, correct: opts.indexOf(`${val}°C`) };
});

// Prefijos métricos
const sciencePrefixes = [
  ["kilo", 3], ["mega", 6], ["giga", 9], ["tera", 12],
  ["mili", -3], ["micro", -6], ["nano", -9], ["pico", -12],
  ["centi", -2], ["deci", -1]
].map(([name, exp]) => {
  const opts = shuffle([exp, exp + 1, exp - 1, exp + 3].map(e => `10^${e}`));
  return { question: `Prefijo ${name} corresponde a:`, options: opts, correct: opts.indexOf(`10^${exp}`) };
});

// Conversión Cº a Fº
const scienceConversions = [];
for (let c = -40; c <= 90; c += 10) {
  const f = Math.round(c * 9 / 5 + 32);
  const opts = shuffle([f, f + 5, f - 5, f + 10].map(v => `${v}°F`));
  scienceConversions.push({ question: `¿A cuántos °F equivale ${c}°C (aprox)?`, options: opts, correct: opts.indexOf(`${f}°F`) });
}

// Datos rápidos de cuerpo humano / biología
const scienceBody = buildFromData([
  ["Número de cromosomas en humanos", ["44", "46", "48", "23"], "46"],
  ["Grupo sanguíneo universal receptor", ["AB+", "O-", "A+", "B+"], "AB+"],
  ["Hueso más largo del cuerpo", ["Fémur", "Húmero", "Tibia", "Peroné"], "Fémur"],
  ["Órgano que produce insulina", ["Hígado", "Páncreas", "Riñón", "Bazo"], "Páncreas"],
  ["Vitamina esencial para la coagulación", ["K", "A", "D", "B12"], "K"],
  ["Cantidad de vertebras cervicales humanas", ["5", "7", "9", "12"], "7"],
  ["Principal gas exhalado al respirar", ["CO2", "O2", "N2", "Argón"], "CO2"],
  ["Músculo principal de la respiración", ["Diafragma", "Intercostales", "Pectoral", "Recto abdominal"], "Diafragma"],
  ["Tipo de tejido que conecta músculo a hueso", ["Tendón", "Ligamento", "Cartílago", "Epitelial"], "Tendón"],
  ["Células que transportan oxígeno", ["Eritrocitos", "Leucocitos", "Plaquetas", "Neutrofilos"], "Eritrocitos"]
]);

// Física y astronomía rápida
const sciencePhysics = buildFromData([
  ["Aceleración de la gravedad en la Tierra (m/s²)", ["9.8", "1.6", "3.7", "24.8"], "9.8"],
  ["Velocidad del sonido en aire (m/s, 20°C)", ["343", "1500", "270", "500"], "343"],
  ["Duración de un día en Marte (horas)", ["24.6", "20.0", "30.2", "10.0"], "24.6"],
  ["Planeta más denso del sistema solar", ["Tierra", "Saturno", "Júpiter", "Marte"], "Tierra"],
  ["Planeta con más satélites conocidos", ["Saturno", "Júpiter", "Urano", "Neptuno"], "Saturno"],
  ["Valor de 1 atm en kPa", ["101.3", "1", "14.7", "120"], "101.3"],
  ["Unidad SI de energía", ["Joule", "Watt", "Newton", "Pascal"], "Joule"],
  ["Carga del electrón (signo)", ["Negativa", "Positiva", "Nula", "Depende"], "Negativa"],
  ["Espectro visible aproximadamente va de", ["400-700 nm", "200-400 nm", "700-1200 nm", "1-10 mm"], "400-700 nm"],
  ["Constante de Avogadro ≈", ["6.02e23", "3.14e8", "9.81", "1.60e-19"], "6.02e23"]
]);

const scienceQuestions = padTo100(
  [
    ...scienceBase,
    ...scienceElements,
    ...scienceTemps,
    ...sciencePrefixes,
    ...scienceConversions,
    ...scienceBody,
    ...sciencePhysics
  ],
  [...scienceElements, ...scienceConversions, ...sciencePhysics]
);

// ------------------ MATHEMATICS ------------------
const mathBase = buildFromData([
  ["Si 2^x = 32, entonces x =", ["4", "5", "6", "2"], "5"],
  ["Derivada de sin(x):", ["cos(x)", "-cos(x)", "-sin(x)", "tan(x)"], "cos(x)"],
  ["Primo más pequeño > 90:", ["91", "97", "101", "103"], "97"],
  ["Área de un círculo r=3:", ["6π", "9π", "12π", "18π"], "9π"],
  ["Si A y B independientes, P(A∩B) =", ["P(A)+P(B)", "P(A)·P(B)", "P(A)/P(B)", "Depende"], "P(A)·P(B)"],
  ["Matriz 3x5 rango máximo:", ["3", "5", "8", "15"], "3"],
  ["¿Cuántos grados suma un triángulo esférico?", ["180", "Entre 180 y 540", "Menos de 180", "Exacto 270"], "Entre 180 y 540"],
  ["e^(ln 7) =", ["1", "7", "ln 7", "e·7"], "7"],
  ["Serie armónica 1/n es:", ["Convergente", "Divergente", "Alternante", "Condicional"], "Divergente"],
  ["log10(100000) =", ["4", "5", "6", "10"], "5"],
  ["Integral de 1/x dx =", ["ln|x|+C", "x+C", "1/(x^2)+C", "tan^{-1}(x)+C"], "ln|x|+C"],
  ["Límite sin(x)/x cuando x→0:", ["0", "1", "infinito", "No existe"], "1"],
  ["Determinante de matriz identidad:", ["0", "1", "n", "n!"], "1"],
  ["Probabilidad de cara en moneda justa:", ["0", "0.25", "0.5", "0.75"], "0.5"],
  ["Varianza de una constante k:", ["k", "0", "k^2", "1/k"], "0"],
  ["¿Cuál no es número irracional?", ["π", "√2", "e", "22/7"], "22/7"],
  ["Factorial de 0:", ["0", "1", "No existe", "-1"], "1"],
  ["Binomio de Newton (a+b)^2:", ["a^2+b^2", "a^2+2ab+b^2", "2ab", "a^2-2ab+b^2"], "a^2+2ab+b^2"],
  ["Pendiente de recta horizontal:", ["0", "1", "∞", "Indefinida"], "0"],
  ["¿Qué crece más rápido?", ["n^2", "n log n", "2^n", "√n"], "2^n"]
]);

const mathSquares = [];
for (let n = 11; n <= 50; n++) {
  const exact = n * n;
  const opts = shuffle([exact, exact + n, exact - n, exact + 10].map(String));
  mathSquares.push({ question: `¿Cuánto es ${n}^2?`, options: opts, correct: opts.indexOf(String(exact)) });
}

const mathLogs = [];
for (let n = 2; n <= 8; n++) {
  const val = Math.pow(10, n);
  const opts = shuffle([n, n - 1, n + 1, val].map(String));
  mathLogs.push({ question: `log10(${val}) =`, options: opts, correct: opts.indexOf(String(n)) });
}

const mathPrimes = [97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173];
const mathPrimeQs = mathPrimes.map(p => {
  const opts = shuffle([p, p + 1, p - 1, p + 10].map(String));
  return { question: `Selecciona el número primo:`, options: opts, correct: opts.indexOf(String(p)) };
});

// Potencias de dos para ampliar banca única
const mathPowers = [];
for (let n = 6; n <= 22; n++) {
  const val = Math.pow(2, n);
  const opts = shuffle([val, val / 2, val * 2, val + 10].map(String));
  mathPowers.push({ question: `2^${n} =`, options: opts, correct: opts.indexOf(String(val)) });
}

const mathQuestions = padTo100(
  [...mathBase, ...mathSquares, ...mathLogs, ...mathPrimeQs, ...mathPowers],
  mathBase
);

// ------------------ ROBOTICS ------------------
const roboticsBase = buildFromData([
  ["En un robot móvil, SLAM significa:", ["Simultaneous Localization and Mapping", "Single Loop Actuator Motor", "Serial Link Axis Model", "Servo Localization and Movement"], "Simultaneous Localization and Mapping"],
  ["¿Qué sensor da orientación absoluta?", ["Encoder", "IMU con magnetómetro", "Ultrasonido", "IR"], "IMU con magnetómetro"],
  ["PID: la parte D actúa sobre:", ["Error acumulado", "Error instantáneo", "Derivada del error", "Salida"], "Derivada del error"],
  ["ROS usa como transporte por defecto:", ["HTTP", "TCP/UDP", "MQTT", "CoAP"], "TCP/UDP"],
  ["¿Qué es rosbag?", ["Simulador 3D", "Formato de log de mensajes", "Librería de control", "Planificador"], "Formato de log de mensajes"],
  ["Cinemática directa calcula:", ["Par de motores", "Pose a partir de articulaciones", "Articulaciones desde pose", "Voltaje máximo"], "Pose a partir de articulaciones"],
  ["¿Qué pasa si saturas PID sin anti-windup?", ["Vibra", "Se resetea", "Integra de más y tarda en estabilizar", "Nada"], "Integra de más y tarda en estabilizar"],
  ["Robot diferencial: girar sobre su eje requiere:", ["Ambas ruedas adelante", "Una rueda adelante y otra atrás", "Frenar ambas", "Solo acelerar derecha"], "Una rueda adelante y otra atrás"],
  ["LiDAR 2D entrega nubes en:", ["XYZ", "Plano polar r-θ", "RGB", "Depth map 2D"], "Plano polar r-θ"],
  ["Arduino UNO usa MCU:", ["STM32", "ATmega328P", "ESP32", "RP2040"], "ATmega328P"],
  ["¿Qué es un gripper?", ["Pinza", "Cámara", "IMU", "Motor"], "Pinza"],
  ["Encoder óptico mide:", ["Corriente", "Distancia", "Ángulo/rotación", "Temperatura"], "Ángulo/rotación"],
  ["Parámetro URDF define:", ["Geometría y articulaciones", "Drivers", "Firmware", "PWM"], "Geometría y articulaciones"],
  ["TF en ROS sirve para:", ["Gestionar transformaciones de marcos", "Publicar video", "Grabar logs", "Enviar comandos PWM"], "Gestionar transformaciones de marcos"],
  ["¿Qué controlador evita sobreesfuerzo al arranque?", ["Soft-start", "Bang-bang", "On/Off", "Derivativo puro"], "Soft-start"],
  ["IMU incluye típicamente:", ["Acelerómetro y giroscopio", "Ultrasonido", "GPS", "LiDAR"], "Acelerómetro y giroscopio"],
  ["¿Qué es un actuador?", ["Sensor de distancia", "Elemento que ejecuta movimiento", "CPU", "Alimentación"], "Elemento que ejecuta movimiento"],
  ["ROS topic es:", ["Archivo", "Canal pub/sub", "Sensor físico", "Nodo maestro"], "Canal pub/sub"],
  ["¿Qué protocolo usa muchos servos hobby?", ["I2C", "PWM", "SPI", "CAN"], "PWM"],
  ["¿Qué efecto logra un filtro Kalman?", ["Reduce ruido en estimación", "Aumenta ganancia", "Genera PWM", "Convierte AC/DC"], "Reduce ruido en estimación"]
]);

const boards = [
  ["Raspberry Pi", "Linux SBC"],
  ["Arduino Mega", "Microcontrolador 8-bit"],
  ["ESP32", "WiFi+BT MCU"],
  ["Jetson Nano", "GPU edge"],
  ["Teensy 4.1", "MCU alta velocidad"],
  ["STM32 Nucleo", "MCU ARM"],
  ["Beaglebone", "SBC PRU"],
  ["Micro:bit", "MCU educativo"],
  ["OpenMV", "Visión embebida"],
  ["Pixhawk", "Controlador de vuelo"],
  ["Odroid", "SBC ARM"],
  ["LattePanda", "x86 embebido"]
];
const roboticsBoards = boards.map(([name, role]) => {
  const opts = shuffle([role, "Gateway IoT", "PLC industrial", "Sensor IMU"]);
  return { question: `${name} se usa principalmente como:`, options: opts, correct: opts.indexOf(role) };
});

const motors = [
  ["Stepper", "Pasos discretos"],
  ["Servo", "Posición controlada"],
  ["DC brushed", "Velocidad simple"],
  ["BLDC", "Eficiencia alta"],
  ["Linear actuator", "Movimiento lineal"],
  ["Planetary gearbox", "Alto torque"],
  ["Harmonic drive", "Backlash mínimo"],
  ["Solenoide", "Golpe lineal"]
];
const roboticsMotors = motors.map(([m, trait]) => {
  const opts = shuffle([trait, "Solo torque alto", "Solo baja tensión", "Solo binario on/off"]);
  return { question: `${m}: característica clave`, options: opts, correct: opts.indexOf(trait) };
});

// Pines GPIO típicos por placa
const boardPins = [
  ["Arduino Uno", 14],
  ["Arduino Mega", 54],
  ["ESP32", 34],
  ["Raspberry Pi 4", 28],
  ["Teensy 4.1", 55],
  ["RP2040 Pico", 26],
  ["STM32 Nucleo", 50],
  ["Jetson Nano (40-pin)", 28],
  ["Beaglebone Black", 65],
  ["Micro:bit", 23]
];
const roboticsPins = boardPins.map(([board, count]) => {
  const opts = shuffle([count, count - 4, count + 4, count + 10].map(String));
  return { question: `Pines GPIO aproximados en ${board}:`, options: opts, correct: opts.indexOf(String(count)) };
});

// Voltaje lógico habitual
const boardVoltages = [
  ["Arduino Uno", "5V"],
  ["Arduino Mega", "5V"],
  ["ESP32", "3.3V"],
  ["Raspberry Pi 4", "3.3V"],
  ["Teensy 4.1", "3.3V"],
  ["RP2040 Pico", "3.3V"],
  ["STM32 Nucleo", "3.3V"],
  ["ESP8266", "3.3V"]
];
const roboticsVoltages = boardVoltages.map(([board, v]) => {
  const opts = shuffle([v, "1.8V", "5V", "12V"]);
  return { question: `Tensión lógica típica de ${board}:`, options: opts, correct: opts.indexOf(v) };
});

// Packs de baterías Li-Ion en serie (3.7 V nominal c/u)
const roboticsBatteries = [];
for (let cells = 2; cells <= 6; cells++) {
  const nominal = (cells * 3.7).toFixed(1);
  const opts = shuffle([nominal, (cells * 4.2).toFixed(1), (cells * 3.0).toFixed(1), (cells * 5).toFixed(1)].map(v => `${v} V`));
  roboticsBatteries.push({
    question: `Pack de ${cells} celdas Li-Ion en serie tiene voltaje nominal ≈`,
    options: opts,
    correct: opts.indexOf(`${nominal} V`)
  });
}

// PWM estándar de servos hobby
const roboticsPwm = [];
for (let us = 1000; us <= 2000; us += 125) {
  const opts = shuffle([`${us} µs`, `${us - 200} µs`, `${us + 200} µs`, `${us + 400} µs`]);
  roboticsPwm.push({
    question: `Control PWM de servo: ¿qué pulso cercano a ${us} µs está dentro del rango típico 1000-2000 µs?`,
    options: opts,
    correct: opts.indexOf(`${us} µs`)
  });
}

const roboticsQuestions = padTo100(
  [...roboticsBase, ...roboticsBoards, ...roboticsMotors, ...roboticsPins, ...roboticsVoltages, ...roboticsBatteries, ...roboticsPwm],
  roboticsBase
);

// ------------------ CHEMISTRY ------------------
const chemistryBase = buildFromData([
  ["pH 7 a 25°C indica:", ["Ácido", "Básico", "Neutral", "Depende"], "Neutral"],
  ["¿Qué gas se libera al mezclar vinagre y bicarbonato?", ["Hidrógeno", "Oxígeno", "CO2", "Cloro"], "CO2"],
  ["Enlace que comparte electrones:", ["Iónico", "Covalente", "Metálico", "Puente de hidrógeno"], "Covalente"],
  ["Número atómico define:", ["Neutrones", "Protones", "Electrones de valencia", "Masa"], "Protones"],
  ["Estado de agregación del vidrio:", ["Sólido cristalino", "Sólido amorfo", "Líquido superenfriado", "Plasma"], "Sólido amorfo"],
  ["¿Qué es un mol?", ["Masa fija", "Conteo de partículas", "Volumen fijo", "Energía"], "Conteo de partículas"],
  ["Electrólisis del agua genera:", ["H2 y O2", "H2O2", "CO y CO2", "Nada sin sal"], "H2 y O2"],
  ["Catalizador hace:", ["Bajar energía de activación", "Subir entalpía", "Cambiar equilibrio", "Consumirse"], "Bajar energía de activación"],
  ["Disolución tampón resiste cambios de:", ["Temperatura", "pH", "Presión", "Volumen"], "pH"],
  ["¿Qué elemento es líquido a 25°C?", ["Mercurio", "Sodio", "Aluminio", "Calcio"], "Mercurio"],
  ["Gas noble más ligero:", ["Neón", "Argón", "Helio", "Xenón"], "Helio"],
  ["Sal común (NaCl) es:", ["Ácido", "Base", "Sal neutra", "Oxidante fuerte"], "Sal neutra"],
  ["¿Qué mide la escala de Mohs?", ["pH", "Dureza mineral", "Conductividad", "Punto de fusión"], "Dureza mineral"],
  ["¿Qué subpartícula determina isótopos?", ["Electrones", "Protones", "Neutrones", "Quarks"], "Neutrones"],
  ["¿Qué compuesto huele a huevo podrido?", ["H2S", "NH3", "CO", "SO2"], "H2S"],
  ["¿Qué ácido está en el estómago?", ["Ácido sulfúrico", "Ácido clorhídrico", "Ácido nítrico", "Ácido acético"], "Ácido clorhídrico"],
  ["Principal componente del aire:", ["N2", "O2", "CO2", "Ar"], "N2"],
  ["Metal alcalino más reactivo de la lista:", ["Litio", "Sodio", "Potasio", "Cesio"], "Cesio"],
  ["¿Qué tipo de reacción es combustión?", ["Redox", "Ácido-base", "Precipitación", "Descomposición sin O2"], "Redox"],
  ["¿Qué color da el ion cobre (II) en solución?", ["Incoloro", "Azul", "Verde", "Rojo"], "Azul"]
]);

const acids = [
  ["H2SO4", "Ácido sulfúrico"],
  ["HNO3", "Ácido nítrico"],
  ["H3PO4", "Ácido fosfórico"],
  ["HF", "Ácido fluorhídrico"],
  ["CH3COOH", "Ácido acético"],
  ["H2CO3", "Ácido carbónico"],
  ["HClO4", "Ácido perclórico"],
  ["HBr", "Ácido bromhídrico"],
  ["HCl", "Ácido clorhídrico"],
  ["HI", "Ácido yodhídrico"]
];
const chemistryAcids = acids.map(([f, name]) => {
  const opts = shuffle([name, "Base fuerte", "Sal", "Óxido"]);
  return { question: `${f} es:`, options: opts, correct: opts.indexOf(name) };
});

const chemStates = [
  ["CO2 a 25°C", "Gas"],
  ["NaCl a 25°C", "Sólido"],
  ["Br2 a 25°C", "Líquido"],
  ["Cl2 a 25°C", "Gas"],
  ["Hg a 25°C", "Líquido"],
  ["Agua a 90°C", "Líquido"],
  ["Etanol a 20°C", "Líquido"],
  ["N2 a 25°C", "Gas"],
  ["He a 25°C", "Gas"],
  ["K a 25°C", "Sólido"]
];
const chemistryStates = chemStates.map(([sub, st]) => {
  const opts = shuffle(["Sólido", "Líquido", "Gas", "Plasma"]);
  return { question: `${sub} está principalmente en estado:`, options: opts, correct: opts.indexOf(st) };
});

// Símbolos químicos
const chemSymbolsData = [
  ["Oxígeno", "O"], ["Hidrógeno", "H"], ["Nitrógeno", "N"], ["Carbono", "C"], ["Sodio", "Na"],
  ["Potasio", "K"], ["Calcio", "Ca"], ["Hierro", "Fe"], ["Cobre", "Cu"], ["Plata", "Ag"],
  ["Oro", "Au"], ["Plomo", "Pb"], ["Mercurio", "Hg"], ["Silicio", "Si"], ["Fósforo", "P"],
  ["Azufre", "S"], ["Cloro", "Cl"], ["Bromo", "Br"], ["Yodo", "I"], ["Litio", "Li"],
  ["Magnesio", "Mg"], ["Zinc", "Zn"], ["Aluminio", "Al"], ["Flúor", "F"], ["Níquel", "Ni"],
  ["Cobalto", "Co"], ["Manganeso", "Mn"], ["Titanio", "Ti"], ["Cromo", "Cr"], ["Neón", "Ne"]
];
const chemistrySymbols = chemSymbolsData.map(([elem, sym]) => {
  const opts = shuffle([sym, sym.toLowerCase(), sym + sym, sym[0].toUpperCase() + sym[0].toLowerCase()]);
  return { question: `Símbolo químico de ${elem}:`, options: opts, correct: opts.indexOf(sym) };
});

// Electrones de valencia en estado fundamental (representativo)
const chemValenceData = [
  ["Carbono", 4], ["Oxígeno", 6], ["Nitrógeno", 5], ["Sodio", 1], ["Magnesio", 2],
  ["Aluminio", 3], ["Silicio", 4], ["Cloro", 7], ["Azufre", 6], ["Fósforo", 5]
];
const chemistryValence = chemValenceData.map(([elem, val]) => {
  const opts = shuffle([val, val - 1, val + 1, val + 2].map(String));
  return { question: `Electrones de valencia de ${elem}:`, options: opts, correct: opts.indexOf(String(val)) };
});

// Clasificación por pH
const chemistryPh = [];
for (let pH = 0; pH <= 14; pH += 2) {
  const category = pH < 3 ? "Ácido fuerte" : pH < 7 ? "Ácido débil" : pH === 7 ? "Neutral" : pH <= 10 ? "Básico" : "Básico fuerte";
  const opts = shuffle(["Ácido fuerte", "Ácido débil", "Neutral", "Básico", "Básico fuerte"].slice(0,5));
  chemistryPh.push({ question: `Una solución con pH ${pH} es:`, options: opts, correct: opts.indexOf(category) });
}

const chemistryQuestions = padTo100(
  [...chemistryBase, ...chemistryAcids, ...chemistryStates, ...chemistrySymbols, ...chemistryValence, ...chemistryPh],
  chemistryBase
);

// ------------------ TECHNOLOGY ------------------
const techBase = buildFromData([
  ["¿Qué complejidad tiene una búsqueda binaria?", ["O(n)", "O(log n)", "O(1)", "O(n log n)"], "O(log n)"],
  ["HTTPS agrega seguridad mediante:", ["TLS/SSL", "FTP", "SSH", "SFTP"], "TLS/SSL"],
  ["UTF-8 puede representar:", ["Solo ASCII", "ASCII y más", "Solo latin-1", "Solo emojis"], "ASCII y más"],
  ["Primera versión pública de Git:", ["1995", "2005", "2010", "2015"], "2005"],
  ["¿Qué es WebSocket?", ["Protocolo full-duplex sobre TCP", "Librería JS", "Base de datos", "Codec de video"], "Protocolo full-duplex sobre TCP"],
  ["CPU vs GPU: la GPU es mejor para:", ["Secuencias largas", "Baja latencia", "Trabajo masivamente paralelo", "IO de disco"], "Trabajo masivamente paralelo"],
  ["¿Qué es CRUD?", ["Create, Read, Update, Delete", "Cache, Render, Update, Deploy", "Compile, Run, Unit, Debug", "Nada"], "Create, Read, Update, Delete"],
  ["DNS traduce:", ["Dominios a IP", "IP a MAC", "MAC a puerto", "HTTP a TCP"], "Dominios a IP"],
  ["¿Qué algoritmo para rutas cortas sin pesos negativos?", ["Kruskal", "Dijkstra", "Prim", "Floyd-Warshall con pesos negativos"], "Dijkstra"],
  ["Compresión con pérdida:", ["ZIP", "PNG", "JPEG", "FLAC"], "JPEG"],
  ["Puerto típico de HTTPS:", ["80", "21", "22", "443"], "443"],
  ["¿Qué significa API?", ["Application Programming Interface", "Advanced Protocol Interface", "App Parallel Input", "Algo Poco Importante"], "Application Programming Interface"],
  ["Cloud IaaS provee principalmente:", ["Aplicaciones listas", "Infraestructura (VM/red)", "Funciones serverless", "Bases NoSQL"], "Infraestructura (VM/red)"],
  ["¿Qué es latency?", ["Tiempo de respuesta", "Ancho de banda", "Capacidad de disco", "Ciclos de CPU"], "Tiempo de respuesta"],
  ["¿Qué hash es de 256 bits?", ["MD5", "SHA-1", "SHA-256", "CRC32"], "SHA-256"],
  ["¿Qué formato es binario?", ["JSON", "XML", "Protocol Buffers", "YAML"], "Protocol Buffers"],
  ["¿Qué significa CORS?", ["Cross-Origin Resource Sharing", "Centralized Origin Routing Service", "Cache Over RESTful Services", "Content Only Restricted"], "Cross-Origin Resource Sharing"],
  ["¿Qué patrón es MVC?", ["Arquitectura", "Hash", "Compresión", "Protocolo"], "Arquitectura"],
  ["¿Qué empresa creó Kubernetes?", ["Docker", "IBM", "Google", "Red Hat"], "Google"],
  ["¿Qué capa es TCP?", ["Aplicación", "Transporte", "Red", "Enlace"], "Transporte"]
]);

const httpCodes = [
  [200, "OK"], [201, "Created"], [204, "No Content"], [301, "Moved Permanently"], [302, "Found"],
  [400, "Bad Request"], [401, "Unauthorized"], [403, "Forbidden"], [404, "Not Found"],
  [418, "I'm a teapot"], [500, "Internal Server Error"], [503, "Service Unavailable"]
];
const techHttp = httpCodes.map(([code, text]) => {
  const opts = shuffle([text, "Gateway Timeout", "Bad Gateway", "Not Acceptable"]);
  return { question: `HTTP ${code} significa:`, options: opts, correct: opts.indexOf(text) };
});

const fileTypes = [
  ["PNG", "Imagen raster sin pérdida"],
  ["JPEG", "Imagen con pérdida"],
  ["SVG", "Gráfico vectorial"],
  ["MP4", "Contenedor de video"],
  ["FLAC", "Audio sin pérdida"],
  ["MP3", "Audio con pérdida"],
  ["CSV", "Texto separado por comas"],
  ["PDF", "Documento portátil"],
  ["GIF", "Animación simple"],
  ["WEBP", "Imagen moderna"],
  ["WAV", "Audio PCM"],
  ["APK", "Paquete Android"],
  ["EXE", "Ejecutable Windows"]
];
const techFiles = fileTypes.map(([ext, desc]) => {
  const opts = shuffle([desc, "Archivo ejecutable", "Base de datos", "Script de servidor"]);
  return { question: `${ext} es:`, options: opts, correct: opts.indexOf(desc) };
});

const techPorts = [
  [22, "SSH"], [25, "SMTP"], [53, "DNS"], [80, "HTTP"], [110, "POP3"],
  [143, "IMAP"], [3306, "MySQL"], [5432, "PostgreSQL"], [6379, "Redis"], [27017, "MongoDB"],
  [1883, "MQTT"], [21, "FTP"], [8080, "HTTP alterno"], [3389, "RDP"], [5900, "VNC"]
].map(([port, svc]) => {
  const opts = shuffle([svc, "SSH", "HTTP", "SMTP"]);
  return { question: `Puerto ${port} suele usarse para:`, options: opts, correct: opts.indexOf(svc) };
});

// Conversiones rápidas de almacenamiento
const techStorage = [];
for (let gb = 1; gb <= 10; gb += 2) {
  const mb = gb * 1024;
  const opts = shuffle([`${mb} MB`, `${mb - 128} MB`, `${mb + 256} MB`, `${gb * 1000} MB`]);
  techStorage.push({
    question: `${gb} GB equivalen a:`,
    options: opts,
    correct: opts.indexOf(`${mb} MB`)
  });
}

// Significado de comandos git frecuentes
const gitCommands = buildFromData([
  ["git clone", ["Crea copia local", "Sube cambios", "Muestra estado", "Cambia rama"], "Crea copia local"],
  ["git status", ["Muestra estado", "Compila", "Resetea HEAD", "Borra branch"], "Muestra estado"],
  ["git checkout -b", ["Crea rama nueva", "Elimina archivos", "Sube tags", "Fusiona"], "Crea rama nueva"],
  ["git merge", ["Une ramas", "Reescribe historia", "Descarga", "Inicializa repo"], "Une ramas"],
  ["git stash", ["Guarda cambios temporales", "Borra tags", "Cambia remoto", "Publica versión"], "Guarda cambios temporales"],
  ["git pull", ["Descarga y fusiona", "Sube cambios", "Borra branch", "Reinicia repo"], "Descarga y fusiona"],
  ["git tag", ["Marca versión", "Borra stash", "Reinicia rama", "Configura remoto"], "Marca versión"]
]);

const techQuestions = padTo100(
  [...techBase, ...techHttp, ...techFiles, ...techPorts, ...techStorage, ...gitCommands],
  techBase
);

// ------------------ HISTORY ------------------
const historyBase = buildFromData([
  ["¿En qué año cayó el Muro de Berlín?", ["1987", "1989", "1991", "1993"], "1989"],
  ["Civilización que construyó Machu Picchu:", ["Aztecas", "Mayas", "Incas", "Olmecas"], "Incas"],
  ["La Revolución Francesa inició en:", ["1776", "1789", "1812", "1848"], "1789"],
  ["¿Quién fue el primer emperador romano?", ["Julio César", "Augusto", "Nerón", "Trajano"], "Augusto"],
  ["La peste negra alcanzó Europa en el siglo:", ["XI", "XIV", "XVII", "XIX"], "XIV"],
  ["¿Qué barco se hundió en 1912?", ["Britannic", "Lusitania", "Titanic", "Bismarck"], "Titanic"],
  ["Independencia de México se celebra el:", ["4 julio", "16 septiembre", "20 julio", "1 mayo"], "16 septiembre"],
  ["¿Cuál guerra usó bombas atómicas?", ["Primera GM", "Segunda GM", "Guerra Fría", "Guerra de Corea"], "Segunda GM"],
  ["La ruta de la seda conectaba:", ["África y América", "Europa y Asia", "Oceanía y Asia", "América y Europa"], "Europa y Asia"],
  ["¿Quién lideró la marcha de la sal?", ["Mandela", "Gandhi", "King Jr.", "Ho Chi Minh"], "Gandhi"],
  ["¿En qué año llegó el hombre a la Luna?", ["1965", "1969", "1972", "1975"], "1969"],
  ["¿Dónde comenzó la Primera Guerra Mundial?", ["Sarajevo", "Berlín", "París", "Londres"], "Sarajevo"],
  ["¿Qué civilización inventó la escritura cuneiforme?", ["Egipcios", "Sumerios", "Fenicios", "Hititas"], "Sumerios"],
  ["¿En qué año terminó la Segunda Guerra Mundial?", ["1944", "1945", "1946", "1950"], "1945"],
  ["¿Quién escribió 'El Príncipe'?", ["Maquiavelo", "Platón", "Aristóteles", "Cicerón"], "Maquiavelo"],
  ["¿Qué revolución derrocó a Luis XVI?", ["Francesa", "Industrial", "Gloriosa", "Rusa"], "Francesa"],
  ["¿Qué guerra duró 100 años (aprox)?", ["Guerra de los 30 años", "Guerra de los 7 años", "Guerra de los 100 años", "Guerra Fría"], "Guerra de los 100 años"],
  ["¿Quién fundó el Imperio Mongol?", ["Kublai Kan", "Gengis Kan", "Tamerlán", "Atila"], "Gengis Kan"],
  ["¿Qué imperio construyó Petra?", ["Nabateo", "Egipcio", "Persa", "Romano"], "Nabateo"],
  ["¿Qué tratado terminó la I Guerra Mundial?", ["Versalles", "Tordesillas", "Brest-Litovsk", "París 1898"], "Versalles"]
]);

const independence = [
  ["Argentina", 1816], ["Brasil", 1822], ["EEUU", 1776], ["India", 1947], ["Indonesia", 1945], ["Nigeria", 1960],
  ["Chile", 1818], ["Perú", 1821], ["Colombia", 1810], ["Venezuela", 1811], ["Rep. Dominicana", 1844], ["Haití", 1804],
  ["Canadá", 1867], ["México", 1810], ["Filipinas", 1898], ["Vietnam", 1945], ["Corea del Sur", 1945], ["Ghana", 1957],
  ["Bolivia", 1825], ["Uruguay", 1825]
];
const historyIndependence = independence.map(([country, year]) => {
  const opts = shuffle([year, year + 1, year - 1, year + 10].map(String));
  return { question: `Año de independencia de ${country}:`, options: opts, correct: opts.indexOf(String(year)) };
});

const leaders = [
  ["Nelson Mandela", "Sudáfrica"],
  ["Winston Churchill", "Reino Unido"],
  ["Franklin D. Roosevelt", "EEUU"],
  ["Simón Bolívar", "Venezuela/Gran Colombia"],
  ["Mustafá Kemal Atatürk", "Turquía"],
  ["Catalina la Grande", "Rusia"],
  ["Pedro el Grande", "Rusia"],
  ["Shaka Zulu", "Reino Zulú"],
  ["Cleopatra", "Egipto"],
  ["Mahatma Gandhi", "India"],
  ["Otto von Bismarck", "Alemania"],
  ["Juana de Arco", "Francia"]
];
const historyLeaders = leaders.map(([name, place]) => {
  const opts = shuffle([place, "Francia", "España", "China"]);
  return { question: `${name} lideró principalmente en:`, options: opts, correct: opts.indexOf(place) };
});

const historyEvents = buildFromData([
  ["Caída de Constantinopla:", ["1453", "1204", "1492", "1914"], "1453"],
  ["Descubrimiento de América:", ["1492", "1501", "1521", "1600"], "1492"],
  ["Reforma protestante inicia:", ["1517", "1610", "1415", "1648"], "1517"],
  ["Firma de la Carta Magna:", ["1066", "1215", "1315", "1415"], "1215"],
  ["Conquista de Tenochtitlan:", ["1492", "1521", "1542", "1571"], "1521"],
  ["Revolución Rusa:", ["1905", "1917", "1929", "1945"], "1917"],
  ["Primer vuelo de los hermanos Wright:", ["1903", "1914", "1890", "1927"], "1903"],
  ["ENIAC se presenta:", ["1946", "1955", "1936", "1960"], "1946"],
  ["Fin de la Guerra Fría (disolución URSS):", ["1989", "1990", "1991", "1992"], "1991"],
  ["Inicio de la Guerra de Corea:", ["1945", "1950", "1955", "1960"], "1950"],
  ["Atentados 11 de septiembre:", ["1998", "2001", "2003", "2005"], "2001"],
  ["Llegada del Apolo 11 a la Luna:", ["1968", "1969", "1970", "1972"], "1969"],
  ["Inicio de la Primera Guerra Mundial:", ["1912", "1914", "1916", "1918"], "1914"],
  ["Declaración de los Derechos del Hombre y del Ciudadano:", ["1776", "1789", "1804", "1848"], "1789"],
  ["Independencia de India:", ["1939", "1945", "1947", "1950"], "1947"],
  ["Caída del Imperio Romano de Occidente:", ["395", "410", "476", "529"], "476"],
  ["Revolución Industrial (aprox inicio):", ["1650", "1700", "1760", "1820"], "1760"],
  ["Batalla de Waterloo:", ["1804", "1812", "1815", "1821"], "1815"],
  ["Guerra de los Siete Años inicia:", ["1756", "1776", "1789", "1812"], "1756"],
  ["Publicación de la Teoría de la Relatividad Especial:", ["1895", "1905", "1915", "1925"], "1905"]
]);

const historyQuestions = padTo100(
  [...historyBase, ...historyIndependence, ...historyLeaders, ...historyEvents],
  historyBase
);

// ------------------ GEOGRAPHY ------------------
const geographyBase = buildFromData([
  ["Río más largo de África:", ["Nilo", "Congo", "Níger", "Zambeze"], "Nilo"],
  ["¿Qué país tiene más husos horarios?", ["Rusia", "EEUU", "Francia", "China"], "Francia"],
  ["Capital de Canadá:", ["Toronto", "Ottawa", "Vancouver", "Montreal"], "Ottawa"],
  ["Montaña más alta fuera de Asia:", ["Aconcagua", "Kilimanjaro", "Denali", "Mont Blanc"], "Aconcagua"],
  ["¿Qué mar está casi cerrado y es muy salado?", ["Báltico", "Rojo", "Muerto", "Tasman"], "Muerto"],
  ["País con más islas registradas:", ["Indonesia", "Suecia", "Filipinas", "Canadá"], "Suecia"],
  ["Desierto más grande del mundo:", ["Sahara", "Arabia", "Antártida", "Gobi"], "Antártida"],
  ["¿En qué continente está Georgia (país)?", ["Europa", "Asia", "Ambos según definición", "Oceanía"], "Ambos según definición"],
  ["¿Qué corriente oceánica calienta Europa Occidental?", ["Humboldt", "Gulf Stream", "Kuroshio", "Canarias"], "Gulf Stream"],
  ["Ciudad grande más alta:", ["La Paz", "Quito", "Bogotá", "Lhasa"], "Lhasa"],
  ["¿Qué país tiene forma de bota?", ["España", "Grecia", "Italia", "Portugal"], "Italia"],
  ["¿Cuál océano es más profundo?", ["Pacífico", "Atlántico", "Índico", "Ártico"], "Pacífico"],
  ["Capital de Australia:", ["Sídney", "Canberra", "Melbourne", "Perth"], "Canberra"],
  ["País más pequeño por área:", ["Mónaco", "Nauru", "Tuvalu", "Vaticano"], "Vaticano"],
  ["¿Dónde está el Kilimanjaro?", ["Kenia", "Tanzania", "Etiopía", "Uganda"], "Tanzania"],
  ["¿Qué lago es de agua dulce?", ["Mar Caspio", "Mar Muerto", "Superior", "Aral"], "Superior"],
  ["¿Qué país no es transcontinental?", ["Turquía", "Rusia", "Egipto", "Tailandia"], "Tailandia"],
  ["¿Qué país tiene dos capitales oficiales?", ["Bolivia", "Chile", "Perú", "Cuba"], "Bolivia"],
  ["¿Qué río pasa por El Cairo?", ["Éufrates", "Tigris", "Nilo", "Danubio"], "Nilo"],
  ["¿Qué canal conecta Atlántico y Pacífico?", ["Suez", "Corinto", "Panamá", "Kiel"], "Panamá"]
]);

const capitals = [
  ["Brasil", "Brasilia", "Río de Janeiro", "São Paulo", "Salvador"],
  ["Egipto", "El Cairo", "Alejandría", "Giza", "Luxor"],
  ["Japón", "Tokio", "Kioto", "Osaka", "Nagoya"],
  ["Sudáfrica", "Pretoria", "Ciudad del Cabo", "Johannesburgo", "Durban"],
  ["Nigeria", "Abuya", "Lagos", "Kano", "Ibadan"],
  ["India", "Nueva Delhi", "Mumbai", "Bangalore", "Calcuta"],
  ["Arabia Saudita", "Riad", "Jeddah", "La Meca", "Medina"],
  ["Corea del Sur", "Seúl", "Busan", "Incheon", "Daegu"],
  ["España", "Madrid", "Barcelona", "Sevilla", "Valencia"],
  ["Alemania", "Berlín", "Múnich", "Hamburgo", "Fráncfort"],
  ["Italia", "Roma", "Milán", "Nápoles", "Turín"],
  ["Francia", "París", "Lyon", "Marsella", "Toulouse"],
  ["China", "Pekín", "Shanghái", "Shenzhen", "Guangzhou"],
  ["Australia", "Canberra", "Sídney", "Melbourne", "Brisbane"],
  ["Argentina", "Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
  ["Canadá", "Ottawa", "Toronto", "Vancouver", "Montreal"],
  ["Rusia", "Moscú", "San Petersburgo", "Novosibirsk", "Kazan"],
  ["Tailandia", "Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
  ["Vietnam", "Hanói", "Ho Chi Minh", "Da Nang", "Hue"],
  ["Grecia", "Atenas", "Tesalónica", "Patras", "Heraclión"]
];
const geographyCapitals = capitals.map(([country, correct, ...rest]) => {
  const opts = shuffle([correct, ...rest]);
  return { question: `Capital de ${country}:`, options: opts, correct: opts.indexOf(correct) };
});

const geoExtremes = [
  ["Punto más bajo en tierra", "Mar Muerto"],
  ["Catarata más alta", "Salto Ángel"],
  ["Isla más remota habitada", "Tristán de Acuña"],
  ["Pico más alto", "Everest"],
  ["Río más caudaloso", "Amazonas"],
  ["País más poblado", "India"],
  ["País más frío habitable", "Rusia (Siberia)"],
  ["Ciudad con más túneles de metro", "Londres"],
  ["País con más fronteras", "China"],
  ["Lago más grande", "Caspio"]
];
const geographyExtremes = geoExtremes.map(([label, answer]) => {
  const opts = shuffle([answer, "Nilo", "Sahara", "Pacífico"]);
  return { question: `${label} es:`, options: opts, correct: opts.indexOf(answer) };
});

const moreCapitals = [
  ["Noruega", "Oslo", "Bergen", "Trondheim", "Stavanger"],
  ["Suecia", "Estocolmo", "Gotemburgo", "Malmö", "Uppsala"],
  ["Finlandia", "Helsinki", "Turku", "Tampere", "Oulu"],
  ["Polonia", "Varsovia", "Cracovia", "Gdansk", "Poznan"],
  ["Países Bajos", "Ámsterdam", "Rotterdam", "La Haya", "Utrecht"],
  ["Suiza", "Berna", "Zúrich", "Ginebra", "Basilea"],
  ["Austria", "Viena", "Salzburgo", "Graz", "Linz"],
  ["Portugal", "Lisboa", "Oporto", "Braga", "Coímbra"],
  ["Hungría", "Budapest", "Debrecen", "Szeged", "Pécs"],
  ["Ucrania", "Kiev", "Leópolis", "Odesa", "Járkov"],
  ["Irlanda", "Dublín", "Cork", "Galway", "Limerick"],
  ["Bélgica", "Bruselas", "Brujas", "Amberes", "Gante"],
  ["Turquía", "Ankara", "Estambul", "Esmirna", "Bursa"],
  ["Egipto", "El Cairo", "Luxor", "Giza", "Alejandría"],
  ["Kenia", "Nairobi", "Mombasa", "Kisumu", "Nakuru"],
  ["Sudáfrica", "Pretoria", "Ciudad del Cabo", "Johannesburgo", "Durban"],
  ["Nueva Zelanda", "Wellington", "Auckland", "Christchurch", "Hamilton"],
  ["Tailandia", "Bangkok", "Chiang Mai", "Phuket", "Pattaya"],
  ["Irán", "Teherán", "Isfahán", "Shiraz", "Mashhad"],
  ["Pakistán", "Islamabad", "Karachi", "Lahore", "Peshawar"]
];
const geographyMoreCapitals = moreCapitals.map(([country, correct, ...rest]) => {
  const opts = shuffle([correct, ...rest]);
  return { question: `Capital de ${country}:`, options: opts, correct: opts.indexOf(correct) };
});

// Montañas más altas por continente
const continentPeaks = [
  ["Asia", "Everest"],
  ["Sudamérica", "Aconcagua"],
  ["Norteamérica", "Denali"],
  ["África", "Kilimanjaro"],
  ["Europa", "Elbrus"],
  ["Antártida", "Vinson"],
  ["Oceanía", "Puncak Jaya"]
];
const geographyPeaks = continentPeaks.map(([cont, peak]) => {
  const opts = shuffle([peak, "Mont Blanc", "Matterhorn", "McKinley"]);
  return { question: `Pico más alto de ${cont}:`, options: opts, correct: opts.indexOf(peak) };
});

// Hemisferios
const geographyHemispheres = buildFromData([
  ["La ciudad de Quito está en el hemisferio:", ["Norte", "Sur", "Cruzando el ecuador", "Occidental"], "Cruzando el ecuador"],
  ["Sídney se ubica en el hemisferio:", ["Norte", "Sur", "Este", "Oeste"], "Sur"],
  ["Londres se ubica en el hemisferio:", ["Norte", "Sur", "Oeste solamente", "Antártico"], "Norte"],
  ["Johannesburgo se ubica en el hemisferio:", ["Norte", "Sur", "Oeste", "Ártico"], "Sur"],
  ["Ciudad de México se ubica en el hemisferio:", ["Norte", "Sur", "Solo Oeste", "Solo Este"], "Norte"]
]);

const geographyQuestions = padTo100(
  [...geographyBase, ...geographyCapitals, ...geographyExtremes, ...geographyMoreCapitals, ...geographyPeaks, ...geographyHemispheres],
  geographyBase
);

function padTo100(list, fillers) {
  // 1) quitar duplicados por texto de pregunta
  const seen = new Set();
  const out = [];
  [...list].forEach(q => {
    if (!seen.has(q.question)) {
      seen.add(q.question);
      out.push(q);
    }
  });
  // 2) agregar fillers solo si no existen ya
  let i = 0;
  while (out.length < 100 && i < fillers.length) {
    const q = fillers[i];
    if (!seen.has(q.question)) {
      seen.add(q.question);
      out.push(q);
    }
    i++;
  }
  // 3) si aun falta, recircular fillers pero cambiando un sufijo numérico para mantener unicidad
  let suffix = 1;
  while (out.length < 100) {
    const base = fillers[(out.length + i) % fillers.length];
    const cloned = {
      ...base,
      question: `${base.question} (var ${suffix})`
    };
    if (!seen.has(cloned.question)) {
      seen.add(cloned.question);
      out.push(cloned);
    }
    suffix++;
  }
  return out.slice(0, 100); // exactamente 100 únicas por categoría
}

// ------------------ ENSAMBLE FINAL ------------------
const questionsDatabase = {
  general: generalQuestions,
  science: scienceQuestions,
  mathematics: mathQuestions,
  robotics: roboticsQuestions,
  chemistry: chemistryQuestions,
  technology: techQuestions,
  history: historyQuestions,
  geography: geographyQuestions
};

Object.keys(questionsDatabase).forEach(k => Object.freeze(questionsDatabase[k]));
Object.freeze(questionsDatabase);
