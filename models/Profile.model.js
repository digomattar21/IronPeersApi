const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const profileSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: "User"},
    bio : {type: String},
    currentPosition: {type: String},
    ironhackClass: {type:String},
    abilities: [{type: String}],
    email: {type: String},
    profilePicture: {type:String}
},
  {
    timestamps: true,
  }
);

module.exports = model("Profile", profileSchema);
