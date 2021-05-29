const express = require('express')
const multer = require('multer')
const router = express.Router()

const MenuItem = require('../models/menu_items')
const Menu = require('../models/menu')
const upload = require('../Utils/fileUpload')


//** Create Menu Item

router.post('/api/menu_items', upload.file_s3, async (req, res) => {

    const req_body = Object.keys(req.body)
    const allowedValues = ['name', 'description', 'price', 'image', 'menu_id']

    const isAllowed = req_body.filter((value) => allowedValues.indexOf(value) == -1)
    if (isAllowed != "") return res.status(400).send({
        error: `Invalid field(s) ${isAllowed} in request`
    })

    if (req_body.includes('menu_id')) {
        const isArr = Object.prototype.toString.call(req.body['menu_id']) == '[object Array]';
        if (!isArr) return res.status(400).send({
            error: 'menu_id should be an array of strings'
        })

        req.body['menu_id'].forEach(async (element) => {
            let isMenu = []
            const menu = await Menu.findOne({
                _id: element
            })

            if (menu == null) isMenu.push(element)
            if (isMenu.length != 0) {
                return res.status(400).send({
                    error: `There are no mathcing records for menu_id(s) ${isMenu}`
                })
            }
        });
    }


    // ** for api create without images. application/json

    if (req.headers['content-type'] === 'application/json') {

        try {
            if (req_body.includes('image')) return res.status(400).send({
                error: 'Unable to create menu item. Use multipart/form-data request to create menu item with images'
            })
            const menuItem = await (new MenuItem(req.body)).save()
            res.status(201).send(menuItem)

        } catch (error) {
            console.log(error)
            res.status(500).send({
                error
            })
        }
    } else {

        try {
            if (req.file == undefined) {
                const menuitem = new MenuItem(req.body)
                const menuItem = await menuitem.save()
                return res.send(menuItem)
            }

            const path = req.file.location
            const menu = new MenuItem({
                ...req.body,
                image: path
            })

            const menuItem = await menu.save()
            res.send(menuItem)
        } catch (error) {
            res.status(500).send({
                error
            })
        }
    }

})

// ** Get Menu Item(s)

router.get('/api/menu_items', async (req, res) => {
    try {
        const menuItems = await MenuItem.find()
        if (menuItems.length == 0) return res.status(404).send({
            message: 'No menu items found'
        })

        res.status(200).send(menuItems)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})

router.get('/api/menu_items/:id', async (req, res) => {

    try {
        const menuItem = await MenuItem.findOne({
            _id: req.params.id
        })
        if (!menuItem) return res.status(404).send({
            message: 'The menu item does not exist'
        })
        res.status(200).send(menuItem)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }

})


// ** update menu item


router.put('/api/menu_items/:id', async (req, res) => {
    try {
        const req_body = Object.keys(req.body)
        const allowedValues = ['name', 'description', 'price', 'image', 'menu_id']

        const isAllowed = req_body.filter((value) => allowedValues.indexOf(value) == -1)
        if (isAllowed != "") return res.status(400).send({
            error: `Invalid field(s) ${isAllowed} in request`
        })

        if (req_body.includes('menu_id')) {
            const isArr = Object.prototype.toString.call(req.body['menu_id']) == '[object Array]';
            if (!isArr) return res.status(400).send({
                error: 'menu_id should be an array of strings'
            })
        }

        req.body['menu_id'].forEach(async (element) => {
            let isMenu = []
            const menu = await Menu.findOne({
                _id: element
            })

            if (menu == null) isMenu.push(element)
            if (isMenu.length != 0) {
                return res.status(400).send({
                    error: `There are no mathcing records for menu_id(s) ${isMenu}`
                })
            }
        });

        const menuItem = await MenuItem.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: req.body
        }, {
            new: true,
            runValidators: true
        })
        if (!menuItem) return res.status(404).send({
            message: 'The menu item you are trying to update does not exist'
        })
        res.status(200).send(menuItem)

    } catch (error) {
        res.status(500).send(error)
    }


})


// ** delete menu item

router.delete('/api/menu_items/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findOneAndDelete({
            _id: req.params.id
        })
        if (!menuItem) return res.status(404).send({
            message: 'The menu item that you are trying to delete does not exist'
        })
        res.status(204).send('No Content')
    } catch (error) {
        res.status(500).send(error)
    }

})

module.exports = router