const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {
  connection,
  getdb
} = require('./database');

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/index.html');
})

app.get('/sign-up', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/sign-up.html');
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/login.html');
})

app.get('/user/Rock-Paper-Scissors', (req, res) => {
  res.sendFile(__dirname + '/frontend/games/r-p-s.html');
})

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/user.html');
})

//checking login details
app.post("/login", (req, res) => {
  const {
    clientusername,
    clientpassword
  } = req.body;

  console.log(clientusername, clientpassword);

  db.collection('accounts')
    .find({
      username: clientusername,
      password: clientpassword
    })
    .toArray()
    .then((result) => {
      if (result.length > 0) {
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
        message: "Internal server error"
      });
    });
});

//checking signup details
app.post("/sign-up", (req, res) => {
  const {
    clientusername,
    clientpassword,
    con_password
  } = req.body;

  console.log(clientusername, clientpassword, con_password);

  if (clientpassword === con_password) {
    db.collection('accounts')
      .findOne({
        username: clientusername
      })
      .then((result) => {
        if (result) {
          res.status(401).json({
            status: "error",
            message: "account already exists!",
          });
        } else {
          db.collection('accounts')
            .insertOne({
              username: clientusername,
              password: clientpassword
            })
            .then(() => {
              res.json({
                status: "success",
                message: "Login successful!",
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

let db;

//connecting to database and runnning server
connection((err) => {
  if (!err) {
    app.listen(3000, () => console.log('running at 3000...'));
  }
  db = getdb();
});


//view collection at `/data`
//
app.get('/data', (req, res) => {

  let accounts = []

  db.collection('accounts')
    .find()
    .forEach(account => accounts.push(account))
    .then(() => {
      res.status(200).json(accounts)
    })
});