const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const { connection, getdb } = require("./database/database");

const arcade = require("./routes/arcade");
const user = require("./routes/user");

const app = express();
const server = require("http").Server(app);

//socket.io
// const setupSocket = require("./socket/games_1");
// setupSocket(server);
const setupSocket = require("./socket/chat");
setupSocket(server);

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", arcade);
app.use("/", user);

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "games"),
  path.join(__dirname, "frontend"),
]);

//root
app.get("/", (req, res) => {
  const sessionString = req.cookies.sessionToken;
  db.collection("accounts")
    .find()
    .toArray()
    .then((result) => {
      let authenticated = false;

      for (let i = 0; i < result.length; i++) {
        if (result[i].session === sessionString) {
          authenticated = true;
          const username = result[i].username;
          res.render("user", { username: username });
          break;
        }
      }

      if (!authenticated) {
        res.sendFile(__dirname + "/frontend/index.html");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal server error");
    });
});


//connecting to database and runnning server
connection((err) => {
  if (!err) {
    server.listen(3000, (err) => {
      if (err) {
        console.error("Error starting server:", err);
      } else {
        console.log("Server is running at 3000...");
      }
    });
    db = getdb();
  }
});
