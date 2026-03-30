@echo off
echo ========================================
echo   Запуск Журнала обучения
echo   IP: 10.145.56.26
echo ========================================
echo.

cd /d "%~dp0"

echo Проверка Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js не установлен!
    echo Скачайте с https://nodejs.org
    pause
    exit /b 1
)

echo Запуск сервера...
echo.
echo Откройте в браузере: http://10.145.56.26
echo.
echo Для остановки нажмите Ctrl+C
echo.

npx http-server -p 80 --cors -a 10.145.56.26

pause
