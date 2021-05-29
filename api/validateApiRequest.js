const base64 = require('base-64')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const Authorization = async function (req, res, next) {

    const wrongCredentials = 'You are not authorized to view this resource. Please check the username or password'

    if (req.user) {
        if (req.user.restaurant_agent == true && req.user.role == 2) {
            return next()
        }
        return res.status(403).send({
            error: {
                message: 'Forbidden'
            }
        })
    }

    const auth = req.headers['authorization']
    if (auth == undefined) {
        return res.status(401).send({
            error: {
                message: 'Missing authorization'
            }
        })
    }

    const email = (base64.decode(auth.split(' ')[1])).split(':')[0]
    const user = await User.findOne({
        email
    })
    if (user == {} || user == undefined || user == null) {
        return res.status(401).send({
            error: {
                message: wrongCredentials
            }
        })
    }

    if (user.restaurant_agent == true && user.role == 2) {
        const password = (base64.decode(auth.split(' ')[1])).split(':')[1]

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).send({
                error: {
                    message: wrongCredentials
                }
            })
        }
        next()
    } else {
        return res.status(403).send({
            error: {
                message: 'Forbidden'
            }
        })
    }
}

module.exports = {
    Authorization
}