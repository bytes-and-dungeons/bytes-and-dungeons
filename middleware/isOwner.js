const Character = require("../models/Character.model");

module.exports = (req, res, next) => {

    const currentUserId = res.locals.currentUser._id;
    const charId = req.params.charId;

    Character.findById(charId)
        .then(returnedChar => {
            console.log(returnedChar)
            if(currentUserId.toString() === returnedChar.owner.toString()) {
                next();
            } else {
                req.session.error = `You can't delete a character you don't own.`;
                res
                  .status(400)
                  .redirect(`/characters/${charId}`)
            }
        })
        .catch(err => {
            next(err);
        })

    console.log(currentUserId, charId)

};