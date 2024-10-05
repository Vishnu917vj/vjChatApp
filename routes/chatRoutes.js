const express=require('express');
const router=express.Router();
const {protect}=require('../middleWare/authMiddleware');
const {accessChat,fetchChat,createGroupChat,renameGroup,addToGroup,removeFromGroup}=require('../controller/chatController');

router.route('/').post(protect,accessChat).get(protect,fetchChat)
router.route('/group').post(protect,createGroupChat);
router.route('/rename').put(protect,renameGroup);
router.route('/groupadd').put(protect,addToGroup);
router.route('/groupremove').put(protect,removeFromGroup);
module.exports=router;

