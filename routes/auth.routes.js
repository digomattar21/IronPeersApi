require("dotenv").config();
const express = require("express");
const authRouter = express.Router();
const axios = require('axios');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt =  require('jsonwebtoken');

const User = require('../models/User.model');
const saltRounds = 12;

authRouter.post('/auth/signup', async(req,res) => {
    var {username, email, password } = req.body;
    try {
        let salt = await bcrypt.genSalt(saltRounds);
        let passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;

        let alreadyExistsEmail = await User.findOne({ email: email });
        let alreadyExistsUser = await User.findOne({ username: username });

        if (alreadyExistsUser != null) {
            throw new Error('Este usuário já está cadastrado');
          }
        if (alreadyExistsEmail != null) {
          throw new Error('Este email já está cadastrado')
        } else if (!password || !email || !username){
          throw new Error('Todos os campos são obrigatórios')
        }else if (!password.match(passRegex)){
          throw new Error('A senha deve conter ao menos 8 caracteres, um símbolo, um número e uma letra maiúscula')
        }else{
          let token1 = Math.floor(Math.random()*900000).toString()
          await sendConfirmationEmail(email,token1)
          password = await bcrypt.hash(password,salt)

          let createUser = await User.create(
            {
              username,
              email,
              password,
              confirmationCode: token1
            }
          );

          let payload = {
            username: username,
            email: email,
            id: createUser.id
          }

          const token = jwt.sign(payload, process.env.JWT_PASS, {expiresIn: '1 day'});

          res.status(201).json({createUser, token});

        }
    } catch (error) {
        console.log(error)
        res.status(500).send({message:error.message})
    }
});


authRouter.post('/auth/confirm', async (req, res) => {
  try {
    const {inputCode} = req.body;

    const token = req.headers.authorization.split(' ')[1];

    let userDeHashed = jwt.verify(token,process.env.JWT_PASS)

    let user = await User.findOne({ email: userDeHashed.email })

    if (inputCode === user.confirmationCode){
      await User.findOneAndUpdate({email:user.email}, {status:"Active"}, {new:true})

      res.status(200).json({user})

    }else{
      let deletedUser = await User.findOneAndDelete({email: email});
      res.status(400).json({message:'Código incorreto'})
    }


  } catch (error) {
    console.log(error.message)
    res.status(500).json({message: error.message})
  }
});

authRouter.post('/auth/login', async (req, res) => {
  const {username,password} = req.body;
  try {
    if (!username || !password) {
      throw new Error('Por favor insira seu usuário e senha')
    }

    let user = await User.findOne({username: username});

    if (user!=null){
      let validate = bcrypt.compareSync(password,user.password);

      if (validate){
        const payload = {
          username: user.username,
          email: user.email,
          id: user.id
        }
        const token = jwt.sign(payload, process.env.JWT_PASS, {expiresIn: '1 day'});
        res.status(200).json({payload,token})

      }else{
        throw new Error('Senha incorreta')
      }
    }else{
      throw new Error('Usuário não encontrado')
    }


  } catch (error) {
    console.log(error.message)
    res.status(500).json({message: error.message})
  }
});


authRouter.post('/auth/signupwithgoogle', async (req, res) => {
    const {username, email, profilePic} = req.body;
    try {
        let payload;
        let user = await User.find({username:username})
        if (!user){
          let newUser = await User.create({username: username, email: email, profilePic: profilePic, status:'Active'});
          payload = {
            username: newUser.username,
            email: newUser.email,
            id: newUser.id
          }

        }else{
           payload = {
            username: user.username,
            email: user.email,
            id: user.id
          }

        }
        
        

        const token = jwt.sign(payload, process.env.JWT_PASS, {expiresIn: '1 day'});
        res.status(200).json({payload,token})

    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})


async function sendConfirmationEmail(email,token){
  try{
    var mailToHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <div style='width: 100%; height: 100%; background-color: #fff'>
          <h4>Seu código: <span>${token}</h4></span>
        </div>
    </body>
    </html>
    `;
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "stag.talk.mailer@gmail.com",
        pass: `${process.env.ARTICLE_MAILER_PASS}`,
      },
    });
    const mail = {
      from: "Stag Article Mailer",
      to: `${email}`,
      subject: "Confirme Sua Conta",
      html: `${mailToHtml}`,
    };
    transporter.sendMail(mail, function (err, info) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Email Sent to ${email}` )
        return info;
      }
    });


  }catch(err){
    console.log(err.message)
  }
}


module.exports = authRouter
