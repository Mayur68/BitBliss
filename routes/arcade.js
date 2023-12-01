const express = require("express");
const router = express.Router();

router.get("/Cosmic-Arcade/Rock-Paper-Scissors", (req, res) => {
  const username = req.params.username;
  res.render("Rock-Paper-Scissors", { username: username });
});

router.get("/Cosmic-Arcade/TicTacToe", (req, res) => {
  const username = req.params.username;
  res.render("tic-tac-toe-online", { username: username });
});

router.get("/Cosmic-Arcade/cosmicshoot", (req, res) => {
  const username = req.params.username;
  res.render("cosmicShoot", { username: username });
});

router.get("/Cosmic-Arcade/chess", (req, res) => {
  const username = req.params.username;
  res.render("chess", { username: username });
});

router.get("/Cosmic-Arcade/truck", (req, res) => {
  const username = req.params.username;
  res.render("truck", { username: username });
});

router.get("/Cosmic-Arcade/paint", (req, res) => {
  const username = req.params.username;
  res.render("paint", { username: username });
});

module.exports = router;
