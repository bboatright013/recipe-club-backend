const db = require("../db");
const ExpressError = require("../helpers/expressError");
const sqlForPartialUpdate = require("../helpers/partialUpdate");


class Tag {
    constructor(tagObj) {
        this.id = tagObj.id,
        this.tag_name = tagObj.tag_name 
    }

    static async create(tag_name) {
        const results = await db.query(`
        INSERT INTO tags (tag_name)
        VALUES($1)
        RETURNING id, tag_name
        `, [tag_name]
        );
        const tag = results.rows[0];
        return new Tag({id:tag.id, 
            tag_name:tag.tag_name});
    }

    async remove(){
        await db.query(`
        DELETE FROM tags
        WHERE id = $1`, [this.id]);
    }

    static async getAll(){
        const results = await db.query(`
        SELECT id, tag_name
        FROM tags`);
        const tags = results.rows.map(tag => 
            new Tag({id:tag.id, 
                tag_name:tag.tag_name})
        );
        return tags;
    }

    static async getById(tagId){
        const result = await db.query(`
        SELECT id, tag_name
        FROM tags
        WHERE id = $1`,
        [tagId]);
        const tag = result.rows[0];
        if(!tag){
            throw new ExpressError("tag not found", 404);
        }
        return new Tag({id:tag.id, 
            tag_name:tag.tag_name}
            );
    }

    static async update(tagId, data) {
        let { query, values } = sqlForPartialUpdate(
          'tags',
          data,
          'id',
          tagId
        );
    
        const result = await db.query(query, values);
        const tag = result.rows[0];
        
    
        if (!tag) {
          throw new ExpressError('No such tag', 404);
        }
        return new Tag({id:tag.id, 
            tag_name:tag.tag_name}
            );
      }
    
}

module.exports = Tag;