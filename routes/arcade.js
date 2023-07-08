const express = require("express");
const router = express.Router();

//user>>>game page
router.get("/Rock-Paper-Scissors", (req, res) => {
  const username = req.params.username;
  res.render("Rock-Paper-Scissors", { username: username });
});

router.get("/shootDown", (req, res) => {
  const username = req.params.username;
  res.render("shootDown", { username: username });
});

router.get("/TicTacToe", (req, res) => {
  const username = req.params.username;
  res.render("ticTacToe", { username: username });
});

router.get("/chess", (req, res) => {
  const username = req.params.username;
  res.render("chess", { username: username });
});

module.exports = router;
