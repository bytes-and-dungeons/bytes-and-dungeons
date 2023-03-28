// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv").config();

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");
const isLoggedOut = require("./middleware/isLoggedOut");

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const capitalize = require("./utils/capitalize");
const projectName = "bytes-and-dungeons";
const isLoggedIn = require("./middleware/isLoggedIn");

// Checks if there's a user logged in (in every possible route)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.currentUser;
  next();
});

// 👇 Start handling routes here
app.use("/", require("./routes/index.routes"));

app.use("/auth", require("./routes/auth.routes"));

app.use("/user-profile", isLoggedIn, require("./routes/user.routes"));

app.use("/characters", require("./routes/character.routes"));

app.use("/game", require("./routes/game.routes"));

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
