const express = require ('express')
const router = express.Router()
const Auth = require('../middleware/auth')
const Order = require('../models/order')

//dashboard route

router.get('/a/dashboard', async (req, res) => {
    try {
        const pendingOrders = await Order.find({status:1}).lean()
        let number
        if ( pendingOrders != null || pendingOrders != undefined) number = pendingOrders.length
        res.render('dashboard', {
           layout:'main', 
           page_name:'Dashboard',
           orders: pendingOrders,
           number: number
        })
    } catch (error) {
        req.flash('error_msg', `Something went wrong while loading the page.Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
        
    }
})

//default route to home or login page

router.get('/', Auth.isAuth, (req, res) => {
    if (req.user.restaurant_agent == false ) return res.redirect('/orders/new')
    else return res.redirect('/a/dashboard')
})

router.get('/*', Auth.isAuth, (req, res) => {
    if (req.user.restaurant_agent == false ) {
        req.flash('error_msg', 'The page you are looking for does not exist')
        return res.redirect('/orders/new')
    }
    else {
        req.flash('error_msg', 'The page you are looking for does not exist')
        return res.redirect('/a/dashboard')
    }
})

module.exports = router
