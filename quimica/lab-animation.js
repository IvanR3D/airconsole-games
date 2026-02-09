// ============================================
// LAB ANIMATION - Schema Animation
// Adapted for Quimica Game (STEAM RD)
// ============================================

// Colores del juego STEAM RD
const colorStr = '#393A39';
const colorGd = '#EB8225';  // Naranja STEAM
const colorGr = '#AB3D8B';  // Morado STEAM  
const colorDv = '#0595AE';  // Turquesa STEAM
const colorVerde = '#73A03F'; // Verde STEAM

let labAnimationInitialized = false;
let labAnimationRunning = false; // Flag para evitar múltiples inicializaciones durante la animación
let S, S2;
let circleFumeeLoop_stop = true;
let gradient_anim_pause = true;
let gradient_anim_level = 0;
let ballon_anim_stop = true;
let bocal_anim_stop = true;
let flamme_anim_stop = true;
let goutte_anim_stop = true;
let nbrCircle = 0;
let goCircle = false;
let circleFumee = [];
let svgContent = '';
let animationTimeouts = []; // Para limpiar timeouts pendientes

function initLabAnimation() {
  if (labAnimationInitialized || labAnimationRunning) return;
  if (typeof Raphael === 'undefined') {
    console.log('Lab animation: waiting for Raphael...');
    return;
  }
  
  const container = document.getElementById('canvas_container');
  const lineBack = document.getElementById('canvas_line_back');
  const svgLine = document.getElementById('svg_line');
  
  if (!container || !lineBack || !svgLine) {
    console.log('Lab animation: waiting for containers...');
    return;
  }
  
  labAnimationInitialized = true;
  labAnimationRunning = true;
  initSVGLines();
}

function initSVGLines() {
  const svgLine = document.getElementById('svg_line');
  if (!svgLine) return;
  
  svgLine.style.visibility = 'visible';
  
  // Inicializar líneas SVG con stroke-dasharray
  const lines = [
    { id: 'line1', animId: 'a1' },
    { id: 'line2', animId: 'a2' },
    { id: 'line3', animId: 'a3' },
    { id: 'line4', animId: 'a4' },
    { id: 'line5', animId: 'a5' },
    { id: 'line6', animId: 'a6' }
  ];
  
  lines.forEach(({ id, animId }) => {
    const path = document.getElementById(id);
    const anim = document.getElementById(animId);
    if (path && anim) {
      const length = Math.round(path.getTotalLength());
      path.setAttribute('stroke-dasharray', `${length},${length}`);
      path.setAttribute('stroke-dashoffset', length.toString());
      anim.setAttribute('from', length.toString());
    }
  });
  
  // Inicializar Raphael solo si no existe
  initRaphaelElements();
}

function initRaphaelElements() {
  const container = document.getElementById('canvas_container');
  const lineBack = document.getElementById('canvas_line_back');
  
  if (!container || !lineBack) return;
  
  // Limpiar instancias de Raphael existentes
  if (S) {
    S.clear();
    S.remove();
    S = null;
  }
  if (S2) {
    S2.clear();
    S2.remove();
    S2 = null;
  }
  
  // Limpiar contenedores antes de crear nuevos elementos
  container.innerHTML = '';
  lineBack.innerHTML = '';
  
  S = new Raphael(container, 500, 600);
  S2 = new Raphael(lineBack, 500, 400);
  
  // Líneas de fondo
  S2.path('M80.193,227.11v-48.02c0-2.209,1.869-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v24.54h0.068c0,3.927,3.184,7.111,7.111,7.111s7.111-3.184,7.111-7.111l-0.097-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111l-0.029-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.442c0-3.928,3.184-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.141,38.442c0,3.927,3.184,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.165v-1.125c0-2.209,1.87-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v112.188').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S2.path('M259.73,317.604L300.209,277.125L300.304,277.061L314.467,277.125L315.262,277.125L331.936,293.8').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S2.path('M364.125,266.366L364.125,46.667L371.729,39.062L463,54L463,66.667').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});

  // Fiola 1
  S.path('M87.257,262.388v-29.317H75.132v29.317c-11.991,2.752-20.938,13.482-20.938,26.308c0,14.912,12.088,27,27,27s27-12.088,27-27C108.195,275.87,99.248,265.14,87.257,262.388z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M69.82 233.071L92.57 233.071').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.circle(28.445, 243.489, 4.313).attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});
  S.circle(14.093, 257.792, 4.313).attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});
  S.path('M17.143 254.792L25.396 246.539').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M32.757 243.491L92.57 243.491').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M14.078 262.153L14.078 382.696').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M6.58 382.696L119.414 382.696').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M89.017 382.849L103.368 368.497').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M66.997 382.849L52.646 368.497').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M88.382,232.071c0,0.552-0.448,1-1,1H75.007c-0.552,0-1-0.448-1-1v-6.812c0-0.552,0.448-1,1-1h12.375c0.552,0,1,0.448,1,1V232.071z').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});

  // Fiola 2
  S.path('M276.131,370.712L276,370.548l-25.169-38.505l10.379-10.379c0.854-0.853,0.854-2.236,0-3.089l-3.089-3.089c-0.854-0.853-2.236-0.853-3.089,0l-7.479,7.48v-24.939h4.411c1.206,0,2.185-0.979,2.185-2.184v-5.43c0-1.206-0.979-2.184-2.185-2.184H215.38c-1.206,0-2.185,0.978-2.185,2.184v5.43c0,1.206,0.979,2.184,2.185,2.184h3.7v29l-28.447,43.521l-0.131,0.164c-2.217,2.902-1.999,7.068,0.654,9.721c1.529,1.529,3.562,2.25,5.566,2.16l0.115,0.008h72.958l0.114-0.008c2.004,0.09,4.037-0.631,5.567-2.16C278.131,377.78,278.348,373.614,276.131,370.712z').attr({fill: '#ffffff', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M244.198,288.229L251.115,275.335L217.018,275.335L223.691,288.229').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M243.393,242.639c0,1.205-1.344,2.182-3,2.182h-14.625c-1.656,0-3-0.978-3-2.182v-10.636c0-1.206,1.344-2.182,3-2.182h14.625c1.656,0,3,0.977,3,2.182V242.639z').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.circle(227.039, 281.782, 0.125).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3});
  S.circle(235.746, 277.363, 0.125).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3});
  S.circle(237.79, 284.534, 0.125).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3});
  S.path('M242.021,292.96L242.021,300.332L225.367,300.332L225.367,292.96').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});

  // Fiola 3
  S.path('M396.723 382.601L411.408 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M370.613,275.229L375.33,266.437L352.08,266.437L356.631,275.229').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M369.59,288.19v-12.855h-12.125v12.855c-5.926,1.36-11.102,4.672-14.827,9.218l-5.45-5.451c-1.172-1.171-3.072-1.171-4.243,0l-2.829,2.829c-1.171,1.171-1.171,3.071,0,4.243l7.602,7.601c-0.76,2.492-1.189,5.127-1.189,7.868c0,14.912,12.088,27,27,27c14.911,0,27-12.088,27-27C390.527,301.672,381.58,290.943,369.59,288.19z').attr({fill: '#ffffff', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M315.83 382.601L330.516 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M390.179 318.883L403.283 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M337.065 319.883L323.973 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});

  // Fiola 4
  S.path('M469.018,111.649L472.952,104.314L453.556,104.314L457.353,111.649').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M457.045,93.902v9.836h12.416v-9.835c4.424-2.262,7.459-6.854,7.459-12.165c0-7.548-6.119-13.667-13.666-13.667c-7.548,0-13.667,6.119-13.667,13.667C449.587,87.048,452.621,91.64,457.045,93.902z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.circle(451.451, 284.533, 4.312).attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});
  S.path('M493.42,156.981c0-13.743-9.193-25.331-21.763-28.971v-15.695h-16.806v15.695c-12.57,3.64-21.764,15.228-21.764,28.971c0,14.011,9.553,25.788,22.5,29.18v77.82c0,3.365,2.171,6.216,5.187,7.248h-0.001l2.48,27.043l2.479-27.043c3.015-1.032,5.187-3.883,5.187-7.248v-77.819h-0.003C483.865,182.771,493.42,170.993,493.42,156.981z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M456.598 284.533L471.283 284.533').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 205.294L462.58 205.294').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 214.238L462.58 214.238').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 223.181L462.58 223.181').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 232.125L462.58 232.125').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 241.068L462.58 241.068').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 250.011L462.58 250.011').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M472.472,315.291v15.5l16,45.834c0,0,3.167,7-5,7s-19.667,0-19.667,0h0.271c0,0-11.5,0-19.667,0s-5-7-5-7l16-45.834v-15.5l-4.542-6.874h25.25L472.472,315.291z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});

  // Elementos animados
  const flamme = S.path('M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,11.247-4.142,10.438,1.193C8.973,10.873,19.269,16.969,18.999,22.168z').attr({fill: colorGd, stroke: 'none', transform: 't68,342'});
  const flamme2 = S.path('M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,11.247-4.142,10.438,1.193C8.973,10.873,19.269,16.969,18.999,22.168z').attr({fill: colorGd, stroke: 'none', transform: 't72,342s0.5,0.5'});
  
  const ballon1 = S.path('M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0-0.072,1.122-6.592,1.668C28.3,4.207,25.048,4.267,21.339,3.28c-4.438-0.662-4.914-2.184-10.216-2.807c-4.18-0.491-9.639,1.609-9.639,1.609C0.526,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007').attr({fill: colorGr, stroke: 'none', transform: 't60,280'});
  const ballon2 = S.path('M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0-0.072,1.122-6.592,1.668C28.3,4.207,25.048,4.267,21.339,3.28c-4.438-0.662-4.914-2.184-10.216-2.807c-4.18-0.491-9.639,1.609-9.639,1.609C0.526,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007').attr({fill: colorDv, stroke: 'none', transform: 't343,305'});
  const ballon3 = S.path('M43.67,6.488c0-2.051-0.284-4.035-0.812-5.917c-0.209-0.743-5.432-0.002-10.465,0.066c-4.731,0.064-6.154,0.26-10.559,0.26s-4.231-0.169-10.559-0.26C6.544,0.57,1.714-0.167,0.949,0.101C0.461,1.915,0,4.52,0,6.488c0,12.059,9.776,21.835,21.834,21.835C33.894,28.323,43.67,18.547,43.67,6.488').attr({fill: colorGd, stroke: 'none', transform: 't441,151s1.1'});
  
  const fiole1 = S.path('M470.033,342.1l10.641,30.48c0,0,2.106,4.655-3.324,4.655c-5.432,0-13.08,0-13.08,0h0.182c0,0-7.648,0-13.08,0c-5.431,0-3.324-4.655-3.324-4.655l10.64-30.48H470.033z').attr({fill: '90-' + colorGd + '-' + colorGd + ':0-#fff:1-#fff', stroke: 'none'});
  const fiole2 = S.path('M254.438,349.984l10.767,16.471l0.096,0.121c1.635,2.139,1.474,5.211-0.482,7.167c-1.128,1.127-2.626,1.659-4.104,1.593l-0.084,0.006h-53.787l-0.084-0.006c-1.478,0.066-2.976-0.465-4.104-1.593c-1.956-1.956-2.117-5.028-0.482-7.167l0.096-0.121l10.76-16.459L254.438,349.984z').attr({fill: colorGr, stroke: 'none'});
  
  const goutte2 = S.path('M34.424,18.917c0,1.519-1.231,2.749-2.75,2.749c-1.518,0-2.749-1.23-2.749-2.749c0,0,0.769-4.57,2.749-6.551C32.564,13.983,34.424,17.862,34.424,18.917z').attr({fill: 'none', stroke: 'none', transform: 't431,60'});
  const goutte3 = S.path('M34.424,18.917c0,1.519-1.231,2.749-2.75,2.749c-1.518,0-2.749-1.23-2.749-2.749c0,0,0.769-4.57,2.749-6.551C32.564,13.983,34.424,17.862,34.424,18.917z').attr({fill: 'none', stroke: 'none', transform: 't431,60'});
  const goutte4 = S.path('M34.424,18.917c0,1.519-1.231,2.749-2.75,2.749c-1.518,0-2.749-1.23-2.749-2.749c0,0,0.769-4.57,2.749-6.551C32.564,13.983,34.424,17.862,34.424,18.917z').attr({fill: 'none', stroke: 'none', transform: 't431,60'});

  // Elementos adicionales
  S.path('M331.516 319.883L396.08 319.883').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.rect(229.6, 300.332, 8.19, 59.335).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});

  // Iniciar animaciones
  circleFumeeLoop(72, 280, colorGr);
  bocal_anim(ballon1);
  bocal_anim(ballon2);
  flamme_anim(flamme);
  flamme_anim(flamme2);
  
  // Timeline de animación
  startAnimationTimeline(fiole2, ballon2, ballon3, goutte2, goutte3, goutte4, fiole1, flamme, flamme2, ballon1);
}

// Animación de humo/burbujas
function circleFumeeLoop(posX, posY, color) {
  if (!circleFumeeLoop_stop || !S || !labAnimationRunning) return;
  
  setTimeout(() => {
    if (!labAnimationRunning || !S) return; // Verificar de nuevo dentro del timeout
    
    const x = Math.floor(Math.random() * 20 + posX);
    const y = posY;
    const diam = Math.floor(Math.random() * 3 + 2);
    
    try {
      circleFumee[nbrCircle] = S.circle(x, y, diam).attr({fill: color, stroke: 'none'});
      circleFumee[nbrCircle].animate({transform: 't0,-10'}, 400);
      circleFumee[nbrCircle].animate({opacity: '0'}, 400);
      nbrCircle++;
      
      if (circleFumee[nbrCircle - 5] && !goCircle) {
        circleFumee[nbrCircle - 5].remove();
      } else if (goCircle) {
        circleFumee[10 - nbrCircle]?.remove();
      }
      
      if (nbrCircle === 10) {
        nbrCircle = 0;
        goCircle = true;
      }
      
      if (nbrCircle < 10 && labAnimationRunning) {
        circleFumeeLoop(posX, posY, color);
      }
    } catch (e) {
      // Ignorar errores si Raphael fue limpiado
    }
  }, 100);
}


// Animación de balón/líquido
function bocal_anim(e) {
  const time = 500;
  
  const paths = [
    'M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0-0.072,1.122-6.592,1.668C28.3,4.207,25.048,4.267,21.339,3.28c-4.438-0.662-4.914-2.184-10.216-2.807c-4.18-0.491-9.639,1.609-9.639,1.609C0.526,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007',
    'M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0-0.072,1.122-6.592,1.668C28.3,4.207,25.048,2.267,21.339,1.28c-4.438-0.662-4.792-0.418-10.216-0.807C6.926,0.172,1.485,2.082,1.485,2.082C0.527,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007',
    'M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0,0.063-0.011-6.464-0.453c-5.5-0.373-8.083-0.535-12.546-0.349c-4.444,0.137-4.102,0.599-10.204,1.349c-4.177,0.514-9.65-0.547-9.65-0.547C0.527,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007',
    'M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0,0.21-1.219-6.317-1.662c-5.5-0.373-8.146,0.22-12.646,1.292c-4.001,0.667-3.834,1.417-10.084,1.667C7.097,3.547,1.485,2.082,1.485,2.082C0.527,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007',
    'M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0,0.147-0.928-6.38-1.37c-5.5-0.373-8.12,0.814-12.583,1c-4.444,0.137-4.148,0.167-10.251,0.917c-4.177,0.514-9.65-0.547-9.65-0.547C0.527,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007'
  ];
  
  let currentIndex = 0;
  
  function animate() {
    if (!bocal_anim_stop || !labAnimationRunning) return;
    currentIndex = (currentIndex + 1) % paths.length;
    try {
      e.animate({path: paths[currentIndex]}, time, animate);
    } catch (err) {}
  }
  
  animate();
}

// Animación de llama
function flamme_anim(e) {
  if (!flamme_anim_stop || !labAnimationRunning) return;
  
  const time = 100;
  const paths = [
    'M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,11.247-4.142,10.438,1.193C8.973,10.873,19.269,16.969,18.999,22.168z',
    'M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,8.747-2.215,7.938,3.119C6.473,12.799,19.269,16.969,18.999,22.168z',
    'M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,10.311,1.701,9.502,7.036C8.036,16.716,19.269,16.969,18.999,22.168z',
    'M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,12.938-1.131,11.188,2.869C7.265,11.838,19.269,16.969,18.999,22.168z'
  ];
  
  let currentIndex = 0;
  
  function animate() {
    if (!flamme_anim_stop || !labAnimationRunning) return;
    currentIndex = (currentIndex + 1) % paths.length;
    try {
      e.animate({path: paths[currentIndex]}, time, animate);
    } catch (err) {}
  }
  
  animate();
}

// Animación de gota
function goutte_anim(e, dec) {
  function first() {
    if (!labAnimationRunning) return;
    try {
      e.animate({transform: 't431,60'}, dec, firstbis);
    } catch (err) {}
  }
  
  function firstbis() {
    if (goutte_anim_stop && labAnimationRunning) {
      try {
        e.animate({transform: 't431,160'}, 1350, second);
      } catch (err) {}
    }
  }
  
  function second() {
    if (!labAnimationRunning) return;
    try {
      e.animate({transform: 't431,60'}, 0, firstbis);
    } catch (err) {}
  }
  
  first();
}

// Animación de gradiente (botella se llena en ~2s para que la animación acabe antes del card)
function gradient_anim(e) {
  gradient_anim_level = 0;
  const stepMs = 40;
  const stepCount = 50;
  let step = 0;
  const timerGradient = setInterval(() => {
    if (!labAnimationRunning) {
      clearInterval(timerGradient);
      return;
    }
    
    try {
      const level = Math.min(100, Math.round((step / stepCount) * 100));
      const gradient = '90-' + colorGd + '-' + colorGd + ':' + level + '-#fff:' + (level + 1) + '#fff';
      e.animate({fill: gradient}, 0);
      gradient_anim_level = level;
      
      step++;
      if (step >= stepCount || level >= 100) {
        gradient_anim_level = 100;
        clearInterval(timerGradient);
      }
    } catch (err) {
      clearInterval(timerGradient);
    }
  }, stepMs);
}

// Animación de balón 3
function ballon_anim(e) {
  const paths = [
    'M43.67,6.488c0-2.051-0.284-4.035-0.812-5.917c-0.209-0.743-5.432-0.002-10.465,0.066c-4.731,0.064-6.154,0.26-10.559,0.26s-4.231-0.169-10.559-0.26C6.544,0.57,1.714-0.167,0.949,0.101C0.461,1.915,0,4.52,0,6.488c0,12.059,9.776,21.835,21.834,21.835C33.894,28.323,43.67,18.547,43.67,6.488',
    'M43.67,7.008c0-2.051-0.284-4.035-0.812-5.917c-0.209-0.743-6.158,1.028-10.465-0.934c-4.306-1.962-6.154,1.26-10.559,1.26s-6.252-3.222-10.559-1.26C6.97,2.119,0.97,0.497,0.748,1.319C0.26,3.133,0,5.04,0,7.008c0,12.059,9.776,21.835,21.834,21.835C33.894,28.843,43.67,19.066,43.67,7.008',
    'M43.67,7.226c0-2.051-0.283-4.035-0.812-5.917c-0.209-0.743-6.158,1.028-10.465-0.934c-4.305-1.962-6.154,1.26-10.558,1.26c-4.404,0-6.252-3.222-10.559-1.26C6.97,2.337,0.97,0.714,0.749,1.537C0.26,3.351,0,5.257,0,7.226c0,12.058,9.776,21.835,21.834,21.835C33.895,29.061,43.67,19.283,43.67,7.22',
    'M43.67,7.007c0-2.467-0.41-4.837-1.164-7.049c-0.121-0.354-8.807,2.16-13.113,0.198c-4.306-1.962-3.154,1.26-7.559,1.26s-3.252-3.222-7.559-1.26C9.97,2.118,1.18-0.11,1.021,0.392C0.357,2.478,0,4.7,0,7.007c0,12.059,9.776,21.836,21.834,21.836C33.894,28.843,43.67,19.065,43.67,7.007c0-2.565-0.442-5.027-1.256-7.314',
    'M43.67,7.312c0-2.861-0.551-5.593-1.552-8.095c0,0-5.419,3.207-9.726,1.244c-4.306-1.962-6.154,1.26-10.559,1.26s-6.252-3.222-10.559-1.26C6.97,2.424,1.55-0.783,1.55-0.783C0.55,1.72,0,4.452,0,7.312c0,12.059,9.776,21.835,21.834,21.835C33.894,29.147,43.67,19.371,43.67,7.312c0-2.566-0.442-5.028-1.256-7.314'
  ];
  
  let currentIndex = 0;
  
  function animate() {
    if (!ballon_anim_stop || !labAnimationRunning) return;
    currentIndex = (currentIndex + 1) % paths.length;
    try {
      e.animate({path: paths[currentIndex]}, 100, animate);
    } catch (err) {}
  }
  
  animate();
}


// Timeline principal de animación (velocidad normal)
function startAnimationTimeline(fiole2, ballon2, ballon3, goutte2, goutte3, goutte4, fiole1, flamme, flamme2, ballon1) {
  // Usar velocidad rápida por defecto para el juego
  startFastAnimationTimeline(fiole2, ballon2, ballon3, goutte2, goutte3, goutte4, fiole1, flamme, flamme2, ballon1);
}

// Timeline de animación RÁPIDA (para mostrar resultados)
function startFastAnimationTimeline(fiole2, ballon2, ballon3, goutte2, goutte3, goutte4, fiole1, flamme, flamme2, ballon1) {
  // Limpiar timeouts anteriores
  animationTimeouts.forEach(t => clearTimeout(t));
  animationTimeouts = [];
  
  // Los colores se mantienen estáticos: morado, turquesa, naranja
  
  // Burbujas en el matraz izquierdo (morado) - ballon1
  circleFumeeLoop(72, 280, colorGr);
  
  // Burbujas en el matraz central (morado) - fiole2
  setTimeout(() => {
    if (labAnimationRunning) circleFumeeLoop(225, 350, colorGr);
  }, 200);
  
  // Burbujas en el matraz derecho (turquesa) - ballon2
  setTimeout(() => {
    if (labAnimationRunning) circleFumeeLoop(355, 305, colorDv);
  }, 400);
  
  // Gotas cayendo al matraz inferior derecho (fiole1)
  animationTimeouts.push(setTimeout(() => {
    if (!labAnimationRunning) return;
    goutte_anim_stop = true;
    goutte2.attr({fill: colorGd});
    goutte3.attr({fill: colorGd});
    goutte4.attr({fill: colorGd});
    goutte_anim(goutte2, 150);
    goutte_anim(goutte3, 300);
    goutte_anim(goutte4, 0);
  }, 500));
  
  // Animación de llenado del matraz inferior derecho (fiole1)
  animationTimeouts.push(setTimeout(() => {
    if (!labAnimationRunning) return;
    gradient_anim_pause = true;
    gradient_anim(fiole1);
  }, 800));
  
  // Las animaciones de líquido ondulando ya están activas desde initRaphaelElements
}

// Resetear estado de animación
function resetAnimationState(goutte2, goutte3, goutte4) {
  goutte_anim_stop = false;
  gradient_anim_pause = false;
  ballon_anim_stop = false;
  goutte2?.attr({fill: 'none'});
  goutte3?.attr({fill: 'none'});
  goutte4?.attr({fill: 'none'});
  circleFumeeLoop_stop = false;
}

// Funciones de control para integración con el juego
function pauseLabAnimation() {
  labAnimationRunning = false;
  circleFumeeLoop_stop = false;
  bocal_anim_stop = false;
  flamme_anim_stop = false;
  ballon_anim_stop = false;
  goutte_anim_stop = false;
}

function resumeLabAnimation() {
  labAnimationRunning = true;
  circleFumeeLoop_stop = true;
  bocal_anim_stop = true;
  flamme_anim_stop = true;
  ballon_anim_stop = true;
  goutte_anim_stop = true;
}

// Inicializar el laboratorio de forma estática (solo dibujo, sin animaciones)
function initStaticLabAnimation() {
  if (typeof Raphael === 'undefined') {
    console.log('Lab animation: waiting for Raphael...');
    return;
  }
  
  const container = document.getElementById('canvas_container');
  const lineBack = document.getElementById('canvas_line_back');
  const svgLine = document.getElementById('svg_line');
  
  if (!container || !lineBack || !svgLine) {
    console.log('Lab animation: waiting for containers...');
    return;
  }
  
  // Limpiar instancias anteriores
  if (S) {
    try { S.clear(); S.remove(); } catch (e) {}
    S = null;
  }
  if (S2) {
    try { S2.clear(); S2.remove(); } catch (e) {}
    S2 = null;
  }
  
  container.innerHTML = '';
  lineBack.innerHTML = '';
  
  // Resetear flags - todo pausado
  labAnimationInitialized = false;
  labAnimationRunning = false;
  circleFumeeLoop_stop = false;
  gradient_anim_pause = false;
  ballon_anim_stop = false;
  bocal_anim_stop = false;
  flamme_anim_stop = false;
  goutte_anim_stop = false;
  gradient_anim_level = 0;
  nbrCircle = 0;
  goCircle = false;
  circleFumee = [];
  
  svgLine.style.visibility = 'visible';
  
  // Inicializar líneas SVG
  const lines = [
    { id: 'line1', animId: 'a1' },
    { id: 'line2', animId: 'a2' },
    { id: 'line3', animId: 'a3' },
    { id: 'line4', animId: 'a4' },
    { id: 'line5', animId: 'a5' },
    { id: 'line6', animId: 'a6' }
  ];
  
  lines.forEach(({ id, animId }) => {
    const path = document.getElementById(id);
    const anim = document.getElementById(animId);
    if (path && anim) {
      const length = Math.round(path.getTotalLength());
      path.setAttribute('stroke-dasharray', `${length},${length}`);
      path.setAttribute('stroke-dashoffset', length.toString());
      anim.setAttribute('from', length.toString());
    }
  });
  
  // Crear elementos de Raphael (estáticos)
  S = new Raphael(container, 500, 600);
  S2 = new Raphael(lineBack, 500, 400);
  
  // Líneas de fondo
  S2.path('M80.193,227.11v-48.02c0-2.209,1.869-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v24.54h0.068c0,3.927,3.184,7.111,7.111,7.111s7.111-3.184,7.111-7.111l-0.097-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111l-0.029-38.442c0-3.928,3.185-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.142,38.442c0,3.927,3.185,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.442c0-3.928,3.184-7.112,7.112-7.112c3.927,0,7.111,3.184,7.111,7.112l-0.141,38.442c0,3.927,3.184,7.111,7.112,7.111c3.927,0,7.111-3.184,7.111-7.111v-38.165v-1.125c0-2.209,1.87-4,4.176-4h18.648c2.306,0,4.176,1.791,4.176,4v14.625v112.188').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S2.path('M259.73,317.604L300.209,277.125L300.304,277.061L314.467,277.125L315.262,277.125L331.936,293.8').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S2.path('M364.125,266.366L364.125,46.667L371.729,39.062L463,54L463,66.667').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});

  // Fiola 1
  S.path('M87.257,262.388v-29.317H75.132v29.317c-11.991,2.752-20.938,13.482-20.938,26.308c0,14.912,12.088,27,27,27s27-12.088,27-27C108.195,275.87,99.248,265.14,87.257,262.388z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M69.82 233.071L92.57 233.071').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.circle(28.445, 243.489, 4.313).attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});
  S.circle(14.093, 257.792, 4.313).attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});
  S.path('M17.143 254.792L25.396 246.539').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M32.757 243.491L92.57 243.491').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M14.078 262.153L14.078 382.696').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M6.58 382.696L119.414 382.696').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M89.017 382.849L103.368 368.497').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M66.997 382.849L52.646 368.497').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M88.382,232.071c0,0.552-0.448,1-1,1H75.007c-0.552,0-1-0.448-1-1v-6.812c0-0.552,0.448-1,1-1h12.375c0.552,0,1,0.448,1,1V232.071z').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});

  // Fiola 2
  S.path('M276.131,370.712L276,370.548l-25.169-38.505l10.379-10.379c0.854-0.853,0.854-2.236,0-3.089l-3.089-3.089c-0.854-0.853-2.236-0.853-3.089,0l-7.479,7.48v-24.939h4.411c1.206,0,2.185-0.979,2.185-2.184v-5.43c0-1.206-0.979-2.184-2.185-2.184H215.38c-1.206,0-2.185,0.978-2.185,2.184v5.43c0,1.206,0.979,2.184,2.185,2.184h3.7v29l-28.447,43.521l-0.131,0.164c-2.217,2.902-1.999,7.068,0.654,9.721c1.529,1.529,3.562,2.25,5.566,2.16l0.115,0.008h72.958l0.114-0.008c2.004,0.09,4.037-0.631,5.567-2.16C278.131,377.78,278.348,373.614,276.131,370.712z').attr({fill: '#ffffff', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M244.198,288.229L251.115,275.335L217.018,275.335L223.691,288.229').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M243.393,242.639c0,1.205-1.344,2.182-3,2.182h-14.625c-1.656,0-3-0.978-3-2.182v-10.636c0-1.206,1.344-2.182,3-2.182h14.625c1.656,0,3,0.977,3,2.182V242.639z').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.circle(227.039, 281.782, 0.125).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3});
  S.circle(235.746, 277.363, 0.125).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3});
  S.circle(237.79, 284.534, 0.125).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3});
  S.path('M242.021,292.96L242.021,300.332L225.367,300.332L225.367,292.96').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});

  // Fiola 3
  S.path('M396.723 382.601L411.408 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M370.613,275.229L375.33,266.437L352.08,266.437L356.631,275.229').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M369.59,288.19v-12.855h-12.125v12.855c-5.926,1.36-11.102,4.672-14.827,9.218l-5.45-5.451c-1.172-1.171-3.072-1.171-4.243,0l-2.829,2.829c-1.171,1.171-1.171,3.071,0,4.243l7.602,7.601c-0.76,2.492-1.189,5.127-1.189,7.868c0,14.912,12.088,27,27,27c14.911,0,27-12.088,27-27C390.527,301.672,381.58,290.943,369.59,288.19z').attr({fill: '#ffffff', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M315.83 382.601L330.516 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M390.179 318.883L403.283 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M337.065 319.883L323.973 382.601').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});

  // Fiola 4
  S.path('M469.018,111.649L472.952,104.314L453.556,104.314L457.353,111.649').attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M457.045,93.902v9.836h12.416v-9.835c4.424-2.262,7.459-6.854,7.459-12.165c0-7.548-6.119-13.667-13.666-13.667c-7.548,0-13.667,6.119-13.667,13.667C449.587,87.048,452.621,91.64,457.045,93.902z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.circle(451.451, 284.533, 4.312).attr({fill: colorGd, stroke: colorStr, 'stroke-width': 3});
  S.path('M493.42,156.981c0-13.743-9.193-25.331-21.763-28.971v-15.695h-16.806v15.695c-12.57,3.64-21.764,15.228-21.764,28.971c0,14.011,9.553,25.788,22.5,29.18v77.82c0,3.365,2.171,6.216,5.187,7.248h-0.001l2.48,27.043l2.479-27.043c3.015-1.032,5.187-3.883,5.187-7.248v-77.819h-0.003C483.865,182.771,493.42,170.993,493.42,156.981z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.path('M456.598 284.533L471.283 284.533').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 205.294L462.58 205.294').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 214.238L462.58 214.238').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 223.181L462.58 223.181').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 232.125L462.58 232.125').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 241.068L462.58 241.068').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M455.74 250.011L462.58 250.011').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});
  S.path('M472.472,315.291v15.5l16,45.834c0,0,3.167,7-5,7s-19.667,0-19.667,0h0.271c0,0-11.5,0-19.667,0s-5-7-5-7l16-45.834v-15.5l-4.542-6.874h25.25L472.472,315.291z').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round'});

  // Elementos estáticos (sin animación) - líquidos en los matraces
  S.path('M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0-0.072,1.122-6.592,1.668C28.3,4.207,25.048,4.267,21.339,3.28c-4.438-0.662-4.914-2.184-10.216-2.807c-4.18-0.491-9.639,1.609-9.639,1.609C0.526,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007').attr({fill: colorGr, stroke: 'none', transform: 't60,280'});
  S.path('M41.833,9.837c0-2.741-0.527-5.357-1.484-7.755c0,0-0.072,1.122-6.592,1.668C28.3,4.207,25.048,4.267,21.339,3.28c-4.438-0.662-4.914-2.184-10.216-2.807c-4.18-0.491-9.639,1.609-9.639,1.609C0.526,4.479,0,7.096,0,9.837c0,11.552,9.365,20.917,20.917,20.917S41.833,21.389,41.833,9.837c0-2.458-0.424-4.816-1.203-7.007').attr({fill: colorDv, stroke: 'none', transform: 't343,305'});
  S.path('M43.67,6.488c0-2.051-0.284-4.035-0.812-5.917c-0.209-0.743-5.432-0.002-10.465,0.066c-4.731,0.064-6.154,0.26-10.559,0.26s-4.231-0.169-10.559-0.26C6.544,0.57,1.714-0.167,0.949,0.101C0.461,1.915,0,4.52,0,6.488c0,12.059,9.776,21.835,21.834,21.835C33.894,28.323,43.67,18.547,43.67,6.488').attr({fill: colorGd, stroke: 'none', transform: 't441,151s1.1'});
  
  // Fiolas con líquido estático
  S.path('M254.438,349.984l10.767,16.471l0.096,0.121c1.635,2.139,1.474,5.211-0.482,7.167c-1.128,1.127-2.626,1.659-4.104,1.593l-0.084,0.006h-53.787l-0.084-0.006c-1.478,0.066-2.976-0.465-4.104-1.593c-1.956-1.956-2.117-5.028-0.482-7.167l0.096-0.121l10.76-16.459L254.438,349.984z').attr({fill: colorGr, stroke: 'none'});

  // Elementos adicionales
  S.path('M331.516 319.883L396.08 319.883').attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  S.rect(229.6, 300.332, 8.19, 59.335).attr({fill: 'none', stroke: colorStr, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round'});
  
  // Llama estática
  S.path('M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,11.247-4.142,10.438,1.193C8.973,10.873,19.269,16.969,18.999,22.168z').attr({fill: colorGd, stroke: 'none', transform: 't68,342'});
  S.path('M18.999,22.168c-0.269,5.197-4.323,9.032-9.711,8.754c-5.389-0.279-9.612-4.724-9.269-9.917C0.783,9.476,11.247-4.142,10.438,1.193C8.973,10.873,19.269,16.969,18.999,22.168z').attr({fill: colorGd, stroke: 'none', transform: 't72,342s0.5,0.5'});
  
  labAnimationInitialized = true;
  console.log('Lab animation initialized (static)');
}

// Iniciar las animaciones del laboratorio
function startLabAnimations() {
  if (!labAnimationInitialized || !S) {
    console.log('Lab not initialized, cannot start animations');
    return;
  }
  
  labAnimationRunning = true;
  circleFumeeLoop_stop = true;
  bocal_anim_stop = true;
  flamme_anim_stop = true;
  ballon_anim_stop = true;
  goutte_anim_stop = true;
  
  // Limpiar y recrear con animaciones
  const container = document.getElementById('canvas_container');
  const lineBack = document.getElementById('canvas_line_back');
  
  if (S) { try { S.clear(); S.remove(); } catch (e) {} S = null; }
  if (S2) { try { S2.clear(); S2.remove(); } catch (e) {} S2 = null; }
  
  container.innerHTML = '';
  lineBack.innerHTML = '';
  
  // Reinicializar con animaciones activas
  initRaphaelElements();
  
  console.log('Lab animations started');
}

function resetLabAnimation() {
  // Pausar todas las animaciones
  pauseLabAnimation();
  
  // Limpiar todos los timeouts pendientes
  animationTimeouts.forEach(t => clearTimeout(t));
  animationTimeouts = [];
  
  // Limpiar los contenedores de Raphael
  const container = document.getElementById('canvas_container');
  const lineBack = document.getElementById('canvas_line_back');
  
  if (container) container.innerHTML = '';
  if (lineBack) lineBack.innerHTML = '';
  
  // Limpiar referencias de Raphael
  if (S) {
    try {
      S.clear();
      S.remove();
    } catch (e) {}
    S = null;
  }
  if (S2) {
    try {
      S2.clear();
      S2.remove();
    } catch (e) {}
    S2 = null;
  }
  
  // Resetear estado
  labAnimationInitialized = false;
  labAnimationRunning = false;
  gradient_anim_level = 0;
  nbrCircle = 0;
  goCircle = false;
  circleFumee = [];
  
  // Resetear flags de animación
  circleFumeeLoop_stop = true;
  gradient_anim_pause = true;
  ballon_anim_stop = true;
  bocal_anim_stop = true;
  flamme_anim_stop = true;
  goutte_anim_stop = true;
}

// Auto-init deshabilitado - la animación se inicia manualmente cuando los jugadores contestan
// La inicialización se hace desde showLabAnimationInMixingZone() en screen-app.js

// Export para integración con el juego
window.labAnimation = {
  init: initLabAnimation,
  initStatic: initStaticLabAnimation,
  startAnimation: startLabAnimations,
  pause: pauseLabAnimation,
  resume: resumeLabAnimation,
  reset: resetLabAnimation
};
