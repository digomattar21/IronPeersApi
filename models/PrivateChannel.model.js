const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const PrivateChannelSchema = new Schema(
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
      invitedMembers: [{type:Schema.Types.ObjectId, ref:'User'}]
    },
    {
      timestamps: true,
    }
  );
  
  module.exports = model("PrivateChannel", PrivateChannelSchema);