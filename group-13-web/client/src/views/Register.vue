      <template>
      <div class = "background-image">
        <form class="register-form" @submit.prevent="register">
      <h1 style="font-family:system-ui ;">Register</h1>

      <div class="input-icon-user">
      <input type="text" v-model="user_name" placeholder="Username" style="font-size: 22px; font-family:system-ui; padding-left: 5%;" >
      <i class="fa-solid fa-user"></i>
      </div>
      <br>
      <div class="input-icon-email">
      <input type="email" v-model="email" placeholder="Email" style="font-size: 22px; font-family:system-ui; padding-left: 5%;">
      <i class="fa-solid fa-envelope"></i>
      </div>
      <br>
      <div class="input-icon-password">
      <input type="password" v-model="password" placeholder="Password" style="font-size: 22px; font-family: system-ui; padding-left: 5%;">
      <i class="fa-solid fa-lock"></i>
      </div>
      <br>
      <div class="input-country">
      <select  v-model="selectedCountry" style="font-size: 22px; font-family: system-ui; padding-left: 5%;">
        <option disabled value="">Select a language</option>
    <option v-for="country in countries" :key="country" :value="country">{{ country }}</option>
  </select>

      </div>
      <br>
      <button style="font-family:system-ui ;">Sign up</button>

      <div class="login-link">
            <p>Already have an account? <router-link to="/">Login</router-link></p>
        </div>
     </form>
    </div>

</template>
<font-awesome-icon icon="user" />
<script>


import Api from '../Api';

export default {
  data() {
    return {
      user_name: '',
      email: '',
      password: '',
      countries: ['English', 'Arabic', 'Spanish', 'French', 'German'],
      selectedCountry: ''
    }
  },
  methods: {
    async register() {
      try {
        const response = await Api.post('/users', {
          user_name: this.user_name,
          email: this.email,
          password: this.password,
          selectedCountry: this.selectedCountry,
        }, { withCredentials: true })
        console.log(response.data)
        alert('Registration successful')
        this.$router.push('/dashboard')
      } catch (error) {
        if (error.response && error.response.status === 400) {
          alert('Email or username has already been registered.')
        } else {
          alert('An error occurred during registration.')
        }
      }
    }
  }
}

</script>

<style scoped>

.register-form h1{
  font-size: 100px;
  color: black;
  font-size: 62px;
  margin-bottom: 50px;
  padding-bottom: 50px;

}

.register-form{
  display: flex;
  flex-direction: column;
  justify-content: center;  /* This will try to center the content vertically */
  align-items: center;      /* This will center the content horizontally */
  height: 100vh;
  margin: 0;
  background-image: url('/assets/luke-chesser-eICUFSeirc0-unsplash.jpg');
background-size: cover;
  -webkit-box-shadow: 0 0 10px rgb(11, 9, 9);
  -moz-box-shadow: 0 0 10px rgb(0,0,0);
}

input{
  border-radius: 40px;
  outline: none;
  width: 500px;
  height: 50px;
  display: grid;
  padding: .25rem;
  border: none;
  }

  p{
    color: black;
    padding-top: 40px;
  }

  button{
    background-color: white;
    border-radius: 10px;
    border: none;
    width: 150px;
    height: 50px;
    font-size: 22px;
    transition: all 0.2s ease;
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
    top: 60%;
    right: 25px;
    pointer-events: none;
    transform: translateY(-50%);
  }

.input-icon-email{

position: relative;
display: inline-block ;
}

.input-icon-email i{
color: black;
position: absolute;
top: 60%;
right: 25px;
pointer-events: none;
transform: translateY(-50%);
}

.input-icon-password{

position: relative;
display: inline-block ;
}
.input-country{

position: relative;
display: inline-block ;
}

.input-icon-password i{
color: black;
position: absolute;
top: 60%;
right: 25px;
pointer-events: none;
transform: translateY(-50%);
}
.input-country i{
color: black;
position: absolute;
top: 60%;
right: 25px;
pointer-events: none;
transform: translateY(-50%);
}

@media only screen and (max-width: 768px) {

  .register-form{
  display: flex;
  flex-direction: column;
  justify-content: center;  /* This will try to center the content vertically */
  align-items: center;      /* This will center the content horizontally */
  height: 100vh;
  margin: 0;
  background-image: url('/assets/luke-chesser-eICUFSeirc0-unsplash.jpg');
background-size: cover;
  -webkit-box-shadow: 0 0 10px rgb(11, 9, 9);
  -moz-box-shadow: 0 0 10px rgb(0,0,0);
}

input{
  border-radius: 40px;
  outline: none;
  width: 200px;
  height: 50px;
  display: block;
  border: none;
  }

  p{
    color: black;
  }
  button {
  display: block;
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
