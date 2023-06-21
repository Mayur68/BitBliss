const express = require("express");
const bodyParser = require("body-parser");
const { connection, getdb } = require("./database/database");
const cookieParser = require("cookie-parser");
const path = require("path");
const arcade = require("./routes/arcade")

const app = express();

//connecting to database and runnning server
connection((err) => {
  if (!err) {
    app.listen(3000, () => console.log("running at 3000..."));
  }
  db = getdb();
});

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/:username/',arcade)

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "games"),
]);

app.get("/", (req, res) => {
  const sessionNo = parseInt(req.cookies.sessionToken);
  db.collection("accounts")
    .find()
    .toArray()
    .then((result) => {
      if (result.length > 0) {
        let i;
        for (i = 0; i < result.length; i++) {
          if (result[i].session === sessionNo) {
            res.render("user", { username: result[i].username });
          } else {
            res.sendFile(__dirname + "/frontend/pages/index.html");
          }
        }
      } else {
        res.sendFile(__dirname + "/frontend/pages/index.html");
      }
    });
});

app.get("/sign-up", (req, res) => {
  res.sendFile(__dirname + "/frontend/pages/sign-up.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/frontend/pages/login.html");
});

//checking login details
app.post("/login", async (req, res) => {
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
app.post("/sign-up", async (req, res) => {
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
app.post("/logout", (req, res) => {
  res.clearCookie("sessionToken");
  res.sendStatus(200);
});

//view collection at `/data`
app.get("/data", (req, res) => {
  let accounts = [];

  db.collection("accounts")
    .find()
    .forEach((account) => accounts.push(account))
    .then(() => {
      res.status(200).json(accounts);
    });
});

//user profile page
app.get("/:username", (req, res) => {
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