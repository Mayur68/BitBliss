const express = require("express");
const router = express.Router();

router.get("/Rock-Paper-Scissors", (req, res) => {
  const username = req.params.username;
  res.render("Rock-Paper-Scissors", { username: username });
});

router.get("/TicTacToe", (req, res) => {
  const username = req.params.username;
  res.render("tic-tac-toe-online", { username: username });
});

router.get("/shootDown", (req, res) => {
  const username = req.params.username;
  res.render("cosmicShoot", { username: username });
});

router.get("/chess", (req, res) => {
  const username = req.params.username;
  res.render("chess", { username: username });
});

router.get("/truck", (req, res) => {
  const username = req.params.username;
  res.render("truck", { username: username });
});

router.get("/paint", (req, res) => {
  const username = req.params.username;
  res.render("paint", { username: username });
});

module.exports = router;
