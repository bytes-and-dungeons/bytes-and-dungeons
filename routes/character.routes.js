const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn');
const isOwner = require('../middleware/isOwner');
const checkOwnership = require("../utils/checkOwnership");

const Character = require('../models/Character.model');
const User = require("../models/User.model");


//GET /characters
router.get("/", (req, res, next) => {
    Character.find()
        .populate("owner")
        .then((charactersArr) => {
            res.render("characters/characters-list", {character: charactersArr});
        }).catch((err) => {
            next(err);
        });
});


// GET /characters/create
router.get('/create', isLoggedIn, (req, res, next) => {
    res.render("characters/character-create");
});

//GET /characters/:characterID
router.get("/:charId", (req, res, next) => {
    const {charId} = req.params;
    const user = req.session.currentUser;

    Character.findById(charId)
        .populate("owner")
        .then((character) => {
            const userIsOwner = checkOwnership(user, character);
            const error = req.session.error;
            delete req.session.error;
            res.render("characters/character-details", {character, userIsOwner, error});
        }).catch((err) => {
            next(err);
        });
});

//GET /characters/:characterID/edit
router.get("/:charId/edit", isLoggedIn, isOwner, (req, res, next) => {
    const {charId} = req.params;

    Character.findById(charId)
        .then((character) => {
            res.render("characters/character-edit", {character});
        }).catch((err) => {
            next(err);
        });
});


// POST /characters/create
router.post("/create", isLoggedIn, (req, res, next) => {
    const {name, characterClass, level, description, healthPoints, strength, dexterity, constitution, intelligence, wisdom, charisma, experiencePoints} = req.body;

    const newCharacterData = {
        name,
        characterClass,
        level,
        description,
        healthPoints,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        experiencePoints,
        owner: req.session.currentUser._id
    };

    Character.create(newCharacterData)
        .then(() => {
            res.redirect("/characters")
        }).catch((err) => {
            next(err);
        });
});


//POST /characters/:charId/edit
router.post("/:charId/edit", isLoggedIn, isOwner, (req, res, next) => {
    const { charId }  = req.params;

    const {name, characterClass, level, description, healthPoints, strength, dexterity, constitution, intelligence, wisdom, charisma, experiencePoints} = req.body;

    const newCharacterData = {
        name,
        characterClass,
        level,
        description,
        healthPoints,
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        experiencePoints,
        owner: req.session.currentUser._id
    };

    Character.findByIdAndUpdate(charId, newCharacterData, {new: true})
        .then(() => {
            res.redirect('/characters')
        })
        .catch(err => {
            next(err);
        });
});


//POST /characters/:charId/delete
router.post("/:charId/delete", isLoggedIn, isOwner, (req, res, next) => {
    const { charId }  = req.params;

    Character.findByIdAndDelete(charId)
        .then(() => {
            res.redirect('/characters')
        })
        .catch(err => {
            next(err);
        });
});

module.exports = router;