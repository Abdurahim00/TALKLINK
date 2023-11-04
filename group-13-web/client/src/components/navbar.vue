<head>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Sofia">
  <style>
  body {
    font-family: "Sofia", sans-serif;
  }
  </style>
  </head>
<template>
  <div id="navbar">
    <div class="topnav">
    <div class="icon-user">
        <i class="fa-solid fa-user user"></i>
        <p>{{ username }}</p>

    </div>
    <b-dropdown variant="primary" class="icon-settings">
    <template #button-content>
      <i class="fa-solid fa-gear" aria-label="Settings"></i>
    </template>
    <b-dropdown-item @click="toggleLog">Logout</b-dropdown-item>
    <b-dropdown-item @click="toggleUse">Change Username</b-dropdown-item>
    <b-dropdown-item @click="togglePas">Change Password</b-dropdown-item>
    <b-dropdown-item @click="togglePut">Change Email</b-dropdown-item>
    <b-dropdown-item v-if="isAdmin" @click="toggleDeleteAll">Delete all messages</b-dropdown-item>

</b-dropdown>

</div>
<div class="popup-content">
    <div class="popup" v-show="changeUsername">
      <form @submit.prevent="updateUsername(new_user)">
        <i class="fa-solid fa-xmark" v-on:click="toggle()" style="color: black; font-size: 22px;"></i>
        <label for="username">Enter new username:</label>
        <input type="text" v-model="new_user" autocomplete="off">
        <button v-on:click="updateUsername(new_user)" type="submit">Submit</button>
      </form>
    </div>

    <div class="popup" v-show="changePassword">
      <form>
        <label for="password">Enter new password:</label>
        <i class="fa-solid fa-xmark" v-on:click="toggle()" style="color: black; font-size: 22px;"></i>
        <input type="text" v-model="new_pass" autocomplete="off">
        <button v-on:click="updatePassword(new_pass)" type="submit" style="color: white;">Submit</button>
      </form>
    </div>

    <div class= "popup" id="put" v-show="put">
      <form>
        <br>
        <label for="put">Enter new details: </label>
        <br>
        <i class="fa-solid fa-xmark" v-on:click="toggle" style="color: black; font-size: 22px;"></i>
        <input type="text" v-model="new_user" placeholder="Username" autocomplete="off">
        <br>
        <input type="text" v-model="new_pass" placeholder="Password" autocomplete="off">
        <br>
        <input type="text" v-model="new_email" placeholder="Email" autocomplete="off">
        <br>
        <button v-on:click="put_user(new_user, new_pass, new_email)">Submit</button>
      </form>
    </div>

    <div class="popup" v-show="logout">
      <form>
        <i class="fa-solid fa-xmark" v-on:click="toggle()" style="color: black; font-size: 22px;"></i>
        <label class="logout-text" for="logout">Are you sure?</label>
        <br />
        <br />
        <button v-on:click="logoff()">Logout</button>
      </form>
    </div>
    <div v-if="isAdmin" class="popup" v-show="deleteAllMessagesPopup">
  <form >
    <i class="fa-solid fa-xmark"  v-on:click="toggle()" style="color: black; font-size: 22px;"></i>
    <label class="logout-text" for="logout">Are you sure you want to delete all messages?</label>
    <br />
    <br />
    <button v-on:click="deleteAllMessages()">Delete All</button>
  </form>
</div>

  </div></div>
</template>
<script>
import axios from 'axios'

export default {
  data() {
    return {
      isClicked: false,
      logout: false,
      changeUsername: false,
      changePassword: false,
      put: false,
      username: '',
      new_user: '',
      new_pass: '',
      new_email: '',
      userId: '',
      isAdmin: false,
      deleteAllMessagesPopup: false
    }
  },
  mounted() {
    axios
      .get('http://localhost:3000/current-user', { withCredentials: true })
      .then((response) => {
        axios.defaults.withCredentials = true
        this.username = response.data.userId
        this.userId = response.data.userId
        this.isAdmin = response.data.isAdmin
        this.getUsername()
      })
      .catch((error) => {
        console.error('Error fetching current user:', error)
      })
  },
  watch: {
    username: 'getUsername'
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible
    },
    toggle() {
      this.isClicked = !this.isClicked
      this.logout = false
      this.changePassword = false
      this.changeUsername = false
      this.put = false
      this.deleteAllMessagesPopup = false
    },
    togglePut() {
      this.put = !this.put
      this.changeUsername = false
      this.changePassword = false
      this.logout = false
    },

    toggleLog() {
      this.put = false
      this.logout = !this.logout
      this.changePassword = false
      this.changeUsername = false
    },
    toggleUse() {
      this.put = false
      this.changeUsername = !this.changeUsername
      this.logout = false
      this.changePassword = false
    },
    togglePas() {
      this.put = false
      this.changePassword = !this.changePassword
      this.logout = false
      this.changeUsername = false
    },
    toggleDeleteAll() {
      this.put = false
      this.deleteAllMessagesPopup = !this.deleteAllMessagesPopup
      this.logout = false
      this.changePassword = false
      this.changeUsername = false
    },
    getUsername() {
      axios
        .get(`http://localhost:3000/users/${this.userId}`)
        .then((response) => {
          console.log('Received user data:', response.data.user_name)
          this.username = response.data.user_name
        })
        .catch((error) => {
          console.error('Error loading username:', error)
        })
    },
    async deleteAllMessages() {
      try {
        const response = await axios.delete('http://localhost:3000/messages')
        console.log('Successfully deleted all messages', response.data)
        alert('Successfully deleted all messages')
        // Optionally, you can reload the page or redirect the user somewhere else after the deletion
      } catch (error) {
        console.error('Error deleting all messages', error)
        alert('Failed to delete all messages')
      }
    },

    async updateUsername(newName) {
      try {
        const response = await axios
          .patch('http://localhost:3000/username/' + this.userId, {
            username: newName
          })
          .then(window.location.reload())
        console.log('Failed to change username, status code:', response.status)
        alert('Something went wrong, please try again later')
      } catch (err) {
        console.log('An error occurred trying to change the username:', err)
        alert('Failed to change username')
      }
    },
    async updatePassword(newPass) {
      try {
        const response = await axios
          .patch('http://localhost:3000/password/' + this.userId, {
            password: newPass
          })
          .then(alert('Succesfully changed password'))
        if (response.status === 200) {
          alert('Successfully changed password')
        } else {
          console.log(
            'Failed to change password, status code:',
            response.status
          )
          alert('Something went wrong, please try again later')
        }
      } catch (err) {
        console.log('An error occurred trying to change the password:', err)
        alert('Failed to change password')
      }
    },

    async logoff() {
      try {
        this.$router.push({ path: '/login' })
        await axios.post('http://localhost:3000/logout')
        console.log('loginging out')
      } catch (error) {
        console.error('Error during logout:', error)
      }
    },

    async put_user(newName, newPass, newEmail) {
      try {
        const response = await axios
          .put('http://localhost:3000/users/' + this.userId, {
            user_name: newName,
            password: newPass,
            email: newEmail
          })
          .then(window.location.reload())
        console.log('Failed to change username, status code:', response.status)
        alert('Something went wrong, please try again later')
      } catch (err) {
        console.log('An error occurred trying to change the username:', err)
        alert('Failed to change username')
      }
    }
  }
}
</script>
<style>
#navbar {
  width: 100%;
  background-color: white;
  align-content: center;
}
/* Add a black background color to the top navigation */
.topnav {
  width: 100%;
  background-color: transparent;
  display: flex;
    align-items: center; /* This will vertically center the children */
    justify-content: space-between; /* This will give space between .icon-user and the dropdown */
}

.topnav p {
  float: left;
  color: black;
  text-decoration: none;
  font-size: 26px;
}

.topnav i {
  float: left;
  margin: 5px;
}

.popup-content{
position: relative;
}

.popup {
  position: fixed; /* Fixed position for the popup */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Center the element */
  width: 22%;
  height: 20%;
  background-color: whitesmoke;
  justify-content: center;
  display: flex;
  z-index: 2; /* Ensure the popup is above other content */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a slight shadow for the popup */
  backdrop-filter: blur(5px); /* Apply a blur to the background */
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  border-radius: 40px;
}

.popup form {
  text-align: center;
}

.popup h2 {
  margin-top: 10px;
  font-size: 24px;
}

.popup label {
  font-size: 16px;
  color: black;
  margin-top: 12px;
}

.popup input {
  margin-top: 5px;
  padding: 8px;
  width: 80%;
  border: 1px solid white;
  border-radius: 8px;
  font-size: 14px;
}

.popup button:hover {
  background-color: darkslategray;
}
.popup button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: black;
  color: whitesmoke;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.icon-user {
    display: flex;
    align-items: left;
    justify-content: space-between;
    position: relative; color: black;
    font-size: 30px;
}

.icon-settings {
    display: flex;
    align-items: right;
    justify-content: space-between;
    position: relative;
    font-size: 30px;
    padding: 0;
    border: none;
    background: none;

}
/* Remove border, padding, background, and shadows from the dropdown button */
.icon-settings .btn {
    padding: 0;
    border: none;
    background: none;
    box-shadow: none;
    display: flex;
    align-items: center; /* Align items to the center for vertical centering */
    color: black;
}

/* Remove border and shadow from the dropdown menu */
.icon-settings .dropdown-menu {
    border: none;
    box-shadow: none;
}

.icon-settings .btn:hover {
    background-color:black;

}

.popup .fa-xmark {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
}

.fa-xmark {
  padding: 5px;
}
#put{
  position: fixed; /* Fixed position for the popup */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Center the element */
  width: 22%;
  height: 35%;
  background-color: whitesmoke;
  justify-content: center;
  display: flex;
  z-index: 2; /* Ensure the popup is above other content */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a slight shadow for the popup */
  backdrop-filter: blur(5px); /* Apply a blur to the background */
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  border-radius: 40px;
}
@media only screen and (max-width: 1300px){

  .popup label {
  font-size: 16px;
  color: black;
  margin-top: 12px;
}
@media only screen and (max-width: 968px){

.popup label {
font-size: 11px;
color: black;
margin-top: 12px;
}
#put {
height: 40%;
width: 30%;
display: block;
}

#put{
  position: fixed; /* Fixed position for the popup */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Center the element */
  width: 22%;
  height: 25%;
  background-color: whitesmoke;
  justify-content: center;
  display: flex;
  z-index: 2; /* Ensure the popup is above other content */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a slight shadow for the popup */
  backdrop-filter: blur(5px); /* Apply a blur to the background */
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  border-radius: 40px;
}

@media only screen and (max-width: 768px) {

  .popup {
  position: fixed; /* Fixed position for the popup */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Center the element */
  width: 75%;
  height: 25%;
  background-color: whitesmoke;
  justify-content: center;
  display: flex;
  z-index: 2; /* Ensure the popup is above other content */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a slight shadow for the popup */
  backdrop-filter: blur(5px); /* Apply a blur to the background */
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  border-radius: 40px;
}
.popup form {
  text-align: center;
}

.popup h2 {
  margin-top: 10px;
  font-size: 24px;
}

.popup label {
  font-size: 12px;
  color: black;
  margin-top: 12px;
}

.popup input {
  margin-top: 5px;
  padding: 8px;
  width: 80%;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 14px;
}

.popup button {
  margin-top: 10px;
  padding: 8px 16px;
  background-color: black;
  color: whitesmoke;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.popup button:hover {
  background-color: darkslategray;
}
p{
  display: none;
}
.user{
  display: none;
}

}

}
#put {
  position: fixed; /* Fixed position for the popup */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Center the element */
  width: 40%;
  height: 45%;
  background-color: whitesmoke;
  justify-content: center;
  display: flex;
  z-index: 2; /* Ensure the popup is above other content */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); /* Add a slight shadow for the popup */
  backdrop-filter: blur(5px); /* Apply a blur to the background */
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  border-radius: 40px;
}
}
</style>
