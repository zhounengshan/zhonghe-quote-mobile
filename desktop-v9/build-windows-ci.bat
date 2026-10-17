@echo off
setlocal
python -m PyInstaller --noconfirm --clean --windowed ^
  --name "中禾报价ERP-V9" ^
  --icon "app-windows.ico" ^
  --add-data "index.html;." ^
  --add-data "efficiency.css;." ^
  --add-data "efficiency.js;." ^
  --add-data "business.css;." ^
  --add-data "business.js;." ^
  --add-data "app-windows.ico;." ^
  --collect-all webview ^
  --collect-all pystray ^
  --hidden-import openpyxl ^
  server.py
exit /b %errorlevel%
