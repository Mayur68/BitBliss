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
  res.render("cosmicShoot", { username: username });
});

router.get("/:username/chess", (req, res) => {
  const username = req.params.username;
  res.render("chess", { username: username });
});

router.get("/:username/truck", (req, res) => {
  const username = req.params.username;
  res.render("truck", { username: username });
});

router.get("/:username/paint", (req, res) => {
  const username = req.params.username;
  res.render("paint", { username: username });
});

module.exports = router;
