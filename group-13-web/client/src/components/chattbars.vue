/* eslint-disable */
<template>
  <div class="Bar-layout">
    <div class="search-bar">
      <div class="input-wrapper" style="border: none; font-family: system-ui;">
        <input type="text" v-model="searchQuery" @keydown.enter="searchUser" placeholder="Search for a user" />
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
    </div>
    <div class="Chatt-bar" v-for="(userId, index) in users" :key="userId" id="chat-bar" @click="selectUser(userId)"
      :class="{ offset: userId === selectedUserId }">
      <div class="achievement-circle">
        <div class="user-images">
  <img :src="getImage(index)" alt="user image" @error="handleImageError"> <!-- The getImage method will handle the fallback -->
</div>
      </div>
      <span class="centered-text" style="padding-left: 40px; font-family: system-ui;">{{ usernames[userId] || 'Loading...'
      }}</span>
      <i class="fa-solid fa-xmark" style="color: red;" @click="handleDeleteUser($event, userId)"></i>
    </div>
    <font-awesome-icon icon="icons" />
  </div>
</template>

<script>
import Vue from 'vue'
import Api from '../Api';


Vue.prototype.$eventBus = new Vue()

export default {
  name: 'Group13WebChattbars',
  data() {
    return {
      users: [],
      usernames: {},
      searchQuery: '',
      selectedUserId: null,
      loggedInUserId: '',
      imageURL: [],
      chatroomIDs: [],
      counter: 0,
      routes: []
    }
  },
  mounted() {
    this.fetchRoutesForLevels();
    Api.get('/current-user')
      .then((response) => {
        this.loggedInUserId = response.data.userId;
        this.getAllFriends();
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
      });
  },
  methods: {
    getImage(index) {
    // Check if the image URL is available; otherwise, use the default image.
      const defaultImage = require('@/assets/wood.png') // This ensures Webpack properly resolves the path at build time.
      return this.imageURL[index] || defaultImage // Use the default image if no specific image URL is available.
    },
    handleImageError(event) {
    // This function will be called if an image fails to load
      event.target.src = require('@/assets/wood.png') // Fallback to the default image
    },

    async fetchRoutesForLevels() {
      this.routes = [] // Clear the existing routes

      const levelPromises = []

      // Iterate through levels 1 to 5 and create an array of promises
      for (let level = 1; level <= 5; level++) {
        const promise = Api.get(`/achievements/${level}`)
          .then(response => {
            if (response.data) {
              return `${response.data}`
            }
            return null
          })
          .catch(error => {
            console.error(`Error fetching route for level ${level}:`, error)
            return null // Handle the error as needed, and return null for this route
          })
        levelPromises.push(promise)
      }

      // Use Promise.all to wait for all promises to resolve
      const routes = await Promise.all(levelPromises)

      // Filter out null routes (routes with errors)
      this.routes = routes.filter(route => route !== null)

      console.log('All routes fetched:', this.routes)
    },

    async getAllFriends() {
      try {
        const response = await Api.get(`/chatrooms/users/${this.loggedInUserId}`)
        this.users = response.data.otherUsers
        this.chatroomIDs = response.data.chatroomIDs
        console.log('chatroomIDs', this.chatroomIDs)
        await this.fetchUsernamesForUsers()
      } catch (error) {
        console.error('Error fetching friends:', error)
      }
    },

    async fetchUsernamesForUsers() {
      try {
        const responses = await Promise.all(this.users.map(userId => Api.get(`/users/${userId}`)))
        responses.forEach((response, index) => {
          this.$set(this.usernames, this.users[index], response.data.user_name) // Use $set for reactivity
          this.achievementID(index)
        })
      } catch (error) {
        console.error('Error fetching usernames:', error)
      }
    },
    achievementID(index) {
      if (this.counter < this.chatroomIDs.length) {
        Api
          .get(`/chatrooms/${this.chatroomIDs[index]}`)
          .then((response) => {
            const length = response.data.achCount
            let imageURL
            if (length <= 5) {
              imageURL = require('@/assets/' + this.routes[0])
            } else if (length > 5 && length <= 10) {
              imageURL = require('@/assets/' + this.routes[1])
            } else if (length > 10 && length <= 15) {
              imageURL = require('@/assets/' + this.routes[2])
            } else if (length > 15 && length <= 20) {
              imageURL = require('@/assets/' + this.routes[3])
            } else if (length > 20) {
              imageURL = require('@/assets/' + this.routes[4])
            }

            this.$set(this.imageURL, index, imageURL)
            console.log('imageURLs', this.imageURL[this.counter])
            console.log('counter', this.counter)
            console.log('All routes fetched:', this.routes)

            this.counter++
            // No need to return this.imageURL[index] here
          })
          .catch((error) => {
            console.error('Error loading messages:', error)
            // Handle the error as needed
          })
      }
    },

    async searchUser() {
      try {
        const response = await Api.get('/users', {
          params: {
            searchQuery: this.searchQuery
          }
        })

        const foundUser = response.data[0]
        const userAlreadyExists = this.users.includes(foundUser._id)

        if (!userAlreadyExists) {
          // Add the found user's ID to the users array.
          this.users.push(foundUser._id)
          // Update the usernames object with the found user's name.
          this.$set(this.usernames, foundUser._id, foundUser.user_name)
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          if (this.userAlreadyExists === '') {
            this.userAlreadyExists = [] // Clear the user list
            alert('User not found')
          } else {
            alert('An error occurred during the search.')
          }
        }
      }
    },

    async handleDeleteUser(event, userId) {
      event.stopPropagation()
      const confirmDelete = window.confirm('Are you sure you want to delete this user?')
      if (!confirmDelete) return

      try {
        const chatroomId = await Api.post(`/chatroom-for-user/${userId}/${this.loggedInUserId}`)
        console.log('to be deleted chatroom', chatroomId.data.chatroomId)
        Api.delete(`/chatrooms/${chatroomId.data.chatroomId}`)
        location.reload()

        /* await axios.delete(`http://localhost:3000/users/${userId}`)
        this.users = this.users.filter(u => u !== userId) */
      } catch (error) {
        console.error('Error deleting the user', error)
        alert('Failed to delete the chatroom. Please try again')
      }

      if (this.selectedUserId === userId) {
        this.selectedUserId = null
        this.$eventBus.$emit('hideChatroomEvent')
      }
    },

    selectUser(userId) {
      if (userId === this.loggedInUserId) {
        alert("You can't chat with yourself!")
        return
      }

      if (this.selectedUserId === userId) {
        this.selectedUserId = null
        this.$eventBus.$emit('hideChatroomEvent')
      } else {
        this.selectedUserId = userId
        this.$emit('selected-user', userId)
        this.$eventBus.$emit('showChatroomEvent')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.Bar-layout {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url('/assets/pexels.jpg');
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  padding: 12px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

.search-bar {
  margin: 20px;
  padding: 0;
  width: 10%;
  /* Set the width to 100% to fit within the available space */
  text-align: center;
  /* Center the content horizontally */
  border-radius: 40px;
}

#chat-bar {
  padding: 22px;
  color: black;
  border-style: solid;
  background-color: white;
  border-radius: 40px;
  border-color: white;
  width: 400px;
  height: 70px;
  margin-top: 20px;
  margin-left: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.Chatt-bar {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 60px;
  padding: 0 10px;
  position: relative;
}

/* Animation */
@keyframes slideFromLeft {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

.Chatt-bar {
  animation: slideFromLeft 0.5s ease-out;
  /* Apply the animation */
}

/* Hover effect */
.Chatt-bar:hover:not(.offset) {
  transform: scale(1.05);
  /* Slightly scale the element */
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.2);
  /* Add a deeper shadow */
}

.Chatt-bar span {
  font-size: 26px;
  text-align: center;
  display: flex;
  align-items: center;
  /* Vertical centering of flex children */
  justify-content: center;
}

.user-images {
  width: 50px;
  height: 50px;
  background-color: #ccc;
  /* You can style the user's image here */
  border-radius: 50%;
  /* To create a circular image */
  margin-right: 10px;
}

.user-images img {
  object-fit: cover;
  object-fit: fill;
  height: inherit;
  width: inherit;
}

.offset {
  transform: translateX(100px);
}

.input-wrapper {
  position: relative;
  display: inline-block; // Makes it so that the width fits the content
  border-radius: 40px;
  width: 400px; // To round the corners
}

input {
  border: none;
  border-radius: 40px;
  width: 400px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  outline: none;
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
}

.fa-magnifying-glass {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  font-size: 2rem;
}

.fa-xmark {
  right: 20px;
  position: absolute;
  font-size: 1.8rem;
}

.Chatt-bar .centered-text {
  max-width: 60%;
  /* adjust as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10px;
  /* adjust as needed, especially if there are other elements like icons on the right */
  flex-grow: 1;
  /* This allows it to take up all available space */

}

@media only screen and (max-width: 1300px) {
  #chat-bar {
    padding: 22px;
    color: black;
    border-style: solid;
    background-color: white;
    border-radius: 40px;
    border-color: white;
    width: 300px;
    height: 60px;
    margin-top: 20px;
    margin-left: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 40px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  .fa-magnifying-glass {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 1rem;
  }
  .user-images {
  width: 40px;
  height: 40px;
  background-color: #ccc;
  /* You can style the user's image here */
  border-radius: 50%;
  /* To create a circular image */
  margin-right: 10px;
}

  input {
    border: none;
    float: left;
    border-radius: 40px;
    width: 250px;
    /* change this */
    height: 50px;
    /* change this */
    text-align: center;
    font-size: 24px;
    /* change this */
    outline: none;
    -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
    -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  }

  .achievement-circle {
    float: left;
    display: inline-block;
    border-radius: 50%;
    /* change this */
    margin: -15px;
    margin-inline-start: 1%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .Chatt-bar span {
    font-size: 21px;
    /* change this */
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .offset {
    transform: translateX(70px);
  }

  .fa-xmark {
    right: 20px;
    position: absolute;
    font-size: 1.5rem;
  }
}

@media only screen and (max-width: 968px) {
  #chat-bar {
    padding: 22px;
    color: black;
    border-style: solid;
    background-color: white;
    border-radius: 40px;
    border-color: white;
    width: 200px;
    height: 50px;
    margin-top: 20px;
    margin-left: 20px;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border-radius: 40px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  }

  .fa-magnifying-glass {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 1rem;
  }
  .user-images {
  width: 30px;
  height: 30px;
  background-color: #ccc;
  /* You can style the user's image here */
  border-radius: 50%;
  /* To create a circular image */
  margin-right: 10px;
}

  input {
    border: none;
    float: left;
    border-radius: 40px;
    width: 200px;
    /* change this */
    height: 40px;
    /* change this */
    text-align: center;
    font-size: 20px;
    /* change this */
    outline: none;
    -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
    -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  }

  .achievement-circle {
    float: left;
    display: inline-block;
    border-radius: 50%;
    /* change this */
    margin: -15px;
    margin-inline-start: 1%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center center;
  }

  .Chatt-bar span {
    font-size: 18px;
    /* change this */
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .offset {
    transform: translateX(60px);
  }

  .fa-xmark {
    right: 20px;
    position: absolute;
    font-size: 1.3rem;
  }
}

@media only screen and (max-width: 768px) {
  .Chatt-bar {
    display: none;
  }

  .search-bar {
    display: none;
  }

}
</style>
