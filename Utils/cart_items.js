const Cart = require ('../models/cart')

const addItem = (cart, req) => {
    let index = cart.items.map((item) => item.name).indexOf(req.body.name);
    cart.items[index].quantity ++
    cart.items[index].price =   cart.items[index].quantity * req.body.value

    let prices = cart.items.map((item) => item.price)
    const total = prices.reduce((x,y) => x+y)
    cart.total = total
    return cart
}

const incrementItem = (cart, req) => {
    cart.items.push(req.body)
    let index = cart.items.map((item) => item.name).indexOf(req.body.name);
    cart.items[index].quantity ++
    cart.items[index].price =   cart.items[index].quantity * req.body.value

    let prices = cart.items.map((item) => item.price)
    const total = prices.reduce((x,y) => x+y)
    cart.total = total
    return cart
}

const decrementItem = (cart, req) => {
    let index = cart.items.map((item) => item.name).indexOf(req.body.name);
    cart.items[index].quantity --
    cart.items[index].price -= cart.items[index].value
    
    let prices = cart.items.map((item) => item.price)
    const total = prices.reduce((x,y) => x+y)
    cart.total = total
    return cart
}

module.exports = {
    addItem,
    incrementItem,
    decrementItem
}