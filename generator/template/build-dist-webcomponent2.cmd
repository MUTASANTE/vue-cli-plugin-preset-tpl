REM Necessite karol-f/vue-custom-element

call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" run build -- --mode webcomponent2

call powershell -Command "(gc """"%~dp0dist\index.html"""") -replace '<div id=app></div>', '<my-custom-element2></my-custom-element2>' | Out-File -encoding utf8 """"%~dp0dist\index.html""""
