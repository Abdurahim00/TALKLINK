import Vue from 'vue'
import Router from 'vue-router'
import Register from './views/Register.vue'
import Login from './views/Login.vue'
import Dashboard from './views/Dashboard.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [

    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/',
      redirect: 'login'
    },
    {
      path: '/register', // Path for the new route
      name: 'register', // Route name
      component: Register // Component to load when this route is navigated to
    },

    {
      path: '/dashboard', // Path for the new route
      name: 'dashboard', // Route name
      component: Dashboard // Component to load when this route is navigated to
    }
  ]
})
