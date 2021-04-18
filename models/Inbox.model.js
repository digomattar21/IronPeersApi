const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const inboxSchema = new Schema(
  {
    hasUnread: {type: Boolean},
    invites: [{type: Schema.Types.ObjectId, ref:'Invite'}],
    user: {type: Schema.Types.ObjectId, ref:'User', required: true}
},
  {
    timestamps: true,
  }
);

module.exports = model("Inbox", inboxSchema);
