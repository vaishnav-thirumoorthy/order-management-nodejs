const express = require('express')
const router = express.Router()

const User = require('../models/user')
const Order = require('../models/order')

const validator = require('../Utils/validator')

router.get('/a/users', async (req, res) => {
    try {
        const users = await User.find({restaurant_agent:false}).lean()
        res.render('customers', {
        page_name: 'Customers',
        users: users
    })   
    } catch (error) {
        req.flash('error_msg', `Something went wrong while loading the page.Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/users')
    }    
})

router.get('/a/users/:id', async (req, res) => {
    try {
        if(!validator.isValidMongoID({id:req.params.id}))
        {
            req.flash('error_msg', `Unable to get user details. The user might be removed or does not exist`)
            return res.redirect('/a/users')    
        }
        const user = await User.find({_id:req.params.id}).lean()
        const orders = await Order.find({user_id: req.params.id}).lean()
        res.render('user_details', {
            page_name: 'Customers',
            user: user,
            orders: orders
        })
        
    } catch (error) {
        req.flash('error_msg', `Something went wrong while loading the page.Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/users')
    }   
})


router.get('/a/orders/:id', async (req, res) => {
    try {
        const order = await Order.find({order_number: req.params.id}).lean()
        const user = await User.find({_id: order[0].user_id}).lean()
        const date = order[0].created_at
        const status = order[0].status
        const rating = order[0].rating
        const total = order[0].total
        let unrated
        if(rating != null || rating != undefined){
            unrated = 5 - rating
        }
        const order_number = order[0].order_number
        const order_items = order[0].items
        res.render('customer_order_details', {
            order_items: order_items,
            order_number: order_number,
            page_name: 'Order Details',
            rating: rating,
            status: status,
            unrated: unrated,
            user: user,
            total: total,
            date: date
        })

    } catch (error) {
        req.flash('error_msg', `Something went wrong while loading the page.Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/users')   
    }
})

module.exports = router