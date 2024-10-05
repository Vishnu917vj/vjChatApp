const User=require('../models/userModel');
const Chat=require('../models/ChatModel');
const Message=require('../models/messageModel');
const mongoose=require('mongoose');
const accessChat = async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        console.log("User ID not sent along with body");
        return res.sendStatus(400);
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.user._id) || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).send("Invalid User ID format");
    }

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $in: [req.user._id] } },
            { users: { $in: [userId] } }
        ]
    })
    .populate("users", "-password")
    .populate("latestMessage");

    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "Chat between " + req.user.username + " and " + userId,
            isGroupChat: false,
            users: [req.user._id, userId]
        };

        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(fullChat);
        } catch (err) {
            res.status(400).send(err);
        }
    }
};

const fetchChat=async (req,res)=>{
    try
    {
        Chat.find({users:{$in:req.user._id}})
        .populate("users","-password")
        .populate("groupAdmin","-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async (result)=>{
            result=result.map((chat)=>{
                if(!chat.latestMessage)
                {
                    chat.latestMessage={};
                }
                return chat;
            })
            res.status(200).send(result);
        })
        .catch((err)=>{
            res.status(400).send(err);
        })

    }
    catch(err)
    {
        res.status(400).send(err);
    }
}
const createGroupChat=async (req,res)=>{
    if(!req.body.users || !req.body.name)
    {
        return res.status(400).send("Please fill all the fields");
    }
    var users = JSON.parse(req.body.users); // Correct typo here
users.push(req.user._id);
    if(users.length<2)
    {
        return res.status(400).send("More than 2 users are required to form a group chat");
    }
    try
    {
        const groupChat=await Chat.create({
            chatName:req.body.name,
            users:users,
            isGroupChat:true,
            groupAdmin:req.user
        })
        const fullGroupChat=await Chat.findOne({_id:groupChat._id}).populate("users","-password");
        res.status(200).send(fullGroupChat);
    }
    catch(err)
    {
        res.status(400).send(err);
    }
}
const renameGroup=async (req,res)=>{
    const {chatId,chatName}=req.body;
    const updatedChat=await Chat.findByIdAndUpdate(
        chatId,
        {chatName},
        {new:true}
    ).populate("users","-password")
    if(!updatedChat)
    {
        res.status(404).send("Chat not found");
    }
    else
    {
        res.status(200).send(updatedChat);
    }
}
const addToGroup=async (req,res)=>{
    const {chatId,userId}=req.body;
    const added=await Chat.findByIdAndUpdate(
        chatId,
        {$push:{users:userId}},
        {new:true}
    ).populate("users","-password")
    if(!added)
    {
        res.status(404).send("Chat not found");
    }
    else
    {
        res.status(200).send(added);
    }
}
const removeFromGroup=async (req,res)=>{
    const {chatId,userId}=req.body;
    const removed=await Chat.findByIdAndUpdate(
        chatId,
        {$pull:{users:userId}},
        {new:true}  
    ).populate("users","-password")
    if(!removed)
    {
        res.status(404).send("Chat not found");
    }
    else
    {
        res.status(200).send(removed);
    }
}

module.exports={accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup}