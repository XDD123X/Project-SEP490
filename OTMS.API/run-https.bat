@echo off
cd /d %~dp0
dotnet run --launch-profile https
pause