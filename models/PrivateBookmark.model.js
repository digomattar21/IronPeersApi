const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PrivateBookmarkSchema = new Schema(
  {
    channelMongoId:{type: Schema.Types.ObjectId, ref:'PrivateChannel'},
    messageFirebaseId: {type: String},
    message: {type:String},
    channelFireBaseId:{type: String},
    messageOwner: {type:String},
    channelName:{type:String},
    isPrivate:{type: Boolean}
  },
  {
    timestamps: true,
  }
);

module.exports = model("PrivateBookmark", PrivateBookmarkSchema);
