const db = require("../db");
const ExpressError = require("../helpers/expressError");

class Comment {
    constructor(commentObj) {
        this.id = commentObj.id,
        this.users_username = commentObj.users_username,
        this.recipe_id = commentObj.recipe_id,
        this.comment = commentObj.comment,
        this.created_on = commentObj.created_on

    }

    static async create(username, recipe_id, comment) {
        const results = await db.query(`
        INSERT INTO comments (users_username, recipe_id, comment)
        VALUES($1,$2,$3)
        RETURNING id, users_username, recipe_id, comment, created_on
        `, [username, recipe_id, comment]
        );
        const newComment = results.rows[0];
        return new Comment({id:newComment.id, 
            users_username:newComment.users_username,
            recipe_id:newComment.recipe_id,
            comment:newComment.comment,
            created_on:newComment.created_on});
    }

    async remove(){
        await db.query(`
        DELETE FROM comments
        WHERE id = $1`, [this.id]);
    }

    static async getAll(recipeId){
        const results = await db.query(`
        SELECT id, users_username, recipe_id, comment, created_on
        FROM comments
        WHERE recipe_id = $1`,
        [recipeId]);
        const comments = results.rows.map(comment => 
            new Comment({id:comment.id, 
                users_username:comment.users_username,
                recipe_id:comment.recipe_id,
                comment:comment.comment,
                created_on:comment.created_on})
        );
        return comments;
    }

    static async getById(commentId){
        const result = await db.query(`
        SELECT id, users_username, recipe_id, comment, created_on
        FROM comments
        WHERE id = $1`,
        [commentId]);
        const comment = result.rows[0];
        if(!comment){
            throw new ExpressError("comment not found", 404);
        }
        return new Comment({id:comment.id, 
            users_username:comment.users_username,
            recipe_id:comment.recipe_id,
            comment:comment.comment,
            created_on:comment.created_on}
            );
    }

    static async update(comment_id, data) {
        let { query, values } = sqlForPartialUpdate(
          'comments',
          data,
          'id',
          comment_id
        );
    
        const result = await db.query(query, values);
        const comment = result.rows[0];
        
    
        if (!comment) {
          throw new ExpressError('Couldn;t find comment', 404);
        }
        return new Comment({id:comment.id, 
            users_username:comment.users_username,
            recipe_id:comment.recipe_id,
            comment:comment.comment,
            created_on:comment.created_on});
      }
    
    
}

module.exports = Comment;