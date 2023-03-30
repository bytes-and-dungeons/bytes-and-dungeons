const express = require('express');
const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn');
const isOwner = require('../middleware/isOwner');
const checkOwnership = require("../utils/checkOwnership");
const createCharacter = require("../utils/createCharacter");
const calculateUpgradedAttributes = require('../utils/calculateUpgradedAttributes');

const fileUploader = require('../config/cloudinary.config');

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

    if(user) {
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
    } else {
        res.redirect("/auth/login");
    }
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

//GET /characters/:characterID/upgrade
router.get("/:charId/upgrade", isLoggedIn, isOwner, (req, res, next) => {
    const {charId} = req.params;

    Character.findById(charId)
        .then((character) => {
            const error = req.session.error;
            delete req.session.error;
            res.render("characters/character-upgrade", {character, error});
        }).catch((err) => {
            next(err);
        });
});


// POST /characters/create
router.post("/create", isLoggedIn, fileUploader.single('char-img'), (req, res, next) => {
    const {name, characterClass, description} = req.body;

    const charImgUrl = req.file.path;

    const newCharacterData = createCharacter(req.session.currentUser._id, name, description, characterClass, charImgUrl);

    Character.create(newCharacterData)
        .then(() => {
            res.redirect("/characters")
        }).catch((err) => {
            next(err);
        });
});


//POST /characters/:charId/edit
router.post("/:charId/edit", isLoggedIn, isOwner, fileUploader.single('char-new-img'), (req, res, next) => {
    const { charId }  = req.params;

    const {name, description} = req.body;

    const newCharacterData = {
        name,
        description,
        charImgUrl: req.file.path
    };

    Character.findByIdAndUpdate(charId, newCharacterData, {new: true})
        .then(() => {
            res.redirect('/characters')
        })
        .catch(err => {
            next(err);
        });
});


//POST /characters/:charId/upgrade
router.post("/:charId/upgrade", isLoggedIn, isOwner, (req, res, next) => {
    const { charId }  = req.params;

    let {healthPoints, strengthPoints, defensePoints} = req.body;
    healthPoints = parseInt(healthPoints);
    defensePoints = parseInt(defensePoints);
    strengthPoints = parseInt(strengthPoints);
    
    Character.findById(charId)
        .then((character) => {
            
            if((healthPoints + strengthPoints + defensePoints) <= character.experiencePoints) {

                const newCharacterData = calculateUpgradedAttributes(character, healthPoints, strengthPoints, defensePoints);
                
                return Character.findByIdAndUpdate(charId, newCharacterData, {new: true});

            } else {
                req.session.error = "You tried to use more Experience Points than you currently have."
                res.redirect(`/characters/${charId}/upgrade`);
            } 
            
        })
        .then(() => {
            res.redirect(`/characters/${charId}`);
        })
        .catch((err) => {
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