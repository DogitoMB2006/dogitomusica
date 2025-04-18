// create-icon.js - Ejecuta con Node.js
// Este script crea un icono muy visible para el system tray

const fs = require('fs');
const path = require('path');

// Asegurarse de que exista la carpeta public
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log(`Creando carpeta public en ${publicDir}`);
  fs.mkdirSync(publicDir);
}

// Función para crear un archivo de icono PNG simple
function createSimplePngIcon() {
  try {
    // Usar un módulo externo para crear imágenes requeriría instalar dependencias
    // En su lugar, crearemos un archivo SVG que puedes usar como icono
    
    // Un SVG simple con un círculo musical (funciona bien como icono)
    const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <circle cx="128" cy="128" r="120" fill="#FF5500" />
  <circle cx="128" cy="128" r="100" fill="#FF7700" />
  <circle cx="128" cy="128" r="80" fill="#FF9900" />
  <!-- Nota musical -->
  <path d="M160,80 L160,170 C160,186 145,198 128,198 C111,198 96,186 96,170 C96,154 111,142 128,142 C133,142 138,143 142,145 L142,80 L160,80 Z" 
        fill="black" stroke="white" stroke-width="4" />
</svg>`;
    
    const svgPath = path.join(publicDir, 'icon.svg');
    
    console.log(`Creando icono SVG en ${svgPath}`);
    fs.writeFileSync(svgPath, svgContent);
    
    // También crear un archivo de texto como favicon.ico solo como respaldo
    const icoPath = path.join(publicDir, 'favicon.ico');
    if (!fs.existsSync(icoPath)) {
      console.log(`Creando archivo de respaldo en ${icoPath}`);
      fs.writeFileSync(icoPath, 'Este es un archivo favicon de respaldo');
    }
    
    console.log('¡Iconos creados con éxito!');
    console.log('Ahora puedes usar public/icon.svg o public/favicon.ico como iconos para tu aplicación.');
    console.log('NOTA: Es mejor convertir el SVG a ICO usando una herramienta online o instalando un convertidor.');
    console.log('RECOMENDACIÓN: Descarga un archivo .ico real para mejor compatibilidad.');
  } catch (error) {
    console.error('Error al crear el icono:', error);
  }
}

// Ejecutar la función
createSimplePngIcon();