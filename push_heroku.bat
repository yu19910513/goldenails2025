@echo off
REM ============================
REM Push to Heroku using CLI token (skip login)
REM ============================

REM Step 1: Get Heroku Git token
for /f "delims=" %%t in ('heroku auth:token') do set HEROKU_TOKEN=%%t
if "%HEROKU_TOKEN%"=="" (
    echo Failed to get Heroku token. Make sure you are logged into Heroku CLI.
    pause
    exit /b 1
)

REM Step 2: Push current branch to Heroku main
echo Pushing to Heroku using token...
git push https://heroku:%HEROKU_TOKEN%@git.heroku.com/goldenails2025.git main

echo.
echo Push complete. Press any key to exit.
pause
