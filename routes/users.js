/** User related routes. */

const User = require('../models/user');
const express = require('express');
const router = new express.Router();
const ExpressError = require('../helpers/expressError');
const { authUserToken, requireLogin, requireAdmin } = require('../middleware/authenticate');

/** GET /
 *
 * Get list of users. For admin dashboard.
 * Can mute users from here, find users comments to delete
 *
 */

router.get('/', authUserToken, requireLogin, requireAdmin, async function(req, res, next) {
  try {
    console.log(req.body, req.user);
    let users = await User.getAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
}); 

/** GET /[username]
 *
 * Get details on a user. Only logged-in users should be able to use this.
 *
 * It should return:
 *     {user: {username, first_name, last_name, phone, email}}
 *
 * If user cannot be found, return a 404 err.
 *
 */

router.get('/:username', authUserToken, async function(req,res,next) {
  try {
    let user = await User.get(req.params.username);
    return res.json({user});
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[username]
 *
 * Update user. Only the user themselves or any admin user can use this.
 *
 * It should accept:
 *  {first_name, last_name, phone, email}
 *
 * It should return:
 *  {user: all-data-about-user}
 *
 * It user cannot be found, return a 404 err. If they try to change
 * other fields (including non-existent ones), an error should be raised.
 *
 */
router.patch('/:username', authUserToken, requireLogin,
async function(req,res,next) {
  try {
   if (!req.user.is_admin && req.body.update.is_admin) {
      throw new ExpressError('Only Admin can modify admin status', 401);
    }
    if(req.user.is_admin || req.user.username == req.params.username){
      let fields = { ...req.body.update };
      console.log(fields);
      delete fields._userToken;
      let user = await User.update(req.params.username, fields);
      return res.json(user);
    } else {
      throw new ExpressError('Only that user or admin can edit a user.', 401);
    }
  } catch (err) {
    return next(err);
  }
}); // end

/** DELETE /[username]
 *
 * Delete a user. Only a staff user should be able to use this.
 *
 * It should return:
 *   {message: "deleted"}
 *
 * If user cannot be found, return a 404 err.
 */

router.delete('/:username',  authUserToken, requireLogin,
async function(req,res,next) {
  try {
    const user = User.get(username);
    if(user.username === req.user.username){
      user.delete(user.username);
      return res.json({ message: `deleted ${user.username}` });
    }
  } catch (err) {
    return next(err);
  }
}); // end

module.exports = router;
