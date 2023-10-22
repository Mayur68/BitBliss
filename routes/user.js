const express = require("express");
const router = express.Router();
const path = require("path");
const crypto = require('crypto');
const { db, accounts } = require("../database/database");
const nodemailer = require('nodemailer');

let username

// Route for the sign-up page
router.get("/sign-up", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/sign-up.html"));
});

// Route for the login page
router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/login.html"));
});

router.post("/login", async (req, res) => {
  const { clientusername, clientpassword } = req.body;
  const expirationTime = 24 * 60 * 60 * 1000; // 24 hours
  const expirationDate = new Date(Date.now() + expirationTime);

  try {
    const user = await accounts.findOne({
      username: clientusername,
      password: clientpassword,
    }, "session");

    if (user) {
      const sessionToken = user.session;
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});



// sign up details
router.post("/sign-up", async (req, res) => {
  const { clientusername, clientemail, clientpassword, con_password } = req.body;
  const sessionString = await generateSession();
  const sessionToken = sessionString;
  const expirationTime = 24 * 60 * 60 * 1000;
  const expirationDate = new Date(Date.now() + expirationTime);

  try {
    if (clientpassword === con_password) {
      const existingUser = await accounts.findOne({ username: clientusername });

      if (existingUser) {
        res.status(401).json({
          status: "error",
          message: "Account already exists!",
        });
      } else {
        const newUser = new accounts({
          username: clientusername,
          email: clientemail,
          password: clientpassword,
          session: sessionString,
        });

        await newUser.save();
        res.cookie("sessionToken", sessionToken, {
          expires: expirationDate,
          httpOnly: true,
        });
        res.json({
          status: "success",
          message: "Sign-up successful!",
        });
      }
    } else {
      res.status(401).json({
        status: "error",
        message: "Passwords do not match",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});



router.get("/resetpassword", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/resetpassword.html"));
});

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    // user: 'your_email@gmail.com',
    // pass: 'your_password',
  },
});

router.post("/send-username", async (req, res) => {
  const { clientemail } = req.body;

  try {
    const user = await accounts.findOne({ email: clientemail }, "username");

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
      res.status(200).json({ message: 'Username recovery email sent' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await accounts.findOne({ email }, "username _id");

    if (!user) {
      return res.status(404).json({ message: 'Email not found' });
    }

    const username = user.username;
    const resetToken = crypto.randomBytes(20).toString('hex');

    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000;

    await user.save();

    const mailOptions = {
      from: 'patkarmahesh387@gmail.com',
      to: email,
      subject: 'Your Password Recovery',
      text: `Dear ${username},\n\nWe received a request to reset the password for your Cosmic Arcade account. 
      If you did not initiate this request, you can ignore this email.\n\nTo reset your password, 
      please click on the link below or copy and paste it into your web browser's address bar:\n\nhttp://192.168.1.8:3000/resetpassword/${resetToken}\n\n
      This link will expire in 1 hour for security reasons. If you don't use this link within that time, you can request another password reset.
      \n\nIf you have any questions or need further assistance, please contact our support team at [Support Email].\n\nSincerely,
      \nYour Cosmic Arcade Team`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('Email sent: ' + info.response);
      res.status(200).json({ message: 'Password reset email sent' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// resetpassword
router.get('/resetpassword/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await accounts.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

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
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});


router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send('Passwords do not match');
  }

  try {
    const user = await accounts.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    res.status(200).send('Password reset successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
});

//Repository
router.get("/new-Repository", async (req, res) => {
  const sessionString = req.cookies.sessionToken;

  try {
    const user = await accounts.findOne({ session: sessionString }, "username");

    if (user) {
      res.render("createRepo", { username: user.username });
    } else {
      res.status(403).send("Unauthorized");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});

//logout
router.post("/logout", (req, res) => {
  res.clearCookie("sessionToken");
  res.sendStatus(200);
});

// user profile page
router.get("/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const sessionString = req.cookies.sessionToken;

    const user1 = await accounts.findOne({ username, session: sessionString });
    const user2 = await accounts.findOne({ username });
    if (user1) {
      res.render("loggedUserProfile", { username: user1.username });
    } else if (user2) {
      res.render("userProfile", { username: user2.username });
    } else {
      res.render("notfound");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal server error');
  }
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

module.exports = router;