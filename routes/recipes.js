const express = require("express");
const router = new express.Router();
const Recipe = require("../models/recipe");
const Ingredient = require("../models/ingredients");
const Instruction = require("../models/instructions");
const Comment = require("../models/comment");
const Recipe_Tag = require("../models/recipe_tag");
const Rating = require("../models/rating");
const {authUserToken, requireLogin} = require("../middleware/authenticate");
const jsonschema = require("jsonschema");
const recipeSchema = require("../schemas/recipeSchema.json");
const instructionsSchema = require("../schemas/instructionsSchema.json");
const ingredientsSchema = require("../schemas/ingredientsSchema.json");
const updateRecipeSchema = require("../schemas/updateRecipeSchema.json");
const ExpressError = require("../helpers/expressError");


router.post("/", authUserToken, requireLogin, async function (req, res, next) {
    try{
        const recipeResult = jsonschema.validate(req.body, recipeSchema);
        if(!recipeResult.valid){
          let listOfErrors = recipeResult.errors.map( error => error.stack);
          let error = new ExpressError(listOfErrors, 400);
          return next(error);
        }
        const { recipe_name, image_url, instructionsArray, ingredientsArray, recipeTags } = req.body;
        const { username } = req.user;
        let tmpRecipe = await Recipe.create(recipe_name, image_url, username);
        const instructionResult = jsonschema.validate({instructionsArray}, instructionsSchema);
        if(!instructionResult.valid){
          let listOfErrors = instructionResult.errors.map( error => error.stack);
          let error = new ExpressError(listOfErrors, 403);
          return next(error);
        }
        let instructions = await Instruction.createAll(instructionsArray, tmpRecipe.id);
        const ingredientResult = jsonschema.validate({ingredientsArray}, ingredientsSchema);
        if(!ingredientResult.valid){
          let listOfErrors = ingredientResult.errors.map( error => error.stack);
          let error = new ExpressError(listOfErrors, 405);
          return next(error);
        }
        let ingredients = await Ingredient.createAll(ingredientsArray, tmpRecipe.id);
        const recipe_tags = await Recipe_Tag.createAll(recipeTags, tmpRecipe.id);
        console.log(recipe_tags);
        const recipe = { id:tmpRecipe.id, 
            recipe_name: tmpRecipe.recipe_name, 
            image_url: tmpRecipe.image_url, 
            user_username:tmpRecipe.user_username, 
            ingredients, instructions}; 
        return res.json(recipe);
    }catch(error){
        return next(error);
    }
});

router.delete("/:recipeId", authUserToken, requireLogin, async function(req, res, next) {
    try{
        let recipe = await Recipe.getById(req.params.recipeId);
        console.log("in delete route", recipe);
        await recipe.remove();
        return res.json({ msg: `deleted ${recipe.recipe_name}`,
                            id: req.params.recipeId});
    } catch(error){
        return next(error)
    }
});

router.get("/", async function (req, res, next) {
    try{
        let recipes = await Recipe.getAllWithInfo();
        return res.json({recipes});
    } catch(error){
        return next(error);
    }
});

router.get("/filter/:tag_name", async function (req, res, next) {
  try {
    const tag_name = req.params.tag_name;
    let recipes = await Recipe.getFilteredWithInfo(tag_name);
    return res.json({recipes})
  } catch(error){
    return next(error);
  }
})

router.get("/:recipeId", async function (req, res, next) {
    try{
        let tmpRecipe = await Recipe.getById(req.params.recipeId);
        let ingredients = await Ingredient.getAll(tmpRecipe.id);
        let instructions = await Instruction.getAll(tmpRecipe.id);
        let comments = await Comment.getAll(tmpRecipe.id);
        let recipe_tags = await Recipe_Tag.getByRecipe(tmpRecipe.id);
        let rating = await Rating.getRating(tmpRecipe.id);
        const recipe = { id:tmpRecipe.id, 
            recipe_name: tmpRecipe.recipe_name, 
            image_url: tmpRecipe.image_url, 
            user_username:tmpRecipe.user_username, 
            rating, ingredients, instructions, comments, recipe_tags };
        return res.json(recipe);
    }catch(error){
        return next(error);
    }
});

router.patch('/:recipeId', authUserToken, requireLogin,
async function(req,res,next) {
  console.log("patch request body:", req.body);
  try {
    // const updateResult = jsonschema.validate(req.body, updateRecipeSchema);
    // if(!updateResult.valid){
    //   let listOfErrors = updateResult.errors.map( error => error.stack);
    //   let error = new ExpressError(listOfErrors, 400);
    //   return next(error);
    // }
    let tmpRecipe = await Recipe.getById(req.params.recipeId);
    console.log(req.user.is_admin || req.user.username == tmpRecipe.user_username)
    if(req.user.is_admin || req.user.username == tmpRecipe.user_username){
      let fields = { ...req.body };
      let recipeFields = { recipe_name: fields.recipe_name, image_url: fields.image_url }
      let recipe = await Recipe.update(tmpRecipe.id, recipeFields);
      let instructions = await Instruction.updateAll(fields.instructions, tmpRecipe.id);
      let ingredients = await Ingredient.updateAll(fields.ingredients, tmpRecipe.id);
      const recipe_tags = await Recipe_Tag.updateAll(fields.recipeTags, tmpRecipe.id);
      let rating = await Rating.getRating(tmpRecipe.id);

      return res.json({ id:recipe.id, 
        recipe_name: recipe.recipe_name, 
        image_url: recipe.image_url, 
        user_username:recipe.user_username, 
        rating, ingredients, instructions, recipe_tags });
    } else {
      throw new ExpressError('Only that user or admin can edit a users recipe.', 401);
    }
  } catch (err) {
    return next(err);
  }
}); // end

module.exports = router; 