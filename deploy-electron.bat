@echo off
echo === Iniciando proceso de despliegue de Dogito Music ===

REM Comprobar si existe un token de GitHub
if "%GH_TOKEN%"=="" (
  echo ERROR: No se ha configurado el token de GitHub.
  echo Por favor, ejecuta: set GH_TOKEN=tu_token_personal_aqui
  echo.
  echo Necesitas crear un token personal en GitHub con permisos 'repo'
  echo Visita: https://github.com/settings/tokens
  exit /b 1
)

echo [1/4] Asegurando que todas las dependencias estén instaladas...
call npm install electron-updater electron-log
if %ERRORLEVEL% neq 0 (
  echo ERROR: Falló la instalación de dependencias.
  exit /b %ERRORLEVEL%
)

echo [2/4] Construyendo aplicación...
call npm run build
if %ERRORLEVEL% neq 0 (
  echo ERROR: Falló el proceso de construcción.
  exit /b %ERRORLEVEL%
)

echo [3/4] Empaquetando con electron-builder...
call npx electron-builder --win --publish never
if %ERRORLEVEL% neq 0 (
  echo ERROR: Falló el proceso de empaquetado.
  exit /b %ERRORLEVEL%
)

echo [4/4] Publicando en GitHub...
call npx electron-builder --win --publish always
if %ERRORLEVEL% neq 0 (
  echo ERROR: Falló la publicación en GitHub.
  exit /b %ERRORLEVEL%
)

echo === Despliegue completado con éxito ===
echo La versión 0.0.1 de Dogito Music ha sido publicada en GitHub.
echo Recuerda revocar o rotar el token de GitHub si ya no lo necesitas.
echo.
echo IMPORTANTE: Para la próxima versión, no olvides incrementar
echo el número de versión en package.json antes de desplegar.