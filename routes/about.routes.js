const express = require("express");
const { escapeExpression } = require("handlebars");
const router = express.Router();

// GET /about-us
router.get('/', (req, res, next) => {
    res.render('about/about-us')
});

module.exports = router;