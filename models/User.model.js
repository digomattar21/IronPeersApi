const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, `Insira seu nome de usuário`],
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      required: [true, `Insira um email`],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor insira um email válido"],
    },
    password: { type: String},
    settings : {type: Schema.Types.ObjectId, ref: "Settings"},
    confirmationCode: {type: String, unique:true},
    status: {
      type:String,
      enum:['Pending', 'Active'],
      default:'Pending'
    },
    profilePic:{type:String},
    myBookmarks : [{type: Schema.Types.ObjectId, ref:"BookMark"}],
    joinedChannels: [{type: Schema.Types.ObjectId, ref:"Channel"}],
    favoriteChannels: [{type: Schema.Types.ObjectId, ref:'Channel'}]

  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
