@echo off

rem Get the current directory
set "currentDir=%cd%"

rem Delete all "bin" - "obj" - "dist" - "nbproject" folders
for /d /r %%d in (bin obj dist nbproject) do (
    if exist "%%d" (
        echo Deleting: "%%d"
        rmdir /s /q "%%d"
    )
)

echo.
echo All "bin" - "obj" - "dist" - "nbproject" folders have been deleted in the current directory and subdirectories.
echo Press Enter to exit...

rem Wait for the user to press Enter
set /p dummy=""

exit
