const express = require('express')
const router = express.Router();

const Order = require('../models/order')
const User = require('../models/user')

router.get('/orders/:id/invoice', async (req, res) => {
    try {
        const order = await Order.find({order_number:req.params.id}).lean()
        const user = await User.find({_id:order[0].user_id}).lean()

        const order_items = order[0].items
        const total = order[0].total

        res.render('invoice', {
            order: order,
            user: user,
            order_items: order_items,
            total: total
        })
        
    } catch (error) {
        req.flash('error_msg', `Something went wrong while loading the page.Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
        
    }
})

module.exports = router