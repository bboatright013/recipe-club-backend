const express = require("express");
const router = new express.Router();
const Recipe = require("../models/recipe");
const Comment = require("../models/comment");
const {authUserToken, requireLogin, requireAdmin} = require("../middleware/authenticate");
const ExpressError = require("../helpers/expressError");

router.post("/:recipeId", authUserToken, requireLogin, async function (req, res, next) {
    try{
        let recipe = await Recipe.getById(req.params.recipeId);
        const { username } = req.user;
        const { comment } = req.body;
        if(!recipe){
            return new ExpressError("recipe not found", 404)
        }

        let newComment = await Comment.create(username, recipe.id, comment);
        return res.json({newComment});
    }catch(error){
        return next(error);
    }
})

router.delete("/:commentId", authUserToken, requireLogin, async function(req, res, next) {
    try{
        let comment = await Comment.getById(req.params.commentId);
        if(!comment){
            return new ExpressError("comment not found", 404);
        }
        if(req.user.is_admin || req.user.username == comment.users_username){
            await comment.remove();
            return res.json({ msg: `deleted comment: ${comment.id}`,
                                id: `${comment.id}`});
        } else {
            throw new ExpressError('Only that user or admin can delete their comment', 401);
        }
    } catch(error){
        return next(error)
    }
})

router.get("/:recipeId", async function (req, res, next) {
    try{
        let comments = await Comment.getAll(req.params.recipeId);
        console.log("comments", comments)
        return res.json({comments});
    } catch(error){
        return next(error);
    }
});



router.patch('/:commentId', authUserToken, requireLogin,
async function(req,res,next) {
  try {
    let tmpComment = await Comment.getById(req.params.commentId);
    if(req.user.username == recipe.user_username){
      let fields = { ...req.body.update };
      let comment = await Comment.update(tmpComment.id, fields);
      return res.json({ comment });
    } else {
      throw new ExpressError('Only that user can edit their comment.', 401);
    }
  } catch (err) {
    return next(err);
  }
}); // end

module.exports = router; 