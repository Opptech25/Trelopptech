# TrelOpptech - Sistema de Gestión de Proyectos

## 🚀 Características

- **Sistema de autenticación** con NIT y clave generada automáticamente
- **Multi-usuario**: Cada empresa tiene sus propios datos aislados
- **Gestión completa de proyectos** con subproyectos ilimitados
- **Tablero Kanban** con drag & drop para tareas
- **Sistema semáforo** para monitoreo automático del estado
- **5 columnas**: Por hacer, En curso, Completadas, Observaciones, Restricciones
- **Filtros avanzados** por cliente y estado
- **Dashboard con estadísticas** en tiempo real
- **Totalmente responsive** - funciona en móvil, tablet y desktop
- **100% local** - no requiere servidor, funciona con localStorage

## 📁 Archivos del proyecto

```
trelopptech/
├── index.html       # Página de inicio con login y registro
├── dashboard.html   # Aplicación principal
├── app.js          # Lógica de la aplicación
└── README.md       # Este archivo
```

## 🔧 Instalación

### Opción 1: Uso local
1. Descarga todos los archivos en una carpeta
2. Abre `index.html` en tu navegador
3. ¡Listo! La aplicación funcionará completamente

### Opción 2: Despliegue en la nube (GitHub Pages, Netlify, Vercel)

#### GitHub Pages:
1. Sube los archivos a un repositorio de GitHub
2. Ve a Settings → Pages
3. Selecciona la rama y carpeta
4. Tu app estará en `https://tuusuario.github.io/trelopptech`

#### Netlify:
1. Arrastra la carpeta a netlify.com/drop
2. Tu app estará lista en segundos
3. URL: `https://tu-app.netlify.app`

#### Vercel:
1. Conecta tu repositorio en vercel.com
2. Despliega automáticamente
3. URL: `https://tu-app.vercel.app`

## 📖 Guía de uso

### 1. Registro
- Ingresa el nombre de tu empresa, NIT y email
- El sistema generará automáticamente una clave segura
- **IMPORTANTE**: Guarda la clave generada

### 2. Inicio de sesión
- Ingresa tu NIT y la clave generada
- Accede a tu dashboard personalizado

### 3. Crear proyectos
- Click en "+ Proyecto"
- Completa: nombre, cliente (opcional), fechas, observaciones y restricciones
- Los proyectos aparecen en el menú lateral izquierdo

### 4. Crear subproyectos
- Selecciona un proyecto
- Click en "📁 Subproyecto"
- Los subproyectos se muestran anidados debajo del proyecto padre

### 5. Gestionar tareas
- Click en un proyecto/subproyecto para ver su tablero
- "+ Nueva tarea" para crear
- Arrastra tareas entre columnas (Por hacer → En curso → Completadas)
- Cada tarea tiene: título, descripción, prioridad, fecha, observaciones

### 6. Columnas especiales
- **Observaciones**: Muestra las observaciones del proyecto actual
- **Restricciones**: Muestra las restricciones del proyecto actual

### 7. Filtros
- Filtra por cliente específico
- Filtra por estado (Retrasado, En curso, Al día, Completado)
- Los filtros son acumulativos

### 8. Sistema semáforo (automático)
- 🔴 **Rojo**: Proyecto retrasado
- 🟡 **Amarillo**: En curso normal
- 🟠 **Naranja**: En curso pero retrasado
- 🟢 **Verde**: Al día
- ✅ **Completado**: 100% de tareas completadas

## 💾 Almacenamiento de datos

- **Usuarios**: `localStorage['trelopptech-users']`
- **Proyectos**: `localStorage['trelopptech-projects-{userId}']`
- Los datos están aislados por usuario
- Cada empresa ve solo sus propios proyectos

## 🔒 Seguridad

- Las claves se generan aleatoriamente (12 caracteres)
- Los datos se almacenan localmente en el navegador
- No hay transmisión de datos a servidores externos
- Cada usuario tiene datos completamente aislados

## 📱 Responsive Design

La aplicación se adapta a:
- 📱 **Móviles**: Menú colapsable, columnas apiladas
- 💻 **Tablets**: Vista optimizada
- 🖥️ **Desktop**: Vista completa con sidebar fijo

## 🌐 Funciona como PWA

Para usar como app:

### En móvil (Chrome/Safari):
1. Abre la app en el navegador
2. Menu → "Agregar a pantalla de inicio"
3. Úsala como app nativa

### En desktop (Chrome):
1. Click en el ícono de instalación (⊕)
2. Instala la app
3. Ábrela desde el menú de aplicaciones

## ⚡ Ventajas de esta arquitectura

1. **Sin servidor**: No necesita backend
2. **Gratis**: Hosting gratuito en GitHub Pages/Netlify/Vercel
3. **Rápido**: Todo funciona en el navegador
4. **Offline**: Funciona sin internet (después de la primera carga)
5. **Multi-usuario**: Soporte para múltiples empresas
6. **Escalable**: Puede manejar cientos de proyectos

## 🆘 Solución de problemas

**Los datos no se guardan**
- Verifica que localStorage esté habilitado en tu navegador
- No uses modo incógnito

**No puedo iniciar sesión**
- Verifica que el NIT y clave sean correctos
- Las credenciales son sensibles a mayúsculas/minúsculas

**Los subproyectos no aparecen**
- Actualiza la página
- Verifica que hayas seleccionado el proyecto padre primero

## 🔄 Actualizar la app

Si subes una nueva versión:
1. Los usuarios deben borrar caché (Ctrl+Shift+R)
2. O cambiar la versión en el código para forzar actualización

## 📝 Notas técnicas

- **Frontend**: HTML5, CSS3, JavaScript vanilla
- **Fuente**: Poppins (Google Fonts)
- **Almacenamiento**: localStorage API
- **Autenticación**: sessionStorage para sesiones
- **Compatibilidad**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🎨 Personalización

Para cambiar colores, edita las variables CSS en `dashboard.html`:

```css
:root {
    --bg-primary: #0a0e27;      /* Fondo principal */
    --accent-primary: #6366f1;  /* Color de acento */
    --status-delayed: #ef4444;  /* Color rojo */
    /* ... más variables */
}
```

## 📧 Soporte

Para preguntas o problemas:
- Revisa esta documentación
- Verifica la consola del navegador (F12)
- Asegúrate de tener la última versión

## ⚖️ Licencia

Este proyecto es de código abierto. Puedes usarlo, modificarlo y distribuirlo libremente.

---

**¡Disfruta gestionando tus proyectos con TrelOpptech! 🚀**

