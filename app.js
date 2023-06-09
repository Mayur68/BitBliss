const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { connection, getdb } = require("./database");
const cookieParser = require("cookie-parser");
const path = require("path");

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

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/frontend/index/index.html");
});

app.get("/sign-up", (req, res) => {
  res.sendFile(__dirname + "/frontend/index/sign-up.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/frontend/index/login.html");
});

//checking login details
app.post("/login", async (req, res) => {
  const { clientusername, clientpassword } = req.body;
  const expirationTime = 30 * 60 * 1000;
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
  const expirationTime = 30 * 60 * 1000;
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

//user page
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
        res.render("user", { username: username });
      } else {
        res.render("notfound");
      }
    });
});

//user>>>game page
app.get("/:username/Rock-Paper-Scissors", (req, res) => {
  const username = req.params.username;
  res.render("Rock-Paper-Scissors", { username: username });
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
