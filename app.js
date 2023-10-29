const express = require("express");
const app = express();
const server = require("http").Server(app);
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const { accounts } = require("./database/database");
const { EventEmitter } = require('events');
const arcade = require("./routes/arcade");
const user = require("./routes/user");
const home = require("./routes/home");
const chatHistory = require("./routes/chatHistory");
const repository = require("./routes/repository");
const explore = require("./routes/explore");
const profile = require("./routes/profile");
const setupSocket = require("./socket/chat");


setupSocket(server);

const busEmitter = new EventEmitter();
busEmitter.setMaxListeners(15);
for (let i = 0; i < 15; i++) {
  busEmitter.on('exit', () => {
    console.log('Exit listener', i + 1);
  });
}
app.use(express.urlencoded({ extended: false }))
app.use('/profilePhotos', express.static(path.join(__dirname, './profilePhotos')));
app.use('/repository', express.static(path.join(__dirname, '../uploads')));

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(cookieParser());

app.use("/", profile);
app.use("/", arcade);
app.use("/", chatHistory);
app.use("/", home);
app.use("/", explore);
app.use("/", repository);
app.use("/", user);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "games"),
  path.join(__dirname, "frontend"),
]);

//Root
app.get("/", (req, res) => {
  const sessionString = req.cookies.sessionToken;
  if (sessionString) {
    accounts.findOne({ session: sessionString })
      .then((user) => {
        if (user) {
          res.render("user", { username: user.username });
        } else {
          res.sendFile(__dirname + "/frontend/index.html");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal server error");
      });
  } else {
    console.log("no session token")
    res.sendFile(__dirname + "/frontend/index.html");
  }

});

server.listen(3000, (err) => {
  if (err) {
    console.error("Error starting server:", err);
  } else {
    console.log("Server is running at 3000...");
  }
});