REM Necessite karol-f/vue-custom-element

setlocal enableDelayedExpansion

for /F %%i in ('findstr /B /L VUE_APP_WEB_COMPONENT_NAME= "%~dp0.env.webcomponent"') do set "%%i"

if not defined VUE_APP_WEB_COMPONENT_NAME (
   echo.
   echo La variable VUE_APP_WEB_COMPONENT_NAME n'a pu etre trouvee dans le fichier "%~dp0.env.webcomponent"
   set ERRORLEVEL=1
   goto fin
)

call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" run build -- --mode webcomponent2

call powershell -Command "(gc """"%~dp0dist\index.html"""") -replace '<div id=app></div>', '<!VUE_APP_WEB_COMPONENT_NAME!></!VUE_APP_WEB_COMPONENT_NAME!>' | Out-File -encoding utf8 """"%~dp0dist\index.html""""

:fin
