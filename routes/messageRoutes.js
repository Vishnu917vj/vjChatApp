// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleWare/authMiddleware');
const { sendMessage , allMessages} = require('../controller/messageController'); // Ensure this import is correct

// Route to send a message
router.route('/').post(protect, sendMessage);

// Uncomment this if you implement allMessages function later
// const { allMessages } = require('../controller/messageController');
router.route('/:chatId').get(protect, allMessages);

module.exports = router;
