REM Necessite karol-f/vue-custom-element

setlocal enableDelayedExpansion

for /F %%i in ('findstr /B /L VUE_APP_WEB_COMPONENT_NAME= "%~dp0.env.webcomponent2"') do set "%%i"

if not defined VUE_APP_WEB_COMPONENT_NAME (
   echo.
   echo La variable VUE_APP_WEB_COMPONENT_NAME n'a pu etre trouvee dans le fichier "%~dp0.env.webcomponent2"
   set ERRORLEVEL=1
   goto fin
)

pushd "%~dp0"
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" i --package-lock-only
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npx" browserslist@latest --update-db
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" audit fix
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" prune
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" dedupe
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" run build -- --mode webcomponent2

call powershell -Command "(gc """"%~dp0dist\index.html"""") -replace '<div id=""""app"""">', '<!VUE_APP_WEB_COMPONENT_NAME!>' | Out-File -encoding utf8 """"%~dp0dist\index.html""""
call powershell -Command "(gc """"%~dp0dist\index.html"""") -replace '</div></div></div><script ', '</div></div></!VUE_APP_WEB_COMPONENT_NAME!><script ' | Out-File -encoding utf8 """"%~dp0dist\index.html""""
if exist "%~dp0dist\index.html.gz" del /Q "%~dp0dist\index.html.gz"

:fin
