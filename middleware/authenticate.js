const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../helpers/expressError");

// const token = req.body._token || req.query._token;
// if (token) {
//   let payload = jwt.verify(token, SECRET_KEY);
//   req.curr_username = payload.username;
//   req.curr_admin = payload.admin;

// }

function authUserToken(req, res, next) {
    try{
        console.log("authusertoken",req.body);
        // const payload = jwt.verify(req.body._userToken, SECRET_KEY);
        const payload = jwt.verify(req.body.token, SECRET_KEY);
        req.user = payload;
        console.log("user : ",req.user);
        return next();
    }catch(error){
        return next();
    }
}

function requireLogin(req, res, next){
    try{
        if(!req.user){
            console.log("not valid user?", req.body);
            const error = new ExpressError("Unauthorized", 401);
            return next(error);
        } else {
            return next();
        }
    } catch(error) {
        return next();
    }
}

function requireAdmin(req, res, next) {
    try{
        if(!req.user.is_admin){
            console.log("in middleWare:", req.user);

            const error = new ExpressError("Unauthorized", 401);
            return next(error);
        } else {
            return next();
        }
    } catch(error){
        return next();
    }
}



// function giveAdminAccess(req, res, next){
//     try{
//         if(!req.user.username && req.user.is_admin){

//         }
//     } catch(error){
//         return next()
//     }
// }

module.exports = {authUserToken, requireLogin, requireAdmin}; 