<% if (useBootstrap) { %><template>
  <div id="app" class="text-center">
    <div id="nav">
      <router-link to="/" active-class="text-success font-weight-bolder" exact
        >Home</router-link
      >|
      <router-link
        to="/about"
        active-class="text-success font-weight-bolder"
        exact
        >About</router-link
      >
    </div>
    <router-view />
  </div>
</template>

<script>
import 'bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
// eslint-disable-next-line
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
export default {};
</script>

<style></style>

<style lang="scss">
@import 'bootstrap/scss/bootstrap.scss';
</style>
<% } else { %><template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
<% } %>