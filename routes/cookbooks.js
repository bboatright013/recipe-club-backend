const express = require("express");
const router = new express.Router();
const Cookbook = require("../models/cookbook");
const Recipe = require("../models/recipe")
const {authUserToken, requireLogin, requireAdmin} = require("../middleware/authenticate");
const ExpressError = require("../helpers/expressError");

router.post("/:recipeId", authUserToken, requireLogin, async function (req, res, next) {
    try{
        let recipe = await Recipe.getById(req.params.recipeId);
        const { username } = req.user;
        if(!recipe){
            return new ExpressError("recipe not found", 404)
        }
        let cookbook = await Cookbook.create(username, req.params.recipeId);
        return res.json(cookbook);

    }catch(error){
        return next(error);
    }
})

router.delete("/:recipeId", authUserToken, requireLogin, async function(req, res, next) {
    try{
        const { username } = req.user;
        const cookbook = await Cookbook.getByPK(username, req.params.recipeId);
        console.log(cookbook);
        console.log(req.user.username == cookbook.users_username);
        if(req.user.username == cookbook.users_username){
        await cookbook.remove();
        return res.json({ msg: "deleted tag from recipe",
                            id: `${cookbook.recipe_id}`});
        } else {
            throw new ExpressError('Only that user can delete recipes frmo their cookbook', 401);
        }
    } catch(error){
        return next(error)
    }
})

router.get("/:username", async function (req, res, next) {
    try{
        console.log("in cookbook/username");
        let recipes = await Cookbook.getAllWithInfo(req.params.username);
        console.log("cookbook recipes", recipes);
        return res.json(recipes);
    }catch(error){
        return next(error);
    }
});


module.exports = router; 