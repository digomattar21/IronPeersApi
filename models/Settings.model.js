const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const settingsSchema = new Schema(
  {
    user: {type: Schema.Types.ObjectId, ref: "User"},
    darkmode: {type: Boolean},
},
  {
    timestamps: true,
  }
);

module.exports = model("Settings", settingsSchema);
