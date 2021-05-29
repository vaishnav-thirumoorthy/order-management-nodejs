const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Menu = require('../models/menu')
const MenuItem = require('../models/menu_items')
const Cart = require('../models/cart')
const Order = require('../models/order')
const User = require('../models/user')

const cartUtil = require('../Utils/cart_items')

router.get('/orders/new', async (req, res) => {
    try {
        console.log('getting order')
    const isCart = await Cart.find({user_id: req.user._id})
    
    let menu
    let cart_id
    let items
    let total

    if(isCart.length !== 0) {
        console.log('Cart exists')
        cart_id = isCart[0]._id
    }
    else{
    console.log('No new cart. Create one')
    const cart = new Cart({user_id:req.user._id})
    await cart.save()
    console.log('Cart created')
    }
    menu = await Menu.find({status:1}).lean()
    const cart_items = await Cart.findOne({_id:cart_id}).lean()
    
    if (cart_items != null || cart_items != undefined)
    {
    items = cart_items.items
    total = cart_items.total
    }
    req.session['cart_id'] = cart_id;
    res.render('place_order', {
        layout: 'main',
        name: 'Orders',
        user: req.user.name,
        menu: menu,
        cart_id: cart_id,
        cart_items: items,
        total: total
    })
} catch (error) {
    console.log(error)       
}
})


router.get('/orders/menus/:id/add_items', async (req, res) => {

    let newCart
    const isCart = await Cart.findOne({user_id:req.user._id}).lean()
    if (isCart == null || isCart == undefined)
    {
        console.log('No new cart. Create one')
        newCart = new Cart({user_id:req.user._id})
        await newCart.save()
        console.log('Cart created')   
    }

    const cart = await Cart.findOne({user_id: req.user._id}).lean()
    const cart_id = cart._id
    const cart_items = cart.items
    const total = cart.total
    const menu = await Menu.findOne({_id:req.params.id})
    const menu_name = menu.name
    const menuitems = await MenuItem.find({menu_id:req.params.id}).lean()
    
    req.session.menu = menu
    
    res.render('add_to_cart', {
        layout: 'main',
        name: 'Orders',
        menu_name: menu_name,
        user: req.user.name,
        menu: menu,
        item: menuitems,
        cart_id: cart_id,
        cart_items: cart_items,
        total: total
    })
})


router.put('/orders/add_to_cart/:id', async (req, res) => {
    
    const cart = await Cart.findOne({_id:req.params.id})
    const cart_id = cart._id
    const exist = cart.items.filter((value) => {
        return value.item_id == req.body.item_id
    })
    
    if(exist.length != 0)
    {   
        let newcart = cartUtil.addItem(cart, req)
        await newcart.save()

        if (Object.keys(req.query).includes('from_orders'))
        {
            return res.redirect('/orders/new')    
        }
        return res.redirect('/orders/menus/'+req.session.menu._id+'/add_items')
    }
    else{
        let newcart = cartUtil.incrementItem(cart, req)
        await newcart.save()
        if (Object.keys(req.query).includes('from_orders'))
        {
            return res.redirect('/orders/new')    
        }
        return res.redirect('/orders/menus/'+req.session.menu._id+'/add_items')
    }
})

router.put('/orders/remove_from_cart/:id', async (req,res) => {
    const cart = await Cart.findOne({_id:req.params.id})
    const cart_id = cart._id

    let index = cart.items.map(function(item) {return item.name; }).indexOf(req.body.name);

    let newcart = cartUtil.decrementItem(cart, req)
    
    await newcart.save()
    if (newcart.items[index].quantity == 0 )
    {
        await Cart.findByIdAndUpdate(req.params.id, {"$pull":{"items":{"item_id":req.body.item_id}}}, {new:true, runValidators: true})
        
        if (Object.keys(req.query).includes('from_orders'))
        {
            return res.redirect('/orders/new')    
        }
        return res.redirect('/orders/menus/'+req.session.menu._id+'/add_items')
    }

    if (Object.keys(req.query).includes('from_orders'))
    {
        return res.redirect('/orders/new')    
    }
    return res.redirect('/orders/menus/'+req.session.menu._id+'/add_items')

})


router.delete('/orders/cart/:id/clear', async (req,res) => {
    await Cart.findByIdAndUpdate(req.params.id, {$set : {items:[], total:0}})
    res.redirect('/orders/new')
})

router.post('/orders/:id/create', async (req, res) => {
    const cart = await Cart.findOne({_id:req.params.id})
    

    const order = new Order({
        order_number: Date.now().toString().substring(6,12),
        items: cart.items,
        total: cart.total,
        user_id: req.user._id,
        created_at: new Date()
    })
    await order.save()
    const order_id = order.order_number
    await cart.remove();
    res.redirect('/orders/my_orders/'+order_id)

})


router.get('/orders/my_orders', async (req, res) => {
    let orders
    let empty
    if(req.query['status'] == 'pending') {
        orders = await Order.find({user_id: req.user._id, status: 1}).lean()    
    }
    else{
        orders = await Order.find({user_id: req.user._id}).lean()
    }
    empty = orders.length < 1 ? true : false
    res.render('my_orders', {
        layout: 'main',
        user: req.user.name,
        order: orders,
        empty: empty
    })
})

router.get('/orders/my_orders/:id', async (req,res) => {
    const order = await Order.find({order_number: req.params.id, user_id: req.user._id}).lean()
    const order_items = order[0].items
    const total = order[0].total
    const delivered = order[0].status == 1 ? false : true
    const rating = order[0].rating
    const date = order[0].created_at
    let unrated
    if (rating != null || rating != undefined){
        unrated = 5 - rating
    }
    res.render('order_details', {
        layout: 'main',
        order_number: req.params.id,
        user: req.user.name,
        order_items: order_items,
        total: total,
        delivered: delivered,
        rating: rating,
        unrated: unrated,
        date: date
    })
})

router.post('/orders/:id/rating', async (req, res) => {
    const order = await Order.findOneAndUpdate({order_number:req.params.id}, {$set:{rating:req.body.rating}}, {new:true, runValidators:true})
    res.redirect('/orders/my_orders/'+req.params.id)
})

router.put('/a/orders/:id', async (req, res) => {
    const order = await Order.findOneAndUpdate({order_number:req.params.id}, {$set:{status:req.body['status']}}, {new:true, runValidators:true})
    await order.save()
    res.redirect('/a/orders')
})

module.exports = router