const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      trim: true,
      required: [true, `Insira seu nome de usuário`],
    },
    email: {
      type: String,
      unique: true,
      required: [true, `Insira um email`],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor insira um email válido"],
    },
    password: { type: String},
    settings : {type: Schema.Types.ObjectId, ref: "Settings"},
    status: {
      type:String,
      enum:['Pending', 'Active'],
      default:'Pending'
    },
    profilePic:{type:String},
    myBookmarks : [{type: Schema.Types.ObjectId, ref:"BookMark"}],
    joinedChannels: [{type: Schema.Types.ObjectId, ref:"Channel"}],
    favoriteChannels: [{type: Schema.Types.ObjectId, ref:'Channel'}],
    privateChannels: [{type: Schema.Types.ObjectId, ref:"PrivateChannel"}],
    myPrivateBookmarks: [{type: Schema.Types.ObjectId,ref:"PrivateBookmark"}],
    inbox: {type: Schema.Types.ObjectId, ref:'Inbox'},
    dms:[{type: String, unique:true}]

  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
