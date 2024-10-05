const Message = require('../models/messageModel');
const Chat = require('../models/ChatModel');

// Send Message function
const sendMessage = async (req, res) => {
  const { chatId, content } = req.body;

  if (!chatId || !content) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    // Create the message
    let newMessage = await Message.create({
      chat: chatId,
      sender: req.user._id,
      content: content
    });

    // Populate sender details (only include fields you want)
    newMessage = await newMessage.populate('sender', 'username ProfilePicture');

    // Populate chat and users details
    newMessage = await newMessage.populate({
      path: 'chat',
      populate: {
        path: 'users',
        select: 'name pic email' 
      }
    });

    // Update the latest message in the chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

    // Send the populated message
    res.status(201).send(newMessage);
  } catch (error) {
    console.log("Error while sending message:", error);
    res.status(500).send({ error: "Failed to send message" });
  }
};
const allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name profilePicture email')
      .populate('chat');
    res.status(200).send(messages);
  } catch (error) {
    console.log("Error while fetching messages:", error);
    res.status(500).send({ error: "Failed to fetch messages" });
  }
};

// Export the sendMessage function
module.exports = { sendMessage , allMessages};
