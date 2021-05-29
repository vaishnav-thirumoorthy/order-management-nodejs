const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Menu = require('../models/menu')
const MenuItem = require('../models/menu_items')
const Cart = require('../models/cart')
const Order = require('../models/order')
const User = require('../models/user')

const cartUtil = require('../Utils/cart_items')

router.get('/orders/walkin/new', async (req, res) => {
    const walkin = await User.find({source: 0})
    
    const isCart = await Cart.find({user_id: walkin[0]._id})
    
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
        const cart = new Cart({user_id:walkin[0]._id})
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
    res.render('place_order_walkin', {
        layout: 'main',
        name: 'Orders',
        user: walkin[0].name,
        menu: menu,
        cart_id: cart_id,
        cart_items: items,
        total: total,
        agent: true
    })
})


router.get('/orders/walkin/menus/:id/add_items', async (req, res) => {
    const walkin = await User.find({source: 0})
    let newCart
    const isCart = await Cart.findOne({user_id:walkin[0]._id}).lean()
    if (isCart == null || isCart == undefined)
    {
        console.log('No new cart. Create one')
        newCart = new Cart({user_id:walkin[0]._id})
        await newCart.save()
        console.log('Cart created')   
    }

    const cart = await Cart.findOne({user_id: walkin[0]._id}).lean()
    const cart_id = cart._id
    const cart_items = cart.items
    const total = cart.total
    const menu = await Menu.findOne({_id:req.params.id})
    const menu_name = menu.name
    const menuitems = await MenuItem.find({menu_id:req.params.id}).lean()
    
    req.session.menu = menu
    
    res.render('add_to_cart_walkin', {
        layout: 'main',
        name: 'Orders',
        menu_name: menu_name,
        user: walkin[0].name,
        menu: menu,
        item: menuitems,
        cart_id: cart_id,
        cart_items: cart_items,
        total: total,
        agent: true
    })
})


router.put('/orders/walkin/add_to_cart/:id', async (req, res) => {
    const walkin = await User.find({source: 0})
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
            return res.redirect('/orders/walkin/new')    
        }
        return res.redirect('/orders/walkin/menus/'+req.session.menu._id+'/add_items')
    }
    else{
      
        let newcart = cartUtil.incrementItem(cart, req)
        await newcart.save()

        if (Object.keys(req.query).includes('from_orders'))
        {
            return res.redirect('/orders/walkin/new')    
        }
        return res.redirect('/orders/walkin/menus/'+req.session.menu._id+'/add_items')
    }
})

router.put('/orders/walkin/remove_from_cart/:id', async (req,res) => {
    const cart = await Cart.findOne({_id:req.params.id})
    const cart_id = cart._id

    let index = cart.items.map((item) => item.name).indexOf(req.body.name);
    let newcart = cartUtil.decrementItem(cart, req)
    await newcart.save()

    if (newcart.items[index].quantity == 0 )
    {
        await Cart.findByIdAndUpdate(req.params.id, {"$pull":{"items":{"item_id":req.body.item_id}}}, {new:true, runValidators: true})
        
        if (Object.keys(req.query).includes('from_orders'))
        {
            return res.redirect('/orders/walkin/new')    
        }
        return res.redirect('/orders/walkin/menus/'+req.session.menu._id+'/add_items')
    }
    
    if (Object.keys(req.query).includes('from_orders'))
    {
        return res.redirect('/orders/walkin/new')    
    }
    return res.redirect('/orders/walkin/menus/'+req.session.menu._id+'/add_items')

})


router.delete('/orders/walkin/cart/:id/clear', async (req,res) => {
    await Cart.findByIdAndUpdate(req.params.id, {$set : {items:[], total:0}})
    res.redirect('/orders/walkin/new')
})

router.post('/orders/walkin/:id/create', async (req, res) => {
    const walkin = await User.find({source:0})
    const cart = await Cart.findOne({_id:req.params.id})
    

    const order = new Order({
        order_number: Date.now().toString().substring(6,12),
        items: cart.items,
        total: cart.total,
        user_id: walkin[0]._id,
        created_at: new Date()
    })
    await order.save()
    const order_id = order.order_number
    await cart.remove();
    res.redirect('/a/orders/'+order_id)

})

module.exports = router