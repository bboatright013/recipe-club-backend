/** Common config for my recipe web app. */


let DB_URI = `postgresql://`;

if (process.env.NODE_ENV === "test") {
  DB_URI = `${DB_URI}/recipeclub_test`;
} else {
  DB_URI = process.env.DATABASE_URL || `${DB_URI}/recipeclub`;
}

const SECRET_KEY = process.env.SECRET_KEY || "mySecretKey";
const BCRYPT_WORK_FACTOR = 12;


module.exports = { 
    DB_URI,
    SECRET_KEY,
    BCRYPT_WORK_FACTOR };