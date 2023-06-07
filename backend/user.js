app.get("/:username", (req, res) => {
    const username = req.params.username;
    res.render("user", { username: username });
  });
  
  app.get("/:username/Rock-Paper-Scissors", (req, res) => {
    const username = req.params.username;
    res.render("Rock-Paper-Scissors", { username: username });
  });