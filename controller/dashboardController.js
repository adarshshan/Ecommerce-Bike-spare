const Admin = require('../models/admin')
const Order = require('../models/order')
const localStorage = require('localStorage')
const helpers = require('../utils/adminHelpers')

async function dashboardHome(req, res) {
    try {
        const allOrders = await helpers.getAllOrders();
        const todoMessage = await helpers.getTodoList();
        // console.log(allOrders);
        var totalSales = 0;
        for (let i = 0; i < allOrders.length; i++) {
            totalSales += allOrders[i].totalAmount + allOrders[i].walletAmount
        }
        const topProducts = await helpers.mostPurchasedProducts();
        // console.log(topProducts)
        const timeWiseOrders = await helpers.timeWiseOrders()

        const newarr = helpers.newArray(timeWiseOrders);
        const day = helpers.getDayRatio(newarr);
        res.render('admin/dashboard.ejs', {
            title: 'Dashboard',
            allOrders,
            todoMessage,
            totalSales,
            newarr,
            graph: { day },
            topProducts
        });
    } catch (error) {
        console.log(error)
        return res.redirect('/err-internal');
    }
}


async function orderPagination(req, res) {
    try {
        if (localStorage.getItem('page') && req.query.page === 'minus') {
            if (parseInt(localStorage.getItem('page')) === 1) return res.json({ success: false, message: 'page should not be less than 1' })
            localStorage.setItem('page', parseInt(localStorage.getItem('page')) - 1);
        } else if (localStorage.getItem('page') && req.query.page === 'plus') {
            localStorage.setItem('page', parseInt(localStorage.getItem('page')) + 1);
        } else {
            localStorage.setItem('page', 1);
        }
        const orderList = await Order.find()
        const allOrders = orderList.reduce((accumulator, currentOrder) => {
            return accumulator.concat(currentOrder.orders);
        }, []);
        allOrders.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        const orderPerPage = 8
        const page = parseInt(localStorage.getItem('page')) || 1;
        const start = (page - 1) * orderPerPage;
        const end = start + orderPerPage;
        const paginatedProducts = allOrders.slice(start, end)
        const totalPages = Math.ceil(allOrders.length / orderPerPage)
        return res.json({ success: true, paginatedProducts: paginatedProducts, page, totalPages });
    } catch (error) {
        console.log('its here')
        console.log(error)
    }
}

async function todoListPost(req, res) {
    try {
        const message = req.body.message;
        const adminId = req.session.adminId;
        const updated = await Admin.findByIdAndUpdate(adminId, { $push: { todoList: { $each: [{ message: message }], $position: 0 } } })
        if (updated) {
            const todoList = await Admin.find();
            const todoMessage = todoList[0].todoList
            return res.json({ success: true, message: 'message saved successfully', todoMessage })
        } else {
            return res.json({ success: false, message: `Message couldn't save` })
        }
    } catch (error) {
        console.log(error)
    }
}

async function deleteTodoList(req, res) {
    try {
        const messageId = req.params.id
        const deleted = await Admin.findByIdAndUpdate(req.session.adminId, { $pull: { todoList: { _id: messageId } } });
        if (deleted) {
            const todoList = await Admin.find();
            const todoMessage = todoList[0].todoList
            return res.json({ success: true, message: 'message Deleted successsfully', todoMessage })
        } else {
            return res.json({ success: false, message: `Message couldn't delete` });
        }
    } catch (error) {
        console.log(error)
    }
}
async function showGraph(req, res) {
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
        return res.json({ success: false, message: 'Somthing Trouble detected.' })
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    dashboardHome,
    orderPagination,
    todoListPost,
    deleteTodoList,
    showGraph
}