pushd "%~dp0"

for /F "usebackq tokens=*" %%i in ("list_of_installed_extensions.txt") do code --install-extension "%%i"
