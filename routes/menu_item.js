const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('dotenv').config()

const Menu = require('../models/menu')
const MenuItem = require('../models/menu_items')

const upload = require('../Utils/fileUpload')
const validator = require('../Utils/validator')


router.get('/admin/menu_items', async (req, res) => {
    try {
        const menuitems = await MenuItem.find().lean()
        res.render('menu_items', {
            layout: 'main',
            page_name: 'Admin',
            items: menuitems
        })
    } catch (error) {
        req.flash('error_msg', `Something went wrong while loading the page.Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
    }
})


router.get('/admin/menu_items/new', async (req, res) => {
    res.render('menuItem_create', {
        page_name: 'Admin',
        layout: 'main'
    })
})


router.post('/admin/menu_items', upload.file_s3, async (req, res) => {
    try {
        let isExist = await MenuItem.findOne({
            name: req.body.name
        })
        if (isExist != null) {
            req.flash('error_msg', `An item already exists with the name ${req.body.name}. Please create an item with a different name`)
            return res.redirect('/admin/menu_items/new')
        }

        if (req.file == undefined) {
            const menuitem = new MenuItem(req.body)
            const menuItem = await menuitem.save()
            req.flash('success_msg', 'Menu Item created successfully')
            return res.redirect('/admin/menu_items')
        }
        console.log(req.file)
        const path = req.file.location // (req.file.path).substring(path.indexOf("/"))
        const menu = new MenuItem({
            ...req.body,
            image: path
            //image: path.substring(path.indexOf("/"))
        })

        const menuItem = await menu.save()
        req.flash('success_msg', 'Menu Item created successfully')
        res.redirect('/admin/menu_items')

    } catch (error) {
        req.flash('error_msg', `Something went wrong. Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
    }
})

router.post('/admin/:id/menu_items/quick_add', upload.file_s3, async (req, res) => {
    try {
        if (!validator.isValidMongoID({
                id: req.params.id
            })) {
            req.flash('error_msg', `The menu might be removed or does not exist`)
            return res.redirect('/admin/menus')
        }

        let isExist = await MenuItem.findOne({
            name: req.body.name
        })
        if (isExist != null) {
            req.flash('error_msg', `An item already exists with the name ${req.body.name}. Please create an item with a different name`)
            return res.redirect('/admin/menu_items/' + req.params.id + '/quick_add')
        }

        if (req.file == undefined) {
            const menuitem = new MenuItem(req.body)
            const menuItem = await menuitem.save()
            req.flash('success_msg', 'Menu Item created successfully')
            return res.redirect('/admin/menus/' + req.params.id + '/add')
        }

        const path = req.file.location
        const menu = new MenuItem({
            ...req.body,
            image: path
        })

        const menuItem = await menu.save()
        req.flash('success_msg', 'Menu Item created successfully')
        res.redirect('/admin/menus/' + req.params.id + '/add')

    } catch (error) {
        req.flash('error_msg', `Something went wrong. Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
    }
})



// ** render menu items page


router.get('/admin/menu_items/:id', async (req, res) => {
    try {
        if (!validator.isValidMongoID({
                id: req.params.id
            })) {
            req.flash('error_msg', `The menu item might be removed or does not exist`)
            return res.redirect('/admin/menus')
        }
        const menuitem = await MenuItem.findOne({
            _id: req.params.id
        })
        const name = menuitem.name
        const price = menuitem.price
        res.render('edit_menu_item', {
            page_name: 'Admin',
            layout: 'main',
            item_id: req.params.id,
            name: name,
            price: price
        })
    } catch (error) {
        req.flash('error_msg', `Something went wrong. Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
    }
})

router.post('/admin/menu_items/:id', upload.file_s3, async (req, res) => {
    try {
        if (!validator.isValidMongoID({
                id: req.params.id
            })) {
            req.flash('error_msg', `The menu item might be removed or does not exist`)
            return res.redirect('/admin/menus')
        }
        if (req.file == undefined) {
            const menuItem = await MenuItem.findOneAndUpdate({
                _id: req.params.id
            }, {
                $set: req.body
            }, {
                new: true,
                runValidators: true
            })
            req.flash('success_msg', 'Menu Item updated')
            return res.redirect('/admin/menu_items')
        }

        const path = req.file.location
        const menuItem = await MenuItem.findOneAndUpdate({
            _id: req.params.id
        }, {
            $set: {
                ...req.body,
                image: path
            }
        }, {
            new: true,
            runValidators: true
        })

        req.flash('success_msg', 'Menu Item updated')
        res.redirect('/admin/menu_items')
    } catch (error) {
        req.flash('error_msg', `Something went wrong. Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/a/dashboard')
    }
})

router.delete('/admin/menu_items/:id', async (req, res) => {
    try {
        if (!validator.isValidMongoID({
                id: req.params.id
            })) {
            req.flash('error_msg', `The menu item might be removed or does not exist`)
            return res.redirect('/admin/menus')
        }
        const item  = await MenuItem.findOne({_id: req.params.id})

        if (item.image != process.env.DEFAULT_IMAGE_S3)
        {
            let file = decodeURIComponent(((item.image).split('/'))[3]) 
            const response = await upload.deletefromS3(file)
            console.log(response)
        }
        await item.delete()

        req.flash('success_msg', 'Menu Item Deleted')
        res.redirect('/admin/menu_items')
    } catch (error) {
        req.flash('error_msg', `Something went wrong. Error: ${error}
                                Please try again or contact support.`)
        res.redirect('/admin/menu_items')
    }
})

module.exports = router