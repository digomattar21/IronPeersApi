require('dotenv').config();
const mongoose = require('mongoose');
const encodedPassword = encodeURIComponent(process.env.MONGODB_PASS);
const uri =
  process.env.MONGODB_URI ||
  `mongodb+srv://${process.env.MONGODB_USER}:${encodedPassword}@${process.env.MONGODB_CLUSTER}`;

//Connecting to DB
mongoose
  .connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err);
  });
