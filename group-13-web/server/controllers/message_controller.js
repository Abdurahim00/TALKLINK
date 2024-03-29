
const Message = require("../modules/message")
const Chatroom = require("../modules/chatroom")


const post_message = async (request, response) => {
  try {
    const messageData = request.body;
    const message = new Message(messageData);
    await message.save();


    const chatroom = await Chatroom.findOne({
      users: {
        $all: [messageData.sender, messageData.recipient]
      }
    });

    if (!chatroom) {
      const newChatroom = new Chatroom({
        users: [messageData.sender, messageData.recipient],
        messages: [message._id]
      });
      await newChatroom.save();
    } else {
      chatroom.messages.push(message._id);
      await chatroom.save();
    }

    response.send(message);
  } catch (error) {
    response.status(500).send(error);
  }
}

const post_message_to_chatroom = async (request, response) => {
  try {
    const messageData = request.body;
    const message = new Message(messageData);
    await message.save();


    const chatroom = await Chatroom.findById(request.params.chatroomId);

    if (!chatroom) {
      const newChatroom = new Chatroom({
        users: [messageData.sender, messageData.recipient],
        messages: [message._id]
      });
      await newChatroom.save();
    } else {
      chatroom.messages.push(message._id);
      await chatroom.save();
    }

    response.send(message);
  } catch (error) {
    response.status(500).send(error);
  }
}


const get_message = async (request, response) => {
  try {
    const messages = await Message.find({});
    response.send(messages);
  } catch (error) {
    response.status(500).send(error);
  }
}


const get_message_id = async (request, response) => {
  try {
    const messageId = request.params.id;
    const message = await Message.findById(messageId);
    if (!message) {
      return response.status(404).json({ message: "Message not found" });
    }
    response.json(message);
  } catch (error) {
    response.status(500).send(error);
  }
}

const get_message_from_chatroom = async (request, response) => {
  try {
    const chatroomId = request.params.chatroomId;
    const userId = request.userId; // Assuming this is how you get the current user's ID

    // Fetch the chatroom and populate messages
    const chatroom = await Chatroom.findById(chatroomId).populate('messages');

    if (!chatroom) {
      return response.status(404).json({ message: "Chatroom not found" });
    }

    // Assuming you have a way to get the user's selected country/language preference
    const currentUser = await User.findById(userId);
    const currentUserLanguage = currentUser.selectedCountry; // Adjust this based on your user model

    // Iterate over messages and translate if necessary
    const messagesWithTranslation = await Promise.all(chatroom.messages.map(async (message) => {
      // Fetch sender's language preference
      const sender = await User.findById(message.sender);
      const senderLanguage = sender.selectedCountry; // Adjust based on your user model

      // Check if translation is needed
      if (currentUserLanguage !== senderLanguage) {
        // Call your translation function here and get the translated text
        const translatedText = await translateMessage(message.message, currentUserLanguage);

        return {
          ...message.toObject(),
          translatedMessage: translatedText
        };
      } else {
        // No translation needed
        return message;
      }
    }));

    response.json(messagesWithTranslation);
  } catch (error) {
    console.error(error);
    response.status(500).send(error);
  }
};


const message_chatroom = async (request, response) => {
  try {
    const chatroomId = request.params.chatroomId;
    const chatroom = await Chatroom.findById(chatroomId).populate("messages");
    if (!chatroom) {
      return response.status(404).json({ message: "Chatroom not found" });
    }
    response.json(chatroom.messages);
  } catch (error) {
    response.status(500).send(error);
  }
}

const delete_message = async (req, res) => {
  try {
    const chatroomId = req.params.chatroomId;
    const messageId = req.params.messageId;
    Message.findByIdAndDelete(messageId);
    
    res.json({ "message": "message deleted" })
  } catch (err) {
    response.status(500).send(err)
  }
}

const update_msg = async (request, response) => {
  try {
    const msgId = request.params.id;
    const msgData = request.body;
    const msg = await Message.findByIdAndUpdate(msgId, msgData, { new: true });
    response.send(msg);
  } catch (error) {
    response.status(500).send(error);
  }
}


const delete_all_messages = async (req, res) => {
  try {
    Message.remove({}, function(err, result) {
      if (err) {
          console.log(err);
      }
      console.log(result);
    });
    res.json({ "message": "all message deleted" })
  } catch (err) {
    response.status(500).send(err)
  }
}


module.exports = {
  post_message,
  get_message,
  get_message_id,
  message_chatroom,
  get_message_from_chatroom,
  post_message_to_chatroom,
  delete_message,
  update_msg,
  delete_all_messages
} //