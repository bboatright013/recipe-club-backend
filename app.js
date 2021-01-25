/** Express app for my recipe web app. */


const express = require("express");
const app = express();
const { authUserToken, requireAdmin, requireLogin } = require("./middleware/authenticate");

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
  "Access-Control-Allow-Methods",
  "GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH"
  );
  res.header(
  "Access-Control-Allow-Headers",
  "Origin,Cache-Control,Accept,X-Access-Token ,X-Requested-With, Content-Type, Access-Control-Request-Method"
  );
  next();
});



const ExpressError = require("./helpers/expressError")

// Import Routes here
const recipeRoutes = require("./routes/recipes");
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const ratingsRoutes = require("./routes/ratings");
const commentsRoutes = require("./routes/comments");
const cookbooksRoutes = require("./routes/cookbooks");
const tagsRoutes = require("./routes/tags");
const recipe_tagsRoutes = require("./routes/recipe_tags");

//Tell app to use routes here
app.use("/", authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/users", usersRoutes);
app.use("/ratings", ratingsRoutes);
app.use("/comments", commentsRoutes);
app.use("/cookbook", cookbooksRoutes);
app.use("/tags", tagsRoutes);
app.use("/recipe_tags", recipe_tagsRoutes);


/** 404 handler */

app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});


/** general error handler */

app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;
