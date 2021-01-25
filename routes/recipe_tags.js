const express = require("express");
const router = new express.Router();
const Recipe_Tag = require("../models/recipe_tag");
const Recipe = require("../models/recipe")
const {authUserToken, requireLogin, requireAdmin} = require("../middleware/authenticate");

router.post("/:recipeId", authUserToken, requireLogin, async function (req, res, next) {
    try{
        let recipe = await Recipe.getById(req.params.recipeId);
        if(req.user.is_admin || req.user.username == recipe.user_username){
          const { tag_name } = req.body;
          let recipe_tag = await Recipe_Tag.create(req.params.recipeId, tag_name);
          return res.json(recipe_tag);
        } else {
          throw new ExpressError('Only that user or admin can tag a recipe.', 401);
        }
    }catch(error){
        return next(error);
    }
})

router.delete("/:recipeId", authUserToken, requireLogin, async function(req, res, next) {
    try{
        let recipe = await Recipe.getById(req.params.recipeId);
        if(req.user.is_admin || req.user.username == recipe.user_username){

        const {id} = req.body;
        let recipe_tag = await Recipe_Tag.getById(id);
        await recipe_tag.remove();
        return res.json({ msg: "deleted tag from recipe",
                            id: `${recipe_tag.id}` });
        } else {
            throw new ExpressError('Only that user or admin can delete a tag from a recipe.', 401);
        }
    } catch(error){
        return next(error)
    }
})

router.get("/:recipeId", async function (req, res, next) {
    try{
        let recipe_tags = await Recipe_Tag.getByRecipe(req.params.recipeId);
        return res.json({recipe_tags});
    }catch(error){
        return next(error);
    }
});

router.get("/", async function (req, res, next) {
    try{
        let recipe_tags = await Recipe_Tag.getAll(req.params.recipeId);
        return res.json({recipe_tags});
    }catch(error){
        return next(error);
    }
});



module.exports = router; 