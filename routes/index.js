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
const Profile = require("../models/Profile.model");
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

router.post("/channels/private/getpinnedmessages", async (req, res) => {
  const { channelId, isPrivate } = req.body;
  try {
    let channel;
    if (isPrivate) {
      channel = await PrivateChannel.findOne({ firebaseId: channelId });
    } else {
      channel = await Channel.findOne({ firebaseId: channelId });
    }
    let pinnedMessages = channel.pinnedMessages;
    res.status(200).json({ messageFirebaseIds: pinnedMessages });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
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
        userDms: user.dms,
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
    if (inbox.invites.length <= 0) {
      await Inbox.findByIdAndUpdate(inbox.id, { $set: { hasUnread: false } });
    }
    res
      .status(200)
      .json({ invites: inbox.invites, hasUnread: inbox.hasUnread });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/invites/getinfo", async (req, res) => {
  const { userWhoInvited, channelFirebaseId, dmId } = req.body;

  try {
    let user = await User.findById(userWhoInvited);
    if (dmId) {
      res.status(200).json({
        userName: user.username,
        dmId: dmId,
      });
    } else {
      let channel = await PrivateChannel.findOne({
        firebaseId: channelFirebaseId,
      });
      res.status(200).json({
        channelName: channel.name,
        userName: user.username,
        membersLength: channel.members.length,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/channel/private/joinprivatechannel", async (req, res) => {
  const { userEmail, channelFirebaseId, inviteId } = req.body;
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
      await PrivateChannel.updateOne({firebaseId: channelFirebaseId},{
        $push:{members: [user.id]}
      })
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

router.post("/channel/getmembers", async (req, res) => {
  let { isPrivate, channelId } = req.body;
  try {
    let members;
    if (isPrivate) {
      let channel = await PrivateChannel.findOne({ firebaseId: channelId });
      members = channel.members;
    } else {
      let channel = await Channel.findOne({ firebaseId: channelId });
      members = channel.members;
    }

    res.status(200).json({ members: members });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/channel/getmembersinfo", async (req, res) => {
  let { members } = req.body;
  try {
    let membersInfo = [];
    for (let i = 0; i < members.length; i++) {
      let user = await User.findById(members[i]);
      let { username, profilePic, email } = user;
      membersInfo.push({
        username: username,
        profilePic: profilePic,
        email: email,
      });
    }

    res.status(200).json({ info: membersInfo });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/directmessage/searchforuser", async (req, res) => {
  let { query } = req.body;
  let userQueryResults;
  try {
    query.includes("@")
      ? await User.aggregate(
          [
            {
              $match: {
                email: { $regex: query, $options: "i" },
              },
            },
            { $unwind: "$email" },
            {
              $match: {
                email: { $regex: query, $options: "i" },
              },
            },
            {
              $group: {
                _id: "$_id",
                email: { $push: "$email" },
                profilePic: { $first: "$profilePic" },
              },
            },
          ],
          function (err, results) {
            if (err) {
              throw err;
            } else {
              res.status(200).json({ results: results });
            }
          }
        )
      : await User.aggregate(
          [
            {
              $match: {
                username: { $regex: query, $options: "i" },
              },
            },
            { $unwind: "$username" },
            {
              $match: {
                username: { $regex: query, $options: "i" },
              },
            },
            {
              $group: {
                _id: "$_id",
                username: { $push: "$username" },
                profilePic: { $first: "$profilePic" },
              },
            },
          ],
          function (err, results) {
            if (err) {
              throw err;
            } else {
              res.status(200).json({ results: results });
            }
          }
        );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/directmessage/createnew", async (req, res) => {
  const { userEmail, otherUsername, dmId, inviteId } = req.body;

  try {
    let updatedUserSending = await User.updateOne(
      { email: userEmail },
      { $push: { dms: [dmId] } }
    );

    let deletedInvite = await Invite.findByIdAndDelete(inviteId);

    let userR = await User.findOne({ username: otherUsername }).populate(
      "inbox"
    );

    if (userR.inbox.invites.length <= 0) {
      await Inbox.findByIdAndUpdate(userR.inbox.id, {
        $set: { hasUnread: false },
      });
    }

    let updatedUserReceiving = await User.updateOne(
      { username: otherUsername },
      { $push: { dms: [dmId] } }
    );

    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/directmessage/senddmrequest", async (req, res) => {
  const { userWhoInvitedEmail, userReceivingUsername, dmId } = req.body;
  try {
    let userWhoInvited = await User.findOne({ email: userWhoInvitedEmail });
    let userReceiving = await User.findOne({ username: userReceivingUsername });
    let userInvitedInboxId = userReceiving.inbox;

    let newInvite = await Invite.create({
      userWhoInvited: userWhoInvited.id,
      userInvited: userReceiving.id,
      dmId: dmId,
      read: false,
    });

    let userWhoInvitedUpdated = await Inbox.findByIdAndUpdate(
      userInvitedInboxId,
      {
        hasUnread: true,
        $push: { invites: [newInvite.id] },
      }
    );

    res.status(200).json({ message: "Invite sent sucessfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/getdms", async (req, res) => {
  let { userEmail } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    res.status(200).json({ dms: user.dms });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/channel/checkdeletemessage", async (req, res) => {
  let { channelFirebaseId, messageFirebaseId, Private } = req.body;
  try {
    if (Private) {
      let channel = await PrivateChannel.findOne({
        firebaseId: channelFirebaseId,
      });
      if (channel.pinnedMessages.includes(messageFirebaseId)) {
        await PrivateChannel.updateOne(
          { firebaseId: channelFirebaseId },
          { $pull: { pinnedMessages: messageFirebaseId } }
        );
      }
    } else {
      let channell = await Channel.findOne({ firebaseId: channelFirebaseId });
      if (channell.pinnedMessages.includes(messageFirebaseId)) {
        await Channel.updateOne(
          { firebaseId: channelFirebaseId },
          { $pull: { pinnedMessages: messageFirebaseId } }
        );
      }
    }

    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/getprofile", async (req, res) => {
  let { userId } = req.body;

  try {
    let user = await User.findOne({ email: userId }).populate("profile");

    res
      .status(200)
      .json({
        profile: user.profile,
        profilePic: user.profilePic,
        username: user.username,
      });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/profile/addnewability", async (req, res) => {
  let { userEmail, ability } = req.body;
  try {
    let habRegex = /^[a-z0-9]/;
    if (!habRegex.test(ability)) {
      throw Error(`Only letters and numbers are allowed`);
    }

    let user = await User.findOne({ email: userEmail });
    await Profile.findByIdAndUpdate(user.profile, {
      $push: { abilities: [ability] },
    });

    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/profile/deleteability", async (req, res) => {
  let { userEmail, ability } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    await Profile.findByIdAndUpdate(user.profile, {
      $pull: { abilities: ability },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/getemail", async (req, res) => {
  let { username } = req.body;
  try {
    let user = await User.findOne({ username: username });
    res.status(200).json({ email: user.email });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/profile/setnewbio", async (req, res) => {
  let { userEmail, newBio } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });

    await Profile.findByIdAndUpdate(user.profile, {
      $set: { bio: newBio },
    });

    res.status(200).json({ message: "OK" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post("/mainsearch", async (req, res) => {
  let { userEmail, query } = req.body;
  try {
    await User.aggregate(
      [
        {
          $match: {
            username: { $regex: query, $options: "i" },
          },
        },
        { $unwind: "$username" },
        {
          $match: {
            username: { $regex: query, $options: "i" },
          },
        },
        {
          $group: {
            _id: "$_id",
            username: { $push: "$username" },
            profilePic: { $first: "$profilePic" },
            email: { $first: "$email" },
          },
        },
      ],
      function (err, results) {
        if (err) {
          throw err;
        } else {
          res.status(200).json({ results: results });
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

router.post('/user/setnewgiturl', async (req, res) => {
  let {userEmail, url} = req.body;
  try {
    let user = await User.findOne({email: userEmail})
    await Profile.findByIdAndUpdate(user.profile, {
      $set: {githubUrl: url}
    })
    res.status(200).json({'message': "OK"})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
})

module.exports = router;
