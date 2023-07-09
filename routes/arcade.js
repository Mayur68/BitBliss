const express = require("express");
const router = express.Router();

router.get("/Rock-Paper-Scissors", (req, res) => {
  const username = req.params.username;
  res.render("Rock-Paper-Scissors", { username: username });
});

router.get("/TicTacToe-online", (req, res) => {
  const username = req.params.username;
  res.render("tic-tac-toe-online", { username: username });
});

router.get("/shootDown", (req, res) => {
  const username = req.params.username;
  res.render("shootDown", { username: username });
});

router.get("/TicTacToe", (req, res) => {
  const username = req.params.username;
  res.render("ticTacToe", { username: username });
});

module.exports = router;
