REM Utilisation du Web Component : <my-custom-element id="my-element-id"></my-custom-element>
REM Necessite vuejs/vue-web-component-wrapper (fournit avec vuejs)

call "<%= globalScriptsPath.replace(/^\/|\/$/g, '') %>\npx" vue-cli-service build --target wc --name my-custom-element ./src/WebComponent.vue --mode webcomponent

call powershell -Command "(gc """"%~dp0dist\demo.html"""") -replace '<my-custom-element>', '<my-custom-element id=""""myapp"""">' | Out-File -encoding utf8 """"%~dp0dist\demo.html""""
