<template>
  <div class="dashboard" v-cloak>
    <div class="navbar">
      <Navbar></Navbar>
      <i class="fa-solid fa-bars menu-icon" @click="toggleMenu"></i>
      <div class="side-menu" v-bind:class="{ 'menu-visible': menuVisible }">

        <i class="fa-solid fa-xmark x" @click="unToggleMenu"></i>
        <Sidemenu  @unToggleMenu="unToggleMenu"
        :selectedUserId="selectedUserId"
          @selected-user="handleSelectedUser"></Sidemenu>
      </div>
    </div>
    <div class="main-content">
      <div class="left-panel">
        <Chattbars
          :selectedUserId="selectedUserId"
          @selected-user="handleSelectedUser"
          @unToggleMenu="unToggleMenu"
        ></Chattbars>
      </div>
      <div class="right-panel">
        <Chatrooms
          :loggedInUserId="loggedInUserId"
          ref="chatroomsComponent"
        ></Chatrooms>
      </div>
    </div>
  </div>
</template>
<script>
import Chatrooms from '../components/Chatrooms.vue'
import Chattbars from '../components/chattbars.vue'
import Navbar from '../components/navbar.vue'
import Sidemenu from '../components/sidemenu.vue'
import Vue from 'vue'
import Api from '../Api';


export const eventBus = new Vue()

export default {
  mounted() {
    // Fetch the logged-in user's ID when the component mounts
    Api
      .get('/current-user')
      .then((response) => {
        this.idOfLoggedInUser = response.data.userId
      })
      .catch((error) => {
        console.error('Error fetching the current user:', error)
      })
  },
  data() {
    return {
      selectedUserId: null,
      currentChatroomId: null,
      idOfLoggedInUser: null,
      menuVisible: false

    }
  },
  name: 'Dashboard',
  components: { Chattbars, Chatrooms, Navbar, Sidemenu },

  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible
    },
    unToggleMenu() {
      console.log('closing menu')
      this.menuVisible = false
    },
    handleSelectedUser(userId) {
      this.selectedUserId = userId
      console.log('userId:', userId)
      console.log('idOfLoggedInUser:', this.idOfLoggedInUser)
      console.log('chatroom id', this.chatroomId)

      // Make a call to the backend to get the chatroom ID for this user
      Api
        .post(`/chatroom-for-user/${this.idOfLoggedInUser}/${userId}`)
        .then((response) => {
          this.currentChatroomId = response.data.chatroomId
          console.log(this.currentChatroomId)
          this.$refs.chatroomsComponent.loadMessages(this.currentChatroomId)
          this.$refs.chatroomsComponent.setChosenUser(userId)
        })
        .catch((error) => {
          console.error("Couldn't fetch chatroom ID for user", error)
        })
    }
  }
}
</script>

<style>
.menu-icon {
  display: none;
  font-size: 24px;
  cursor: pointer;
  margin-top: -45px;  /* adjust this value to raise or lower the icon */
}
[v-cloak] {
  display: none;
}

.dashboard {
  height: 100vh;
  overflow: hidden;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
}

.navbar {
  display: flex;  /* Added Flexbox */
  justify-content: space-between;  /* To push Navbar and icon to opposite ends */
  align-items: center;  /* To vertically align items */
  color: black;
  padding: 1rem;
  position: absolute;
  height: 8vh;
  top: 0;
  z-index: 2;
  overflow-y: visible;
}

.main-content {
  display: flex;
  flex: 1;
  padding-top: 0.5rem;
  position: relative;
  height: 92vh;
}

.left-panel {
  flex: 0 0 30%;
  background-color: #f0f0f0;
  overflow-y: auto;
}

.right-panel {
  flex: 1;
  background-color: #ffffff;
  overflow-y: auto;
}
.side-menu {
 display: none;
}

@media only screen and (max-width: 768px){
  .menu-icon {
    display: inline-block;
  }

  .side-menu {

    background-color: white; /* or any other solid color */
    z-index: 1000; /* Ensure it's above other elements */
will-change: transform;
    display: block;
  position: fixed;
  top: 0;
  left: -300px; /* this assumes a sidebar width of 300px */
  height: 100%;
  width: 300px;
  background: white; /* or any color you prefer */
  overflow-y: auto; /* for scrolling if the content overflows */
  transition: left 0.1s;
  -webkit-box-shadow: none !important;
  box-shadow: none !important;
}

.menu-visible {
  left: 0;
}
.x{
  left: -300px;
  font-size: 30px;
  padding-top: 20px;
padding-left: 240px;
z-index: 100;

}

}

</style>
