<template>
        <form class="login-form" @submit.prevent="login">
    <div class="background-image">
      <h1 style="font-family: system-ui ;">Login</h1>

      <div class="input-icon-user">
          <input type="text" v-model="user_name" placeholder="Username" style="font-size: 22px; font-family:system-ui; padding-left: 5%;" >
            <i class="fa-solid fa-user"></i>
            </div>

             <br>

             <div class="input-icon-password">
      <input type="password" v-model="password" placeholder="Password" style="font-size: 22px; font-family: system-ui; padding-left: 5%;">
      <i class="fa-solid fa-lock"></i>
      </div>

            <br>

            <button type="submit" style="font-family:system-ui;">Login</button>

        <div class="register-link">
            <p class="register">Don't have an account? <router-link to="/register">Register</router-link></p>

        </div>

    </div>
    </form>
</template>

<script>
import Api from '../Api';

export default {
  data() {
    return {
      user_name: '',
      password: ''
    }
  },
  methods: {
    async login() {
      try {
        const response = await Api.post('/login', {
          user_name: this.user_name,
          password: this.password
        }, { withCredentials: true })

        if (response.data.success) {
          // Navigates to dashboard
          if (this.$router.currentRoute.path !== '/dashboard') {
            this.$router.push('/dashboard')
          }
        } else {
          alert('Invalid credentials')
        }
      } catch (error) {
        console.error('An error occurred during login:', error)
        alert('Login failed')
      }
    }

  }
}

</script>

<style scoped>
.register-link {
    margin-top: 20px;
}

.login-form h1{
  font-size: 100;
  color: black;
  padding-bottom: 50px;
  font-size: 62px;
}
.login-form{
  background-image: url('/assets/luke-chesser-eICUFSeirc0-unsplash.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  display: grid;
  place-items: center;
  height: 100vh;
  margin: 0;

  -webkit-box-shadow: 0 0 10px rgb(0,0,0);
  -moz-box-shadow: 0 0 10px rgb(0,0,0);
}

input{
  border-radius: 40px;
  outline: none;
  width: 500px;
  height: 50px;
  display: grid;
  padding: .25rem;
  margin-top: 4%;
  border: none;
  }

  .register{
    padding-top: 40px;
    color: black;
  }
  button {
  display: block;
  margin: 10% auto 0 auto;
  background-color: white;
  border-radius: 10px;
  border: none;
  width: 150px;
  height: 50px;
  font-size: 22px;
  transition: all 0.2s ease;
  text-align: center;
}

  button:active{
  transform: scale(0.96);
  }

  button:hover{
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }

  .input-icon-user{

position: relative;
display: inline-block ;
}

.input-icon-user i{
    color: black;
    position: absolute;
    top: 70%;
    right: 25px;
    pointer-events: none;
    transform: translateY(-50%);
  }

  .input-icon-password{

position: relative;
display: inline-block ;
}

.input-icon-password i{
color: black;
position: absolute;
top: 70%;
right: 25px;
pointer-events: none;
transform: translateY(-50%);
}

@media only screen and (max-width: 768px) {

  .login-form{
  background-image: url('/assets/luke-chesser-eICUFSeirc0-unsplash.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  display: grid;
  place-items: center;
  height: 100vh;
  margin: 0;

  -webkit-box-shadow: 0 0 10px rgb(0,0,0);
  -moz-box-shadow: 0 0 10px rgb(0,0,0);
}
input{
  border-radius: 40px;
  outline: none;
  width: 200px;
  height: 50px;
  display: grid;
  padding: .25rem;
  margin-top: 4%;
  border: none;
  }

  button {
  display: block;
  margin: 10% auto 0 auto;
  background-color: white;
  border-radius: 10px;
  border: none;
  width: 120px;
  height: 40px;
  font-size: 18px;
  transition: all 0.2s ease;
  text-align: center;
}
}

</style>
