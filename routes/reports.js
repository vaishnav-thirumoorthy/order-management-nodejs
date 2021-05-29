const express = require('express')
const router = express.Router()

const Order = require('../models/order')

router.get('/admin/reports', async (req, res) => {
    res.render('reports', {
        page_name: 'Reports'
    })
})

router.post('/admin/reports/filter', async (req, res) => {
    const start_date = req.body['start_time']
    const end_date = req.body['end_time']
    res.redirect('/admin/reports/filter?start_date=' + start_date + '&end_date=' + end_date)
})

router.get('/admin/reports/filter', async (req, res) => {
    if (Object.keys(req.query).length == 0) {
        return res.redirect('/admin/reports')
    }
    if (req.query['start_date'] == '' || req.query['end_date'] == ''){
        req.flash('error_msg', 'Please enter a valid date')
        return res.redirect('/admin/reports')
    }
    
    const start_date = req.query['start_date']
    const end_date = req.query['end_date']
    const orders = await Order.find({
        created_at: {
            $gte: new Date(start_date),
            $lte: new Date(end_date)
        }
    }).lean()
    if (orders.length == 0) return res.render('reports', {
        page_name: 'Reports',
        start_date: start_date,
        end_date: end_date
    })
    const total = orders.filter((obj) => {
        return obj.total
    }).map(function (obj) {
        return obj.total;
    });
    const sum = total.reduce((x, y) => x + y)
    const number = orders.length
    res.render('reports', {
        page_name: 'Reports',
        orders: orders,
        sum: sum,
        number: number,
        start_date: start_date,
        end_date: end_date
    })
})

module.exports = router