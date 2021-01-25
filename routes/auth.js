const express = require("express");
const router = new express.Router();
const ExpressError = require("../helpers/expressError");

const createToken = require("../helpers/createToken");
const User = require("../models/user");
const jsonschema = require("jsonschema");
const registerSchema = require("../schemas/registerSchema.json");
const loginSchema = require("../schemas/loginSchema.json");

router.post("/register", async function(req, res, next) {
    try {
        const result = jsonschema.validate(req.body, registerSchema);
        if(!result.valid){
          let listOfErrors = result.errors.map( error => error.stack);
          let error = new ExpressError(listOfErrors, 400);
          return next(error);
        }
        const { username, password, email } = req.body;
        if( !username || !password || !email){
            throw new ExpressError("Username, Password and Email required", 400);
        }
        const user = await User.register(username, password, email);
        const token = createToken(user.username, user.is_admin);
        return res.json({token, username: user.username, is_admin: user.is_admin, is_mute:user.is_mute, email:user.email});
    } catch(error){
        return next(error);
    }
});

router.post("/login", async function(req, res, next) {
    try{
        const result = jsonschema.validate(req.body, loginSchema);
        if(!result.valid){
          let listOfErrors = result.errors.map( error => error.stack);
          let error = new ExpressError(listOfErrors, 400);
          return next(error);
        }
        const { username, password } = req.body;
        if(!username || !password){
            throw new ExpressError("Username and password required", 400);
        }
        const user = await User.authenticate(username, password);
        const token = createToken(user.username, user.is_admin);
        return res.json({token, username: user.username, is_admin: user.is_admin, is_mute:user.is_mute, email: user.email});
    } catch(error){
        return next(error);
    }
});



module.exports = router; 