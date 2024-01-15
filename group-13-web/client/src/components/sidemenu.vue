/* eslint-disable */
<template>
  <div class="Bar-layout">
    <div class="username-icon">
      <i class="fa-solid fa-user sideuser"></i>
      {{ loggedInUsername }}
    </div>
    <div class="search-bar">
      <div class="input-wrapper" style="border: none; font-family: system-ui">
        <input
          type="text"
          v-model="searchQuery"
          @keydown.enter="searchUser"
          placeholder="Search for a user"
        />
        <i class="fa-solid fa-magnifying-glass"></i>
      </div>
    </div>
    <div
      class="Chatt-bar"
      v-for="(userId, index) in users"
      :key="userId"
      id="chat-bar"
      @click="selectUser(userId)"
    >
      <div class="achievement-circle">
        <div class="user-images">
          <img :key="imageURL" :src="imageURL[index]" />
        </div>
      </div>
      <span
        class="centered-text"
        style="padding-left: 40px; font-family: system-ui"
        >{{ usernames[userId] || 'Loading...' }}</span
      >
      <i
        class="fa-solid fa-xmark"
        style="color: red"
        @click="handleDeleteUser($event, userId)"
      ></i>
    </div>
    <font-awesome-icon icon="icons" />
  </div>
</template>

<script>
import axios from 'axios'
import Vue from 'vue'

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
      counter: 0
    }
  },
  mounted() {
    axios
      .get('http://localhost:3000/current-user', { withCredentials: true })
      .then((response) => {
        this.loggedInUserId = response.data.userId
        this.getAllFriends()
        this.fetchLoggedInUsername()
      })
      .catch((error) => {
        console.error('Error fetching current user:', error)
      })
  },
  methods: {
    async getAllFriends() {
      try {
        const response = await axios.get(
          `http://localhost:3000/chatrooms/users/${this.loggedInUserId}`
        )
        this.users = response.data.otherUsers
        this.chatroomIDs = response.data.chatroomIDs
        console.log('chatroomIDs', this.chatroomIDs)
        await this.fetchUsernamesForUsers()
      } catch (error) {
        console.error('Error fetching friends:', error)
      }
    },
    async fetchLoggedInUsername() {
      try {
        const response = await axios.get(`http://localhost:3000/users/${this.loggedInUserId}`)
        this.loggedInUsername = response.data.user_name
      } catch (error) {
        console.error('Error fetching logged-in username:', error)
      }
    },

    async fetchUsernamesForUsers() {
      try {
        const responses = await Promise.all(
          this.users.map((userId) =>
            axios.get(`http://localhost:3000/users/${userId}`)
          )
        )
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
        axios
          .get(`http://localhost:3000/chatrooms/${this.chatroomIDs[index]}`)
          .then((response) => {
            const length = response.data.achCount
            let imageURL
            if (length <= 5) {
              imageURL = require('@/assets/wood.png')
            } else if (length > 5 && length <= 10) {
              imageURL = require('@/assets/bronze-bar.png')
            } else if (length > 10 && length <= 15) {
              imageURL = require('@/assets/silver-bars.png')
            } else if (length > 15 && length <= 20) {
              imageURL = require('@/assets/gold-bricks.png')
            } else if (length > 20) {
              imageURL = require('@/assets/diamond.png')
            }

            this.$set(this.imageURL, index, imageURL)
            console.log('imageURLs', this.imageURL[this.counter])
            console.log('counter', this.counter)
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
        const response = await axios.get('http://localhost:3000/users', {
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
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this user?'
      )
      if (!confirmDelete) return

      try {
        const chatroomId = await axios.post(
          `http://localhost:3000/chatroom-for-user/${userId}/${this.loggedInUserId}`
        )
        console.log('to be deleted chatroom', chatroomId.data.chatroomId)
        axios.delete(
          `http://localhost:3000/chatrooms/${chatroomId.data.chatroomId}`
        )
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
        this.$emit('unToggleMenu')
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
  align-items: flex-start;
  position: absolute;
  top: 50px;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 12px;
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

#chat-bar {
  color: black;
  border-style: solid;
  background-color: white;
  border-color: white;
  width: 100%;
  height: 70px;
  margin-top: 20px;

  // Removed backdrop-filter, used a fallback background.
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0)
  );
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  padding-right: 80px;
}

.Chatt-bar {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 60px;
  padding: 0 10px;
  position: relative;
  background-color: white;
}

.Chatt-bar span {
  font-size: 26px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrapper {
  position: relative;
  display: inline-block;
  border-radius: 40px;
  width: 400px;
}

.search-user {
  border: none;
  border-radius: 40px;
  width: 400px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  outline: none;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-right: 10px;
  flex-grow: 1;
}

@media only screen and (max-width: 768px) {
  .username-icon {
    display: flex;
    align-items: center;
    gap: 10px; // Optional, it will add a space between the icon and the username
    padding-left: 10px;
  }
  #chat-bar {
    color: black;
    border-style: solid;
    background-color: white;
    border-color: white;
    width: 100%;
    height: 50px;
    margin-top: 20px;
    padding-right: 80px;
  }

  .fa-magnifying-glass {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 1rem;
  }

  input {
    border: none;
    float: left;
    border-radius: 40px;
    width: 70%;
    height: 40px;
    text-align: center;
    font-size: 18px;
    outline: none;
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
    object-fit: fill;
    height: inherit;
    width: inherit;
  }

  .Chatt-bar span {
    font-size: 12px;
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

  .search-user {
    border: none;
    width: 200px;
    height: 40px;
    text-align: center;
    font-size: 12px;
    outline: none;
  }
  .search-bar {
  width: 100%;
  padding-top: 30px;
}
}
</style>
