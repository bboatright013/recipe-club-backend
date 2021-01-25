const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Rating {
    constructor(ratingObj) {
        this.users_username = ratingObj.users_username,
        this.recipe_id = ratingObj.recipe_id,
        this.score = ratingObj.score
    }

    static async create(username, recipe_id, score) {
        console.log("in create");
        const duplicateCheck = await db.query(
            `SELECT users_username, recipe_id, score
              FROM ratings 
              WHERE users_username = $1
              AND recipe_id = $2`,
            [username, recipe_id]
          );
          console.log("dup check", duplicateCheck.rows[0]);
          if (duplicateCheck.rows[0]) {
            throw new ExpressError("duplicate ratings not allowed", 400);
          }
        const results = await db.query(`
        INSERT INTO ratings (users_username, recipe_id, score)
        VALUES($1,$2,$3)
        RETURNING users_username, recipe_id, score
        `, [username, recipe_id, score]
        );
        const rating = results.rows[0];
        return new Rating({ 
            users_username:rating.users_username,
            recipe_id:rating.recipe_id,
            score:rating.score});
    }

    async remove(){
        await db.query(`
        DELETE FROM ratings
        WHERE users_username = $1 
        AND recipe_id = $2`, 
        [this.users_username, this.recipe_id]);
    }

    static async getRating(recipeId){
        const results = await db.query(`
        SELECT AVG(score) AS "rating"
        FROM ratings
        WHERE recipe_id = $1`,
        [recipeId]);
        const tmpRate = results.rows[0];
        console.log("tmprate:", tmpRate.rating);
        const rating = tmpRate.rating;
        console.log(rating);
        return rating;
    }

    static async getByPK(username, recipeId){
        console.log("username and id", username, recipeId);
        const result = await db.query(`
        SELECT users_username, recipe_id, score
        FROM ratings
        WHERE users_username = $1
        AND recipe_id = $2`,
        [username, recipeId]);
        const rating = result.rows[0];
        console.log("rating", rating);
        if(!rating){
            throw new ExpressError("rating not found", 404);
        }
        return new Rating({
            users_username:rating.users_username,
            recipe_id:rating.recipe_id,
            score:rating.score}
            );
    }

    static async getByUsername(username){
        const results = await db.query(`
        SELECT users_username, recipe_id, score
        FROM ratings
        WHERE users_username = $1`,
        [username]);

        const userRatings = results.rows.map( row => 
            new Rating({
                users_username:row.users_username,
                recipe_id:row.recipe_id,
                score:row.score
            })
        );
        console.log("userRating:", userRatings);
        return userRatings; 
    }


    async update(score) {
        console.log("score", score);
        console.log("username", this.users_username);
        console.log("recipe", this.recipe_id);
        const result = await db.query(`
        UPDATE ratings
        SET score = $1
        WHERE users_username = $2
        AND recipe_id = $3
        RETURNING users_username, recipe_id, score`,
        [score, this.users_username, this.recipe_id]);

        const updatedRating = result.rows[0];
        console.log("after db query", updatedRating);
        if (!updatedRating) {
          throw new ExpressError('Couldnt find rating', 404);
        }
        return new Rating({
            users_username:updatedRating.users_username,
            recipe_id:updatedRating.recipe_id,
            score:updatedRating.score});
      }
    
    
}

module.exports = Rating;