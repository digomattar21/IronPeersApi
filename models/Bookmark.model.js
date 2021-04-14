const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const bookmarkSchema = new Schema(
  {
    channelMongoId:{type: Schema.Types.ObjectId, ref:'Channel'},
    messageFirebaseId: {type: String},
    message: {type:String},
    channelFireBaseId:{type: String},
    messageOwner: {type:String},
    channelName:{type:String}
  },
  {
    timestamps: true,
  }
);

module.exports = model("BookMark", bookmarkSchema);
