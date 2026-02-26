// Banco de preguntas STEAM Trivia
// -------------------------------------------------------------
// Cómo está organizado este archivo
// 1) Helpers: shuffle, buildFromData, uniqueQuestions
//    - shuffle(array): devuelve copia mezclada (Fisher-Yates)
//    - buildFromData([ [pregunta, opciones[], correctaLabel], ... ]):
//         crea objetos { question, options, correct } calculando el índice
//    - uniqueQuestions(lista): quita preguntas duplicadas por texto.
//
// 2) Secciones por categoría (GENERAL, SCIENCE, MATHEMATICS, ROBOTICS,
//    CHEMISTRY, TECHNOLOGY, HISTORY, GEOGRAPHY)
//    Cada sección define:
//       - una base curada (buildFromData)
//       - grupos adicionales generados (listas mapeadas o for)
//       - se combinan y se deduplican
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

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeOptionKey(value) {
  return normalizeText(value).toLowerCase();
}

function normalizeQuestionKey(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/([!?¿¡])\1+/g, "$1");
}

function buildFromData(data) {
  if (!Array.isArray(data)) {
    throw new Error("[buildFromData] data debe ser un array.");
  }

  return data.map((entry, index) => {
    if (!Array.isArray(entry) || entry.length !== 3) {
      throw new Error(`[buildFromData] entrada inválida en índice ${index}.`);
    }

    const [q, opts, correctLabel] = entry;
    const question = normalizeText(q);
    const optionsOriginal = Array.isArray(opts) ? opts.map(normalizeText) : null;
    const correct = normalizeText(correctLabel);

    if (!question) {
      throw new Error(`[buildFromData] pregunta vacía en índice ${index}.`);
    }
    if (!Array.isArray(optionsOriginal) || optionsOriginal.length !== 4) {
      throw new Error(`[buildFromData] "${question}" debe tener exactamente 4 opciones.`);
    }
    if (optionsOriginal.some(opt => !opt)) {
      throw new Error(`[buildFromData] "${question}" tiene opciones vacías.`);
    }

    const normalizedOptions = optionsOriginal.map(normalizeOptionKey);
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      throw new Error(`[buildFromData] "${question}" tiene opciones duplicadas: ${JSON.stringify(optionsOriginal)}.`);
    }

    // Debe existir exactamente en las opciones originales (tras trim).
    if (!optionsOriginal.includes(correct)) {
      throw new Error(
        `[buildFromData] correctLabel no existe en options. question="${question}", correctLabel="${correct}", options=${JSON.stringify(optionsOriginal)}`
      );
    }

    const optsShuffled = shuffle(optionsOriginal);
    const correctIndex = optsShuffled.indexOf(correct);
    if (correctIndex === -1) {
      throw new Error(
        `[buildFromData] indexOf falló tras shuffle. question="${question}", correctLabel="${correct}", options=${JSON.stringify(optionsOriginal)}`
      );
    }

    return { question, options: optsShuffled, correct: correctIndex };
  });
}

function buildQuestion(question, options, correctLabel) {
  return buildFromData([[question, options, correctLabel]])[0];
}

// Deduplica manteniendo el primer elemento con el mismo texto normalizado de pregunta.
function uniqueQuestions(list) {
  const seen = new Set();
  const out = [];
  for (const q of list) {
    const key = normalizeQuestionKey(q.question);
    if (!seen.has(key)) {
      seen.add(key);
      out.push(q);
    }
  }
  return out;
}

function validateQuestionsDatabase(db, { log = false } = {}) {
  const summary = {};
  const errors = [];

  for (const [category, questions] of Object.entries(db || {})) {
    if (!Array.isArray(questions)) {
      errors.push({ category, index: -1, type: "category_not_array", value: questions });
      continue;
    }

    let invalidCorrect = 0;
    let duplicateOptions = 0;
    let invalidOptions = 0;
    let invalidQuestion = 0;
    const questionBuckets = new Map();

    questions.forEach((q, index) => {
      const question = normalizeText(q?.question);
      const options = Array.isArray(q?.options) ? q.options : null;
      const correct = q?.correct;
      const key = normalizeQuestionKey(question);

      if (!question) {
        invalidQuestion++;
        errors.push({ category, index, type: "empty_question", question: q?.question });
      }

      if (!questionBuckets.has(key)) questionBuckets.set(key, []);
      questionBuckets.get(key).push({ index, question: q?.question });

      if (!options || options.length !== 4) {
        invalidOptions++;
        errors.push({ category, index, type: "invalid_options_length", length: options ? options.length : null, question });
      } else {
        const invalidValues = options.some(opt => typeof opt !== "string" || !normalizeText(opt));
        if (invalidValues) {
          invalidOptions++;
          errors.push({ category, index, type: "invalid_option_value", options, question });
        }

        const optionKeys = options.map(normalizeOptionKey);
        if (new Set(optionKeys).size !== optionKeys.length) {
          duplicateOptions++;
          errors.push({ category, index, type: "duplicate_options", options, question });
        }
      }

      if (!Number.isInteger(correct) || correct < 0 || correct > 3) {
        invalidCorrect++;
        errors.push({ category, index, type: "invalid_correct_index", correct, question });
      }
    });

    const top10DuplicateQuestions = [...questionBuckets.entries()]
      .filter(([, list]) => list.length > 1)
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
      .slice(0, 10)
      .map(([normalized, list]) => ({ normalized, count: list.length, examples: list.slice(0, 3) }));

    summary[category] = {
      total: questions.length,
      invalidCorrect,
      duplicateOptions,
      invalidOptions,
      invalidQuestion,
      top10DuplicateQuestions
    };
  }

  if (log) {
    console.log("[questions-data] Validation summary:");
    console.log(JSON.stringify(summary, null, 2));
    if (errors.length > 0) {
      console.log("[questions-data] Sample errors:");
      console.log(JSON.stringify(errors.slice(0, 25), null, 2));
    }
  }

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    summary,
    errors
  };
}


function normalizeLooseTextKey(value) {
  const text = normalizeText(value).toLowerCase();
  if (!text) return "";
  const noDiacritics = typeof text.normalize === "function"
    ? text.normalize("NFD").replace(/[̀-ͯ]/g, "")
    : text;
  return noDiacritics
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(value) {
  const text = normalizeText(value);
  return text ? text.split(/\s+/).length : 0;
}

function validateQuestionsDatabaseExtended(db, config = {}) {
  const merged = {
    maxQuestionLines: 2,
    maxOptionWords: 5,
    maxOptionChars: 26,
    bannedOptionPhrases: [
      "todas las anteriores",
      "todos los anteriores",
      "ninguna de las anteriores",
      "ninguno de los anteriores",
      "all of the above",
      "none of the above"
    ],
    log: false,
    ...config
  };

  const bannedOptionSet = new Set(
    (Array.isArray(merged.bannedOptionPhrases) ? merged.bannedOptionPhrases : [])
      .map(normalizeLooseTextKey)
      .filter(Boolean)
  );

  const summary = {};
  const errors = [];

  const bannedOptionRegexes = [
    /^(todas?|todos?)\s+las?\s+(anteriores|opciones?|respuestas?)$/,
    /^(ningunas?|ningunos?)\s+(de\s+)?las?\s+(anteriores|opciones?|respuestas?)$/,
    /^all\s+of\s+the\s+(above|options?)$/,
    /^none\s+of\s+the\s+(above|options?)$/
  ];

  for (const [category, questions] of Object.entries(db || {})) {
    if (!Array.isArray(questions)) {
      errors.push({ category, index: -1, type: "category_not_array", value: questions });
      continue;
    }

    let tooManyQuestionLines = 0;
    let bannedOptions = 0;
    let optionTooLong = 0;

    questions.forEach((q, index) => {
      const question = normalizeText(q?.question);
      const questionLines = question ? question.split(/\r?\n/).length : 0;
      if (question && questionLines > merged.maxQuestionLines) {
        tooManyQuestionLines++;
        errors.push({
          category,
          index,
          type: "question_too_many_lines",
          maxQuestionLines: merged.maxQuestionLines,
          lineCount: questionLines,
          question
        });
      }

      const options = Array.isArray(q?.options) ? q.options : [];
      options.forEach((option, optionIndex) => {
        const optionText = normalizeText(option);
        const optionKey = normalizeLooseTextKey(optionText);

        const isBanned =
          bannedOptionSet.has(optionKey) ||
          bannedOptionRegexes.some(regex => regex.test(optionKey));

        if (isBanned) {
          bannedOptions++;
          errors.push({
            category,
            index,
            optionIndex,
            type: "banned_option",
            option: optionText,
            question
          });
        }

        const wordCount = countWords(optionText);
        const charCount = optionText.length;
        const exceedsWords = wordCount > merged.maxOptionWords;
        const exceedsChars = charCount > merged.maxOptionChars;

        // Se invalida solo cuando excede ambas restricciones.
        if (exceedsWords && exceedsChars) {
          optionTooLong++;
          errors.push({
            category,
            index,
            optionIndex,
            type: "option_too_long",
            option: optionText,
            wordCount,
            charCount,
            maxOptionWords: merged.maxOptionWords,
            maxOptionChars: merged.maxOptionChars,
            question
          });
        }
      });
    });

    summary[category] = {
      total: questions.length,
      tooManyQuestionLines,
      bannedOptions,
      optionTooLong
    };
  }

  if (merged.log) {
    console.log("[questions-data] Extended validation summary:");
    console.log(JSON.stringify(summary, null, 2));
    if (errors.length > 0) {
      console.log("[questions-data] Extended validation sample errors:");
      console.log(JSON.stringify(errors.slice(0, 25), null, 2));
    }
  }

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    summary,
    errors,
    config: {
      maxQuestionLines: merged.maxQuestionLines,
      maxOptionWords: merged.maxOptionWords,
      maxOptionChars: merged.maxOptionChars
    }
  };
}

// ------------------ GENERAL ------------------
const generalBase = buildFromData([
  ["¿Cuál de estos países NO tiene costa?", ["Bolivia", "Perú", "Ecuador", "Chile"], "Bolivia"],
  ["Si en Nueva York son las 12:00 (UTC-5), ¿qué hora es en Londres (UTC+0)?", ["3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"], "5:00 PM"],
  ["¿Qué idioma es oficial en más países?", ["Árabe", "Francés", "Inglés", "Español"], "Inglés"],
  ["¿Qué objeto pesa más? (mismo volumen)", ["1L de agua", "1L de mercurio", "1L de aceite", "1L de aire"], "1L de mercurio"],
  ["¿Cuál invento se comercializó primero?", ["Teléfono", "Bombilla incandescente", "Automóvil de gasolina", "Radio"], "Teléfono"],
  ["Un año bisiesto es divisible por 4, excepto si…", ["Es primo", "Termina en 00", "Divisible por 100, no 400", "Cae en domingo"], "Divisible por 100, no 400"],
  ["¿Qué ciudad queda más al norte?", ["Beijing", "Roma", "Nueva York", "Madrid"], "Roma"],
  ["¿Cuántas estrellas tiene la bandera de la Unión Europea?", ["10", "12", "15", "27"], "12"],
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
  ["¿Cuál de estos países es una ciudad-estado?", ["Noruega", "Suiza", "Qatar", "Singapur"], "Singapur"],
  ["¿Cuál lago es más profundo?", ["Baikal", "Tanganica", "Superior", "Victoria"], "Baikal"],
  ["¿Qué desierto es más grande?", ["Sahara", "Arábigo", "Gobi", "Kalahari"], "Sahara"],
  ["¿Cuál mar es más salado?", ["Muerto", "Rojo", "Caspio", "Báltico"], "Muerto"],
  ["¿Qué país tiene la línea costera más larga del mundo?", ["Canadá", "Rusia", "Indonesia", "Australia"], "Canadá"],
  ["¿Cuál montaña es más alta fuera de Asia?", ["Aconcagua", "Kilimanjaro", "Denali", "Mont Blanc"], "Aconcagua"],
  ["¿Qué río tiene mayor caudal promedio?", ["Nilo", "Amazonas", "Yangtsé", "Misisipi"], "Amazonas"],
  ["¿Qué ciudad es la capital de Japón?", ["Tokio", "Delhi", "São Paulo", "Shanghái"], "Tokio"],
  ["¿Cuál continente tiene más países?", ["África", "Europa", "Asia", "América"], "África"],
  ["¿Qué isla es más grande?", ["Groenlandia", "Nueva Guinea", "Borneo", "Madagascar"], "Groenlandia"],
  ["¿Cuál país produce más café?", ["Brasil", "Colombia", "Vietnam", "Etiopía"], "Brasil"],
  ["¿Qué país tiene como capital a Berna?", ["Suiza", "Bélgica", "Alemania", "Reino Unido"], "Suiza"],
  ["¿En qué ciudad está la Acrópolis?", ["Jerusalén", "Atenas", "Roma", "Estambul"], "Atenas"],
  ["¿Cuál es más ancho?", ["Canal de Panamá", "Canal de Suez", "Canal de Corinto", "Canal de Kiel"], "Canal de Suez"],
  ["¿Dónde llueve más al año?", ["Cherrapunji", "Londres", "Seattle", "Bogotá"], "Cherrapunji"],
  ["¿Qué capital está más cerca del ecuador?", ["Quito", "Nairobi", "Brasilia", "Yakarta"], "Quito"],
  ["¿Cuál país tiene más volcanes activos?", ["Indonesia", "Japón", "Chile", "EEUU"], "Indonesia"],
  ["¿Cuál país tiene mayor densidad de población?", ["India", "Bangladés", "Japón", "Corea del Sur"], "Bangladés"],
  ["¿Qué océano es más cálido en promedio?", ["Índico", "Atlántico", "Pacífico", "Ártico"], "Índico"],
  ["¿Qué ciudad está más al sur?", ["Ushuaia", "Punta Arenas", "Christchurch", "Hobart"], "Ushuaia"]
]);

const generalExtra = buildFromData([
  ["¿Qué idioma tiene más hablantes nativos?", ["Mandarín", "Inglés", "Español", "Hindi"], "Mandarín"],
  ["¿Qué continente no tiene reptiles nativos?", ["Antártida", "Europa", "Asia", "Oceanía"], "Antártida"],
  ["¿Cuál es el metal más abundante en la corteza terrestre?", ["Aluminio", "Hierro", "Cobre", "Calcio"], "Aluminio"],
  ["¿En qué país se originaron los Juegos Olímpicos antiguos?", ["Grecia", "Italia", "Egipto", "Persia"], "Grecia"],
  ["¿Cuántos minutos hay en 3 horas?", ["120", "150", "180", "210"], "180"],
  ["¿Qué planeta tiene el día más largo?", ["Venus", "Mercurio", "Tierra", "Marte"], "Venus"],
  ["¿Quién escribió “Cien años de soledad”?", ["Gabriel García Márquez", "Mario Vargas Llosa", "Julio Cortázar", "Jorge Luis Borges"], "Gabriel García Márquez"],
  ["¿Cuál es el mamífero más grande?", ["Ballena azul", "Elefante africano", "Cachalote", "Hipopótamo"], "Ballena azul"],
  ["¿Qué océano baña la costa este de Estados Unidos?", ["Atlántico", "Pacífico", "Índico", "Ártico"], "Atlántico"],
  ["¿Cuál es la moneda oficial de Japón?", ["Yen", "Won", "Yuan", "Ringgit"], "Yen"],
  ["¿Cuál es la montaña más alta de África?", ["Kilimanjaro", "Atlas", "Monte Kenia", "Ruwenzori"], "Kilimanjaro"],
  ["¿Cuál es el río más largo de Sudamérica?", ["Amazonas", "Paraná", "Orinoco", "Magdalena"], "Amazonas"],
  ["¿Quién pintó la Mona Lisa?", ["Leonardo da Vinci", "Miguel Ángel", "Rafael", "Botticelli"], "Leonardo da Vinci"],
  ["¿Qué animal es símbolo de Australia?", ["Canguro", "Koala", "Emú", "Demonio de Tasmania"], "Canguro"],
  ["¿Cuántos jugadores hay por equipo en fútbol once?", ["11", "7", "9", "10"], "11"],
  ["¿Qué gas respiramos principalmente?", ["Nitrógeno", "Oxígeno", "Argón", "CO2"], "Nitrógeno"],
  ["¿Cuál es el único metal líquido a temperatura ambiente?", ["Mercurio", "Sodio", "Galio", "Cesio"], "Mercurio"],
  ["¿Qué ciencia estudia los fósiles?", ["Paleontología", "Geología", "Arqueología", "Antropología"], "Paleontología"],
  ["¿Qué país es conocido por el Canal de Panamá?", ["Panamá", "Colombia", "Costa Rica", "México"], "Panamá"],
  ["¿Qué ciudad se conoce como “La Gran Manzana”?", ["Nueva York", "Londres", "Tokio", "Los Ángeles"], "Nueva York"],
  ["¿Qué instrumento mide la temperatura?", ["Termómetro", "Barómetro", "Anemómetro", "Higrómetro"], "Termómetro"],
  ["¿Qué deporte practica Lionel Messi?", ["Fútbol", "Baloncesto", "Tenis", "Béisbol"], "Fútbol"],
  ["¿Cuál es el hueso más largo del cuerpo humano?", ["Fémur", "Húmero", "Tibia", "Radio"], "Fémur"],
  ["¿En qué ciudad está el Big Ben?", ["Londres", "París", "Berlín", "Roma"], "Londres"],
  ["¿Cuántos lados tiene un hexágono?", ["6", "5", "7", "8"], "6"],
  ["¿Qué tipo de animal es una orca?", ["Mamífero", "Pez", "Reptil", "Ave"], "Mamífero"],
  ["¿Cuál es la capital de Islandia?", ["Reikiavik", "Oslo", "Helsinki", "Estocolmo"], "Reikiavik"],
  ["¿En qué país está Machu Picchu?", ["Perú", "Bolivia", "México", "Guatemala"], "Perú"],
  ["¿Qué vitamina ayuda a la visión?", ["Vitamina A", "Vitamina C", "Vitamina B12", "Vitamina K"], "Vitamina A"],
  ["¿Quién escribió “Don Quijote de la Mancha”?", ["Miguel de Cervantes", "Lope de Vega", "Francisco de Quevedo", "Luis de Góngora"], "Miguel de Cervantes"],
  ["¿Qué gas hace burbujas en la gaseosa?", ["CO2", "O2", "N2", "H2"], "CO2"],
  ["¿Cuál país es famoso por el tango?", ["Argentina", "España", "Brasil", "México"], "Argentina"],
  ["¿En qué continente está Bután?", ["Asia", "África", "Europa", "Oceanía"], "Asia"],
  ["¿Qué órgano bombea la sangre?", ["Corazón", "Pulmón", "Riñón", "Hígado"], "Corazón"],
  ["¿Qué se mide en decibelios?", ["Sonido", "Temperatura", "Luz", "Masa"], "Sonido"],
  ["¿Cuál es el metal precioso más blando?", ["Oro", "Plata", "Platino", "Paladio"], "Oro"],
  ["¿Qué planeta es famoso por sus anillos?", ["Saturno", "Júpiter", "Urano", "Neptuno"], "Saturno"],
  ["¿Cuál es la capital de Noruega?", ["Oslo", "Bergen", "Stavanger", "Trondheim"], "Oslo"],
  ["¿Qué país inventó el sushi?", ["Japón", "Corea del Sur", "China", "Tailandia"], "Japón"],
  ["¿Cuál es el animal terrestre más rápido?", ["Guepardo", "León", "Antílope", "Lince"], "Guepardo"],
  ["¿Cuántos colores tiene un arcoíris tradicional?", ["7", "6", "8", "9"], "7"],
  ["¿Qué instrumento se usa para medir la presión atmosférica?", ["Barómetro", "Manómetro", "Altímetro", "Termómetro"], "Barómetro"],
  ["¿Qué instrumento musical se toca con arco?", ["Violín", "Piano", "Flauta", "Saxofón"], "Violín"],
  ["¿Qué país es famoso por sus tulipanes?", ["Países Bajos", "Bélgica", "Dinamarca", "Polonia"], "Países Bajos"],
  ["¿Qué ave es símbolo de Estados Unidos?", ["Águila calva", "Cóndor andino", "Halcón peregrino", "Pelícano pardo"], "Águila calva"]
]);

const generalExtra2 = buildFromData([
  ["¿Qué instrumento mide el tiempo?", ["Reloj", "Balanza", "Termómetro", "Barómetro"], "Reloj"],
  ["¿Qué país superó a China como el más poblado en 2023?", ["India", "China", "EEUU", "Indonesia"], "India"],
  ["¿Cuál es la capital de Tailandia?", ["Bangkok", "Hanoi", "Phnom Penh", "Vientián"], "Bangkok"],
  ["Animal símbolo de Canadá:", ["Castor", "Lobo", "Águila", "Búfalo"], "Castor"],
  ["¿En qué continente está el Sahara?", ["África", "Asia", "Oceanía", "Europa"], "África"],
  ["Idioma oficial de Brasil:", ["Portugués", "Español", "Inglés", "Francés"], "Portugués"],
  ["Bebida tradicional de Japón:", ["Sake", "Vodka", "Whisky", "Tequila"], "Sake"],
  ["La torre CN está en:", ["Toronto", "Chicago", "París", "Dubái"], "Toronto"],
  ["¿Qué planeta es conocido como el rojo?", ["Marte", "Júpiter", "Saturno", "Mercurio"], "Marte"],
  ["¿Qué deporte usa bate y bases?", ["Béisbol", "Críquet", "Hockey", "Rugby"], "Béisbol"]
]);

const generalQuestions = uniqueQuestions([...generalBase, ...generalComparisons, ...generalExtra, ...generalExtra2]);

// ------------------ SCIENCE ------------------
const scienceBase = buildFromData([
  ["¿Qué partícula tiene carga negativa?", ["Protón", "Electrón", "Neutrón", "Bosón W"], "Electrón"],
  ["¿Qué planeta rota 'al revés' respecto a la mayoría?", ["Venus", "Marte", "Júpiter", "Mercurio"], "Venus"],
  ["Donde se encuentra ADN en celulas eucariotas?", ["Nucleo y mitocondrias", "Solo nucleo", "Solo ribosomas", "Solo membrana celular"], "Nucleo y mitocondrias"],
  ["Unidad SI de presión:", ["Bar", "Atm", "Pascal", "Torr"], "Pascal"],
  ["¿Qué detecta LIGO?", ["Materia oscura", "Ondas gravitacionales", "Rayos gamma", "Neutrinos"], "Ondas gravitacionales"],
  ["¿Qué variable permanece constante en un proceso isocórico?", ["Volumen", "Presión", "Temperatura", "Moles"], "Volumen"],
  ["Velocidad de la luz en vacío aprox:", ["3e5 km/s", "3e6 km/s", "3e7 m/s", "3e5 m/s"], "3e5 km/s"],
  ["¿Quién predijo los agujeros negros con relatividad general?", ["Newton", "Einstein", "Hawking", "Chandrasekhar"], "Einstein"],
  ["¿Cuál es la partícula portadora de la fuerza fuerte?", ["Fotón", "Gluón", "Bosón Z", "Gravitón"], "Gluón"],
  ["pH 3 es:", ["Neutro", "Ácido fuerte", "Ácido débil", "Básico"], "Ácido débil"],
  ["¿Qué gas es más abundante en la atmósfera terrestre?", ["Oxígeno", "Nitrógeno", "CO2", "Argón"], "Nitrógeno"],
  ["El flujo de la linfa depende principalmente de:", ["Corazón", "Pulmones", "Músculos esqueléticos", "Hígado"], "Músculos esqueléticos"],
  ["Energía de un fotón depende de:", ["Amplitud", "Frecuencia", "Fase", "Polarización"], "Frecuencia"],
  ["¿Qué capa protege de rayos UV?", ["Troposfera", "Estratosfera (ozono)", "Mesosfera", "Ionosfera"], "Estratosfera (ozono)"],
  ["¿Qué unidad mide energía?", ["Watt", "Joule", "Volt", "Ohm"], "Joule"],
  ["¿Qué tipo de onda es la luz?", ["Transversal", "Longitudinal", "Ambas", "No es onda"], "Transversal"],
  ["¿Qué organismo no es célula?", ["Virus", "Bacteria", "Hongo", "Protozoo"], "Virus"],
  ["¿Qué vitamina sintetiza la piel con sol?", ["A", "B12", "C", "D"], "D"],
  ["¿Qué metal es líquido a 25°C?", ["Mercurio", "Cesio", "Galio", "Bromo"], "Mercurio"],
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
  const distractors = [];
  for (const candidate of [z - 1, z + 1, z + 2, z - 2, z + 3, z + 4]) {
    const bounded = Math.max(1, candidate);
    if (bounded !== z && !distractors.includes(bounded)) {
      distractors.push(bounded);
    }
    if (distractors.length === 3) break;
  }
  const opts = [String(z), ...distractors.map(String)];
  return buildQuestion(`Número atómico de ${name}:`, opts, String(z));
});

const scienceTemps = [
  ["Agua hierve (1 atm)", 100],
  ["Agua se congela", 0],
  ["Cero absoluto", -273],
  ["Cuerpo humano", 37]
].map(([label, val]) => {
  const opts = [`${val}°C`, `${val + 5}°C`, `${val - 5}°C`, `${val + 10}°C`];
  return buildQuestion(`${label} ≈`, opts, `${val}°C`);
});

// Prefijos métricos
const sciencePrefixes = [
  ["kilo", 3], ["mega", 6], ["giga", 9], ["tera", 12],
  ["mili", -3], ["micro", -6], ["nano", -9], ["pico", -12],
  ["centi", -2], ["deci", -1]
].map(([name, exp]) => {
  const opts = [exp, exp + 1, exp - 1, exp + 3].map(e => `10^${e}`);
  return buildQuestion(`Prefijo ${name} corresponde a:`, opts, `10^${exp}`);
});

// Conversión Cº a Fº
const scienceConversions = [];
for (let c = -40; c <= 90; c += 10) {
  const f = Math.round(c * 9 / 5 + 32);
  const opts = [f, f + 5, f - 5, f + 10].map(v => `${v}°F`);
  scienceConversions.push(buildQuestion(`¿A cuántos °F equivale ${c}°C (aprox)?`, opts, `${f}°F`));
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
  ["Planeta con anillos más visibles", ["Saturno", "Júpiter", "Urano", "Neptuno"], "Saturno"],
  ["Valor de 1 atm en kPa", ["101.3", "1", "14.7", "120"], "101.3"],
  ["Unidad SI de energía", ["Joule", "Watt", "Newton", "Pascal"], "Joule"],
  ["Carga del electrón (signo)", ["Negativa", "Positiva", "Nula", "Depende"], "Negativa"],
  ["Espectro visible aproximadamente va de", ["400-700 nm", "200-400 nm", "700-1200 nm", "1-10 mm"], "400-700 nm"],
  ["Constante de Avogadro ≈", ["6.02e23", "3.14e8", "9.81", "1.60e-19"], "6.02e23"]
]);

const scienceExtra = buildFromData([
  ["Grupo sanguíneo universal donante:", ["AB+", "O-", "A", "B"], "O-"],
  ["Hormona que regula el metabolismo:", ["Tiroxina", "Insulina", "Adrenalina", "Progesterona"], "Tiroxina"],
  ["¿Qué órgano produce bilis?", ["Hígado", "Riñón", "Páncreas", "Pulmón"], "Hígado"]
]);

const scienceQuestions = uniqueQuestions([
  ...scienceBase,
  ...scienceElements,
  ...scienceTemps,
  ...sciencePrefixes,
  ...scienceConversions,
  ...scienceBody,
  ...sciencePhysics,
  ...scienceExtra
]);

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

const mathExtra = buildFromData([
  ["¿Cuál es la derivada de x^2?", ["2x", "x", "x^2", "0"], "2x"],
  ["Integral de cos(x):", ["sin(x)+C", "-sin(x)+C", "cos(x)+C", "tan(x)+C"], "sin(x)+C"],
  ["0/5 es:", ["0", "Indefinido", "5", "1"], "0"],
  ["5/0 es:", ["Indefinido", "5", "0", "1"], "Indefinido"],
  ["Raíz cuadrada de 144:", ["10", "11", "12", "13"], "12"],
  ["Área de un triángulo base 6 altura 4:", ["10", "12", "14", "18"], "12"],
  ["Perímetro de un cuadrado lado 5:", ["15", "20", "25", "30"], "20"],
  ["Volumen de un cubo arista 3:", ["9", "18", "27", "36"], "27"],
  ["Media aritmética de 2,4,6:", ["3", "4", "5", "6"], "4"],
  ["Mediana de 1,3,7,9,11:", ["5", "7", "9", "11"], "7"],
  ["Modo de 1,1,2,3:", ["1", "2", "3", "Ninguno"], "1"],
  ["0.75 en fracción:", ["1/4", "1/3", "3/4", "4/3"], "3/4"],
  ["50 es el ___% de 200:", ["10", "20", "25", "50"], "25"],
  ["Un ángulo recto mide:", ["45°", "60°", "90°", "120°"], "90°"],
  ["Suma de ángulos de un triángulo plano:", ["90°", "120°", "180°", "270°"], "180°"],
  ["π radianes equivalen a:", ["90°", "180°", "270°", "360°"], "180°"],
  ["f(x)=x^3, f'(2) =", ["6", "8", "12", "18"], "12"],
  ["Determinante de [[1,2],[3,4]]:", ["-2", "2", "5", "0"], "-2"],
  ["log_e(e) =", ["0", "1", "e", "10"], "1"],
  ["x^2 - 9 = 0 tiene raíces:", ["±2", "±3", "±4", "±5"], "±3"],
  ["Inversa multiplicativa de 5:", ["1/5", "5", "0", "10"], "1/5"],
  ["PA con a1=2, d=3, a4 =", ["8", "9", "11", "14"], "11"],
  ["Número de diagonales de un pentágono:", ["3", "4", "5", "6"], "5"],
  ["Combinaciones C(5,2):", ["5", "8", "10", "12"], "10"],
  ["Permutaciones de 4 objetos:", ["12", "16", "20", "24"], "24"],
  ["Probabilidad de sacar un as (baraja 52):", ["1/4", "1/13", "1/26", "1/52"], "1/13"],
  ["Valor absoluto de -7:", ["-7", "0", "7", "14"], "7"],
  ["Sistema 2x+y=5 y x-y=1, x =", ["1", "2", "3", "4"], "2"],
  ["Recta con pendiente 2 que pasa por (0,3):", ["y=2x+3", "y=2x-3", "y=3x+2", "y=3x-2"], "y=2x+3"],
  ["Hipotenusa de triángulo 3-4-?:", ["4", "5", "6", "7"], "5"],
  ["Longitud circunferencia r=10:", ["10π", "15π", "20π", "25π"], "20π"],
  ["tan(45°) =", ["0", "1", "√3/2", "∞"], "1"],
  ["sin(30°) =", ["0.5", "√3/2", "1", "0"], "0.5"],
  ["cos(60°) =", ["0.5", "0.75", "1", "0"], "0.5"],
  ["¿Qué es el producto escalar de vectores perpendiculares?", ["0", "1", "-1", "Igual a su módulo"], "0"],
  ["Límite (1+1/n)^n cuando n→∞:", ["e", "1", "0", "∞"], "e"],
  ["MCD de 28 y 35:", ["7", "14", "21", "28"], "7"],
  ["MCM de 6 y 8:", ["12", "18", "20", "24"], "24"],
  ["2^10 =", ["256", "512", "1024", "2048"], "1024"],
  ["log2(32) =", ["3", "4", "5", "6"], "5"],
  ["Un polígono con suma de ángulos 720° tiene lados:", ["4", "5", "6", "7"], "6"],
  ["Si la derivada es cero en un intervalo, la función es:", ["Constante", "Lineal", "Cuadrática", "Exponencial"], "Constante"],
  ["Probabilidad de sacar 3 en un dado justo:", ["1/2", "1/3", "1/4", "1/6"], "1/6"],
  ["Número áureo aproximado:", ["1.41", "1.61", "1.73", "2.71"], "1.61"],
  ["Distancia entre (0,0) y (3,4):", ["4", "5", "6", "7"], "5"],
  ["Suma de primeros n naturales es:", ["n(n+1)/2", "n^2", "n/2", "2n"], "n(n+1)/2"],
  ["Ángulo llano mide:", ["90°", "120°", "180°", "360°"], "180°"],
  ["Vértices de un dodecaedro:", ["12", "16", "20", "24"], "20"],
  ["Eventos mutuamente excluyentes tienen probabilidad conjunta:", ["0", "1", "0.5", "Depende"], "0"],
  ["0.999... equivale a:", ["Menos que 1", "Igual a 1", "Mayor que 1", "No se sabe"], "Igual a 1"],
  ["Un número irracional es:", ["No expresable como fracción exacta", "Número negativo", "Número par", "Número complejo"], "No expresable como fracción exacta"],
  ["Si varianza = 0, entonces los datos son:", ["Todos iguales", "Todos distintos", "Aleatorios", "Simétricos"], "Todos iguales"],
  ["Integral de 0 a 1 de 1 dx =", ["0", "0.5", "1", "2"], "1"]
]);

const mathExtra2 = buildFromData([
  ["Número primo más pequeño:", ["2", "1", "3", "5"], "2"],
  ["7 × 8 =", ["54", "56", "58", "60"], "56"],
  ["9 × 9 =", ["72", "81", "90", "99"], "81"],
  ["(a - b)^2 =", ["a^2 - 2ab + b^2", "a^2 + 2ab + b^2", "a^2 - b^2", "2a^2 - b^2"], "a^2 - 2ab + b^2"],
  ["Inversa aditiva de 7:", ["-7", "1/7", "7", "0"], "-7"],
  ["Un millar equivale a:", ["100", "1000", "10000", "500"], "1000"],
  ["2/3 + 1/3 =", ["1/3", "2/3", "1", "4/3"], "1"],
  ["La mitad de 1/4 es:", ["1/8", "1/4", "1/2", "1/16"], "1/8"],
  ["3^0 =", ["0", "1", "3", "9"], "1"],
  ["Base del logaritmo natural:", ["e", "10", "2", "π"], "e"],
  ["5^3 =", ["25", "75", "100", "125"], "125"],
  ["100% de 50 es:", ["25", "50", "75", "100"], "50"],
  ["Derivada de ln(x):", ["1/x", "x", "ln(x)", "0"], "1/x"],
  ["Un decágono tiene lados:", ["8", "9", "10", "12"], "10"],
  ["Área de un rectángulo 5x7:", ["30", "32", "35", "40"], "35"],
  ["Perímetro triángulo equilátero lado 4:", ["8", "10", "12", "14"], "12"],
  ["Media geométrica de 4 y 9:", ["5", "6", "6.5", "7"], "6"],
  ["1 rad ≈", ["34°", "57°", "90°", "180°"], "57°"],
  ["sin(90°) =", ["0", "0.5", "1", "√3/2"], "1"],
  ["cos(0°) =", ["0", "0.5", "1", "-1"], "1"],
  ["C(4,1) =", ["1", "2", "3", "4"], "4"],
  ["3x = 12, x =", ["2", "3", "4", "5"], "4"],
  ["Una matriz con determinante 0 es:", ["Singular", "Inversa", "Ortogonal", "Diagonal"], "Singular"],
  ["log10(1) =", ["-1", "0", "1", "10"], "0"],
  ["Diagonal de un cuadrado lado 1:", ["1", "√2", "2", "0.5"], "√2"],
  ["Pendiente de recta vertical:", ["Indefinida", "0", "1", "-1"], "Indefinida"],
  ["Segundos en una hora:", ["600", "1800", "3600", "5400"], "3600"]
]);

const mathQuestions = uniqueQuestions([...mathBase, ...mathExtra, ...mathExtra2]);

// ------------------ ROBOTICS ------------------
const roboticsBase = buildFromData([
  ["En un robot móvil, SLAM significa:", ["Simultaneous Localization and Mapping", "Single Loop Actuator Motor", "Serial Link Axis Model", "Servo Localization and Movement"], "Simultaneous Localization and Mapping"],
  ["¿Qué sensor da orientación absoluta?", ["Encoder", "IMU con magnetómetro", "Ultrasonido", "IR"], "IMU con magnetómetro"],
  ["PID: la parte D actúa sobre:", ["Error acumulado", "Error instantáneo", "Derivada del error", "Salida"], "Derivada del error"],
  ["ROS usa como transporte por defecto:", ["HTTP", "TCP/UDP", "MQTT", "CoAP"], "TCP/UDP"],
  ["¿Qué es rosbag?", ["Simulador 3D", "Formato de log de mensajes", "Librería de control", "Planificador"], "Formato de log de mensajes"],
  ["Cinemática directa calcula:", ["Par de motores", "Pose a partir de articulaciones", "Articulaciones desde pose", "Voltaje máximo"], "Pose a partir de articulaciones"],
  ["�Qu� pasa si saturas PID sin anti-windup?", ["Vibra", "Se resetea", "Se sobreintegra y tarda", "Nada"], "Se sobreintegra y tarda"],
  ["Robot diferencial: girar sobre su eje requiere:", ["Ambas ruedas adelante", "Ruedas en sentidos opuestos", "Frenar ambas", "Solo acelerar derecha"], "Ruedas en sentidos opuestos"],
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
  const opts = [role, "Gateway IoT", "PLC industrial", "Sensor IMU"];
  return buildQuestion(`${name} se usa principalmente como:`, opts, role);
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
  const opts = [trait, "Solo torque alto", "Solo baja tensión", "Solo binario on/off"];
  return buildQuestion(`${m}: característica clave`, opts, trait);
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
  const opts = [count, count - 4, count + 4, count + 10].map(String);
  return buildQuestion(`Pines GPIO aproximados en ${board}:`, opts, String(count));
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
  const voltagePool = ["1.8V", "3.3V", "5V", "12V", "24V"];
  const distractors = shuffle(voltagePool.filter(value => value !== v)).slice(0, 3);
  const opts = [v, ...distractors];
  return buildQuestion(`Tensión lógica típica de ${board}:`, opts, v);
});

const roboticsExtra = buildFromData([
  ["Sensor que mide distancia con luz láser:", ["LiDAR", "IMU", "Encoder", "Potenciómetro"], "LiDAR"],
  ["¿Qué protocolo usa MQTT?", ["Publicación/suscripción", "HTTP", "CAN", "UART"], "Publicación/suscripción"],
  ["¿Qué hace el watchdog en un microcontrolador?", ["Reinicia si se cuelga", "Acelera CPU", "Carga firmware", "Amplifica señal"], "Reinicia si se cuelga"],
  ["Tipo de comunicación entre Arduino y PC por defecto:", ["UART", "I2C", "SPI", "CAN"], "UART"],
  ["¿Qué es un H-bridge?", ["Driver invierte giro DC", "Filtro de audio", "Sensor Hall", "Bus de red"], "Driver invierte giro DC"],
  ["¿Qué mide un giroscopio?", ["Velocidad angular", "Aceleración lineal", "Campo magnético", "Temperatura"], "Velocidad angular"],
  ["¿Qué es un encoder incremental?", ["Cuenta pulsos de giro", "Mide distancia láser", "Calcula corriente", "Convierte AC/DC"], "Cuenta pulsos de giro"],
  ["¿Qué microcontrolador usa ESP32?", ["Xtensa dual core", "AVR 8-bit", "ARM Cortex-M0", "x86"], "Xtensa dual core"],
  ["Batería típica de dron pequeño:", ["LiPo 3S", "Plomo 12V", "NiMH 9.6V", "Pila AA"], "LiPo 3S"],
  ["¿Qué es ROS2?", ["Framework de robótica", "Sistema operativo en tiempo real", "Simulador 3D", "Driver de motor"], "Framework de robótica"],
  ["Parámetro Kp en PID afecta:", ["Respuesta proporcional al error", "Memoria usada", "Ruido del sensor", "Consumo eléctrico"], "Respuesta proporcional al error"],
  ["¿Qué es SLAM?", ["Localización y mapeo simultáneo", "Modo ahorro de energía", "Protocolo de radio", "Tipo de LiDAR"], "Localización y mapeo simultáneo"],
  ["¿Qué es un servo?", ["Motor con control de posición", "Sensor de distancia", "CPU", "Pantalla"], "Motor con control de posición"],
  ["¿Qué es una odometría?", ["Estimación de pose por movimiento", "Mapa de calor", "Tabla de pines", "Transformada de Fourier"], "Estimación de pose por movimiento"],
  ["¿Qué bus permite múltiples maestros y esclavos con dos cables?", ["I2C", "SPI", "UART", "USB"], "I2C"],
  ["¿Qué significa PWM?", ["Pulse Width Modulation", "Power Watt Mode", "Parallel Wire Mapping", "Protocol With Messages"], "Pulse Width Modulation"],
  ["¿Qué driver popular controla motores paso a paso?", ["A4988", "L298N", "ULN2003", "TB6612"], "A4988"],
  ["¿Qué archivo describe la cinemática y geometría en ROS?", ["URDF", "launch", "rviz", "bag"], "URDF"],
  ["¿Qué mide un magnetómetro?", ["Campo magnético", "Temperatura", "Presión", "Distancia"], "Campo magnético"],
  ["¿Qué es un IMU?", ["Unidad de medida inercial", "Motor industrial", "Unidad de memoria", "Sensor de luz"], "Unidad de medida inercial"],
  ["¿Qué hace un optoacoplador?", ["Aísla eléctricamente dos circuitos", "Duplica voltaje", "Conecta a internet", "Mide rpm"], "Aísla eléctricamente dos circuitos"],
  ["¿Qué es CAN bus?", ["Red robusta para vehículos", "Formato de video", "Sistema operativo", "Tipo de batería"], "Red robusta para vehículos"],
  ["¿Qué es un limit switch?", ["Fin de carrera", "Regulador DC-DC", "Sensor óptico de color", "Driver MOSFET"], "Fin de carrera"],
  ["¿Qué es un potenciómetro?", ["Resistencia variable", "Sensor óptico", "Motor paso a paso", "Memoria EEPROM"], "Resistencia variable"],
  ["¿Qué hace un regulador buck?", ["Reduce voltaje", "Aumenta voltaje", "Convierte AC en DC", "Mide voltaje"], "Reduce voltaje"],
  ["¿Qué es un MPU-6050?", ["IMU 6 ejes", "LiDAR 3D", "Servo digital", "Microcontrolador RISC-V"], "IMU 6 ejes"],
  ["¿Qué es un relé de estado sólido?", ["Switch electrónico sin partes móviles", "Sensor de humedad", "Driver de paso a paso", "Conector waterproof"], "Switch electrónico sin partes móviles"],
  ["¿Qué es la frecuencia de Nyquist?", ["Mitad del muestreo", "Mínima frecuencia de un PWM", "Máxima de una batería", "Constante de Planck"], "Mitad del muestreo"],
  ["�Qu� es un Lidar 3D?", ["Sensor l�ser 3D", "C�mara RGB", "Radar de microondas", "Sensor de ultrasonido"], "Sensor l�ser 3D"],
  ["¿Qué es un microservicio en robótica?", ["Nodo pequeño con una función", "Motor de precisión", "Sensor de presión", "Cableado modular"], "Nodo pequeño con una función"],
  ["¿Qué es una cinemática inversa?", ["Articulaciones desde pose", "Calcular pose desde articulaciones", "Muestrear PWM", "Filtrar ruido"], "Articulaciones desde pose"],
  ["�Qu� es un encoder absoluto?", ["Da �ngulo absoluto", "Cuenta pulsos relativos", "Mide temperatura", "Convierte voltaje"], "Da �ngulo absoluto"],
  ["¿Qué es un puente H doble?", ["Driver para dos motores DC", "Fuente de poder", "Filtro de audio", "Bus de datos"], "Driver para dos motores DC"],
  ["¿Qué es un MOSFET?", ["Transistor de efecto de campo", "Sensor térmico", "Motor sin escobillas", "Conector"], "Transistor de efecto de campo"],
  ["¿Qué significa kinematic chain?", ["Cadena de eslabones articulados", "Lista de comandos ROS", "Secuencia de PWM", "Mapa de bits"], "Cadena de eslabones articulados"],
  ["¿Qué se usa para medir corriente?", ["Shunt + amplificador", "Sensor capacitivo", "Fotodiodo", "Encoder"], "Shunt + amplificador"],
  ["�Qu� es un limit torque?", ["L�mite de par motor", "Tipo de engrane", "Modo de comunicaci�n", "Sensor de fuerza"], "L�mite de par motor"],
]);

const roboticsExtra2 = buildFromData([
  ["¿Qué es un ESC en drones?", ["Controlador de motor BLDC", "Sensor de altitud", "Firmware de cámara", "Batería"], "Controlador de motor BLDC"],
  ["Frecuencia PWM común en Arduino para motores DC:", ["490 Hz", "50 Hz", "5 kHz", "60 kHz"], "490 Hz"],
  ["¿Qué mide un acelerómetro?", ["Aceleración lineal", "Ángulo absoluto", "Presión", "Temperatura"], "Aceleración lineal"],
  ["¿Qué hace un fusible?", ["Se funde para cortar corriente", "Amplifica señal", "Reduce voltaje", "Guarda datos"], "Se funde para cortar corriente"],
  ["¿Qué software planifica trayectorias sin colisiones?", ["Planificador de movimiento", "Compilador", "Firmware", "Bootloader"], "Planificador de movimiento"]
]);

const roboticsQuestions = uniqueQuestions([
  ...roboticsBase,
  ...roboticsBoards,
  ...roboticsMotors,
  ...roboticsPins,
  ...roboticsVoltages,
  ...roboticsExtra,
  ...roboticsExtra2
]);

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
  const opts = [name, "Base fuerte", "Sal", "Óxido"];
  return buildQuestion(`${f} es:`, opts, name);
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
  const opts = ["Sólido", "Líquido", "Gas", "Plasma"];
  return buildQuestion(`${sub} está principalmente en estado:`, opts, st);
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
const chemistrySymbolPool = chemSymbolsData.map(([, sym]) => sym);
const chemistrySymbols = chemSymbolsData.map(([elem, sym]) => {
  const distractors = shuffle(chemistrySymbolPool.filter(candidate => candidate.toLowerCase() !== sym.toLowerCase())).slice(0, 3);
  const opts = [sym, ...distractors];
  return buildQuestion(`Símbolo químico de ${elem}:`, opts, sym);
});

// Electrones de valencia en estado fundamental (representativo)
const chemValenceData = [
  ["Carbono", 4], ["Oxígeno", 6], ["Nitrógeno", 5], ["Sodio", 1], ["Magnesio", 2],
  ["Aluminio", 3], ["Silicio", 4], ["Cloro", 7], ["Azufre", 6], ["Fósforo", 5]
];
const chemistryValence = chemValenceData.map(([elem, val]) => {
  const opts = [val, val - 1, val + 1, val + 2].map(String);
  return buildQuestion(`Electrones de valencia de ${elem}:`, opts, String(val));
});

// Clasificación por pH
const chemistryPh = [];
const phLabels = ["Ácido fuerte", "Ácido débil", "Neutral", "Básico", "Básico fuerte"];
for (let pH = 0; pH <= 14; pH += 2) {
  const category = pH < 3 ? "Ácido fuerte" : pH < 7 ? "Ácido débil" : pH === 7 ? "Neutral" : pH <= 10 ? "Básico" : "Básico fuerte";
  const distractors = shuffle(phLabels.filter(label => label !== category)).slice(0, 3);
  const opts = [category, ...distractors];
  chemistryPh.push(buildQuestion(`Una solución con pH ${pH} es:`, opts, category));
}

const chemistryExtra = buildFromData([
  ["pH menor a 7 indica solución:", ["Ácida", "Básica", "Neutra", "Desconocida"], "Ácida"],
  ["Elemento líquido (además de mercurio) cerca de 25°C:", ["Bromo", "Sodio", "Aluminio", "Potasio"], "Bromo"],
  ["Enlace típico entre metal y no metal:", ["Iónico", "Covalente", "Metálico", "Puente de hidrógeno"], "Iónico"],
  ["Neutralización ácido + base produce:", ["Sal y agua", "Solo agua", "Solo sal", "Oxígeno"], "Sal y agua"],
  ["Unidad de molaridad:", ["mol/L", "g/L", "kg/m^3", "%"], "mol/L"],
  ["Reacción que absorbe calor:", ["Endotérmica", "Exotérmica", "Redox", "Descomposición"], "Endotérmica"],
  ["Gas noble usado en letreros luminosos:", ["Neón", "Argón", "Xenón", "Kriptón"], "Neón"],
  ["Principal componente del acero:", ["Hierro", "Cobre", "Aluminio", "Plomo"], "Hierro"],
  ["CO2 a -80°C y 1 atm está en estado:", ["Sólido", "Líquido", "Gas", "Plasma"], "Sólido"],
  ["Nombre común de H2O2:", ["Peróxido de hidrógeno", "Perclorato", "Hipoclorito", "Ozono"], "Peróxido de hidrógeno"],
  ["Número atómico del carbono:", ["4", "6", "8", "10"], "6"],
  ["Gas usado para atmósferas inertes en soldadura:", ["Argón", "Oxígeno", "Cloro", "Helio"], "Argón"]
]);

const chemistryQuestions = uniqueQuestions([
  ...chemistryBase,
  ...chemistryAcids,
  ...chemistryStates,
  ...chemistrySymbols,
  ...chemistryValence,
  ...chemistryPh,
  ...chemistryExtra
]);

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
  const opts = [text, "Gateway Timeout", "Bad Gateway", "Not Acceptable"];
  return buildQuestion(`HTTP ${code} significa:`, opts, text);
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
  const opts = [desc, "Archivo ejecutable", "Base de datos", "Script de servidor"];
  return buildQuestion(`${ext} es:`, opts, desc);
});

const techPorts = [
  [22, "SSH"], [25, "SMTP"], [53, "DNS"], [80, "HTTP"], [110, "POP3"],
  [143, "IMAP"], [3306, "MySQL"], [5432, "PostgreSQL"], [6379, "Redis"], [27017, "MongoDB"],
  [1883, "MQTT"], [21, "FTP"], [8080, "HTTP alterno"], [3389, "RDP"], [5900, "VNC"]
].map(([port, svc]) => {
  const servicePool = ["SSH", "SMTP", "DNS", "HTTP", "POP3", "IMAP", "MySQL", "PostgreSQL", "Redis", "MongoDB", "MQTT", "FTP", "HTTP alterno", "RDP", "VNC"];
  const distractors = shuffle(servicePool.filter(item => item !== svc)).slice(0, 3);
  const opts = [svc, ...distractors];
  return buildQuestion(`Puerto ${port} suele usarse para:`, opts, svc);
});

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

const techExtra = buildFromData([
  ["¿Qué es OAuth2?", ["Protocolo de autorización", "Base de datos", "Codec de audio", "Formato de imagen"], "Protocolo de autorización"],
  ["¿Qué lenguaje se ejecuta en el navegador?", ["JavaScript", "Python", "Go", "Rust"], "JavaScript"],
  ["¿Qué es un CDN?", ["Red de entrega de contenido", "Tipo de base relacional", "Algoritmo de hashing", "Compresor de video"], "Red de entrega de contenido"],
  ["¿Qué es Docker?", ["Plataforma de contenedores", "Servidor web", "Framework frontend", "Librería de IA"], "Plataforma de contenedores"],
  ["¿Qué comando lista procesos en Linux?", ["ps", "ls", "cat", "cp"], "ps"],
  ["¿Qué significa SSD?", ["Solid State Drive", "Secure Socket Device", "Serial Storage Disk", "Software Defined Device"], "Solid State Drive"],
  ["¿Qué framework es React?", ["Frontend JS", "Backend PHP", "Base de datos", "Servidor DNS"], "Frontend JS"],
  ["¿Qué hace un balanceador de carga?", ["Distribuye tráfico entre instancias", "Encripta discos", "Compila código", "Mide latencia"], "Distribuye tráfico entre instancias"],
  ["¿Qué es un webhook?", ["Llamada HTTP saliente por evento", "Dispositivo de red", "Tipo de hash", "Balanceador físico"], "Llamada HTTP saliente por evento"],
  ["¿Qué significa CRUD?", ["Create, Read, Update, Delete", "Cache, Render, Update, Deploy", "Compile, Run, Unit, Debug", "Nada"], "Create, Read, Update, Delete"]
]);

const techExtra2 = buildFromData([
  ["¿Qué es la RAM?", ["Memoria volátil", "Disco duro", "CPU", "GPU"], "Memoria volátil"],
  ["CPU significa:", ["Central Processing Unit", "Computer Power Unit", "Control Peripheral Unit", "Core Performance Unit"], "Central Processing Unit"],
  ["Comando para copiar archivos en Linux:", ["cp", "mv", "ls", "cat"], "cp"],
  ["Protocolo de correo para sincronizar bandeja:", ["IMAP", "POP3", "SMTP", "FTP"], "IMAP"],
  ["Estructura LIFO se llama:", ["Pila", "Cola", "Árbol", "Grafo"], "Pila"],
  ["Algoritmo de ordenamiento O(n log n):", ["Merge sort", "Bubble sort", "Counting sort", "Selection sort"], "Merge sort"],
  ["Base de datos clave-valor popular:", ["Redis", "PostgreSQL", "MySQL", "SQLite"], "Redis"],
  ["CSS significa:", ["Cascading Style Sheets", "Central Style System", "Common Style Syntax", "Creative Sheet Styles"], "Cascading Style Sheets"],
  ["`npm install` hace:", ["Instala dependencias", "Ejecuta tests", "Inicia servidor", "Compila nativo"], "Instala dependencias"],
  ["Imagen con soporte de transparencia:", ["PNG", "JPEG", "BMP", "TIFF sin alfa"], "PNG"],
  ["Herramienta común para probar APIs:", ["Postman", "Figma", "Photoshop", "Jira"], "Postman"],
  ["GPU es:", ["Unidad de procesamiento gráfico", "Servidor de archivos", "Tarjeta de sonido", "Router"], "Unidad de procesamiento gráfico"],
  ["BIOS es:", ["Firmware de arranque", "Sistema operativo", "Driver de red", "Aplicación web"], "Firmware de arranque"],
  ["RAID 1 se conoce como:", ["Espejo", "Striping", "Paridad doble", "JBOD"], "Espejo"],
  ["Firewall sirve para:", ["Filtrar tráfico de red", "Renderizar gráficos", "Comprimir archivos", "Desfragmentar discos"], "Filtrar tráfico de red"],
  ["2FA significa:", ["Autenticación de dos factores", "Aplicación de archivos", "Framework de análisis", "Formato de audio"], "Autenticación de dos factores"],
  ["Cookie en web es:", ["Dato corto en navegador", "Malware", "Servidor proxy", "Formato de imagen"], "Dato corto en navegador"],
  ["WebAssembly es:", ["Bytecode portable para la web", "Framework CSS", "Servidor de correo", "Algoritmo de búsqueda"], "Bytecode portable para la web"],
  ["SLA significa:", ["Service Level Agreement", "Secure Link Access", "Serial Link Adapter", "Standard License Agreement"], "Service Level Agreement"],
  ["Comando para ver IP en Windows:", ["ipconfig", "ls", "ps", "route"], "ipconfig"],
  ["Formato de compresión sin pérdida:", ["FLAC", "MP3", "AAC", "WMA"], "FLAC"],
  ["Protocolo para transferencias seguras de archivos:", ["SFTP", "Telnet", "SMTP", "POP3"], "SFTP"],
  ["Unidad básica de frecuencia:", ["Hertz", "Volt", "Ohm", "Joule"], "Hertz"]
]);

const techQuestions = uniqueQuestions([
  ...techBase,
  ...techHttp,
  ...techFiles,
  ...techPorts,
  ...gitCommands,
  ...techExtra,
  ...techExtra2
]);

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
  const opts = [year, year + 1, year - 1, year + 10].map(String);
  return buildQuestion(`Año de independencia de ${country}:`, opts, String(year));
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
const historyPlacesPool = [...new Set(leaders.map(([, place]) => place))];
const historyLeaders = leaders.map(([name, place]) => {
  const distractors = shuffle(historyPlacesPool.filter(value => value !== place)).slice(0, 3);
  const opts = [place, ...distractors];
  return buildQuestion(`${name} lideró principalmente en:`, opts, place);
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

const historyExtra = buildFromData([
  ["Muro de Berlín se construye:", ["1961", "1950", "1969", "1975"], "1961"],
  ["Crack bursátil de Nueva York:", ["1929", "1919", "1939", "1959"], "1929"],
  ["Ataque a Pearl Harbor:", ["1941", "1944", "1939", "1945"], "1941"],
  ["Fin de la guerra de Vietnam:", ["1975", "1968", "1980", "1970"], "1975"],
  ["Guerra Civil Española comienza:", ["1936", "1939", "1929", "1945"], "1936"],
  ["Constitución de EE.UU. se firma:", ["1787", "1800", "1763", "1812"], "1787"],
  ["Fin del apartheid en Sudáfrica:", ["1994", "1984", "2000", "1990"], "1994"],
  ["Primavera Árabe inicia:", ["2010", "2011", "2012", "2013"], "2011"],
  ["Revolución Cubana triunfa:", ["1959", "1949", "1965", "1970"], "1959"],
  ["Fundación de la ONU:", ["1945", "1955", "1930", "1960"], "1945"],
  ["Disolución oficial de la URSS:", ["1991", "1989", "1993", "1995"], "1991"],
  ["Marcha sobre Washington de Martin Luther King:", ["1963", "1955", "1960", "1970"], "1963"],
  ["Independencia de Brasil:", ["1822", "1808", "1889", "1850"], "1822"],
  ["Primer mensaje de ARPANET:", ["1969", "1975", "1983", "1990"], "1969"],
  ["Armisticio que detiene la Guerra de Corea:", ["1953", "1950", "1955", "1960"], "1953"],
  ["Batalla de Hastings:", ["1066", "1215", "1415", "1666"], "1066"],
  ["Declaración Universal de Derechos Humanos:", ["1948", "1955", "1968", "1984"], "1948"],
  ["Voto femenino en EE.UU. (19ª enmienda):", ["1920", "1910", "1930", "1940"], "1920"],
  ["Inicio de la Guerra del Golfo:", ["1990", "1995", "1980", "2001"], "1990"],
  ["Tratado de Versalles se firma:", ["1919", "1925", "1933", "1905"], "1919"],
  ["Descubrimiento de la penicilina:", ["1928", "1918", "1938", "1948"], "1928"],
  ["Inicio de la Revolución Mexicana:", ["1910", "1920", "1898", "1905"], "1910"],
  ["Revolución de Mayo en Buenos Aires:", ["1810", "1820", "1800", "1830"], "1810"],
  ["Independencia de Haití:", ["1804", "1810", "1821", "1789"], "1804"],
  ["Primera circunnavegación del mundo finaliza:", ["1522", "1498", "1600", "1700"], "1522"],
  ["Caída de Saigón:", ["1975", "1969", "1982", "1990"], "1975"],
  ["Derrota de la Armada Invencible:", ["1588", "1600", "1701", "1492"], "1588"],
  ["Guerra de Crimea inicia:", ["1853", "1870", "1815", "1890"], "1853"]
]);

const historyQuestions = uniqueQuestions([
  ...historyBase,
  ...historyIndependence,
  ...historyLeaders,
  ...historyEvents,
  ...historyExtra
]);

// ------------------ GEOGRAPHY ------------------
const geographyBase = buildFromData([
  ["Río más largo de África:", ["Nilo", "Congo", "Níger", "Zambeze"], "Nilo"],
  ["¿Qué país tiene más husos horarios contando territorios de ultramar?", ["Rusia", "EEUU", "Francia", "China"], "Francia"],
  ["Capital de Canadá:", ["Toronto", "Ottawa", "Vancouver", "Montreal"], "Ottawa"],
  ["Montaña más alta fuera de Asia:", ["Aconcagua", "Kilimanjaro", "Denali", "Mont Blanc"], "Aconcagua"],
  ["¿Qué mar está casi cerrado y es muy salado?", ["Báltico", "Rojo", "Muerto", "Tasman"], "Muerto"],
  ["País con más islas registradas:", ["Indonesia", "Suecia", "Filipinas", "Canadá"], "Suecia"],
  ["Desierto más grande del mundo (incluyendo desiertos polares):", ["Sahara", "Arabia", "Antártida", "Gobi"], "Antártida"],
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
  ["Japón", "Tokio", "Kioto", "Osaka", "Nagoya"],
  ["India", "Nueva Delhi", "Mumbai", "Bangalore", "Calcuta"],
  ["Corea del Sur", "Seúl", "Busan", "Incheon", "Daegu"],
  ["España", "Madrid", "Barcelona", "Sevilla", "Valencia"],
  ["Alemania", "Berlín", "Múnich", "Hamburgo", "Fráncfort"],
  ["Italia", "Roma", "Milán", "Nápoles", "Turín"],
  ["Francia", "París", "Lyon", "Marsella", "Toulouse"],
  ["China", "Pekín", "Shanghái", "Shenzhen", "Guangzhou"],
  ["Argentina", "Buenos Aires", "Córdoba", "Rosario", "Mendoza"],
  ["Rusia", "Moscú", "San Petersburgo", "Novosibirsk", "Kazan"],
  ["Vietnam", "Hanói", "Ho Chi Minh", "Da Nang", "Hue"],
  ["Grecia", "Atenas", "Tesalónica", "Patras", "Heraclión"]
];
const geographyCapitals = capitals.map(([country, correct, ...rest]) => {
  const opts = [correct, ...rest];
  return buildQuestion(`Capital de ${country}:`, opts, correct);
});

const geoExtremes = [
  ["Punto más bajo en tierra", "Mar Muerto"],
  ["Catarata más alta", "Salto Ángel"],
  ["Isla más remota habitada", "Tristán de Acuña"],
  ["Pico más alto", "Everest"],
  ["Río más caudaloso", "Amazonas"],
  ["País más poblado desde 2023", "India"],
  ["País más frío habitable", "Rusia (Siberia)"],
  ["Capital federal de Australia", "Canberra"],
  ["País con mayor superficie", "Rusia"],
  ["Lago más grande", "Caspio"]
];
const geographyExtremes = geoExtremes.map(([label, answer]) => {
  const opts = [answer, "Nilo", "Sahara", "Pacífico"];
  return buildQuestion(`${label} es:`, opts, answer);
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
  const opts = [correct, ...rest];
  return buildQuestion(`Capital de ${country}:`, opts, correct);
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
  const opts = [peak, "Mont Blanc", "Matterhorn", "McKinley"];
  return buildQuestion(`Pico más alto de ${cont}:`, opts, peak);
});

// Hemisferios
const geographyHemispheres = buildFromData([
  ["La ciudad de Quito está en el hemisferio:", ["Norte", "Sur", "Cruzando el ecuador", "Occidental"], "Cruzando el ecuador"],
  ["Sídney se ubica en el hemisferio:", ["Norte", "Sur", "Este", "Oeste"], "Sur"],
  ["Londres se ubica en el hemisferio:", ["Norte", "Sur", "Oeste solamente", "Antártico"], "Norte"],
  ["Johannesburgo se ubica en el hemisferio:", ["Norte", "Sur", "Oeste", "Ártico"], "Sur"],
  ["Ciudad de México se ubica en el hemisferio:", ["Norte", "Sur", "Solo Oeste", "Solo Este"], "Norte"]
]);

const geographyExtra = buildFromData([
  ["País sin salida al mar:", ["Paraguay", "Perú", "Birmania", "Somalia"], "Paraguay"],
  ["Montaña más alta de Europa:", ["Elbrus", "Mont Blanc", "Matterhorn", "Grossglockner"], "Elbrus"],
  ["Lago más profundo del mundo:", ["Baikal", "Tanganica", "Caspio", "Superior"], "Baikal"],
  ["Desierto de Atacama está en:", ["Chile", "Perú", "Argentina", "Bolivia"], "Chile"],
  ["Cataratas del Iguazú se encuentran en:", ["Argentina/Brasil", "EEUU/Canadá", "Zambia/Zimbabue", "Croacia/Bosnia"], "Argentina/Brasil"],
  ["Ciudad de Petra está en:", ["Jordania", "Israel", "Egipto", "Arabia Saudita"], "Jordania"],
  ["El río Danubio desemboca en:", ["Mar Negro", "Mar Báltico", "Mar del Norte", "Mediterráneo"], "Mar Negro"],
  ["Cordillera que divide Europa y Asia:", ["Urales", "Andes", "Rocosas", "Alpes"], "Urales"],
  ["País con más pirámides:", ["Sudán", "Egipto", "México", "China"], "Sudán"],
  ["Isla más poblada del mundo:", ["Java", "Sumatra", "Luzón", "Gran Bretaña"], "Java"],
  ["La península ibérica está formada principalmente por:", ["España y Portugal", "Francia y Bélgica", "Italia y Suiza", "Croacia y Serbia"], "España y Portugal"],
  ["Las islas Galápagos pertenecen a:", ["Ecuador", "Perú", "Chile", "Colombia"], "Ecuador"],
  ["Capital de Nigeria:", ["Abuya", "Lagos", "Kano", "Ibadan"], "Abuya"],
  ["Dubái se encuentra en:", ["Emiratos Árabes Unidos", "Qatar", "Arabia Saudita", "Omán"], "Emiratos Árabes Unidos"],
  ["País famoso por sus fiordos:", ["Noruega", "Suecia", "Islandia", "Canadá"], "Noruega"],
  ["Mar que separa Arabia e Irán:", ["Golfo Pérsico", "Mar Rojo", "Mar Arábigo", "Mar Caspio"], "Golfo Pérsico"],
  ["Ciudad llamada 'Venecia del Norte':", ["Ámsterdam", "Estocolmo", "Brujas", "Copenhague"], "Ámsterdam"],
  ["País más joven del mundo (2011):", ["Sudán del Sur", "Kosovo", "Eritrea", "Montenegro"], "Sudán del Sur"],
  ["Capital de Etiopía:", ["Adís Abeba", "Asmara", "Nairobi", "Juba"], "Adís Abeba"]
]);

const geographyExtra2 = buildFromData([
  ["Capital de Filipinas:", ["Manila", "Cebú", "Dávao", "Quezón"], "Manila"],
  ["Río más largo de Norteamérica:", ["Misisipi-Misuri", "Colorado", "Ohio", "Columbia"], "Misisipi-Misuri"],
  ["Monte Fuji está en:", ["Japón", "China", "Corea", "Filipinas"], "Japón"],
  ["Capital de Arabia Saudita:", ["Riad", "Yeda", "La Meca", "Medina"], "Riad"],
  ["Mayor isla del Caribe:", ["Cuba", "Hispaniola", "Puerto Rico", "Jamaica"], "Cuba"],
  ["Capital administrativa de Sudáfrica:", ["Pretoria", "Ciudad del Cabo", "Johannesburgo", "Durban"], "Pretoria"]
]);

const geographyQuestions = uniqueQuestions([
  ...geographyBase,
  ...geographyCapitals,
  ...geographyExtremes,
  ...geographyMoreCapitals,
  ...geographyPeaks,
  ...geographyHemispheres,
  ...geographyExtra,
  ...geographyExtra2
]);

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

const QUESTION_CATEGORIES = Object.freeze(Object.keys(questionsDatabase));


const questionsValidation = validateQuestionsDatabase(questionsDatabase);
if (!questionsValidation.isValid) {
  const first = questionsValidation.errors[0];
  throw new Error(
    `[questions-data] Banco inv?lido (${questionsValidation.errorCount} errores). ` +
    `Primero: [${first.category}] #${first.index} ${first.type}.`
  );
}

const questionsExtendedValidation = validateQuestionsDatabaseExtended(questionsDatabase);
if (!questionsExtendedValidation.isValid) {
  const first = questionsExtendedValidation.errors[0];
  throw new Error(
    `[questions-data] Banco inv?lido por reglas extendidas (${questionsExtendedValidation.errorCount} errores). ` +
    `Primero: [${first.category}] #${first.index} ${first.type}.`
  );
}

const DIFFICULTY_KEYS = Object.freeze(["facil", "intermedio", "dificil"]);
const LEVEL_KEYS = Object.freeze([
  "primaria_baja",
  "primaria_alta",
  "secundaria",
  "bachillerato",
  "universidad",
  "posgrado"
]);

const DIFFICULTY_LEVEL_GROUPS = Object.freeze({
  facil: Object.freeze(["primaria_baja", "primaria_alta"]),
  intermedio: Object.freeze(["secundaria", "bachillerato"]),
  dificil: Object.freeze(["universidad", "posgrado"])
});

const QUESTIONS_PER_LEVEL_TARGET = 100;

function getCategoryQuestionsForLevel(baseQuestions, levelIndex, targetCount = QUESTIONS_PER_LEVEL_TARGET) {
  const source = Array.isArray(baseQuestions) ? baseQuestions : [];
  if (source.length === 0 || targetCount <= 0) return [];

  const offset = source.length > 0 ? (levelIndex * 17) % source.length : 0;
  const rotated = source.slice(offset).concat(source.slice(0, offset));

  if (rotated.length >= targetCount) {
    return rotated.slice(0, targetCount);
  }

  const out = [];
  while (out.length < targetCount) {
    out.push(...rotated);
  }
  return out.slice(0, targetCount);
}

function buildSeedCategoryMap(seedMap) {
  const out = {};
  for (const [category, rows] of Object.entries(seedMap || {})) {
    out[category] = buildFromData(rows);
  }
  return out;
}

function buildSeedLayerByLevel(sourceByLevel) {
  const out = {};
  for (const levelKey of LEVEL_KEYS) {
    out[levelKey] = Object.freeze(buildSeedCategoryMap(sourceByLevel?.[levelKey] || {}));
  }
  return Object.freeze(out);
}

// Inicio de banco manual por nivel (incremental).
// Se prioriza este banco y se completa con fallback automatico hasta 100 por nivel/categoria.
// Semillas manuales externas (questions-data-seeds.js).
// Fallback a objeto vacio para mantener compatibilidad en entornos sin ese script.
const MANUAL_SEEDS_SOURCE = (typeof globalThis !== "undefined" && globalThis.STEAM_TRIVIA_MANUAL_SEEDS)
  ? globalThis.STEAM_TRIVIA_MANUAL_SEEDS
  : {};
const manualBaseSeedsByLevel = buildSeedLayerByLevel(MANUAL_SEEDS_SOURCE.base || {});
const manualExtraSeedsByLevel = buildSeedLayerByLevel(MANUAL_SEEDS_SOURCE.extra || {});


const MANUAL_MIN_PER_LEVEL_CATEGORY = 50;
const MANUAL_MIN_TOTAL_QUESTIONS = LEVEL_KEYS.length * Object.keys(questionsDatabase).length * MANUAL_MIN_PER_LEVEL_CATEGORY;

function cloneQuestionRecord(question) {
  return {
    question: normalizeText(question?.question),
    options: Array.isArray(question?.options) ? question.options.map(normalizeText) : [],
    correct: Number.isInteger(question?.correct) ? question.correct : 0
  };
}

function buildFallbackSeedsByLevel(sourceDb, { perLevelCategory = MANUAL_MIN_PER_LEVEL_CATEGORY } = {}) {
  const out = {};
  for (const level of LEVEL_KEYS) out[level] = {};

  for (const [category, list] of Object.entries(sourceDb || {})) {
    const source = Array.isArray(list) ? list : [];

    LEVEL_KEYS.forEach((levelKey, levelIndex) => {
      if (source.length === 0) {
        out[levelKey][category] = [];
        return;
      }

      const start = (levelIndex * 13) % source.length;
      const picked = [];
      for (let i = 0; i < perLevelCategory; i++) {
        const idx = (start + i) % source.length;
        picked.push(cloneQuestionRecord(source[idx]));
      }

      out[levelKey][category] = uniqueQuestions(picked);
    });
  }

  return out;
}

const fallbackSeedsByLevel = buildFallbackSeedsByLevel(questionsDatabase);

const manualSeedLayers = Object.freeze([manualBaseSeedsByLevel, manualExtraSeedsByLevel]);

function collectManualSeeds(levelKey, category, seedLayers = manualSeedLayers) {
  return uniqueQuestions(seedLayers.flatMap(layer => layer?.[levelKey]?.[category] || []));
}

function hasCompleteManualBank(seedLayers, { perLevelCategory = QUESTIONS_PER_LEVEL_TARGET } = {}) {
  for (const levelKey of LEVEL_KEYS) {
    for (const category of QUESTION_CATEGORIES) {
      const count = collectManualSeeds(levelKey, category, seedLayers).length;
      if (count < perLevelCategory) return false;
    }
  }
  return true;
}

const activeManualSeedLayers = Object.freeze(
  hasCompleteManualBank(manualSeedLayers)
    ? [...manualSeedLayers]
    : [...manualSeedLayers, fallbackSeedsByLevel]
);

function getActiveManualSeeds(levelKey, category) {
  return collectManualSeeds(levelKey, category, activeManualSeedLayers);
}

function validateManualCoverage(seedMaps, {
  minPerLevelCategory = MANUAL_MIN_PER_LEVEL_CATEGORY,
  minTotalManual = MANUAL_MIN_TOTAL_QUESTIONS
} = {}) {
  const errors = [];
  let totalManual = 0;

  const categories = QUESTION_CATEGORIES;
  for (const levelKey of LEVEL_KEYS) {
    for (const category of categories) {
      const mergedManual = collectManualSeeds(levelKey, category, seedMaps);
      const count = mergedManual.length;
      totalManual += count;

      if (count < minPerLevelCategory) {
        errors.push({
          type: "manual_below_min_per_level_category",
          level: levelKey,
          category,
          expectedAtLeast: minPerLevelCategory,
          got: count
        });
      }
    }
  }

  if (totalManual < minTotalManual) {
    errors.push({
      type: "manual_below_min_total",
      expectedAtLeast: minTotalManual,
      got: totalManual
    });
  }

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    totalManual,
    errors
  };
}
function mergeLevelCategoryQuestions({
  manualQuestions,
  generatedQuestions,
  baseQuestions,
  targetCount = QUESTIONS_PER_LEVEL_TARGET
}) {
  const merged = uniqueQuestions([
    ...(Array.isArray(manualQuestions) ? manualQuestions : []),
    ...(Array.isArray(generatedQuestions) ? generatedQuestions : []),
    ...(Array.isArray(baseQuestions) ? baseQuestions : [])
  ]);

  if (merged.length >= targetCount) {
    return merged.slice(0, targetCount);
  }

  const out = merged.slice();
  const seenQuestionKeys = new Set(out.map(item => normalizeQuestionKey(item?.question)));
  const source = Array.isArray(baseQuestions) ? baseQuestions : [];

  for (const question of source) {
    if (out.length >= targetCount) break;

    const key = normalizeQuestionKey(question?.question);
    if (!key || seenQuestionKeys.has(key)) continue;

    seenQuestionKeys.add(key);
    out.push(question);
  }

  return out.slice(0, targetCount);
}
function buildQuestionsDatabaseByLevel(sourceDb, { targetCount = QUESTIONS_PER_LEVEL_TARGET } = {}) {
  const out = {};
  for (const level of LEVEL_KEYS) out[level] = {};

  for (const [category, list] of Object.entries(sourceDb || {})) {
    LEVEL_KEYS.forEach((levelKey, levelIndex) => {
      const generatedQuestions = getCategoryQuestionsForLevel(list, levelIndex, targetCount);
      const manualQuestions = getActiveManualSeeds(levelKey, category);
      out[levelKey][category] = mergeLevelCategoryQuestions({
        manualQuestions,
        generatedQuestions,
        baseQuestions: list,
        targetCount
      });
    });
  }

  return out;
}

function buildQuestionsDatabaseByDifficultyFromLevels(levelDb) {
  const out = {
    facil: {},
    intermedio: {},
    dificil: {}
  };

  for (const category of QUESTION_CATEGORIES) {
    for (const difficulty of DIFFICULTY_KEYS) {
      const levels = DIFFICULTY_LEVEL_GROUPS[difficulty] || [];
      const merged = [];
      for (const levelKey of levels) {
        merged.push(...(levelDb[levelKey]?.[category] || []));
      }
      out[difficulty][category] = merged;
    }
  }

  return out;
}

const questionsDatabaseByLevel = buildQuestionsDatabaseByLevel(questionsDatabase);
const questionsDatabaseByDifficulty = buildQuestionsDatabaseByDifficultyFromLevels(questionsDatabaseByLevel);

const manualCoverageValidation = validateManualCoverage(activeManualSeedLayers);
if (!manualCoverageValidation.isValid) {
  const first = manualCoverageValidation.errors[0];
  throw new Error(
    `[questions-data] Cobertura manual insuficiente (${manualCoverageValidation.errorCount} errores). ` +
    `Primero: ${first.type} ${first.level || ""} ${first.category || ""}.`
  );
}

function validateDerivedBanks(levelDb, difficultyDb, { perLevelTarget = QUESTIONS_PER_LEVEL_TARGET } = {}) {
  const errors = [];
  const categories = Object.keys(questionsDatabase);

  for (const levelKey of LEVEL_KEYS) {
    for (const category of categories) {
      const count = Array.isArray(levelDb?.[levelKey]?.[category]) ? levelDb[levelKey][category].length : -1;
      if (count !== perLevelTarget) {
        errors.push({
          type: "invalid_level_count",
          level: levelKey,
          category,
          expected: perLevelTarget,
          got: count
        });
      }
    }
  }

  for (const difficultyKey of DIFFICULTY_KEYS) {
    const levelsInDifficulty = DIFFICULTY_LEVEL_GROUPS[difficultyKey] || [];
    const expectedCount = perLevelTarget * levelsInDifficulty.length;

    for (const category of categories) {
      const count = Array.isArray(difficultyDb?.[difficultyKey]?.[category]) ? difficultyDb[difficultyKey][category].length : -1;
      if (count !== expectedCount) {
        errors.push({
          type: "invalid_difficulty_count",
          difficulty: difficultyKey,
          category,
          expected: expectedCount,
          got: count
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    errors
  };
}

const derivedBanksValidation = validateDerivedBanks(questionsDatabaseByLevel, questionsDatabaseByDifficulty);
if (!derivedBanksValidation.isValid) {
  const first = derivedBanksValidation.errors[0];
  throw new Error(
    `[questions-data] Bancos por nivel/dificultad invalidos (${derivedBanksValidation.errorCount} errores). ` +
    `Primero: ${first.type} ${first.level || first.difficulty} ${first.category}.`
  );
}

function sanitizeDifficulty(difficulty) {
  const key = normalizeText(difficulty).toLowerCase();
  return DIFFICULTY_KEYS.includes(key) ? key : "intermedio";
}

function sanitizeCategory(category) {
  const key = normalizeText(category).toLowerCase();
  return Object.prototype.hasOwnProperty.call(questionsDatabase, key) ? key : "general";
}

function sanitizeCount(count) {
  const value = Number(count);
  if (!Number.isFinite(value)) return 10;
  return Math.max(1, Math.floor(value));
}

// Ejemplo:
// const sample = getQuestions({ difficulty: "facil", category: "robotics", count: 10 });
function getQuestions({ difficulty = "intermedio", category = "general", count = 10 } = {}) {
  const difficultyKey = sanitizeDifficulty(difficulty);
  const categoryKey = sanitizeCategory(category);
  const requestedCount = sanitizeCount(count);

  const mergedPool = [];

  mergedPool.push(...(questionsDatabaseByDifficulty[difficultyKey]?.[categoryKey] || []));

  for (const otherDifficulty of DIFFICULTY_KEYS) {
    if (otherDifficulty === difficultyKey) continue;
    mergedPool.push(...(questionsDatabaseByDifficulty[otherDifficulty]?.[categoryKey] || []));
  }

  if (mergedPool.length < requestedCount) {
    mergedPool.push(...(questionsDatabase[categoryKey] || []));
  }

  const uniquePool = uniqueQuestions(mergedPool);
  const selected = shuffle(uniquePool).slice(0, Math.min(requestedCount, uniquePool.length));
  return selected.map(cloneQuestionRecord);
}

function freezeNestedDatabase(db) {
  for (const group of Object.values(db || {})) {
    if (!group || typeof group !== "object") continue;
    for (const category of Object.keys(group)) {
      Object.freeze(group[category]);
    }
    Object.freeze(group);
  }
}

Object.keys(questionsDatabase).forEach(k => Object.freeze(questionsDatabase[k]));
Object.freeze(questionsDatabase);

freezeNestedDatabase(questionsDatabaseByLevel);
Object.freeze(questionsDatabaseByLevel);

freezeNestedDatabase(questionsDatabaseByDifficulty);
Object.freeze(questionsDatabaseByDifficulty);






