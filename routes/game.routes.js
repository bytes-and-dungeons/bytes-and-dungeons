const express = require('express');
const router = express.Router();

const Character = require("../models/Character.model")


//GET

router.get("/", (req, res, next) => {

    const userId = req.session.currentUser._id;

    const filter = {
        owner: userId
    };

    Character.find(filter)
        .then((charArr) => {
            res.render("game/game-select", {character: charArr});
        })
        .catch((err) => {
            next(err);
        });

});


router.get("/lobby", (req, res, next) => {
    const charId = req.session.charId;
    delete req.session.charId;
    const userId = req.session.currentUser._id.toString();

    res.render("game/game-lobby", {charId, userId});
});


//POST

router.post("/", (req, res, next) => {
    req.session.charId = req.body.charId;

    res.redirect("/game/lobby");

//GET game/

router.get("/", (req, res, next) => {
   res.render("game/game-lobby");
});

router.get("/:gameId", (req, res, next) => {
   res.render("game/game", {user: req.session.currentUser});
});

module.exports = router;