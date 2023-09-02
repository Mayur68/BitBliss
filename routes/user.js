const express = require("express");
const router = express.Router();
const path = require("path");

const { getdb } = require("../database/database");
db = getdb();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    // user: 'your_email@gmail.com',
    // pass: 'your_password',
  },
});


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
  const expirationTime = 24 * 60 * 60 * 1000;
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
  const { clientusername, clientemail, clientpassword, con_password } = req.body;
  const sessionString = await generateSession();
  const sessionToken = sessionString;
  const expirationTime = 24 * 60 * 60 * 1000;
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
              email: clientemail,
              password: clientpassword,
              session: sessionString,
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

router.get("/reset%20password", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/resetpassword.html"));
});

router.post("/send-username", async (req, res) => {
  const { clientemail } = req.body;

  const user = await db.collection("accounts")
    .findOne({
      email: clientemail,
    });

  if (!user) {
    return res.status(404).json({ message: 'Email not found' });
  }

  const username = user.username;

  const mailOptions = {
    from: 'patkarmahesh387@gmail.com',
    to: clientemail,
    subject: 'Your Username Recovery',
    text: `Dear ${username},\n\nYour username is: ${username}\n\nSincerely,\nYour Cosmic Arcade team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Password reset email sent' });
  });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  
  const user = await db.collection("accounts")
    .findOne({
      email: clientemail,
    });

  if (!user) {
      return res.send('Email not found');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetToken = resetToken;
  user.resetTokenExpiration = Date.now() + 3600000;

  await user.save();

  const mailOptions = {
    from: 'patkarmahesh387@gmail.com',
    to: clientemail,
    subject: 'Your password Recovery',
    text: `Dear ${username},\n\n\n\nSincerely,\nYour Cosmic Arcade team`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ message: 'Password reset email sent' });
  });
});

router.get('/reset-password/:token', async (req, res) => {
  const { token } = req.params;

  const user = await db.collection("accounts").findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

  if (!user) {
      return res.send('Invalid or expired token');
  }

  res.send(`
      <form action="/reset-password/${token}" method="POST">
          <input type="password" name="newPassword" placeholder="New Password" required>
          <input type="password" name="confirmPassword" placeholder="Confirm Password" required>
          <button type="submit">Reset Password</button>
      </form>
  `);
});

router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
      return res.send('Passwords do not match');
  }

  // Find the user by the reset token and check if it's valid
  const user = await User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

  if (!user) {
      // Handle the case where the token is invalid or expired
      return res.send('Invalid or expired token');
  }

  // Update the user's password
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiration = undefined;
  await user.save();

  // Redirect the user to the login page or a success page
  res.send('Password reset successfully');
});


//logout
router.post("/logout", (req, res) => {
  res.clearCookie("sessionToken");
  res.sendStatus(200);
});

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

//user profile page
router.get("/:username", (req, res) => {
  const username = req.params.username;
  const sessionString = req.cookies.sessionToken;
  db.collection("accounts")
    .find({
      username: username,
      session: sessionString,
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
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let sessionString = "";
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      sessionString += characters.charAt(randomIndex);
    }
    db.collection("accounts")
      .find({ session: sessionString })
      .toArray()
      .then((result) => {
        if (result.length > 0) {
          resolve(sessionString);
        } else {
          resolve(sessionString);
        }
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  });
}

router.post("/addFriend", (req, res) => {
  const { userId, friendId } = req.body;

  if (userId && friendId) {
    if (userId === friendId) {
      return res.status(400).json({
        status: "error",
        message: "Cannot add yourself as a friend!",
      });
    }
  }

  if (userId && friendId) {
    db.collection("accounts")
      .findOne({ username: friendId })
      .then((friend) => {
        if (!friend) {
          return res.status(401).json({
            status: "error",
            message: "Friend not found!",
          });
        }

        db.collection("accounts")
          .findOne({ username: userId, friends: { $in: [friendId] } })
          .then((result) => {
            if (result) {
              return res.status(401).json({
                status: "error",
                message: "Friend already exists!",
              });
            }

            db.collection("accounts")
              .updateOne(
                { username: userId },
                { $addToSet: { friends: friendId } }
              )
              .then(() => {
                res.json({
                  status: "success",
                  message: "Friend added successfully!",
                });
              })
              .catch((err) => {
                console.error(err);
                res.status(500).json({
                  status: "error",
                  message: "Internal server error",
                });
              });
          })
          .catch((err) => {
            console.error(err);
            res.status(500).json({
              status: "error",
              message: "Internal server error",
            });
          });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({
          status: "error",
          message: "Internal server error",
        });
      });
  } else {
    res.status(400).json({
      status: "error",
      message: "Invalid request. Both userId and friendId are required.",
    });
  }
});





module.exports = router;