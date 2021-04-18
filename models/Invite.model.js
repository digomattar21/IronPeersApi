const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const inviteSchema = new Schema(
  {
    userWhoInvited: {type: Schema.Types.ObjectId, ref:'User'},
    userInvited: {type: Schema.Types.ObjectId, ref:'User'},
    channelMongoId: {type: Schema.Types.ObjectId, ref:'PrivateChannel'},
    channelFirebaseId:{type:String},
    read: {type: Boolean}
    
},
  {
    timestamps: true,
  }
);

module.exports = model("Invite", inviteSchema);
