const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Cookbook {
    constructor(cookbookObj) {
        this.users_username = cookbookObj.users_username,
        this.recipe_id = cookbookObj.recipe_id
    }

    static async create(username, recipe_id) {
        const results = await db.query(`
        INSERT INTO cookbooks (users_username, recipe_id)
        VALUES($1,$2)
        RETURNING users_username, recipe_id
        `, [username, recipe_id]
        );
        const cookbook = results.rows[0];
        return new Cookbook({ 
            users_username:cookbook.users_username,
            recipe_id:cookbook.recipe_id});
    }

    async remove(){
        await db.query(`
        DELETE FROM cookbooks
        WHERE users_username = $1
        AND recipe_id = $2`, [this.users_username, this.recipe_id]);
    }

    static async getAll(username){
        const results = await db.query(`
        SELECT users_username, recipe_id
        FROM cookbooks
        WHERE users_username = $1`,
        [username]);

        console.log(results.rows[0]);
        const cookbooks = results.rows.map(cookbook => 
            new Cookbook({
                users_username:cookbook.users_username,
                recipe_id:cookbook.recipe_id})
        );
        return cookbooks;
    }

    static async getAllWithInfo(username){
        const results = await db.query(`
        SELECT recipes.id, recipes.recipe_name, recipes.image_url, recipes.created_on, recipes.user_username
        FROM recipes
        JOIN cookbooks 
        ON recipes.id = cookbooks.recipe_id
        WHERE cookbooks.users_username = $1
        `, [username]);
        console.log(results.rows);
        const recipes = results.rows.map(recipe => 
            ({id:recipe.id, 
                recipe_name:recipe.recipe_name, 
                image_url:recipe.image_url, 
                created_on:recipe.created_on, 
                user_username: recipe.user_username,
            }));
        return recipes;
    }

    static async getByPK(username, recipeId){
        const result = await db.query(`
        SELECT users_username, recipe_id
        FROM cookbooks
        WHERE users_username = $1
        AND recipe_id = $2`,
        [username, recipeId]);
        const cookbook = result.rows[0];
        if(!cookbook){
            throw new ExpressError("cookbook not found", 404);
        }
        return new Cookbook({
            users_username:cookbook.users_username,
            recipe_id:cookbook.recipe_id}
            );
    }
}

module.exports = Cookbook;