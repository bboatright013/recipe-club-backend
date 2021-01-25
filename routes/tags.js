const express = require("express");
const router = new express.Router();
const Tag = require("../models/tags");
const {authUserToken, requireLogin, requireAdmin} = require("../middleware/authenticate");

router.post("/", authUserToken, requireLogin, requireAdmin, async function (req, res, next) {
    try{
        const { tag_name } = req.body;
        let tag = await Tag.create(tag_name);
        return res.json({tag});
    }catch(error){
        return next(error);
    }
})

router.delete("/:tagId", authUserToken, requireLogin, requireAdmin, async function(req, res, next) {
    try{
        let tag = await Tag.getById(req.params.tagId);
        await tag.remove();
        return res.json({ msg: `deleted ${tag.tag_name}`,
                            id: `${tag.id}`});
    } catch(error){
        return next(error)
    }
})

router.get("/", async function (req, res, next) {
    try{
        let tags = await Tag.getAll();
        console.log("getting tags");
        return res.json({tags});
    } catch(error){
        return next(error);
    }
});

router.get("/:tagId", async function (req, res, next) {
    try{
        let tag = await Tag.getById(req.params.tagId);
        return res.json({tag});
    }catch(error){
        return next(error);
    }
});

router.patch('/:tagId', authUserToken, requireLogin, requireAdmin,
async function(req,res,next) {
  try {
      let fields = { ...req.body };
      let updatedTag = await Tag.update(req.params.tagId, fields);
      return res.json({ updatedTag });

  } catch (err) {
    return next(err);
  }
}); // end

module.exports = router; 