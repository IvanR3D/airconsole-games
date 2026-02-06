---
inclusion: fileMatch
fileMatchPattern: "**/controller*.{js,html,css}"
---

# AirConsole Controller Development Guidelines

Este documento contiene las mejores prácticas y reglas para desarrollar controladores de AirConsole basados en la documentación oficial.

## Principio Fundamental

**Los smartphones NO son gamepads tradicionales.** No intentes emular un controlador Xbox/PlayStation. Aprovecha las capacidades únicas del smartphone.

## Diseño de Controles

### Tamaño de Botones/Áreas Interactivas

- **SIEMPRE** hacer los botones lo más grandes posible
- Tamaño mínimo recomendado: **44x44px** (estándar Apple)
- Tamaño óptimo: **60px** o más para mejor precisión táctil
- Para juegos de acción donde el jugador NO mira el teléfono: máximo **4 botones grandes** (uno en cada esquina)

### Tipos de Juegos

#### Juegos por Turnos/Rondas (sin timing crítico)
- El jugador PUEDE mirar el controlador
- Se permiten más botones (hasta 10+)
- Botones pueden ser más pequeños
- Ideal para: juegos de cartas, trivia, estrategia

#### Juegos de Acción (timing crítico)
- El jugador NO debe mirar el controlador
- Máximo 4 botones grandes en las esquinas
- Considerar usar gestos (swipe) o giroscopio en lugar de botones
- El jugador debe poder dar inputs "a ciegas"

## Inputs Alternativos a Botones

Aprovecha las capacidades únicas del smartphone:

```javascript
// Giroscopio - configurar en el constructor
airconsole = new AirConsole({
    device_motion: 100 // Intervalo en ms
});

airconsole.onDeviceMotion = function(data) {
    // data.x, data.y, data.z - acelerómetro
    // data.alpha, data.beta, data.gamma - giroscopio
};
```

### Gestos Recomendados
- **Swipe** (arriba/abajo/izquierda/derecha) - Excelente para movimiento
- **Shake** (agitar el teléfono) - Para acciones especiales
- **Tilt** (inclinar) - Para dirección continua

### Lo que NO usar
- ❌ D-Pads virtuales (se sienten mal sin feedback táctil)
- ❌ Joysticks virtuales (difíciles de usar sin mirar)
- ❌ Muchos botones pequeños en juegos de acción

## Orientación del Controlador

```javascript
// Forzar orientación landscape (horizontal)
airconsole.setOrientation(AirConsole.ORIENTATION_LANDSCAPE);

// Forzar orientación portrait (vertical)
airconsole.setOrientation(AirConsole.ORIENTATION_PORTRAIT);

// Constantes disponibles
AirConsole.ORIENTATION_LANDSCAPE
AirConsole.ORIENTATION_PORTRAIT
```

## Feedback Táctil (Vibración)

Usar vibración para dar feedback al usuario:

```javascript
// Vibración simple
if (navigator.vibrate) {
    navigator.vibrate(30); // 30ms
}

// Patrón de vibración
if (navigator.vibrate) {
    navigator.vibrate([50, 30, 50]); // vibrar, pausa, vibrar
}
```

**Cuándo usar vibración:**
- Al presionar botones
- Al confirmar acciones
- En eventos importantes del juego
- Feedback de error/éxito

## Controladores Personalizados por Jugador

Cada jugador puede tener una vista diferente:

```javascript
// Mostrar información secreta (cartas, objetivos)
// Mostrar color del jugador
// Diferentes roles = diferentes controles
```

## CSS para Controladores

### Variables CSS Recomendadas

```css
:root {
    /* Espacio seguro para logo AirConsole */
    --airconsole-safe-top: 50px;
    
    /* Tamaños de botones */
    --btn-min-size: 44px;
    --btn-optimal-size: 60px;
    --btn-large-size: 80px;
}
```

### Deshabilitar Comportamientos del Navegador

```css
* {
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
}

body {
    touch-action: manipulation;
    overscroll-behavior: none;
}

button {
    touch-action: manipulation;
}
```

### Responsive Design

```css
/* Portrait - móviles */
@media (orientation: portrait) {
    .elements-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}

/* Landscape - más espacio horizontal */
@media (orientation: landscape) {
    .elements-grid {
        grid-template-columns: repeat(8, 1fr);
    }
}
```

## API de AirConsole - Métodos Importantes

### Inicialización

```javascript
airconsole = new AirConsole({
    orientation: AirConsole.ORIENTATION_LANDSCAPE, // Orientación inicial
    device_motion: 100, // Giroscopio cada 100ms (opcional)
    synchronize_time: true // Sincronizar tiempo (opcional)
});
```

### Eventos Principales

```javascript
airconsole.onReady = function() {
    // Controlador listo
    airconsole.setOrientation(AirConsole.ORIENTATION_LANDSCAPE);
};

airconsole.onMessage = function(from, data) {
    // Mensaje recibido de la pantalla
};

airconsole.onConnect = function(device_id) {
    // Nuevo dispositivo conectado
};

airconsole.onDisconnect = function(device_id) {
    // Dispositivo desconectado
};
```

### Enviar Mensajes

```javascript
// Enviar mensaje a la pantalla
airconsole.message(AirConsole.SCREEN, { action: 'select', element: 'H' });

// Broadcast a todos
airconsole.broadcast({ action: 'ready' });
```

## Mejores Prácticas Generales

1. **Probar en múltiples dispositivos** - Diferentes tamaños de pantalla
2. **Usar HTTPS** - Todos los recursos deben cargarse por HTTPS
3. **No pedir login separado** - AirConsole maneja la autenticación
4. **Mantener el controlador simple** - Menos es más
5. **Dar feedback visual y táctil** - El usuario debe saber que su input fue registrado
6. **Considerar el espacio del logo AirConsole** - Dejar ~50px en la parte superior

## View Manager - Gestión de Vistas

El AirConsole View Manager facilita cambiar entre vistas en el controlador y la pantalla.

### Cómo Funciona

Cada dispositivo tiene una propiedad `custom` para manejar estados específicos. El View Manager usa internamente dos propiedades en el `customDeviceState`:

- **`ctrl_view`**: Almacena el ID de la vista visible en los controladores
- **`screen_view`**: Almacena el ID de la vista visible en la pantalla

Cuando `onCustomDeviceStateChange` detecta un cambio en estas propiedades, el View Manager muestra la vista correspondiente y oculta las demás.

```javascript
// Ejemplo de cómo se ve el customDeviceState internamente
{
    ctrl_view: 'game',    // Vista actual de controladores
    screen_view: 'ingame', // Vista actual de pantalla
    // ... otras propiedades personalizadas
}
```

### Instalación

Descargar `airconsole-view-manager.js` de: https://github.com/AirConsole/airconsole-view-manager

```html
<!-- API de AirConsole (versión 1.8.0 - última estable) -->
<script src="https://www.airconsole.com/api/airconsole-1.8.0.js"></script>
<!-- View Manager (descargar y hospedar localmente) -->
<script src="airconsole-view-manager.js"></script>
```

> **Nota sobre versiones**: La versión 1.8.0 es la más reciente y estable del API. Verificar actualizaciones en: https://developers.airconsole.com/

### Estructura HTML de Vistas

Las vistas deben tener:
- Clase `view` en cada contenedor
- Clase `default-view` en la vista inicial
- Un `id` único para cada vista

```html
<!-- Vista inicial (se muestra al cargar) -->
<div id="start" class="view default-view">VISTA INICIAL</div>

<!-- Otras vistas (ocultas por defecto) -->
<div id="game" class="view">VISTA DE JUEGO</div>
<div id="wait" class="view">VISTA DE ESPERA</div>
<div id="result" class="view">VISTA DE RESULTADO</div>
```

### CSS Requerido para Vistas

```css
/* IMPORTANTE: Ocultar vistas por defecto para evitar flash al cargar */
.view {
    display: none;
}
```

### Inicialización

```javascript
var airconsole = new AirConsole();
var vm = null;

airconsole.onReady = function() {
    // Inicializar View Manager
    vm = new AirConsoleViewManager(airconsole);
};

// IMPORTANTE: Escuchar cambios de estado para sincronizar vistas
airconsole.onCustomDeviceStateChange = function(device_id, data) {
    vm.onViewChange(data, function(view_id) {
        // La vista ha cambiado a view_id
        console.log('Vista actual:', view_id);
    });
};
```

### Métodos del View Manager

```javascript
// Cambiar vista en TODOS los controladores
vm.controllersShow('game');

// Cambiar vista en todos los controladores EXCEPTO este
vm.controllersShow('wait', true);

// Cambiar vista en la PANTALLA
vm.screenShow('ingame');

// Cambiar vista SOLO en este dispositivo (sin sincronizar)
vm.show('custom_menu');

// Cambiar vista en PANTALLA Y TODOS los controladores
vm.allShow('endgame');

// Ocultar todas las vistas
vm.hideAll();
```

### Propiedades Internas del View Manager

```javascript
// El View Manager detecta automáticamente si es screen o controller
vm.is_screen  // true si es la pantalla (device_id === AirConsole.SCREEN)

// Vista actual
vm.current_view.self    // Vista actual de este dispositivo
vm.current_view.ctrl    // Vista de controladores
vm.current_view.screen  // Vista de pantalla

// Todas las vistas registradas
vm.views  // Objeto con todas las vistas { id: elemento }
```

### Ejemplo Completo - Controller

```html
<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
    <style>
        .view { display: none; }
    </style>
</head>
<body>
    <!-- Vistas del controlador -->
    <div id="join" class="view default-view">
        <button id="joinBtn">UNIRSE</button>
    </div>
    <div id="wait" class="view">Esperando...</div>
    <div id="game" class="view">
        <!-- Controles del juego -->
    </div>
    <div id="result" class="view">Resultado</div>

    <script src="https://www.airconsole.com/api/airconsole-1.8.0.js"></script>
    <script src="airconsole-view-manager.js"></script>
    <script>
        var airconsole = new AirConsole();
        var vm = null;

        airconsole.onReady = function() {
            vm = new AirConsoleViewManager(airconsole);
        };

        airconsole.onCustomDeviceStateChange = function(device_id, data) {
            vm.onViewChange(data, function(view_id) {
                // Vista cambiada
            });
        };

        // Cambiar a vista de espera
        document.getElementById('joinBtn').onclick = function() {
            vm.show('wait');
            airconsole.message(AirConsole.SCREEN, { action: 'join' });
        };
    </script>
</body>
</html>
```

### Ejemplo Completo - Screen

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        .view { display: none; }
    </style>
</head>
<body>
    <!-- Vistas de la pantalla -->
    <div id="menu" class="view default-view">MENÚ PRINCIPAL</div>
    <div id="game" class="view">JUEGO EN PROGRESO</div>
    <div id="endgame" class="view">FIN DEL JUEGO</div>

    <script src="https://www.airconsole.com/api/airconsole-1.8.0.js"></script>
    <script src="airconsole-view-manager.js"></script>
    <script>
        var airconsole = new AirConsole();
        var vm = null;

        airconsole.onReady = function() {
            vm = new AirConsoleViewManager(airconsole);
        };

        airconsole.onCustomDeviceStateChange = function(device_id, data) {
            vm.onViewChange(data, function(view_id) {
                // Vista cambiada
            });
        };

        // Iniciar juego - cambiar vista en pantalla Y controladores
        function startGame() {
            vm.screenShow('game');
            vm.controllersShow('game');
        }

        // Fin del juego - cambiar vista en TODOS
        function endGame() {
            vm.allShow('endgame');
        }
    </script>
</body>
</html>
```

### Flujo Típico de Vistas

```
CONTROLLER                    SCREEN
-----------                   ------
[join] -----> join ------>    [menu]
[wait] <----- accepted <----  [menu]
[game] <----- startGame <---- [game]
[result] <--- roundEnd <----- [game]
[game] <----- nextRound <---- [game]
[endgame] <-- gameEnd ------> [endgame]
```

## Custom Device State - Estado Personalizado

Usar para sincronizar datos entre dispositivos:

```javascript
// Establecer estado personalizado
airconsole.setCustomDeviceState({
    view: 'game',
    score: 100,
    ready: true
});

// Establecer una propiedad específica
airconsole.setCustomDeviceStateProperty('score', 150);

// Obtener estado de un dispositivo
var state = airconsole.getCustomDeviceState(device_id);
```

### Escuchar Cambios de Estado

```javascript
airconsole.onCustomDeviceStateChange = function(device_id, custom_data) {
    if (custom_data.ready) {
        console.log('Dispositivo', device_id, 'está listo');
    }
};
```

## Estructura Recomendada del Controlador

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <title>Mi Juego - Controller</title>
    <script src="https://www.airconsole.com/api/airconsole-1.8.0.js"></script>
    <link rel="stylesheet" href="controller-styles.css">
</head>
<body>
    <div id="app">
        <!-- Vista de unirse -->
        <div id="join" class="view default-view">
            <button id="joinBtn">UNIRSE</button>
        </div>
        
        <!-- Vista de espera -->
        <div id="wait" class="view">
            <p>Esperando...</p>
        </div>
        
        <!-- Vista de juego -->
        <div id="game" class="view">
            <!-- Controles del juego -->
        </div>
        
        <!-- Vista de resultado -->
        <div id="result" class="view">
            <!-- Resultado de la ronda -->
        </div>
    </div>
    
    <script src="controller-app.js"></script>
</body>
</html>
```

## Patrones Comunes

### Patrón de Pantalla de Carga

```javascript
// Mostrar loading mientras se conecta
function showLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

airconsole.onReady = function() {
    hideLoading();
    // Continuar con la lógica
};
```

### Patrón de Confirmación de Acción

```javascript
function confirmAction(callback) {
    if (navigator.vibrate) navigator.vibrate(30);
    
    // Feedback visual
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 150);
    
    callback();
}
```

### Patrón de Debounce para Inputs

```javascript
let lastInputTime = 0;
const INPUT_DELAY = 100; // ms

function handleInput(action) {
    const now = Date.now();
    if (now - lastInputTime < INPUT_DELAY) return;
    lastInputTime = now;
    
    // Procesar input
    sendMessage({ action: action });
}
```

## Recursos

- Documentación API: https://developers.airconsole.com/
- Controles predefinidos: https://github.com/AirConsole/airconsole-controls
- API Events: https://github.com/AirConsole/airconsole-events
- View Manager: https://github.com/AirConsole/airconsole-view-manager
