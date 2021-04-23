require("dotenv").config();
const express = require("express");
const router = express.Router();
const axios = require("axios");
const Channel = require("../models/Channel.model");
const Bookmark = require("../models/Bookmark.model");
const User = require("../models/User.model");
const PrivateChannel = require("../models/PrivateChannel.model");
const PrivateBookmark = require("../models/PrivateBookmark.model");
const Invite = require("../models/Invite.model");
const Inbox = require("../models/Inbox.model");
const { resolveHostname } = require("nodemailer/lib/shared");

router.post("/channels/createglobal", async (req, res) => {
  const { name, firebaseId, isPrivate, userEmail, description } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    let userId = user.id;

    let newChannel = await Channel.create({
      name: name,
      firebaseId: firebaseId,
      description: description,
      isPrivate: isPrivate,
      members: [userId],
    });

    let channelMongoId = newChannel.id;

    let userUpdated = await User.updateOne(
      { email: userEmail },
      { $push: { joinedChannels: [channelMongoId] } }
    );

    res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/channels/createprivate", async (req, res) => {
  const { name, firebaseId, userEmail, description } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    let userId = user.id;

    let newChannel = await PrivateChannel.create({
      name: name,
      firebaseId: firebaseId,
      description: description,
      members: [userId],
      invitedMembers: [],
    });

    let channelMongoId = newChannel.id;

    let userUpdated = await User.updateOne(
      { email: userEmail },
      { $push: { privateChannels: [channelMongoId] } }
    );

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
    fileURL,
  } = req.body;
  try {
    let channel = await Channel.findOne({ firebaseId: channelId });
    let newBookmark = await Bookmark.create({
      channelMongoId: channel.id,
      messageFirebaseId: messageFirebaseId,
      message: message,
      messageOwner: messageOwner,
      channelName: channelName,
      isPrivate: false,
      fileURL: fileURL ? fileURL : "",
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

router.post("/user/adduserprivatebookmark", async (req, res) => {
  const {
    email,
    channelId,
    messageFirebaseId,
    message,
    messageOwner,
    channelName,
    fileURL,
  } = req.body;
  try {
    let channel = await PrivateChannel.findOne({ firebaseId: channelId });
    let newBookmark = await PrivateBookmark.create({
      channelMongoId: channel.id,
      messageFirebaseId: messageFirebaseId,
      message: message,
      messageOwner: messageOwner,
      channelName: channelName,
      isPrivate: true,
      fileURL: fileURL ? fileURL : "",
    });
    let updateUserBookmark = await User.updateOne(
      { email: email },
      { $push: { myPrivateBookmarks: [newBookmark] } }
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
    let user = await User.findOne({ email: email }).populate(
      "myBookmarks myPrivateBookmarks"
    );
    const bookmarksR = user.myBookmarks;
    const privateBookmarks = user.myPrivateBookmarks;
    const allBookmarks = [...bookmarksR, ...privateBookmarks];
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

router.get(
  "/channels/private/getpinnedmessages/:channelId",
  async (req, res) => {
    const { channelId } = req.params;
    try {
      let channel = await PrivateChannel.findOne({ firebaseId: channelId });
      let pinnedMessages = channel.pinnedMessages;
      res.status(200).json({ messageFirebaseIds: pinnedMessages });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

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

router.get(
  `/channels/private/getchannelmemberslength/:channelId`,
  async (req, res) => {
    const { channelId } = req.params;

    try {
      let channel = await PrivateChannel.findOne({ firebaseId: channelId });
      let membersArray = channel.members;
      let membersLength = membersArray.length;

      res.status(200).json({ membersLength: membersLength });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  }
);

router.post("/user/joinchannel", async (req, res) => {
  const { userEmail, channelId } = req.body;

  try {
    let message;
    let channel = await Channel.findOne({ firebaseId: channelId });
    let channelMongoId = channel.id;

    let userBefore = await User.findOne({ email: userEmail });

    if (userBefore.joinedChannels.includes(channelMongoId)) {
      message = "already joined that channel";
    } else {
      let userUpdated = await User.updateOne(
        { email: userEmail },
        { $push: { joinedChannels: [channelMongoId] } }
      );
      let channelUpdated = await Channel.updateOne(
        { firebaseId: channelId },
        { $push: { members: [userBefore.id] } }
      );
    }

    res.status(201).json({ updated: message });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/getuserchannels", async (req, res) => {
  const { userEmail } = req.body;
  try {
    let user = await User.findOne({ email: userEmail }).populate(
      "joinedChannels favoriteChannels privateChannels inbox"
    );
    if (user) {
      res.status(200).json({
        favoriteChannels: user.favoriteChannels,
        joinedChannels: user.joinedChannels,
        privateChannels: user.privateChannels,
        hasUnread: user.inbox.hasUnread,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/setfavoritechannel", async (req, res) => {
  const { userEmail, channelId } = req.body;
  try {
    let message = "OK";
    let user = await User.findOne({ email: userEmail });
    let channel = await Channel.findOne({ firebaseId: channelId });
    let channelMongoId = channel.id;

    if (user.favoriteChannels.includes(channelMongoId)) {
      message = "Ja esta nos favoritos";
    } else {
      let userUpdated = await User.updateOne(
        { email: userEmail },
        { $push: { favoriteChannels: [channelMongoId] } }
      );
    }

    res.status(200).json({ message: message });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/sendprivatechannelinvite", async (req, res) => {
  const { userWhoInvited, channelId, userInvited } = req.body;

  try {
    let userSending = await User.findOne({ email: userWhoInvited });
    let userReceiving = await User.findOne({ email: userInvited }).populate(
      "inbox"
    );
    let channel = await PrivateChannel.findOne({ firebaseId: channelId });
    let invite;
    let inboxId = userReceiving.inbox.id;

    if (userSending && userReceiving && channel) {
      invite = await Invite.create({
        userWhoInvited: userSending.id,
        userInvited: userReceiving.id,
        channelMongoId: channel.id,
        channelFirebaseId: channelId,
        read: false,
      });
    } else {
      throw Error("Usuario nao encontrado");
    }

    let userUpdated = await Inbox.findByIdAndUpdate(inboxId, {
      hasUnread: true,
      $push: { invites: [invite.id] },
    });

    res.status(200).json({ message: "Invite sucessfully sent" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/inbox/getinfo", async (req, res) => {
  const { userEmail } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    let inboxId = user.inbox;
    let inbox = await Inbox.findById(inboxId)
      .sort([["createdAt", "descending"]])
      .populate("invites");

    res
      .status(200)
      .json({ invites: inbox.invites, hasUnread: inbox.hasUnread });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/invites/getinfo", async (req, res) => {
  const { userWhoInvited, channelFirebaseId } = req.body;

  try {
    let user = await User.findById(userWhoInvited);
    let channel = await PrivateChannel.findOne({
      firebaseId: channelFirebaseId,
    });

    res.status(200).json({
      channelName: channel.name,
      userName: user.username,
      membersLength: channel.members.length,
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/channel/private/joinprivatechannel", async (req, res) => {
  const { userEmail, channelFirebaseId, inviteId } = req.body;
  console.log("invite", inviteId);
  try {
    let mesage;
    let user = await User.findOne({ email: userEmail });
    let channel = await PrivateChannel.findOne({
      firebaseId: channelFirebaseId,
    });
    if (user.privateChannels.includes(channel.id)) {
      message = "You already joined this channel";
      await Invite.findByIdAndDelete(inviteId);
    } else {
      await User.updateOne(
        { email: userEmail },
        { $push: { privateChannels: [channel.id] } }
      );
      await Invite.findByIdAndDelete(inviteId);
      message = "Success";
    }

    res.status(200).json({ message: message });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/invite/deleteone", async (req, res) => {
  const { inviteId } = req.body;
  try {
    await Invite.findByIdAndDelete(inviteId);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/inbox/sethasunreadfalse", async (req, res) => {
  const { userEmail } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    let inbox = await Inbox.findByIdAndUpdate(user.inbox, { hasUnread: false });
    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/removebookmarkedmessage", async (req, res) => {
  const { isPrivate, userEmail, messageFirebaseId, bookmarkMongoId } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    if (isPrivate) {
      await PrivateBookmark.findByIdAndDelete(bookmarkMongoId);
      let updateUserBookmark = await User.updateOne(
        { email: userEmail },
        { $pull: { myPrivateBookmarks: [bookmarkMongoId] } }
      );
    } else {
      await Bookmark.findByIdAndDelete(bookmarkMongoId);
      await User.updateOne(
        { email: userEmail },
        { $pull: { myBookmarks: [bookmarkMongoId] } }
      );
    }

    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
