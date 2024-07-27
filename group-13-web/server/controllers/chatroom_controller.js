const Chatroom = require("../modules/chatroom");
const achievements = require("../modules/achievements");
const User = require("../modules/user");


const delete_all_chatrooms = async (req, res) => {
  try {
    Chatroom.remove({}, function(err, result) {
      if (err) {
          console.log(err);
      }
      console.log(result);
    });
    res.json({ "message": "all chatrooms are deleted" })
  } catch (err) {
    response.status(500).send(err)
  }
}

const getOrCreateChatroom = async (req, res) => {
  try {
    const userId = req.params.userId;
    const loggedInUserId = req.params.loggedUserId;

    console.log("userId:", userId, "loggedInUserId:", loggedInUserId);

    // Validate the user IDs first
    if (
      !userId ||
      !loggedInUserId ||
      String(userId) === String(loggedInUserId)
    ) {
      return res.status(400).send({ error: "Invalid user IDs" });
    }

    // Check if chatroom already exists
    let chatroom = await Chatroom.findOne({
      users: {
        $all: [userId, loggedInUserId], // Ensuring both users are in the chatroom.
      },
    });

    if (!chatroom) {
      // Chatroom doesn't exist, create one.
      chatroom = new Chatroom({
        users: [userId, loggedInUserId],
        messages: [],
      });
      await chatroom.save();
    }

    // Return the chatroom ID.
    res.json({ chatroomId: chatroom._id });
  } catch (error) {
    console.error("Error finding or creating chatroom:", error);
    res.status(500).send({ error: "Error finding or creating chatroom" });
  }
};

const getFriends = async (request, response) => {
  const userId = request.params.userId;
  var chatroomIDs = [];

  try {
    // Find chatrooms where the user is a participant
    const chatrooms = await Chatroom.find({
      users: { $in: [userId] },
    });

    console.log("userId:", userId);
    console.log("chatrooms:", chatrooms);

    // Extract and collect the user IDs of other participants
    const otherUserIDs = chatrooms.reduce((userIDs, chatroom) => {
      chatroom.users.forEach((user) => {
        if (user.toString() !== userId) {
          userIDs.add(user.toString());
          chatroomIDs.push(chatroom._id);
        }
      });
      return userIDs;
    }, new Set());

    console.log("otherUserIDs:", otherUserIDs);

    // Convert the set of user IDs to an array
    const otherUsers = Array.from(otherUserIDs);
    console.log("chatroomIDs: ", chatroomIDs);

    response.json({ otherUsers, chatroomIDs });
  } catch (error) {
    console.error("Error fetching other users in chatrooms:", error);
    response
      .status(500)
      .json({ error: "An error occurred while fetching other users." });
  }
};

const post_chatroom = async (request, response) => {
  try {
    const chatroomData = request.body;
    const chatroom = new Chatroom(chatroomData);
    await chatroom.save();
    response.send(chatroom);
  } catch (error) {
    response.status(500).send(error);
  }
};

const get_chatroom = async (request, response) => {
  try {
    const chatrooms = await Chatroom.find({});
    response.send(chatrooms);
  } catch (error) {
    response.status(500).send(error);
  }
};
const get_chatroom_id = async (request, response) => {
  try {
    const chatroomId = request.params.id;
    if (!chatroomId) {
      return response.status(400).send("Chatroom ID is required");
    }

    const chatroom = await Chatroom.findById(chatroomId).populate("users");
    if (!chatroom) {
      return response.status(404).send("Chatroom not found");
    }

    const achCount = chatroom.messages.length;

    response.send({ chatroom, achCount });
  } catch (error) {
    console.error("Error retrieving chatroom:", error);
    response.status(500).send({ error: "Error retrieving chatroom" });
  }
};
const get_chatroom_messages = async (req, res) => {
  try {
    const chatroomId = req.params.id;
    if (!chatroomId) {
      return res.status(400).send("Chatroom ID is required");
    }

    const chatroom = await Chatroom.findById(chatroomId);
    if (!chatroom) {
      return res.status(404).send("Chatroom not found");
    }

    res.send(chatroom.messages);
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).send({ error: "Error retrieving messages" });
  }
};

const delete_chatroom = async (request, response) => {
  try {
    const chatroomID = request.params.id;
    await Chatroom.findByIdAndDelete(chatroomID);
    response.status(200).send("ok")
  } catch (error) {
    response.status(500).send(error);
  }
};

module.exports = {
  post_chatroom,
  get_chatroom,
  get_chatroom_id,
  delete_chatroom,
  getOrCreateChatroom,
  getFriends,
  delete_all_chatrooms,
  get_chatroom_messages
};