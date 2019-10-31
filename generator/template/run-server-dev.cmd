REM Mise a jour des dependances du projet
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" update
REM Lancement du serveur de dev
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\create_watch_vuejs_project.cmd" "%~dp0" N
