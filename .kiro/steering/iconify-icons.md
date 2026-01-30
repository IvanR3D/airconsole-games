---
inclusion: fileMatch
fileMatchPattern: "quimica/**"
---

# Iconos con Iconify

Este proyecto usa **Iconify** para todos los iconos. 

## Cómo usar iconos

```html
<iconify-icon icon="mdi:flask"></iconify-icon>
```

## Reglas

1. **SIEMPRE** usar `<iconify-icon>` para iconos, nunca emojis ni SVGs inline
2. Preferir iconos de **Material Design Icons (mdi)** que ya se usan en el proyecto
3. Para estilos, usar clases de Tailwind o CSS inline:
   ```html
   <iconify-icon icon="mdi:atom" class="text-2xl text-blue-500"></iconify-icon>
   <iconify-icon icon="mdi:flask" style="color: #10b981; font-size: 24px;"></iconify-icon>
   ```

## Iconos ya usados en el proyecto

- `mdi:flask` - Matraz/frasco
- `mdi:atom` - Átomo
- `mdi:molecule` - Molécula
- `mdi:test-tube` - Tubo de ensayo
- `mdi:beaker` - Vaso de precipitados
- `mdi:water` - Agua
- `mdi:fire` - Fuego
- `mdi:trophy` - Trofeo
- `mdi:crown` - Corona
- `mdi:timer` - Temporizador
- `mdi:check-circle` - Éxito
- `mdi:close-circle` - Error
- `mdi:account-group` - Grupo de personas
- `mdi:rocket-launch` - Iniciar

## Buscar más iconos

Catálogo completo: https://icon-sets.iconify.design/mdi/
