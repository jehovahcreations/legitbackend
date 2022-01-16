require("dotenv").config();
require("./config/database").connect();
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require('axios');

const User = require("./model/user");
const auth = require("./middleware/auth");
const { json } = require("express/lib/response");

const app = express();
const api = 'Bearer eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2NzE1NTc4MTUsImlhdCI6MTY0MDAyMTgxNSwicmF5IjoiODA1MzM0ZTJiYmEzZTVjMDg3NjgyNTVjZjU3Y2JlZDMiLCJzdWIiOjg0OTc1N30.BJJu55XEDW87sINAdmFRmmanAbd54D8wrxod2_Y02qeQqukCTMw_mZ1BTd6QXDEqREOjoLUz6szwO1WlPsLmuDMOgAYlAZE6B10JHl2LXin1a-Gb09p7Mq2Q0EKuulqQDJaWOUz1fIoiDXZoYOTc-yK9sJRNE75GkjmMM-70Cg81pi4MB6dhf3cc4D8w__GVL4Qgkd3pho32CfDEWFkWnGVNZsmJmijGaDEZ9WOadB4gymXRn8qremcuo5OzZ6qGJaoGAtkU7eb4kr3ys0_2PxpUrPm8TkBDstR3qz21uoLCtlm2JYJnTQsOqqHrNZptLlOqAFWqOK0yHZ3ZGfGZIg';

app.use(express.json({ limit: "50mb" }));

app.post("/register", async (req, res) => {
  try {
    // Get user input
    const { first_name, last_name, email, password,phone,referal } = req.body;

    // Validate user input
    if (!(email && password && first_name && last_name)) {
      res.status(400).json("All input is required");
      
    }

    // check if user already exist
    // Validate if user exist in our database
    const oldUser = await User.findOne({ email });

    if (oldUser) {
      return res.status(400).json("User Already Exist. Please Login");
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in our database
    const user = await User.create({
      first_name,
      last_name,
      email: email.toLowerCase(), // sanitize: convert email to lowercase
      password: encryptedPassword,
      balance: 0,
      isActive: 1,
      phone,
      referal,
    });

    // Create token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );
    // save user token
    user.token = token;

    // return new user
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
  }
});

app.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
     return res.status(400).json("All input is required");
    }
    // Validate if user exist in our database
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // save user token
      user.token = token;
     console.log(user)
      // user
     return res.status(200).json(user);
    }
   return res.status(400).json("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
});

app.get("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

app.post("/price", auth, (req, res) => {
  console.log(req.body);
axios.get('https://5sim.net/v1/guest/prices?country='+req.body.country+'&product='+req.body.product, {
    // params: {
    //   ID: 12345
    // }
  })
  .then(function (response) {
  
      res.status(200).json(response.data);

  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });  
});
  
app.post("/buysms", auth, (req, res) => {
  console.log(req.body);
axios.get('https://5sim.net/v1/user/buy/activation/'+req.body.country+'/'+req.body.sim+'/'+req.body.product, {
     headers: {
    "Authorization": api,
       "Accept": "application/json"
     }
  })
  .then(function (response) {
    console.log(response.data);
    if (response.data == "no free phones") {
      console.log('response');
      res.status(400).json(response.data);
    } else {
      res.status(200).json(response.data);
    }
    
    //  res.status(200).json(response.data);

  })
  .catch(function (error) {
    console.log(error);
  })
  .then(function () {
    // always executed
  });  
});
  app.post("/finish", auth, (req, res) => {
  console.log(req.body);
axios.get('https://5sim.net/v1/user/finish/'+req.body.id, {
     headers: {
    "Authorization": api,
       "Accept": "application/json"
     }
  })
  .then(function (response) {
    
    if (response.statusCode == 200) {
      console.log(response.data);
      res.status(200).json(response.data);
    } else {
      console.log('err')
      res.status(400).json(response.data);
    }
   
    //  

  })
  .catch(function (error) {
   // console.log(error);
    res.status(400).json(error);
  })
  .then(function () {
    // always executed
  });  
  });
  app.post("/cancel", auth, (req, res) => {
  console.log(req.body);
axios.get('https://5sim.net/v1/user/cancel/'+req.body.id, {
     headers: {
    "Authorization": api,
       "Accept": "application/json"
     }
  })
  .then(function (response) {
    
    if (response.statusCode == 200) {
      console.log(response.data);
      res.status(200).json(response.data);
    } else {
      console.log('err')
      res.status(400).json(response.data);
    }
   
    //  

  })
  .catch(function (error) {
   // console.log(error);
    res.status(400).json(error);
  })
  .then(function () {
    // always executed
  });  
  });
   app.post("/getsms", auth, (req, res) => {
  console.log(req.body);
axios.get('https://5sim.net/v1/user/check/'+req.body.id, {
     headers: {
    "Authorization": api,
       "Accept": "application/json"
     }
  })
  .then(function (response) {
    
    if (response.statusCode == 200) {
      console.log(response.data);
      res.status(200).json(response.data);
    } else {
      console.log('err')
      res.status(400).json(response.data);
    }
   
    //  

  })
  .catch(function (error) {
   // console.log(error);
    res.status(400).json(error);
  })
  .then(function () {
    // always executed
  });  
  });
// This should be the last route else any after it won't work
app.use("*", (req, res) => {
  res.status(404).json({
    success: "false",
    message: "Page not found",
    error: {
      statusCode: 404,
      message: "You reached a route that is not defined on this server",
    },
  });
});

module.exports = app;
