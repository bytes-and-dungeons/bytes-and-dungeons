const express = require('express');
const router = express.Router();

const User = require("../models/User.model");

// GET /user-profile
router.get("/", (req, res, next) => {

  const userData = req.session.currentUser;

  res.render("user/user-profile", {user: userData});
});

// GET /user-profile/edit
router.get("/edit", (req, res, next) => {
  const userData = req.session.currentUser;

  res.render("user/user-edit", {user: userData});
});

// POST /user-profile/edit
router.post("/edit", (req, res, next) => {
  const userId = req.session.currentUser._id;

  const { username, email } = req.body;

  User.findByIdAndUpdate(userId, {username, email}, {new: true})
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
