REM Mise a jour des dependances du projet
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" update
REM Lancement du serveur de dev
set current_dir=%~dp0
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\create_watch_vuejs_project.cmd" "%current_dir:~0,-1%"
