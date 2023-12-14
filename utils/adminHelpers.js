const Admin = require('../models/admin')
const Order = require('../models/order')

async function getTodoList() {
    try {
        const todoList = await Admin.find();
        const todoMessage = todoList[0].todoList
        return todoMessage;
    } catch (error) {
        console.log(error)
    }
}
async function getAllOrders() {
    try {
        const orderList = await Order.find()
        const orders = orderList.reduce((accumulator, currentOrder) => {
            return accumulator.concat(currentOrder.orders);
        }, []);
        const allOrders = orders.filter(item => item.products[0].status === 'DELIVERED');
        allOrders.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        return allOrders;
    } catch (error) {
        console.log(error)
    }
}

function newArray(timeWiseOrders) {
    try {
        let total;
        let newarr = [];
        for (let i = 0; i < timeWiseOrders.length; i++) {
            total = 0;
            for (let j = 0; j < timeWiseOrders[i].orders.length; j++) {
                let tamount = 0;
                tamount = timeWiseOrders[i].orders[j].totalAmount + timeWiseOrders[i].orders[j].walletAmount;
                total += tamount;
            }
            let data = {
                time: timeWiseOrders[i]._id,
                totalSale: total,
                count: timeWiseOrders[i].count
            }
            newarr.push(data);
        }
        return newarr;
    } catch (error) {
        console.log(error)
    }
}

async function timeWiseOrders() {
    try {
        const timeWiseOrders = await Order.aggregate([
            {
                $unwind: "$orders" // Unwind the orders array
            },
            {
                $project: {
                    year: { $year: "$orders.date" }, // Extract year from the date
                    month: { $month: "$orders.date" }, // Extract month from the date
                    week: { $isoWeek: "$orders.date" }, // Extract week from the date
                    day: { $dayOfYear: "$orders.date" }, // Extract day of the year from the date
                    order: "$orders" // Keep the order details
                }
            },
            {
                $group: {
                    _id: {
                        year: "$year", // Group by year
                        month: "$month", // Group by month
                        week: "$week", // Group by week
                        day: "$day" // Group by day
                    },
                    orders: { $push: "$order" }, // Store orders in an array for each day, week, month, year
                    count: { $sum: 1 } // Count the number of orders in each day, week, month, year
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } // Sort by year, month, week, day
            }
        ])
        return timeWiseOrders;
    } catch (error) {
        console.log(error)
    }
}

function getYearRatio(newarr) {
    try {
        let year = [];
        let totalSale = 0;
        for (let i = 0; i < newarr.length; i++) {
            totalSale += newarr[i].totalSale;
            year.push({ x: newarr[i].time.year, value: totalSale })
        }
        return year;
    } catch (error) {
        console.log(error)
    }
}
function getMonthRatio(newarr) {
    try {
        let month = [];
        let totalSale = 0;
        for (let i = 0; i < newarr.length; i++) {
            totalSale += newarr[i].totalSale;
            month.push({ x: newarr[i].time.month, value: totalSale })
        }
        return month;
    } catch (error) {
        console.log(error)
    }
}
function getWeekRatio(newarr) {
    try {
        let week = [];
        let totalSale = 0;
        for (let i = 0; i < newarr.length; i++) {
            totalSale += newarr[i].totalSale;
            week.push({ x: newarr[i].time.week, value: totalSale })
        }
        return week;
    } catch (error) {
        console.log(error)
    }
}
function getDayRatio(newarr) {
    try {
        let day = [];
        let totalSale = 0;
        for (let i = 0; i < newarr.length; i++) {
            totalSale += newarr[i].totalSale;
            let startDate = new Date('2023-01-01'); // Set the starting date
            let convertedDate = new Date(startDate.getTime() + newarr[i].time.day * 24 * 60 * 60 * 1000);
            let Day = convertedDate.getDate().toString().padStart(2, '0');
            let month = (convertedDate.getMonth() + 1).toString().padStart(2, '0');
            let year = convertedDate.getFullYear();
            let formattedDate = `${Day}/${month}/${year}`;
            day.push({ x: formattedDate, value: totalSale })
        }
        return day;
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getTodoList,
    getAllOrders,
    newArray,
    timeWiseOrders,
    getYearRatio,
    getMonthRatio,
    getWeekRatio,
    getDayRatio
}