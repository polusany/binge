@echo off
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" goto setup
.venv\Scripts\python.exe -c "import flask,waitress" >nul 2>&1
if not errorlevel 1 goto run
:setup
python -m venv .venv
if errorlevel 1 goto fail
.venv\Scripts\python.exe -m pip install -r requirements.txt
if errorlevel 1 goto fail
:run
.venv\Scripts\python.exe app.py
pause
exit /b
:fail
echo Setup failed. Check Python and your internet connection.
pause
