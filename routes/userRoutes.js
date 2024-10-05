const express = require('express');
const router = express.Router();
const { registerUser, authUser,allUser,UpdateProfilePic ,UpdateUsername} = require('../controller/userController');
const { protect } = require('../middleWare/authMiddleware');

// Define the POST /login route correctly
router.post("/login", authUser);

// Register route
router.post("/", registerUser)
router.get("/allusers",protect,allUser);
router.post("/updatepic",protect,UpdateProfilePic);
router.post("/updateusername",protect,UpdateUsername);

module.exports = router;
