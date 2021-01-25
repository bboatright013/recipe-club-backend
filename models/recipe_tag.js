const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Recipe_Tag {
    constructor(recipetagObj) {
        this.id = recipetagObj.id,
        this.tag_id = recipetagObj.tag_id,
        this.recipe_id = recipetagObj.recipe_id
    }

    static async create(tag_id, recipe_id) {
        const results = await db.query(`
        INSERT INTO recipe_tags (tag_id, recipe_id)
        VALUES($1,$2)
        RETURNING id, tag_id, recipe_id
        `, [tag_id, recipe_id]
        );
        const recipe_tag = results.rows[0];
        return new Recipe_Tag({id:recipe_tag.id, 
            tag_id:recipe_tag.tag_id,
            recipe_id:recipe_tag.recipe_id});
    }

    static async createAll(tagList, tmpRecipeID){
        console.log("taglist", tagList);
        try{
            let recipe_tags = await Promise.all(tagList.map(async (theTag) => {
                const tmpTag = await Recipe_Tag.create(
                    theTag,
                    tmpRecipeID
                );
                console.log(tmpTag);
                return tmpTag;
            }));
            return recipe_tags;
        } catch(errr){
            return (error)
        }
    }

    async remove(){
        await db.query(`
        DELETE FROM recipe_tags
        WHERE id = $1`, [this.id]);
    }

    static async getAll(){
        const results = await db.query(`
        SELECT id, recipe_id, tag_id
        FROM recipe_tags`);
        const recipe_tags = results.rows.map(recipe_tag => 
            new Recipe_Tag({id:recipe_tag.id, 
                tag_id:recipe_tag.tag_id,
                recipe_id:recipe_tag.recipe_id})
        );
        return recipe_tags;
    }

    static async getById(recipetagId){
        const result = await db.query(`
        SELECT id, tag_id, recipe_id
        FROM recipe_tags
        WHERE id = $1`,
        [recipetagId]);
        const tag = result.rows[0];
        if(!tag){
            throw new ExpressError("tag not found", 404);
        }
        return new Tag({id:tag.id, 
            tag_name:tag.tag_name}
            );
    }

    static async getByRecipe(recipeId){
        const results = await db.query(`
        SELECT tags.id, tag_id, recipe_id, tag_name
        FROM recipe_tags
        JOIN tags
        ON tags.id = tag_id
        WHERE recipe_id = $1`,
        [recipeId]);

        const recipe_tags = results.rows.map(recipe_tag => 
            ({ 
            tag_id:recipe_tag.tag_id,
                recipe_id:recipe_tag.recipe_id,
            tag_name : recipe_tag.tag_name }
        ))
        console.log(recipe_tags);
        return recipe_tags;
    }
    
    static async updateAll(recipeTags, recipeId){
            await db.query(`
            DELETE FROM recipe_tags
            WHERE recipe_id = $1`, [recipeId]);
        
            let tmpTags = Recipe_Tag.createAll(recipeTags, recipeId);
            console.log("recipe_tags:", tmpTags);
        return tmpTags;

    }
}

module.exports = Recipe_Tag;