@echo off
echo ========================================
echo Nettoyage et redemarrage de l'application
echo ========================================

echo.
echo [1/5] Arret de tous les processus Node...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Suppression des caches Angular...
if exist .angular (
    rmdir /s /q .angular
    echo Cache Angular supprime
) else (
    echo Pas de cache Angular a supprimer
)

if exist dist (
    rmdir /s /q dist
    echo Dossier dist supprime
) else (
    echo Pas de dossier dist a supprimer
)

echo.
echo [3/5] Verification des dependances...
call npm install

echo.
echo [4/5] Build de l'application...
call npm run build

echo.
echo [5/5] Demarrage du serveur de developpement...
echo.
echo ========================================
echo Le serveur sera disponible sur:
echo http://localhost:4200
echo ========================================
echo.

call npm start
