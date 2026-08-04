# Solución: Módulos Vacíos en Cloudflare Pages

## Problema
El sistema se ejecutaba en Cloudflare Pages con GitHub, pero aunque había módulos creados en el archivo Excel (`data/sistema.xlsx`), el sistema no los mostraba (aparecía vacío).

## Causa Raíz
El sistema está diseñado para obtener datos de dos fuentes:
1. **API Backend** (`/api/gas/getDashboardModules`) - Para despliegues con Node.js
2. **Archivos JSON estáticos** (`/data/modules.json` y `/data/news.json`) - Para despliegues estáticos (Cloudflare Pages)

En Cloudflare Pages, no hay backend Node.js disponible, por lo que el frontend intenta cargar los archivos JSON estáticos. Sin embargo, estos archivos **no se estaban generando** antes del build, resultando en un array vacío de módulos.

## Solución Implementada

### 1. Script de Exportación
El script `scripts/export-sistema-data.ts` lee el archivo Excel y genera los archivos JSON:
- `public/data/modules.json` - Módulos del sistema
- `public/data/news.json` - Noticias
- `public/data/sistema-info.json` - Configuración

### 2. Actualización del Build
Se modificó `package.json` para ejecutar la exportación automáticamente:

```json
"scripts": {
  "export": "tsx scripts/export-sistema-data.ts",
  "build:pages": "npm run export && vite build"
}
```

Ahora, cada vez que se ejecuta `npm run build:pages` (comando usado por Cloudflare Pages):
1. Se exportan los datos del Excel a JSON
2. Se ejecuta el build de Vite
3. Los archivos JSON se copian automáticamente a `dist/data/`

## Cómo Funciona Ahora

### En Desarrollo Local
```bash
npm run dev
```
El servidor Node.js lee directamente del Excel usando las funciones API.

### En Cloudflare Pages
```bash
npm run build:pages
```
1. Exporta Excel → JSON
2. Build de Vite
3. Los archivos JSON están disponibles en `/data/modules.json`

### Actualizar Datos Manualmente
Si modificas el archivo Excel y quieres regenerar los JSON sin hacer un build completo:
```bash
npm run export
```

## Verificación

Para verificar que los módulos se exportaron correctamente:

```bash
# Ver contenido de modules.json
cat public/data/modules.json

# O después del build
cat dist/data/modules.json
```

Deberías ver un array con 3 módulos:
- Servicios Ciudadanos
- Gestión Institucional
- Transparencia y Control

## Despliegue en Cloudflare

Cuando hagas push a GitHub, Cloudflare Pages ejecutará automáticamente:
```bash
npm run build:pages
```

Y los módulos aparecerán correctamente en el sistema desplegado.

## Estructura de Datos

### Excel (data/sistema.xlsx)
- Hoja "Modulos": módulos principales
- Hoja "Submodulos": submódulos/servicios
- Hoja "SubSubModulos": opciones dentro de servicios
- Hoja "Noticias": noticias y comunicados
- Hoja "Configuracion": PINs y configuración

### JSON Generado
Los archivos JSON se generan en dos ubicaciones:
- `public/data/` - Para desarrollo y build de Vite
- `functions/_data/` - Para funciones de Cloudflare (si se usan)

## Resumen

✅ **Antes**: Excel → ❌ No se exportaba → Cloudflare Pages sin datos → Módulos vacíos  
✅ **Ahora**: Excel → ✅ Exportación automática → JSON en build → Módulos visibles

---

**Fecha de solución**: ${new Date().toLocaleDateString('es-CO')}
