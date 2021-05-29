const express = require('express')
const router = express.Router()

const Order = require('../models/order')
const User = require('../models/user')

router.get('/a/orders', async (req, res) => {
    if(req.query['user_id'] != null || req.query['user_id'] != undefined)
    {
        const orders = await Order.find({user_id:req.query['user_id']}).lean()
        const user = await User.find({_id:req.query['user_id']}).lean()
        return res.render('orders_all', {
            page_name: 'All Orders',
            orders : orders,
            user: user
        })
    }

    else {
    const orders = await Order.find().lean()
    const users = await User.find({restaurant_agent:false}).lean()
    return res.render('orders_all', {
        page_name: 'All Orders',
        orders : orders,
        users: users
    })
}
})


router.post('/a/orders', async (req, res) => {
    if(req.body.user_id == 0) return res.redirect('/a/orders')
    else  return res.redirect('/a/orders?user_id='+req.body.user_id)
})

module.exports = router