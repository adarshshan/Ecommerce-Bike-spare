const express = require('express')
const router = express.Router()
const Order = require('../../models/order')
const Admin = require('../../models/admin')
const controller = require('../../controller/dashboardController')
const helpers = require('../../utils/adminHelpers')

router.get('/', controller.dashboardHome);
router.get('/order-pagination', controller.orderPagination)

router.get('/show-graph/:timetype', async (req, res) => {
    try {
        const timetype = req.params.timetype;
        const timeWiseOrders = await helpers.timeWiseOrders()
        const newarr = helpers.newArray(timeWiseOrders);
        if (timetype === 'year') {
            const yearRatio = helpers.getYearRatio(newarr);
            return res.json({ success: true, ratio: { time: timetype, value: yearRatio } })
        }
        if (timetype === 'month') {
            const monthRatio = helpers.getMonthRatio(newarr);
            return res.json({ success: true, ratio: { time: timetype, value: monthRatio } })
        }
        if (timetype === 'week') {
            const weekRatio = helpers.getWeekRatio(newarr);
            return res.json({ success: true, ratio: { time: timetype, value: weekRatio } })
        }
        if (timetype === 'day') {
            const dayRatio = helpers.getDayRatio(newarr);
            return res.json({ success: true, ratio: { time: timetype, value: dayRatio } })
        }
        return res.json({success:false,message:'Somthing Trouble detected.'})
    } catch (error) {
        console.log(error)
    }
})

// To Do List
router.post('/to-do-list', controller.todoListPost)
router.get('/delete-todo-message/:id', controller.deleteTodoList)

module.exports = router;