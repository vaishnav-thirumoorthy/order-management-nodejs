const express = require('express')
const router = express.Router()
const User = require('../models/user')
const Auth = require('../middleware/auth')
const passport = require('passport')
const validator = require('../Utils/validator')
const Cart = require('../models/cart')
const mailer = require('../Utils/mailer')
const crypto = require('crypto')


//sign up requests

router.get('/users/register', Auth.isLoggedIn, (req, res) => {
    res.render('register', {
        name: 'Register',
        layout: 'login'
    })
})

router.post('/users/register', async (req, res) => {

    try {
        const errors = await validator.validateRequest(req)

        if (errors.length > 0) {
            req.flash('error', errors)
            return res.redirect('/users/register')
        }

        let token = (crypto.randomBytes(16)).toString('hex')
        req.body['token'] = token
        req.body['token_expires'] = Math.floor(Date.now() / 1000) + 86400

        const user = await User.create(new User(req.body));

        const msg = mailer.activationEmailBody({
            to: user.email,
            name: user.name,
            token
        })
        const response = await mailer.sendMail(msg)

        req.flash('success_msg', `Thank you for signing up. An activation email will be sent to your registered email address.`)
        res.redirect('/users/register')
    } catch (error) {
        console.log(error)
        req.flash('error_msg', `${error}`)
        res.redirect('/users/register')
    }

})

//activate requests

router.get('/user/activate/:id', async (req, res) => {
    try {
        const user = await User.find({
            token: req.params.id
        })
        if (user.length == 0) {
            req.flash('error_msg', 'Invalid URL')
            return res.redirect('/users/register')
        }

        if (user[0].isActive != 0) {
            return res.redirect('/')
        }

        if (Math.floor(Date.now() / 1000) > user[0].token_expires) {
            req.flash('error_msg', 'The activation link has expired. Please perform a password reset')
            return res.redirect('/users/register')
        }

        const email = user[0].email
        res.render('user_activation', {
            layout: 'login',
            name: 'Activate',
            email: email
        })
    } catch (error) {
        req.flash('error_msg', `${error}`)
        res.redirect('/users/register')
    }

})

//activate/reset-password and login


router.post('/users/activate_login', async (req, res) => {
    try {
        const user = await User.findOne({
            email: req.body.email
        })

        if (user == null || user == undefined) {
            req.flash('error_msg', 'User not found. Please register again or contact support')
            return res.redirect('/users/register')
        }

        let token = (crypto.randomBytes(16)).toString('hex')
        let pwd_token = (crypto.randomBytes(16)).toString('hex')
        user.isActive = 1
        user.token = token
        user.pwd_token = pwd_token
        user.token_expires = 0
        user.pwd_token_expires = 0
        user.password = req.body.password
        await user.save()

        req.login(user, function (err) {
            if (err) {
                return next(err);
            }

            if (req.user.restaurant_agent == false) {
                return res.redirect('/orders/new')
            } else {
                return res.redirect('/a/dashboard')
            }
        });
    } catch (error) {
        req.flash('error_msg', 'Something went wrong. Please perform a password reset or contact support')
        return res.redirect('/users/login')
    }
})

//login requests

router.get('/users/login', Auth.isLoggedIn, (req, res) => {
    if ((Object.keys(req.query)).includes('reset')) {
        return res.render('login', {
            layout: 'login',
            name: 'Login',
            forgot_password: true
        })
    }

    res.render('login', {
        layout: 'login',
        name: 'Login'
    })
})


router.post('/users/login',

    passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: true
    }), (req, res, next) => {
        if (req.user.restaurant_agent == false) {
            res.redirect('/orders/new')
        } else {
            res.redirect('/a/dashboard')
        }
    })

//reset password - send reset password link


router.post('/users/reset_password', async (req, res) => {
    try {
        const errors = await validator.validateResetPassword(req)

        if (errors.length > 0) {
            req.flash('error', errors)
            return res.redirect('/users/login?reset')
        }

        const user = await User.findOne({
            email: req.body.email
        })

        if (user.isActive == 0) {
            let token = (crypto.randomBytes(16)).toString('hex')
            user.token = token
            user.token_expires = Math.floor(Date.now() / 1000) + 86400

            await user.save()

            const msg = mailer.activationEmailBody({
                to: user.email,
                name: user.name,
                token
            })
            const response = await mailer.sendMail(msg)
            req.flash('success_msg', `An email will be sent to your registered email address with instructions to set a password and login`)
            return res.redirect('/users/login')
        }

        let pwd_token = (crypto.randomBytes(16)).toString('hex')
        user.pwd_token = pwd_token
        user.pwd_token_expires = Math.floor(Date.now() / 1000) + 86400
        user.password = ''

        await user.save()

        const msg = mailer.passwordResetEmailBody({
            to: user.email,
            name: user.name,
            token: pwd_token
        })
        const response = await mailer.sendMail(msg)
        req.flash('success_msg', `An email will be sent to your registered email address with instructions to reset your password and login`)
        return res.redirect('/users/login')

    } catch (error) {
        req.flash('error_msg', `${error}`)
        res.redirect('/users/login')
    }


})

//reset-password and login

router.get('/user/reset_password/:id', Auth.isLoggedIn, async (req, res) => {
    try {
        const user = await User.find({
            pwd_token: req.params.id
        })
        if (user.length == 0) {
            req.flash('error_msg', 'Invalid URL')
            return res.redirect('/users/login')
        }

        if (Math.floor(Date.now() / 1000) > user[0].pwd_token_expires) {
            req.flash('error_msg', 'The reset link has expired. Please perform a password reset again')
            return res.redirect('/users/register')
        }

        const email = user[0].email
        res.render('user_activation', {
            layout: 'login',
            name: 'Activate',
            email: email
        })

    } catch (error) {
        req.flash('error_msg', `${error}`)
        res.redirect('/users/login')
    }

})




//logut requests

router.get('/logout', async (req, res) => {

    const walkin = await User.find({
        source: 0
    })
    const walkin_cart = await Cart.find({
        user_id: walkin[0]._id
    })

    if (walkin_cart.length != 0) {
        await Cart.findOneAndDelete({
            user_id: walkin[0]._id
        })
    }

    const isCart = await Cart.find({
        user_id: req.user._id
    })
    if (isCart != null || isCart != undefined || isCart.length != 0) await Cart.findOneAndDelete({
        user_id: req.user._id
    })

    req.logout()
    req.flash('success_msg', 'Successfully logged out!')
    res.redirect('/users/login')
})



module.exports = router