const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const channelSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, `Insira um nome`],
    },
    firebaseId: { type: String},
    bookMarkedMessages:[{type:String}],
    description: {type: String},
    pinnedMessages:[{type:String}],
    members:[{type:Schema.Types.ObjectId, ref:'User'}],
    isPrivate:{type: Boolean, required: true}
    
  },
  {
    timestamps: true,
  }
);

module.exports = model("Channel", channelSchema);
