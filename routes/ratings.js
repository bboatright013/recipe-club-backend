const express = require("express");
const router = new express.Router();
const Recipe = require("../models/recipe");
const Rating = require("../models/rating");
const {authUserToken, requireLogin, requireAdmin} = require("../middleware/authenticate");
const ExpressError = require("../helpers/expressError");

router.post("/:recipeId", authUserToken, requireLogin, async function (req, res, next) {
    try{
        console.log("in route", req.user, req.body);

        let recipe = await Recipe.getById(req.params.recipeId);
        const { username } = req.user;
        const { score } = req.body;
        if(!recipe){
            return new ExpressError("recipe not found", 404)
        }
        let rating = await Rating.create(username, recipe.id, score);
        console.log(rating); 
        return res.json({rating});
    }catch(error){
        return next(error);
    }
})

router.delete("/:recipeId", authUserToken, requireLogin, async function(req, res, next) {
    try{
        let {username} = req.user;
        let rating = await Rating.getByPK(username, req.params.recipeId);
        if(!rating){
            return new ExpressError("rating not found", 404);
        }
        if(req.user.is_admin || req.user.username == comment.users_username){
            await rating.remove();
            return res.json({ id: `${rating.recipe_id}` });
        } else {
            throw new ExpressError('Only that user or admin can delete their rating', 401);
        }
    } catch(error){
        return next(error)
    }
})

router.get("/recipe/:recipeId", async function (req, res, next) {
    try{
        let ratings = await Rating.getAll(req.params.recipeId);
        console.log(ratings);
        return res.json({ratings});
    } catch(error){
        return next(error);
    }
});

router.get("/:username", async function(req, res, next) {

    try{
            let ratings = await Rating.getByUsername(req.params.username);
            console.log("after getbyusername ran", ratings);
            return res.json(ratings);

    } catch(error){
        return next(error);
    }
})



router.patch('/:recipeId', authUserToken, requireLogin,
async function(req,res,next) {
  try {
    console.log("score in body", req.body.score);
    let rating = await Rating.getByPK(req.user.username, req.params.recipeId);
    console.log("new rating obj",rating);
    console.log("usernames:", req.user.username == rating.users_username)
    if(req.user.username == rating.users_username){
      let { score } = req.body ;
      console.log("score", score);
      let updatedRating = await rating.update(score);
      console.log("updatedRating", updatedRating);
      return res.json( updatedRating );
    } else {
      throw new ExpressError('Only that user can edit their rating.', 401);
    }
  } catch (err) {
    return next(err);
  }
}); // end

module.exports = router; 