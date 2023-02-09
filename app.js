const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(express.static(__dirname));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/index.html');
})

app.get('/sign-up', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/register/sign-up.html');
})

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/login/login.html');
})

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/frontend/index/user/user.html');
})

app.post("/login", (req, res) => {
  const {
    username,
    password
  } = req.body;

  if (username === "admin" && password === "password") {
    res.json({
      status: "success",
      message: "Login successful!",
    });
  } else {
    res.status(401).json({
      status: "error",
      message: "Incorrect username or password.",
    });
  }
});



app.listen(3000, () => console.log('running at 3000...'));