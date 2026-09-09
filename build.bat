@echo off
setlocal EnableExtensions
cd /d "%~dp0"

rem Force UTF-8 for console / Node / child processes on Windows.
chcp 65001 >nul
set "PYTHONUTF8=1"
set "PYTHONIOENCODING=utf-8"
set "NODE_OPTIONS=--no-warnings"

echo.
echo [apidoc] working dir: %CD%
echo [apidoc] code page: UTF-8 (65001)
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] node not found. Install Node.js first.
  exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npm not found. Install Node.js first.
  exit /b 1
)

if not exist "node_modules\vitepress" (
  echo [apidoc] installing dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed.
    exit /b 1
  )
)

echo [apidoc] checking markdown encoding...
node scripts\check-md-encoding.mjs
if errorlevel 1 (
  echo [ERROR] markdown encoding check failed. Fix source files first.
  exit /b 1
)

echo [apidoc] building...
call npm run build
if errorlevel 1 (
  echo [ERROR] build failed.
  exit /b 1
)

echo [apidoc] verifying built HTML Chinese text...
node scripts\check-md-encoding.mjs --out
if errorlevel 1 (
  echo [ERROR] built HTML still looks broken. Do not upload out\
  exit /b 1
)

echo.
echo [OK] build complete. Upload the out\ folder to your server.
echo     example: out\gpt-image-2.5.html
echo.
exit /b 0
