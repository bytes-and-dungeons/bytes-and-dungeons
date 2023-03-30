const express = require('express');
const router = express.Router();

const User = require("../models/User.model");
const Character = require("../models/Character.model");

const fileUploader = require('../config/cloudinary.config');

// GET /user-profile
router.get("/", (req, res, next) => {

  const userData = req.session.currentUser;

  const filter = {
      owner: req.session.currentUser._id,
  };

  Character.find(filter)
    .sort([["updatedAt", -1]])
    .populate("owner")
    .then((charArr) => {
        res.render("user/user-profile", {user: userData, character: charArr});
    })
    .catch((err) => {
        next(err);
    });

});

// GET /user-profile/edit
router.get("/edit", (req, res, next) => {
  const userData = req.session.currentUser;

  res.render("user/user-edit", {user: userData});
});

// POST /user-profile/edit
router.post("/edit", fileUploader.single('profile-picture'), (req, res, next) => {
  const userId = req.session.currentUser._id;

  const { username, email, existingProfileImage } = req.body;

  let userIconImgUrl;
  if(req.file) {
    userIconImgUrl = req.file.path;
  } else {
    userIconImgUrl = existingProfileImage;
  }

  User.findByIdAndUpdate(userId, {username, email, userIconImgUrl}, {new: true})
    .then((user) => {
      req.session.regenerate(err => {
        if(err) {
          console.log(err);
          next(err);
        } else {
          req.session.currentUser = user.toObject();
          res.redirect("/user-profile");
        }
      });

    }).catch((err) => {
      next(err);
    });
    
});

module.exports = router;
