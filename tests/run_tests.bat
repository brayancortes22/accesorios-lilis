@echo off
chcp 65001 > nul
echo ========================================================
echo   Ejecutando Suite Completa de Pruebas de Accesorios Lilis
echo ========================================================
echo.

python "%~dp0run_all_tests.py"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Se detectaron fallos en las pruebas.
    pause
    exit /b %ERRORLEVEL%
) else (
    echo.
    echo [OK] Pruebas finalizadas con exito.
    pause
    exit /b 0
)
