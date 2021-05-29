const User = require('../models/user')
const validator = require('validator')

const mongoose = require('mongoose')


const validateRequest = async (req) => {
    let errors = [] 
    if(await emailExists(req.body['email'])) errors.push("Email is already registered")
    if(!validator.isEmail(req.body['email'])) errors.push("Invalid email format")
    return errors
}

const validateResetPassword = async (req) => {
    let errors = []
    if(!await emailExists(req.body['email'])) errors.push("This is not a registered email address")
    return errors
}

const validateAgentEmail = async (req) => {
    let errors = [] 
    if(!validator.isEmail(req.body['email'])) errors.push("Invalid email format")
    return errors   
}


const emailExists = async (email) => {
    const user = await User.find({email:email})
    if (user.length > 0) return true

}

const isValidMongoID = function({id}) {
    return validator.isMongoId(id)
}

const validateRole = function(role){
    if (role < 2 || role > 3){
        return false
    }
    return true
}

module.exports = {
    validateRequest,
    validateResetPassword,
    isValidMongoID,
    validateAgentEmail,
    validateRole
}