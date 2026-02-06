---
inclusion: fileMatch
fileMatchPattern: "**/screen*.{js,html,css}"
---

# AirConsole Screen Development Guidelines

Este documento contiene las mejores prácticas para desarrollar la pantalla (screen) de juegos AirConsole.

## Resolución Base

- **Resolución TV estándar**: 960x540 (16:9)
- El juego debe escalar proporcionalmente a diferentes resoluciones
- Diseñar para esta resolución base y usar CSS responsive

## Viewport Meta Tag

```html
<meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
```

## CSS Base Requerido

```css
/* Prevenir interacciones no deseadas */
* {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
}

/* Contenedor principal */
html, body {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
}

/* Renderizado optimizado para TV */
body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
}
```

## Safe Area para TVs

Muchas TVs tienen "overscan" que corta los bordes. Usar un margen seguro del 5%:

```css
.screen {
    padding: max(2.5vh, 10px) max(2.5vw, 10px);
}

/* Para dispositivos con notch/safe-area */
@supports (padding: env(safe-area-inset-top)) {
    .screen {
        padding-top: max(env(safe-area-inset-top), 10px);
        padding-bottom: max(env(safe-area-inset-bottom), 10px);
        padding-left: max(env(safe-area-inset-left), 10px);
        padding-right: max(env(safe-area-inset-right), 10px);
    }
}
```

## Media Queries para Diferentes Pantallas

```css
/* TV estándar 960x540 */
@media (min-width: 900px) and (max-width: 1024px) and (min-height: 500px) and (max-height: 600px) {
    /* Estilos específicos para TV */
}

/* Aspect ratio 16:9 */
@media (aspect-ratio: 16/9) {
    /* Layout horizontal */
}

/* Pantallas ultrawide (21:9) */
@media (min-aspect-ratio: 2/1) {
    /* Ajustes para ultrawide */
}

/* Pantallas 4:3 */
@media (max-aspect-ratio: 4/3) {
    /* Layout más vertical */
}
```

## Sistema de Vistas

Usar el mismo patrón que el controller:

```html
<div id="intro" class="view default-view">Intro</div>
<div id="game" class="view">Juego</div>
<div id="results" class="view">Resultados</div>
```

```css
.view { display: none; }
.view.active { display: flex; }
```

## Legibilidad en TV

- Usar fuentes grandes (mínimo 16px base, escalable)
- Alto contraste entre texto y fondo
- Evitar texto pequeño o detalles finos
- Considerar que el usuario está a 2-3 metros de la pantalla

```css
body {
    font-size: clamp(12px, 1.5vw, 18px);
}

/* Elementos mínimos legibles */
.element-card,
.player-card,
.timer-ring {
    min-width: 50px;
    min-height: 50px;
}
```

## Contraste para TV SDR

```css
@media (dynamic-range: standard) {
    :root {
        --color-text: #0a0a1a;
        --color-text-light: #4a5568;
    }
    
    /* Bordes más gruesos para mejor visibilidad */
    .card {
        border-width: 3px;
    }
}
```

## Animaciones

- Usar animaciones suaves pero no excesivas
- Respetar preferencias de movimiento reducido
- Evitar parpadeos o cambios bruscos

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}
```

## Comunicación con Controllers

```javascript
// Enviar estado del juego a todos los controllers
airconsole.broadcast({
    action: 'gameStateUpdate',
    state: currentState,
    round: currentRound
});

// Enviar mensaje a un controller específico
airconsole.message(device_id, {
    action: 'playerUpdate',
    score: playerScore
});
```

## Manejo de Jugadores

```javascript
airconsole.onConnect = function(device_id) {
    // Nuevo jugador conectado
    updatePlayerSlots();
};

airconsole.onDisconnect = function(device_id) {
    // Jugador desconectado
    handlePlayerDisconnect(device_id);
};
```

## Recursos

- Checklist oficial: https://developers.airconsole.com/airconsole-checklist
- Documentación: https://developers.airconsole.com/
