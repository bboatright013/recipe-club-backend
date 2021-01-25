const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


class Instruction {
    constructor(instructionObj) {
        this.id = instructionObj.id,
        this.order_num = instructionObj.order_num ,
        this.instruction = instructionObj.instruction,
        this.recipe_id = instructionObj.recipe_id
    }

    static async create(order_num, reqInstruction, recipe_id) {
        try{
            const results = await db.query(`
            INSERT INTO instructions (order_num, instruction, recipe_id)
            VALUES($1,$2,$3)
            RETURNING id, order_num, instruction, recipe_id
            `, [order_num, reqInstruction, recipe_id]
            );
            const instruction = results.rows[0];
            return new Instruction({id:instruction.id, 
                order_num:instruction.order_num, 
                instruction:instruction.instruction, 
                recipe_id:instruction.recipe_id});
        } catch(error) {
            return new ExpressError(error.msg, 401);
        }
    }

    static async createAll(instructionsList, tmpRecipeID){
        try{
            let instructions = await Promise.all(instructionsList.map(async (theInstruction) => {
                const tmpInstruction = await Instruction.create(
                    theInstruction.order_num,
                    theInstruction.instruction,
                    tmpRecipeID
                );
                return tmpInstruction;
            }));
            return instructions;
        } catch(errr){
            return (error)
        }
    }

    async remove(){
        await db.query(`
        DELETE FROM instructions
        WHERE id = $1`, [this.id]);
    }

    static async getAll(recipeId){
        try {
            const results = await db.query(`
            SELECT id, order_num, instruction, recipe_id 
            FROM instructions
            WHERE recipe_id = $1`,
            [recipeId]);
            let instructions = results.rows.map(instruction => 
                new Instruction({id:instruction.id, 
                    order_num:instruction.order_num, 
                    instruction:instruction.instruction, 
                    recipe_id:instruction.recipe_id}));
            return instructions;
        } catch(error){
            return(error);
        }

    }

    static async getById(instructionId){
        try {
            const result = await db.query(`
            SELECT id, order_num, instruction, recipe_id 
            FROM instructions
            WHERE id = $1`,
            [instructionId]);
            const instruction = result.rows[0];
            if(!instruction){
                throw new ExpressError("instruction not found", 404);
            }
            return new Instruction({id:instruction.id, 
                order_num:instruction.order_num, 
                instruction:instruction.instruction, 
                recipe_id:instruction.recipe_id});
        } catch(error){
            return(error)
        }

    }

    static async update(instructionId, data) {
        try {
            let { query, values } = sqlForPartialUpdate(
                'instructions',
                data,
                'id',
                instructionId
              );
              const result = await db.query(query, values);
              const instruction = result.rows[0];
              
              if (!instruction) {
                throw new ExpressError('No such instruction', 404);
              }
              return new Instruction({id:instruction.id, 
                  order_num:instruction.order_num, 
                  instruction:instruction.instruction, 
                  recipe_id:instruction.recipe_id});
        }catch(error){
            return (error)
        }
      }

    //   static async updateAll(updatedInstructionsList){
    //     try{
    //         let instructions = await Promise.all(updatedInstructionsList.map(async (theInstruction) => {
    //             const tmpInstruction = await Instruction.update(
    //                 theInstruction.id,
    //                 {
    //                     order_num:theInstruction.order_num,
    //                 instruction:theInstruction.instruction,
    //                 }
    //             );
    //             return tmpInstruction;
    //         }));
    //         return instructions;
    //     } catch(error){
    //         return (error)
    //     }
    //   }


    static async updateAll(updatedInstructionsList, recipeId){
        try{
            let oldInstructions = await Instruction.getAll(recipeId);
            oldInstructions.forEach(instruction => instruction.remove());

            let instructions = Instruction.createAll(updatedInstructionsList, recipeId);
            return instructions;
        } catch(error){
            return (error)
        }
      }
    
}

module.exports = Instruction;