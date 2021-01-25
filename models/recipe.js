const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

class Recipe {
    constructor(recipeObj) {
        this.id = recipeObj.id,
        this.recipe_name = recipeObj.recipe_name,
        this.image_url = recipeObj.image_url,
        this.user_username = recipeObj.user_username
    }

    static async create(newName, newImage_url, newUsername) {
        const results = await db.query(`
        INSERT INTO recipes (recipe_name, image_url, user_username)
        VALUES($1,$2,$3)
        RETURNING id, recipe_name, image_url, created_on, user_username
        `, [newName, newImage_url, newUsername]
        );
        const recipe = results.rows[0];
        return new Recipe({id:recipe.id, 
            recipe_name:recipe.recipe_name, 
            image_url:recipe.image_url, 
            created_on:recipe.created_on, 
            user_username: recipe.user_username});
    }

    async remove(){
        await db.query(`
        DELETE FROM recipes
        WHERE id = $1`, [this.id]);
    }

    static async getAll(){
        const results = await db.query(`SELECT id, recipe_name, image_url, user_username FROM recipes`);
        const recipes = results.rows.map(recipe => 
            new Recipe({id:recipe.id, 
                recipe_name:recipe.recipe_name, 
                image_url:recipe.image_url, 
                created_on:recipe.created_on, 
                user_username: recipe.user_username}));
        return recipes;
    }

    static async getAllWithInfo(){
        const results = await db.query(`
        SELECT recipes.id, recipe_name, image_url, recipes.created_on, recipes.user_username, 
        COUNT(comments.recipe_id) AS "num_comments", AVG(ratings.score) AS "rating", COUNT(cookbooks.recipe_id) AS "cookbook_adds" 
        FROM recipes LEFT JOIN comments ON recipes.id = comments.recipe_id 
        LEFT JOIN ratings ON recipes.id = ratings.recipe_id 
        LEFT JOIN cookbooks ON recipes.id = cookbooks.recipe_id 
        GROUP BY recipes.id 
        ORDER BY recipes.id;`);

        const recipes = results.rows.map(recipe => 
            ({id:recipe.id, 
                recipe_name:recipe.recipe_name, 
                image_url:recipe.image_url, 
                created_on:recipe.created_on, 
                user_username: recipe.user_username,
                rating:recipe.rating,
                cookbook_adds: recipe.cookbook_adds,
                num_comments: recipe.num_comments}));
        return recipes;
    }

    static async getFilteredWithInfo(tagName){
        console.log("in filtered model:",tagName);
        const results = await db.query(`
        SELECT recipes.id, recipe_name, image_url, recipes.created_on, recipes.user_username, 
        COUNT(comments.recipe_id) AS "num_comments", AVG(ratings.score) AS "rating", COUNT(cookbooks.recipe_id) AS "cookbook_adds" 
        FROM recipes LEFT JOIN comments ON recipes.id = comments.recipe_id
        LEFT JOIN ratings ON recipes.id = ratings.recipe_id 
        LEFT JOIN cookbooks ON recipes.id = cookbooks.recipe_id 
        JOIN recipe_tags ON recipes.id = recipe_tags.recipe_id
        JOIN tags ON recipe_tags.tag_id = tags.id
        WHERE tags.tag_name = $1
        GROUP BY recipes.id 
        ORDER BY recipes.id;`, [tagName]);

        const recipes = results.rows.map(recipe => 
            ({id:recipe.id, 
                recipe_name:recipe.recipe_name, 
                image_url:recipe.image_url, 
                created_on:recipe.created_on, 
                user_username: recipe.user_username,
                rating:recipe.rating,
                cookbook_adds: recipe.cookbook_adds,
                num_comments: recipe.num_comments}));
        return recipes;
    }

    static async getById(recipeId){
        const result = await db.query(
            `SELECT id, recipe_name, image_url, created_on, user_username
            FROM recipes
            WHERE id = $1`,
            [recipeId]
        );
        const recipe = result.rows[0];
        if(!recipe){
            throw new ExpressError("recipe not found", 404);
        }
        return new Recipe({id:recipe.id, 
            recipe_name:recipe.recipe_name, 
            image_url:recipe.image_url, 
            created_on:recipe.created_on, 
            user_username: recipe.user_username})
    }

    static async update(recipeId, data) {
        let { query, values } = sqlForPartialUpdate(
          'recipes',
          data,
          'id',
          recipeId
        );
    
        const result = await db.query(query, values);
        const recipe = result.rows[0];
        
    
        if (!recipe) {
          throw new ExpressError('No such user', 404);
        }
        return new Recipe({id:recipe.id, 
            recipe_name:recipe.recipe_name, 
            image_url:recipe.image_url, 
            created_on:recipe.created_on, 
            user_username: recipe.user_username});
      }
    
}

module.exports = Recipe;