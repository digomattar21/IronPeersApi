require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Channel = require("../models/Channel.model");
const Bookmark = require("../models/Bookmark.model");
const User = require("../models/User.model");
const PrivateChannel = require("../models/PrivateChannel.model");

router.post("/channels/createglobal", async (req, res) => {
  const { name, firebaseId, isPrivate, userEmail, description } = req.body;
  try {

    let user = await User.findOne({ email: userEmail});
    let userId = user.id;

    let newChannel = await Channel.create({
      name: name,
      firebaseId: firebaseId,
      description: description,
      isPrivate: isPrivate,
      members: [userId]
    });

    let channelMongoId = newChannel.id;

    let userUpdated = await User.updateOne(
      {email: userEmail},
      {$push:{ joinedChannels:[channelMongoId]}}
      )

    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


router.post("/channels/createprivate", async (req, res) => {
  const { name, firebaseId, userEmail, description } = req.body;
  try {

    let user = await User.findOne({ email: userEmail});
    let userId = user.id;

    let newChannel = await PrivateChannel.create({
      name: name,
      firebaseId: firebaseId,
      description: description,
      members:[userId],
      invitedMembers: []
    });

    let channelMongoId = newChannel.id;

    let userUpdated = await User.updateOne(
      {email: userEmail},
      {$push:{ privateChannels:[channelMongoId]}}
      )

    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/channels/bookmarkmessage", async (req, res) => {
  const { channelId, firebaseId, message } = req.body;

  try {
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

router.post("/channels/private/bookmarkmessage", async (req, res) => {
  const { channelId, firebaseId, message } = req.body;

  try {
    let updateArray = await PrivateChannel.updateOne(
      { firebaseId: channelId },
      { $push: { bookMarkedMessages: [firebaseId] } }
    );
    res.status(201).json({ updated: updateArray });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/channels/getbookmarkedmessages/:channelId", async (req, res) => {
  const { channelId } = req.params;
  try {
    let channel = await Channel.findOne({ firebaseId: channelId });
    let bookmarks = channel.bookMarkedMessages;

    res.status(200).json({ bookmarked: bookmarks });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/adduserbookmark", async (req, res) => {
  const {
    email,
    channelId,
    messageFirebaseId,
    message,
    messageOwner,
    channelName,
  } = req.body;
  try {
    let channel = await Channel.findOne({ firebaseId: channelId });
    let newBookmark = await Bookmark.create({
      channelMongoId: channel.id,
      messageFirebaseId: messageFirebaseId,
      message: message,
      messageOwner: messageOwner,
      channelName: channelName,
    });
    let updateUserBookmark = await User.updateOne(
      { email: email },
      { $push: { myBookmarks: [newBookmark] } }
    );

    res.status(201).json({ bookmark: newBookmark });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/getuserbookmarks", async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email: email }).populate("myBookmarks");
    const allBookmarks = user.myBookmarks;
    res.status(200).json({ bookmarks: allBookmarks });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/channel/pinmessage", async (req, res) => {
  const { channelId, message, messageOwner, messageFirebaseId } = req.body;
  try {
    let channel = await Channel.updateOne(
      { firebaseId: channelId },
      { $push: { pinnedMessages: [messageFirebaseId] } }
    );

    let channelUpdated = await Channel.findOne({ firebaseId: channelId });

    res.status(201).json({ channel: channel });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});



router.post("/channel/private/pinmessage", async (req, res) => {
  const { channelId, message, messageOwner, messageFirebaseId } = req.body;
  try {
    let channel = await PrivateChannel.updateOne(
      { firebaseId: channelId },
      { $push: { pinnedMessages: [messageFirebaseId] } }
    );

    let channelUpdated = await Channel.findOne({ firebaseId: channelId });

    res.status(201).json({ channel: channel });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get("/channels/getpinnedmessages/:channelId", async (req, res) => {
  const { channelId } = req.params;
  try {
    let channel = await Channel.findOne({ firebaseId: channelId });
    let pinnedMessages = channel.pinnedMessages;
    res.status(200).json({ messageFirebaseIds: pinnedMessages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


router.get("/channels/private/getpinnedmessages/:channelId", async (req, res) => {
  const { channelId } = req.params;
  try {
    let channel = await PrivateChannel.findOne({ firebaseId: channelId });
    let pinnedMessages = channel.pinnedMessages;
    res.status(200).json({ messageFirebaseIds: pinnedMessages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});



router.get("/user/getinfo", async (req, res) => {
  const reqUser = req.user;
  try {
    let email = reqUser.email;
    let user = await User.findOne({ email: email });
    console.log(user);
    res.status(200).json({ userAuth: user });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get("/channels/getchannelmemberslength/:channelId", async (req, res) => {
  const { channelId } = req.params;

  try {
    
    let channel = await Channel.findOne({ firebaseId: channelId });
    let membersArray = channel.members;
    let membersLength = membersArray.length;

    res.status(200).json({ membersLength: membersLength });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/joinchannel", async (req, res) => {
  const { userEmail, channelId } = req.body;

  try {
    let message;
    let channel = await Channel.findOne({ firebaseId: channelId });
    let channelMongoId = channel.id;

    let userBefore = await User.findOne({ email: userEmail});

    if (userBefore.joinedChannels.includes(channelMongoId)) {
          message="already joined that channel"
    }else{
      let userUpdated = await User.updateOne(
        { email: userEmail },
        { $push: { joinedChannels: [channelMongoId] } }
      );
      let channelUpdated = await Channel.updateOne(
        {firebaseId: channelId},
        {$push:{members:[userBefore.id]}}
      )
  
    }

    res.status(201).json({ updated: message });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});


router.post('/user/getuserchannels', async (req, res) => {
  const {userEmail} = req.body;
  try {
    let user = await User.findOne({email: userEmail}).populate('joinedChannels favoriteChannels privateChannels');
    res.status(200).json({favoriteChannels: user.favoriteChannels, joinedChannels: user.joinedChannels, privateChannels: user.privateChannels})

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }

});


router.post('/user/setfavoritechannel', async (req, res)=>{
  const {userEmail, channelId} = req.body;
  try {
    let message='OK';
    let user = await User.findOne({email: userEmail});
    let channel = await Channel.findOne({ firebaseId: channelId });
    let channelMongoId = channel.id;

    if (user.favoriteChannels.includes(channelMongoId)){
      message='Ja esta nos favoritos'
    }else{
      let userUpdated = await User.updateOne(
        {email: userEmail},
        {$push: {favoriteChannels:[channelMongoId]}}
      );
    };

    res.status(200).json({message: message});

  } catch (error) {
    console.log(error.message);
    res.status(500).json({message: error.message})
  }
})

module.exports = router;
