@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set MSG=%~1
if "%MSG%"=="" set MSG=chore: actualizacion de la aplicacion

echo =========================================================
echo   🚀 AUTOMATIZADOR DE DESPLIEGUE: Accesorios Lilís
echo   Ruta: development -^> qa -^> main (Vercel Producción)
echo =========================================================

echo [1/4] Subiendo a rama development...
git add .
git commit -m "%MSG%"
git push origin development
if errorlevel 1 (
    echo [ERROR] No se pudo subir a development.
    pause
    exit /b %errorlevel%
)

echo [2/4] Fusionando y subiendo a rama qa...
git checkout qa
git pull origin qa
git merge development --no-edit -m "merge: %MSG% into qa"
git push origin qa
if errorlevel 1 (
    echo [ERROR] No se pudo subir a qa.
    git checkout development
    pause
    exit /b %errorlevel%
)

echo [3/4] Fusionando y subiendo a rama main (Producción en Vercel)...
git checkout main
git pull origin main
git merge qa --no-edit -m "merge: %MSG% into main (produccion)"
git push origin main
if errorlevel 1 (
    echo [ERROR] No se pudo subir a main.
    git checkout development
    pause
    exit /b %errorlevel%
)

echo [4/4] Regresando a rama development...
git checkout development

echo =========================================================
echo   ✅ ¡LISTO! Desplegado en vivo a Producción con éxito.
echo =========================================================
