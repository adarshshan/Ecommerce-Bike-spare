const express = require('express')
const router = express.Router()
const controller = require('../../controller/dashboardController')
const adminAuth=require('../../middlware/adminAuth')

router.use(adminAuth) 

router.get('/', controller.dashboardHome);
router.get('/order-pagination', controller.orderPagination)
router.get('/show-graph/:timetype', controller.showGraph)

// To Do List
router.post('/to-do-list', controller.todoListPost)
router.delete('/delete-todo-message/:id', controller.deleteTodoList)

module.exports = router;