const express = require('express')
const router = express.Router()

const Menu = require('../models/menu')
const MenuItem = require('../models/menu_items')

// ** Get menu(s) API

router.get('/api/menus', async (req, res) => {
    try {
        const menu = await Menu.find()
        if (!menu) return res.status(404).send('There are currently no menus created')
        res.status(200).send(menu)
    } catch (error) {
        res.status(500).send({
            error
        })
    }

})

router.get('/api/menus/:id', async (req, res) => {
    try {
        const menu = await Menu.findOne({
            _id: req.params.id
        })
        if (!menu) return res.status(404).send({
            message: 'The menu does not exist'
        })
        res.status(200).send(menu)
    } catch (error) {
        console.log(error)
        res.status(500).send({
            error
        })
    }

})

// ** List all menu items in a menu
router.get('/api/menus/:id/menu_items', async (req, res) => {
    try {
        const menu = await Menu.findOne({
            _id: req.params.id
        })
        if (!menu) return res.status(404).send({
            message: 'This menu does not exist'
        })
        const menuItems = await menu.populate('menu_items').execPopulate()
        if (!menuItems) return res.status(404).send({
            message: 'There are no items added to this menu'
        })
        res.status(200).send(menuItems.menu_items)
    } catch (error) {
        res.status(500).send(error)
    }

})

// ** add an item to a menu

router.put('/api/menus/:id/add_item', async (req, res) => {
    try {
        const menuItem = await Menu.addItemToMenu(req.params.id, req.body.item_id)
        if (menuItem === null) return res.status(404).send({
            message: 'The menu item you are trying to delete does not exist'
        })
        res.status(200).send({
            message: 'Item successfully added to the menu'
        })
    } catch (error) {
        res.status(500).send(error)
    }

})

// ** remove an item from a menu

router.delete('/api/menus/:id/menu_items/:item_id', async (req, res) => {
    try {
        const menuitem = await MenuItem.findOneAndUpdate({
            _id: req.params['item_id']
        }, {
            $unset: {
                menu_id: req.body['id']
            }
        }, {
            new: true,
            runValidators: true
        })
        if (menuitem === null) return res.status(404).send({
            message: 'The menu item you are trying to delete does not exist'
        })
        res.status(204).send('No Content')

    } catch (error) {
        res.status(500).send(error)
    }
})

// ** Create Menu

router.post('/api/menus', async (req, res) => {
    try {
        const req_body = Object.keys(req.body)
        const allowedValues = ['name', 'status']
        const isAllowed = req_body.every((value) => allowedValues.includes(value))

        if (!isAllowed) return res.status(400).send({
            error: 'Invalid field in request'
        })

        const menu = await (new Menu(req.body)).save()
        res.status(201).send(menu)

    } catch (error) {
        res.status(500).send({
            message: error.message
        })
    }
})

// ** Update Menu

router.put('/api/menus/:id', async (req, res) => {
    try {
        const req_body = Object.keys(req.body)
        const allowedUpdates = ['name', 'status']
        const isAllowed = req_body.every((value) => allowedUpdates.includes(value))

        if (!isAllowed) return res.status(400).send({
            error: 'Invalid field in request'
        })

        const menu = await Menu.findByIdAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            new: true,
            runValidators: true
        })
        if (!menu) return res.status(404).send({
            message: 'The menu you are trying to update does not exist'
        })
        res.status(201).send(menu)

    } catch (error) {
        res.status(500).send({
            error
        })
    }
})

//** Delete Menu

router.delete('/api/menus/:id', async (req, res) => {
    try {
        const menu = await Menu.findOne({
            _id: req.params.id
        })
        if (!menu) return res.status(404).send({
            error: 'The menu that you are trying to delete does not exist'
        })
        await menu.remove()
        res.status(204).send({
            message: 'Menu deleted successfully'
        })
    } catch (error) {
        res.status(500).send({
            error
        })
    }

})


module.exports = router