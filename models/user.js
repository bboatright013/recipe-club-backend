const bcrypt = require('bcrypt');
const db = require('../db');
const ExpressError = require('../helpers/expressError');
const sqlForPartialUpdate = require('../helpers/partialUpdate');
const { BCRYPT_WORK_FACTOR } = require("../config");
// const Cookbook = require("../models/cookbook");

class User {
    constructor(userObj) {
        this.username = userObj.username,
        this.email = userObj.email,
        this.is_admin = userObj.is_admin,
        this.is_mute = userObj.is_mute
    }

/** Register user with data. Returns new user data. */

  static async register(username, password, email) {
    const duplicateCheck = await db.query(
      `SELECT username, email
        FROM users 
        WHERE username = $1`,
      [username]
    );
    if (duplicateCheck.rows[0]) {
      throw new ExpressError(
        `There already exists a user with username '${username}' or email ${email}`,
        400
      );
    }
    // ADDED manual validation to check for empty  not null fields
    // let fieldCheck = [username, password, first_name, last_name, email, phone];
    // fieldCheck.forEach(field => {
    //   if(field.length < 3 || field == ''){
    //     throw new ExpressError('Not enough data to create a user', 400);
    //   } 
    // })
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    if(username == "admin"){
        console.log(hashedPassword);
    }
    const result = await db.query(
      `INSERT INTO users 
          (username, password, email) 
        VALUES ($1, $2, $3) 
        RETURNING username, password, email`,
      [
        username,
        hashedPassword,
        email
      ]
    );
        const user = result.rows[0];
        return new User({username: user.username, email: user.email, is_admin: false, is_mute: false});
  }


  /** Is this username + password combo correct?
   *
   * Return all user data if true, throws error if invalid
   *
   * */
  static async authenticate(username, password) {
    try {
      const result = await db.query(
      `SELECT username,
                password,
                email,
                is_admin,
                is_mute
            FROM users 
            WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user && await bcrypt.compare(password, user.password)) {
      return new User({username:user.username, email:user.email, is_admin:user.is_admin, is_mute:user.is_mute})      ;
    } else {
      throw new ExpressError('Cannot authenticate', 401);
    }
  }catch(e){
    throw new ExpressError('Cannot authenticate', 401);
  }
  }

  /** Returns list of user info:
   *
   * [{username, email, is_admin, is_mute}, ...]
   *
   * */

  static async getAll() {
    const results = await db.query(
      `SELECT   username,
                email,
                is_admin,
                is_mute
            FROM users 
            ORDER BY username`
    );

    const users = results.rows.map(result => 
      new User({
        username: result.username, 
        email: result.email, 
        is_admin: result.is_admin, 
        is_mute: result.is_mute}));
    return users;
  }

  /** Returns user info: {username, first_name, last_name, email, phone}
   *
   * If user cannot be found, should raise a 404.
   *
   **/

  static async get(username) {
    const result = await db.query(
      `SELECT username,
            email,
            is_admin,
            is_mute
         FROM users
         WHERE username = $1`,
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      new ExpressError('No such user', 404);
    }
    return ({username: user.username, 
      email: user.email, 
      is_admin: user.is_admin, 
      is_mute: user.is_mute
      });
  }

  /** Selectively updates user from given data
   *
   * Returns all data about user.
   *
   * If user cannot be found, should raise a 404.
   *
   **/

  static async update(username, data) {
    let { query, values } = sqlForPartialUpdate(
      'users',
      data,
      'username',
      username
    );

    const result = await db.query(query, values);
    const user = result.rows[0];
    

    if (!user) {
      throw new ExpressError('No such user', 404);
    }
    return new User({username: user.username, email:user.email, is_admin:user.is_admin, is_mute:user.is_mute});
  }

  /** Delete user. Returns true.
   *
   * If user cannot be found, should raise a 404.
   *
   **/

  async delete(username) {
    const result = await db.query(
      'DELETE FROM users WHERE username = $1 RETURNING username',
      [username]
    );
    const user = result.rows[0];
    if (!user) {
      throw new ExpressError('No such user', 404);
    }
    return true;
  }
}

module.exports = User;
