const express = require("express");
const router = express.Router();
const path = require("path");

const { getdb } = require("../database/database");
db = getdb();

// Route for the sign-up page
router.get("/sign-up", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/sign-up.html"));
});

// Route for the login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

//login details
router.post("/login", async (req, res) => {
  const { clientusername, clientpassword } = req.body;
  const expirationTime = 4320 * 60 * 60 * 1000;
  const expirationDate = new Date(Date.now() + expirationTime);
  db.collection("accounts")
    .find({
      username: clientusername,
      password: clientpassword,
    })
    .toArray()
    .then((result) => {
      if (result.length > 0) {
        const sessionToken = result[0].session;
        console.log(result);
        res.cookie("sessionToken", sessionToken, {
          expires: expirationDate,
          httpOnly: true,
        });
        res.status(200).json({
          status: "success",
          message: "Login successful!",
        });
      } else {
        res.status(401).json({
          status: "error",
          message: "Incorrect username or password.",
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        status: "error",
        message: "Internal server error",
      });
    });
});

//checking signup details
router.post("/sign-up", async (req, res) => {
  const { clientusername, clientpassword, con_password } = req.body;
  const sessionNo = await generateSession();
  const sessionToken = sessionNo;
  const expirationTime = 4320 * 60 * 60 * 1000;
  const expirationDate = new Date(Date.now() + expirationTime);
  if (clientpassword === con_password) {
    db.collection("accounts")
      .findOne({
        username: clientusername,
      })
      .then((result) => {
        if (result) {
          res.status(401).json({
            status: "error",
            message: "account already exists!",
          });
        } else {
          db.collection("accounts")
            .insertOne({
              username: clientusername,
              password: clientpassword,
              session: sessionNo,
            })
            .then(() => {
              res.cookie("sessionToken", sessionToken, {
                expires: expirationDate,
                httpOnly: true,
              });
              res.json({
                status: "success",
                message: "Login successful!",
              });
            })
            .catch((err) => {
              console.error(err);
              res.status(500).json({
                status: "error",
                message: "Internal server error",
              });
            });
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      });
  } else {
    res.status(401).json({
      status: "error",
      message: "Passwords do not match",
    });
  }
});

//logout
router.post("/logout", (req, res) => {
  res.clearCookie("sessionToken");
  res.sendStatus(200);
});

//user profile page
router.get("/:username", (req, res) => {
  const username = req.params.username;
  const sessionNo = parseInt(req.cookies.sessionToken);
  db.collection("accounts")
    .find({
      username: username,
      session: sessionNo,
    })
    .toArray()
    .then((result) => {
      if (result.length > 0) {
        res.render("userProfile", { username: username });
      } else {
        res.render("notfound");
      }
    });
});

//genetare session
function generateSession() {
  return new Promise((resolve, reject) => {
    let x = 1111;
    db.collection("accounts")
      .find({ session: x })
      .toArray()
      .then((result) => {
        if (result.length > 0) {
          x++;
          resolve(x);
        } else {
          resolve(x);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

//view collection at `/data`
router.get("/data", (req, res) => {
  let accounts = [];

  db.collection("accounts")
    .find()
    .toArray()
    .then((accounts) => {
      res.status(200).json(accounts);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    });
});

module.exports = router;
