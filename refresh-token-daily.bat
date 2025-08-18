@echo off
REM Auto Token Refresh for Upstox Nifty 50 Alert System
REM This script runs daily to refresh the access token automatically

echo [%date% %time%] Starting Upstox Token Refresh...

REM Change to the project directory
cd /d "C:\Users\nigkumar\Desktop\Project\Personal\Alert"

REM Run the token refresh script
node auto-token-refresh.js

REM Check if refresh was successful
if %ERRORLEVEL% EQU 0 (
    echo [%date% %time%] Token refresh completed successfully
    
    REM Optional: Restart the main application if it's running
    REM taskkill /F /IM node.exe /FI "WINDOWTITLE eq Nifty*"
    REM timeout /t 5
    REM start "" node index.js
    
) else (
    echo [%date% %time%] Token refresh failed - Error Level: %ERRORLEVEL%
    echo Manual intervention may be required
)

echo [%date% %time%] Script completed
