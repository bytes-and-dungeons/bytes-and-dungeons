const express = require('express');
const router = express.Router();

//GET game/

router.get("/", (req, res, next) => {
   res.render("game/game-lobby");
});

router.get("/:gameId", (req, res, next) => {
   res.render("game/game", {user: req.session.currentUser});
});

module.exports = router;