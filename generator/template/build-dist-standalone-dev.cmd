pushd "%~dp0"
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" i --package-lock-only
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npx" browserslist@latest --update-db
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" audit fix
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" prune
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" dedupe
call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npm" run build -- --mode standalone-dev
