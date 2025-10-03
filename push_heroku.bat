@echo off
REM ============================
REM Heroku login and push to Heroku
REM ============================

REM Step 1: Login to Heroku
echo Logging into Heroku...
heroku login
if errorlevel 1 (
    echo Heroku login failed. Exiting.
    pause
    exit /b 1
)

REM Step 2: Get Heroku Git token
for /f "delims=" %%t in ('heroku auth:token') do set HEROKU_TOKEN=%%t
if "%HEROKU_TOKEN%"=="" (
    echo Failed to get Heroku token. Exiting.
    pause
    exit /b 1
)

REM Step 3: Push current branch to Heroku main
echo Pushing to Heroku using token...
git push https://heroku:%HEROKU_TOKEN%@git.heroku.com/goldenails2025.git main

echo.
echo Push complete. Press any key to exit.
pause
