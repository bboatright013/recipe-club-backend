const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


class Ingredient {
    constructor(ingredientObj) {
        this.id = ingredientObj.id,
        this.order_num = ingredientObj.order_num ,
        this.ingredient = ingredientObj.ingredient,
        this.recipe_id = ingredientObj.recipe_id
    }

    static async create(order_num, reqIngredient, recipe_id) {
        try {
            const results = await db.query(`
            INSERT INTO ingredients (order_num, ingredient, recipe_id)
            VALUES($1,$2,$3)
            RETURNING id, order_num, ingredient, recipe_id
            `, [order_num, reqIngredient, recipe_id]
            );
            const ingredient = results.rows[0];
            return new Ingredient({id:ingredient.id, 
                order_num:ingredient.order_num, 
                ingredient:ingredient.ingredient, 
                recipe_id:ingredient.recipe_id});
        } catch(error){
            return new ExpressError(error.msg, 401);
        }
    }

    static async createAll(ingredientsList, tmpRecipeID){
        try{
            let ingredients = await Promise.all(ingredientsList.map(async (theIngredient) => {
                const tmpIngredient = await Ingredient.create(
                    theIngredient.order_num,
                    theIngredient.ingredient,
                    tmpRecipeID
                );
                return tmpIngredient;
            }));
            return ingredients;
        } catch(error){
            return (error);
        }
    }

    async remove(){
        try{
            await db.query(`
            DELETE FROM ingredients
            WHERE id = $1`, [this.id]);
        } catch(error){
            return (error);
        }

    }

    static async getAll(recipeId){
        try{
            const results = await db.query(`
            SELECT id, order_num, ingredient, recipe_id 
            FROM ingredients
            WHERE recipe_id = $1`,
            [recipeId]);
            const ingredients = results.rows.map(ingredient => 
                new Ingredient({id:ingredient.id, 
                    order_num:ingredient.order_num, 
                    ingredient:ingredient.ingredient, 
                    recipe_id:ingredient.recipe_id}));
                    console.log({ingredients});
            return ingredients;
        } catch(error){
            return (error);
        }

    }

    static async getById(ingredientId){
        try{
            const result = await db.query(`
            SELECT id, order_num, ingredient, recipe_id 
            FROM ingredients
            WHERE id = $1`,
            [ingredientId]);
            const ingredient = result.rows[0];
            if(!ingredient){
                throw new ExpressError("ingredient not found", 404);
            }
            return new Ingredient({id:ingredient.id, 
                order_num:ingredient.order_num, 
                ingredient:ingredient.ingredient, 
                recipe_id:ingredient.recipe_id});
        } catch(error){
            return (error);
        }

    }

    // static async update(ingredientId, newIngredient, orderNum) {
    //     try{
    //         let results = await db.query(`
    //         UPDATE ingredients
    //         SET ingredient = $1, order_num = $2
    //         WHERE id = $3
    //         RETURNING id, order_num`, [newIngredient, orderNum, ingredientId]);

    //           const result = await db.query(query, values);
    //           const ingredient = result.rows[0];
              
          
    //           if (!ingredient) {
    //             throw new ExpressError('No such ingredient', 404);
    //           }
    //           return new Ingredient({id:ingredient.id, 
    //               order_num:ingredient.order_num, 
    //               ingredient:ingredient.ingredient, 
    //               recipe_id:ingredient.recipe_id});
    //     } catch(error){
    //         return (error);
    //     }
    //   }

      static async updateAll(updatedIngredientsList, recipeId){
        try{
            let oldIngredients = await Ingredient.getAll(recipeId);
            oldIngredients.forEach(ingredient => ingredient.remove());

            let ingredients = Ingredient.createAll(updatedIngredientsList, recipeId);
            return ingredients;
        } catch(error){
            return (error)
        }
      }
    
}

module.exports = Ingredient;