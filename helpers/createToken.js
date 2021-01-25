const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");


/** return signed JWT for payload {username, admin}. */

function createToken(username, is_admin) {
  let payload = {username, is_admin};
  let token = jwt.sign(payload, SECRET_KEY);
  return token;
}


module.exports = createToken;