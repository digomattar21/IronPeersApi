require("dotenv").config();
const express = require("express");
const authRouter = express.Router();
const axios = require("axios");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User.model");
const Inbox = require("../models/Inbox.model");
const Profile = require("../models/Profile.model");
const Settings = require("../models/Settings.model");
const saltRounds = 12;

authRouter.post("/signup/google", async (req, res) => {
  const { username, email, profilePic } = req.body;
  try {
    let payload;
    let user = await User.findOne({ email: email });
    if (!user) {
      let newUser = await User.create({
        username: username,
        email: email,
        profilePic: profilePic,
        status: "Active",
      });
      payload = {
        username: newUser.username,
        email: newUser.email,
        id: newUser.id,
      };
      let inbox = await Inbox.create({ user: newUser.id });
      let profile = await Profile.create({
        user: newUser.id,
        email: newUser.email,
      });
      let settings = await Settings.create({
        user: newUser.id,
        darkmode: false,
      });
      await User.updateOne({ email: email }, { $set: { inbox: inbox.id } });
      await User.updateOne({ email: email }, { $set: { profile: profile.id } });
      await User.updateOne({ email: email },{ $set: { settings: settings.id } });
    } else {
      payload = {
        username: user.username,
        email: user.email,
        id: user.id,
      };
    }

    const token = jwt.sign(payload, process.env.JWT_PASS, {
      expiresIn: "1 day",
    });
    res.status(200).json({ payload, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

authRouter.post("/signup/email", async (req, res) => {
  const { username, email, profilePic } = req.body;
  try {
    let newUser = await User.create({
      username: username,
      email: email,
      profilePic: "https://picsum.photos/100",
      status: "Active",
    });
    let payload = {
      username: newUser.username,
      email: newUser.email,
      id: newUser.id,
    };
    let inbox = await Inbox.create({ user: newUser.id });
    let profile = await Profile.create({
      user: newUser.id,
      email: newUser.email,
    });
    let settings = await Settings.create({ user: newUser.id, darkmode: false });
    await User.updateOne({ email: email }, { $set: { inbox: inbox.id } });
    await User.updateOne({ email: email }, { $set: { profile: profile.id } });
    await User.updateOne({ email: email }, { $set: { settings: settings.id } });

    const token = jwt.sign(payload, process.env.JWT_PASS, {
      expiresIn: "1 day",
    });

    res.status(200).json({ payload, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

authRouter.post("/signin/email", async (req, res) => {
  const { userEmail } = req.body;
  try {
    let user = await User.findOne({ email: userEmail });
    let payload = {
      username: newUser.username,
      email: newUser.email,
      id: newUser.id,
    };
    const token = jwt.sign(payload, process.env.JWT_PASS, {
      expiresIn: "1 day",
    });

    res.status(200).json({ payload, token });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = authRouter;
