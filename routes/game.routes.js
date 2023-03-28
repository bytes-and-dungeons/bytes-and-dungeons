const express = require('express');
const router = express.Router();
const Character = require("../models/Character.model");

//GET game/


router.get("/game-select", (req, res, next) => {
    
    const userId = req.session.currentUser._id;
    const filter = {owner: userId};
    
    Character.find(filter)
    .then((charArray) => {
        res.render('game/game-select', {character: charArray})
    }).catch((err) => {
        next(err);
    });
    
});

router.get("/game-lobby", (req, res, next) => {

    const charId = req.session.selectedChar;

    res.render("game/game-lobby", {charId});
});


router.get("/:gameId", (req, res, next) => {

    const charId = req.session.selectedChar;
    delete req.session.selectedChar;

    Character.findById(charId)
        .then((character) => {
            res.render("game/game", {character});            
        }).catch((err) => {
            next(err);
        });

});

//POST REQUESTS


router.post("/game-select", (req, res, next) => {
    const {charId} = req.body;
    req.session.selectedChar = charId;
    res.redirect("/game/game-lobby");
});



module.exports = router;