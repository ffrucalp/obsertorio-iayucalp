@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "NODEEXE="
where node >nul 2>nul
if not errorlevel 1 set "NODEEXE=node"
if not defined NODEEXE if exist "%ProgramFiles%\nodejs\node.exe" set "NODEEXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODEEXE if exist "%AppData%\npm\node.exe" set "NODEEXE=%AppData%\npm\node.exe"
if not defined NODEEXE (
 echo.
 echo No encuentro Node.js en Windows.
 echo Aunque figure como instalado, comproba que exista en C:\Program Files\nodejs\node.exe
 echo https://nodejs.org/
 pause
 exit /b 1
)
"%NODEEXE%" -v
if errorlevel 1 (
 echo No se pudo iniciar Node.js.
 pause
 exit /b 1
)
rem Evita abrir por error otra version que ya esta usando el mismo puerto.
"%NODEEXE%" -e "const n=require('node:net');const s=n.createServer();s.once('error',()=>process.exit(2));s.listen(4173,'127.0.0.1',()=>s.close(()=>process.exit(0)))"
if errorlevel 1 (
 echo.
 echo ATENCION: el puerto 4173 ya esta en uso.
 echo Cerra la consola donde tenias abierto otro Monitor de Noticias y volve a ejecutar este archivo.
 echo De lo contrario el navegador podria mostrarte la version anterior.
 pause
 exit /b 1
)
echo.
echo ================================================
echo   MONITOR DE NOTICIAS UCALP  -  SERVIDOR LOCAL
echo ================================================
echo.
echo Abrir en el navegador: http://localhost:4173
start "" "http://localhost:4173"
"%NODEEXE%" server.mjs
if errorlevel 1 echo El servidor termino con un error.
pause
