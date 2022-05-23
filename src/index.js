require("dotenv/config");
const cors = require("cors");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const { isAuth } = require("./auth.js");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const dateObj = new Date();

mongoose.connect(
  "mongodb+srv://test123:test123@cluster0.hs0mp.mongodb.net/UserData?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const DataSchemaemp = {
  email: String,
  password: String,
  name: String,
  Rtoken: String,
};
const useremp = mongoose.model("User", DataSchemaemp);

const server = express();
// server.listen(process.env.PORT, function () {
//   console.log("server Active");
// });
const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
  sendAccessToken,
} = require("./token.js");
const res = require("express/lib/response");
const req = require("express/lib/request");
const { sortBy } = require("lodash");
server.use(express.json());
server.use(express.urlencoded({ extended: true }));


server.post("/register-client", async (req, res) => {
  const { email, password, name } = req.body;
  console.log(name);
  try {
    try {
      let user = await useremp.findOne({ email: email });

      if (user) {
        return res.status(200).send({ error: "Client Already Exists" });
      }
      // const userId = isAuth(req);

      //user = await userD.findById(userId);

      if (true) {
        const hashedPassword = await hash(password, 10);

        user = new useremp({
          email: email,
          password: hashedPassword,
          name: name,
        });
        await user.save();
        res.send({ message: "Registration Successful" });
      }
    } catch (err) {
      req.statusCode = 401;
      res.status(401).send({
        error: `${err.message}`,
      });
    }
  } catch (err) {
    res.status(401).send({
      error: `${err.message}`,
    });
  }
});

server.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // username chk
    let user = await useremp.findOne({ email: email });

    if (!user) return res.status(200).send({ error: "User doesnt exist" });

    //password chk
    const valid = await compare(password, user.password);

    if (valid) {
      const accesstok = createAccessToken(user.id);
      const refreshtok = createRefreshToken(user.id);

      user.Rtoken = refreshtok;
      await user.save();

      sendRefreshToken(res, refreshtok);
      sendAccessToken(res, req, accesstok, refreshtok);
    } else {
      return res.status(200).send({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(401).send({
      error: `${err.message}`,
    });
  }
});

server.listen(3001, function () {
  console.log("server Active Now on port " + process.env.PORT);
});
