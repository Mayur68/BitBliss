const express = require("express");
const router = express.Router();

router.get("/:username/Rock-Paper-Scissors", (req, res) => {
  const username = req.params.username;
  res.render("Rock-Paper-Scissors", { username: username });
});

router.get("/:username/TicTacToe-online", (req, res) => {
  const username = req.params.username;
  res.render("tic-tac-toe-online", { username: username });
});

router.get("/:username/shootDown", (req, res) => {
  const username = req.params.username;
  res.render("shootDown", { username: username });
});

router.get("/:username/chess", (req, res) => {
  const username = req.params.username;
  res.render("chess", { username: username });
});

module.exports = router;
