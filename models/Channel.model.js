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
    pinnedMessages:[{type:String}],
    
  },
  {
    timestamps: true,
  }
);

module.exports = model("Channel", channelSchema);
