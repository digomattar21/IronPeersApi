require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Channel = require("../models/Channel.model");
const Bookmark = require("../models/Bookmark.model");
const User = require("../models/User.model");

router.post("/channels/createglobal", async (req, res) => {
  const { name, firebaseId } = req.body;
  try {
    let newChannel = await Channel.create({
      name: name,
      firebaseId: firebaseId,
    });

    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/channels/bookmarkmessage", async (req, res) => {
  const { channelId, firebaseId, message } = req.body;

  try {
    console.log("channel id", channelId);
    let updateArray = await Channel.updateOne(
      { firebaseId: channelId },
      { $push: { bookMarkedMessages: [firebaseId] } }
    );
    res.status(201).json({ updated: updateArray });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


router.get('/channels/getbookmarkedmessages/:channelId', async (req, res) => {
    const {channelId} = req.params;
    try {
        
        let channel = await Channel.findOne({firebaseId: channelId});
        let bookmarks = channel.bookMarkedMessages;        

        res.status(200).json({ bookmarked: bookmarks})

    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});


router.post('/user/adduserbookmark', async (req, res) => {
    const {email, channelId, messageFirebaseId, message, messageOwner, channelName }= req.body;
    try {
        let channel = await Channel.findOne({firebaseId: channelId});
        console.log(channel.id)
        let newBookmark = await Bookmark.create({channelMongoId: channel.id, messageFirebaseId: messageFirebaseId, message: message, messageOwner: messageOwner, channelName: channelName});
        let updateUserBookmark = await User.updateOne(
            {email: email}, 
            {$push: {myBookmarks: [newBookmark]}}
        )

        res.status(201).json({bookmark: newBookmark})

        
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message });
    }
});

router.post('/user/getuserbookmarks', async (req, res) => {
    const {email} = req.body;
    try {
        let user = await User.findOne({email: email}).populate('myBookmarks');
        const allBookmarks = user.myBookmarks;
        console.log(allBookmarks)
        res.status(200).json({bookmarks: allBookmarks})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({ message: error.message });
    }
});

router.post('/channel/pinmessage', async (req, res) => {
  const {channelId, message, messageOwner, messageFirebaseId}= req.body;
  try {

    let channel = await Channel.updateOne(
      {firebaseId: channelId},
      {$push: {pinnedMessages:[messageFirebaseId]}}
      );
      
      let channelUpdated = await Channel.findOne({firebaseId: channelId})

    res.status(201).json({channel: channel})

  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }
});


router.get('/channels/getpinnedmessages/:channelId', async (req, res) => {
  const {channelId} = req.params;
  try {
    let channel = await Channel.findOne({firebaseId: channelId});
    let pinnedMessages = channel.pinnedMessages;
    console.log(pinnedMessages)
    res.status(200).json({messageFirebaseIds: pinnedMessages})

  } catch (error) {
    console.log(error.message)
    res.status(500).json({message: error.message});
  }
});

router.get('/user/getinfo', async (req, res)=>{
  const reqUser = req.user;
  console.log(reqUser)
  try{
    let email = reqUser.email;
    let user = await User.findOne({ email: email})
    console.log(user)
    res.status(200).json({userAuth:user})
  }catch(err){
    console.log(err.message)
    res.status(500).json({message:err.message})
  }
})

module.exports = router;
