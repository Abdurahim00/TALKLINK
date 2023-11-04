<head><link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css"
  integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1I9f5+W5f5Oj04meM1a7xj"
  crossorigin="anonymous"/>
</head>
<template>
  <div class="chat-wrapper">
    <transition name="fade">
      <div class="chat-container" v-if="showChatroom">

        <div id="user_info">
          <div class="user-profile">
            <div class="user-image">
              <img :key="imageURL" :src="imageURL" />
            </div>
            <div class="user-name" style="font-family: system-ui;">{{ chosenUsername }}</div>
          </div>
        </div>
        <section ref="chatArea" class="chat_area">
          <div v-for="(message, index) in messages" :key="index"
            :class="message.sender === loggedInUserId ? 'sent' : 'received'">
            <div class="message-bubble">
              {{ message.message }}
              <div class="timestamp">{{ formatTimestamp(message.createdAt) }}</div>
            </div>
          </div>
        </section>

        <section ref="sendSection" class="send_section">
          <form @submit.prevent="sendMessage" class="message-form">
            <input style="outline: none; font-size: 22px; padding-left: 20px;" v-model="newMessage" id="user_input"
              type="text" placeholder="Type your message" class="message-input" />
            <button id="submit_button" type="submit" class="send-button">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </section>
      </div>
    </transition>
    <div class="Welcome-text" v-if="!showChatroom">
      <div class="content-wrapper">
        <div class="hello-text">WELCOME TO TALKLINK {{ loggedInUserId.user_name }}</div>
        <h2 class="slogan">🌍 Speak Global, 🗨️ Chat Local.</h2>
        <h3 class="info">Connecting worlds, one chat at a time.</h3>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import io from 'socket.io-client'

export default {
  mounted() {
    // Fetching the logged-in user's ID
    this.fetchRoutesForLevels()

    axios
      .get('http://localhost:3000/current-user', { withCredentials: true })
      .then((response) => {
        axios.defaults.withCredentials = true

        this.loggedInUserId = response.data.userId
      })
      .catch((error) => {
        console.error('Error fetching current user:', error)
      })

    this.socket = io('http://localhost:3000')

    this.socket.on('chat message', (msg, room) => {
      if (this.chatroomId !== room) {
        console.log(this.chatroomId)
        console.log(room)
        this.loadMessages(this.chatroomId)
        this.achievementID(this.chatroomId)
        this.messages.push(msg)
        this.scrollToBottom()
      }
    })
  },

  data() {
    return {
      messages: [],
      loggedInUserId: '',
      chosenUser: '',
      newMessage: '',
      chosenUsername: '',
      showChatroom: false,
      imageURL: '',
      routes: []
    }
  },
  created() {
    this.$eventBus.$on('hideChatroomEvent', this.handleHideChatroom)
    this.$eventBus.$on('showChatroomEvent', this.handleShowChatroom)
  },
  beforeDestroy() {
    this.$eventBus.$off('hideChatroomEvent', this.handleHideChatroom)
    this.$eventBus.$off('showChatroomEvent', this.handleShowChatroom)
  },
  props: ['chatroomId'],
  watch: {
    chatroomId(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.loadMessages(newVal)
        this.achievementID(newVal)
      }
    },
    chosenUser: 'getUsername'
  },
  methods: {
    async fetchRoutesForLevels() {
      this.routes = [] // Clear the existing routes

      const levelPromises = []

      // Iterate through levels 1 to 5 and create an array of promises
      for (let level = 1; level <= 5; level++) {
        const promise = axios.get(`http://localhost:3000/achievements/${level}`)
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
    // TODO: fix translation
    translate(language, text) {
      axios.post('https://translation.googleapis.com/language/translate/v2',
        {
          q: text,
          source: 'en',
          target: language,
          format: 'text'
        },
        { Authorization: 'bearer' })
    },
    handleHideChatroom() {
      this.showChatroom = !this.showChatroom

      console.log(this.showChatroom)
    },
    handleShowChatroom() {
      // Add this method
      this.showChatroom = true
    },
    loadMessages(chatroomId) {
      this.chatroomIdValue = chatroomId
      console.log('Loading messages for chatroom:', chatroomId)
      axios
        .get(`http://localhost:3000/chatrooms/${chatroomId}/messages`)
        .then((response) => {
          console.log('Received messages data:', response.data)
          this.messages = response.data
          this.scrollToBottom()
          this.achievementID(chatroomId)
        })
        .catch((error) => {
          console.error('Error loading messages:', error)
        })
    },
    achievementID(chatroomId) {
      let length = 0
      axios
        .get(`http://localhost:3000/chatrooms/${chatroomId}`)
        .then((response) => {
          length = response.data.achCount
          if (length <= 5) {
            this.imageURL = require('@/assets/' + this.routes[0])
          } else if (length > 5 && length <= 10) {
            this.imageURL = require('@/assets/' + this.routes[1])
          } else if (length > 10 && length <= 15) {
            this.imageURL = require('@/assets/' + this.routes[2])
          } else if (length > 15 && length <= 20) {
            this.imageURL = require('@/assets/' + this.routes[3])
          } else if (length > 20) {
            this.imageURL = require('@/assets/' + this.routes[4])
          }
        })
        .catch((error) => {
          console.error('Error loading messages:', error)
        })
    },
    setChosenUser(user) {
      console.log('chosen from chatrooms:' + user)
      this.chosenUser = user
    },
    getUsername(user) {
      axios
        .get(`http://localhost:3000/users/${user}`)
        .then((response) => {
          console.log('Received user data:', response.data.user_name)
          this.chosenUsername = response.data.user_name
        })
        .catch((error) => {
          console.error('Error loading username:', error)
        })
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        const messageData = {
          sender: this.loggedInUserId,
          recipient: this.chosenUser,
          message: this.newMessage
        }

        console.log(messageData.recipient)
        console.log(messageData.sender)
        axios
          .post('http://localhost:3000/messages', messageData)
          .then((response) => {
            this.newMessage = ''
            this.scrollToBottom()
            this.socket.emit('chat message', response.data, this.chatroomIdValue)
          })
          .catch((error) => {
            console.error('Error sending message:', error)
          })
      }
    },

    formatTimestamp(timestamp) {
      const timestampDate = new Date(timestamp)
      const hours = timestampDate.getHours()
      const minutes = timestampDate.getMinutes()
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}`

      return formattedTime
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const chatArea = this.$refs.chatArea
        chatArea.scrollTop = chatArea.scrollHeight
      })
    }
  }
}
</script>

<style>
.Welcome-text {
  position: relative;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  width: 100%;
  padding-top: 20%;
  /* Adjust as required */
  text-align: center;
  /* To center the text */
}

.content-wrapper {
  display: inline-block;
  overflow: hidden;
  animation: typing 15s steps(1000), blink .5s step-end infinite alternate;
  width: 100%;
}

.hello-text {
  font-size: 4.5em;
  /* Adjust as required */
  padding-bottom: 100px;
}

.slogan {
  font-size: 2.3em;
  /* Adjust as required */
  margin-bottom: 35px;
  /* Adjust as required */
}

.info {
  font-size: 2.1em;
  padding-bottom: 150px;
  /* Adjust as required */
}

@keyframes typing {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

@keyframes blink {
  50% {
    border-color: transparent;
  }
}

.fade-enter-active,
.fade-leave-to {
  transition: opacity 1s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.chat-container {
  width: 80%;
  float: right;
}

.chat_area {
  float: right;
  background: white;
  display: block;
  width: 50%;
  /* Set width to 100% minus the width of the chatbars */
  height: 76vh;
  /* Use viewport height to fit the screen */
  overflow-y: scroll;
  padding: 15px;
  position: absolute;
  border-radius: 40px;
  padding-top: 5%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

#user_info {
  padding: 15px;
  position: fixed;
  width: 50%;
  /* Set a fixed width for the user info section */
  background-color: white;
  /* Add a background color for contrast */
  z-index: 1;
  color: white;
  border-top-left-radius: 35px;
  border-top-right-radius: 35px;
  font-size: 18px;
  letter-spacing: 1px;
}

.user-profile {
  display: flex;
  align-items: center;
}

.user-image {
  width: 50px;
  height: 50px;
  background-color: #ccc;
  /* You can style the user's image here */
  border-radius: 50%;
  /* To create a circular image */
  margin-right: 10px;
}

.user-image img {
  object-fit: fill;
  height: inherit;
  width: inherit;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  color: black;
}

.chat_area::-webkit-scrollbar {
  width: 0px;
  display: hidden;
}

.chat_area::-webkit-scrollbar-thumb {
  background-color: #ccc;
  display: hidden;
}

.send_section {
  display: block;
  position: fixed;
  bottom: 0;
  width: 50%;
  /* Set width to 100% minus the width of the chatbars */
  height: 12vh;
  margin: 0;
  background-color: transparent;
  outline: none;
}

.sent {
  text-align: right;
  margin: 10px 0;
}

.sent .message-bubble {
  background-color: rgb(0, 191, 255);
  color: white;
}

.received {
  text-align: left;
  margin: 10px 0;
}

.message-bubble {
  background-color: rgb(10, 209, 10);
  border-radius: 35px;
  padding: 10px;
  margin: 7px;
  position: relative;
  display: inline-block;
  color: white;
  font-size: 24px;
  padding: 20px 25px;
}

.timestamp {
  font-size: 14px;
  color: #999;
  position: absolute;
  bottom: -22px;
  border-radius: 5px;
  padding: 2px 5px;
  right: 15px;
}

.received .timestamp {
  font-size: 14px;
  color: #999;
  position: absolute;
  bottom: -22px;
  border-radius: 5px;
  padding: 2px 5px;
  left: 15px;
}

.message-form {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  background-color: transparent;
  border-radius: 25px;
}

.message-input {
  flex-grow: 1;
  height: 70px;
  border: none;
  border-radius: 40px;
  padding: 10px;
  margin-right: 10px;
  font-size: 16px;
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.send-button {
  background-color: rgb(10, 209, 10);
  border: none;
  height: 70px;
  border-radius: 40px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  -webkit-box-shadow: 0 0 10px rgb(0, 0, 0);
  -moz-box-shadow: 0 0 10px rgb(0, 0, 0);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0));
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}

.send-button:hover {
  background-color: #99ccff;
}

@media only screen and (max-width: 1300px) {

  .Welcome-text {
    position: absolute;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    width: 70%;
    padding-top: 20%;
    /* Adjust as required */
  }

  .content-wrapper {
    display: inline-block;
    width: 100%;
  }

  .hello-text,
  .slogan,
  .info {
    font-size: 2.8em;
    /* Adjust as required */
    padding-bottom: 20px;
    /* Give a bottom padding to each text element for separation */
    margin: 0;
    /* Reset any browser-default margins */
  }

  .slogan {
    font-size: 1.8em;
    /* Adjust as required */
  }

  .info {
    font-size: 1.6em;
  }
}

@media only screen and (max-width: 968px) {
  .Welcome-text {
    position: absolute;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    width: 75%;
    padding-top: 20%;
    /* Adjust as required */
  }

  .content-wrapper {
    display: inline-block;
    width: 100%;
  }

  .hello-text,
  .slogan,
  .info {
    font-size: 2.5em;
    /* Adjust as required */
    padding-bottom: 20px;
    /* Give a bottom padding to each text element for separation */
    margin: 0;
    /* Reset any browser-default margins */
  }

  .slogan {
    font-size: 1.6em;
    /* Adjust as required */
  }

  .info {
    font-size: 1.3em;
  }

}

@media only screen and (max-width: 768px) {
  .chat-container {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* Center vertically */
    align-items: center;
    /* Center horizontally */
  }

  .chat_area {
    transform: translateX(-16.5%);
    width: 90%;
    max-width: 768px;
    max-height: 75%;
    height: 64vh;
    overflow-y: scroll;
    border-radius: 40px;
    background: linear-gradient(135deg,
        rgba(255, 255, 255, 0.1),
        rgba(255, 255, 255, 0));
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    margin-bottom: 40%;
  }

  .send_section {
    position: flex;
    left: 50%;
    /* Center the element horizontally */
    transform: translateX(-50%);
    /* Shift back by half of its width for precise centering */
    bottom: 40px;
    width: 90%;
    height: 6vh;
    /* Adjusted to auto so it takes only the necessary height */
    /* Added padding for inner spacing */
    justify-content: center;
    /* Center the content horizontally */
    align-items: center;
    padding-bottom: 60px;

    /* Center the content vertically */
  }

  .send-button {
    background-color: transparent;
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    outline: none;
    transition: transform 0.2s ease;
    width: 60px;
    height: 40px;
  }

  #user_info {
    display: none;
  }

  .user-image {
    display: none;
  }

  .user-name {
    display: none;
  }

  .fa-paper-plane {
    font-size: 22px;
  }

  .Welcome-text {
    position: absolute;
    font-family: monospace;
    white-space: nowrap;
    overflow: hidden;
    width: 100%;
    /* full width of the parent */
    top: 50%;
    /* position at the middle of the parent */
    left: 50%;
    /* position at the middle of the parent */
    transform: translate(-50%, -50%);
    /* adjust for its own dimensions */
    text-align: center;
    /* align text center horizontally */
    padding-bottom: 40%;
  }

  .content-wrapper {
    display: inline-block;
    width: 100%;
    /* full width */
  }

  .hello-text,
  .slogan,
  .info {
    font-size: 1.3em;
    /* Adjust as required */
    padding-bottom: 20px;
    /* Give a bottom padding to each text element for separation */
    margin: 0;
    /* Reset any browser-default margins */
  }

  .slogan {
    font-size: 1.1em;
    /* Adjust as required */
  }

  .info {
    font-size: 0.8em;
  }

  .fade-enter-active,
  .fade-leave-to {}

  .fade-enter,
  .fade-leave-to {}

  .sent {
    text-align: right;
    margin: 8px 0;
  }

  .sent .message-bubble {
    background-color: rgb(0, 191, 255);
    color: white;
  }

  .received {
    text-align: left;
    margin: 8px 0;
  }

  .message-bubble {
    background-color: rgb(10, 209, 10);
    border-radius: 25px;
    padding: 8px;
    margin: 5px;
    position: relative;
    display: inline-block;
    color: white;
    font-size: 14px;
    padding: 14px 18px;
  }

  .timestamp {
    font-size: 11px;
    color: #999;
    position: absolute;
    bottom: -22px;
    border-radius: 5px;
    padding: 2px 5px;
    right: 15px;
  }

  .received .timestamp {
    font-size: 11px;
    color: #999;
    position: absolute;
    bottom: -22px;
    border-radius: 5px;
    padding: 2px 5px;
    left: 15px;
  }
}
</style>
