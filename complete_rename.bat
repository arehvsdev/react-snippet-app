@echo off
title Complete Antigravity IDE Fix
echo =======================================================
echo.
echo   This script will close the running Antigravity IDE
echo   and rename 'app.asar' to complete the restore.
echo.
echo =======================================================
echo.
pause
echo.
echo Closing Antigravity...
taskkill /f /im Antigravity.exe 2>nul
timeout /t 2 /nobreak >nul

set "asarPath=%LOCALAPPDATA%\Programs\Antigravity\resources\app.asar"
set "asarBakPath=%LOCALAPPDATA%\Programs\Antigravity\resources\app.asar.bak"

if exist "%asarPath%" (
    ren "%asarPath%" app.asar.bak
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] Renamed app.asar to app.asar.bak.
        echo [SUCCESS] Antigravity IDE will now launch correctly.
    ) else (
        echo [ERROR] Failed to rename app.asar.
        echo Please ensure the application is completely closed and try again.
    )
) else (
    if exist "%asarBakPath%" (
        echo [INFO] app.asar is already renamed to app.asar.bak.
    ) else (
        echo [WARNING] Could not locate app.asar or app.asar.bak.
    )
)
echo.
echo Fix complete! You can now start the Antigravity IDE.
echo.
pause
