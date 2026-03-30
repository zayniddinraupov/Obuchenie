@echo off
echo ========================================
echo   Запуск Журнала обучения (Python)
echo   IP: 10.145.56.26
echo ========================================
echo.

cd /d "%~dp0"

echo Проверка Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python не установлен!
    echo Скачайте с https://python.org
    pause
    exit /b 1
)

echo Запуск сервера...
echo.
echo Откройте в браузере: http://10.145.56.26
echo.
echo Для остановки нажмите Ctrl+C
echo.

python -m http.server 80 --bind 10.145.56.26

pause
