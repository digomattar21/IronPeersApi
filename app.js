require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { default: axios } = require('axios');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3080;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

require('./configs/db.config');

const index = require('./routes/index');
const auth = require('./routes/auth.routes');



//Rotas

app.use('/', auth)
//Rotas publicas


//Middleware validacao de token jwt
// app.use(require('./middlewares/authmiddleware'));

//Rotas privadas
app.use('/', index);

app.listen(PORT, () => {
  console.log(`Server listening on the port: ${PORT}`);
});
module.exports = app;
