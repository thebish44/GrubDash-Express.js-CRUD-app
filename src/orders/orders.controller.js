const path = require("path");
const orders = require(path.resolve("src/data/orders-data"));
const nextId = require("../utils/nextId");

// ROUTE HANDLERS
function listOrders(req, res) {
    res.json({ data: orders});
}

function getOrder(req, res) {
    res.json({ data: res.locals.order });
}

function createOrder(req, res) {
    const { data: { deliverTo, mobileNumber, status, dishes } } = req.body;
    const newOrder = {
        id: nextId(),
        deliverTo,
        mobileNumber,
        status,
        dishes
    }
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
}

function updateOrder(req, res) {
    const order = res.locals.order;
    const { orderId } = req.params;
    const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    if (id && id !== orderId) {
        return next({
            status: 400,
            message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`
        });
    }

    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;

    res.json({ data: order });
}

function deleteOrder(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === orderId);
    const deletedOrder = orders.splice(index, 1);
    res.sendStatus(204);
}

// VALIDATION MIDDLEWARE
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
        res.locals.order = foundOrder;
        return next();
    }
    return next({status: 404, message: `Order ${orderId} does not exist.`});
}

function bodyHasProperty(propertyName) {
    return function missingProperty(req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            return next();
        }
        return next({status: 400, message: `Order must include a ${propertyName}`});
    }
}

function dishesArrayCheck(req, res, next) {
    const { data: { dishes }  = {} } = req.body;
    if (!Array.isArray(dishes) || dishes.length === 0) {
        return next({
            status: 400,
            message: `Order must include at least one dish`
        });
    }
    return next();
}

function dishesQtyCheck(req, res, next) {
    const { data: { dishes }  = {} } = req.body;
    for (let i = 0; i < dishes.length; i++) {
        const dish = dishes[i];
        if (!dish.quantity || !Number.isInteger(dish.quantity) || dish.quantity <= 0) {
            return next({
                status: 400, 
                message: `Dish ${i} must have a quantity that is an integer greater than 0`
            });
        }
    }
    return next();
}

function statusChecks(req, res, next) {
    const { data: {status} } = req.body;
    const existingOrder = req.locals.order;
    if (!status) {
        return next({status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered`});
    } 
    if (existingOrder.status === "delivered") {
        return next({status: 400, message: `A delivered order cannot be changed`});
    }
    return next();
}

function deleteOrderChecks(req, res, next) {
    const existingOrder = req.locals.order;

    if (existingOrder.status !== "pending"){
        return next({status: 400, message: `An order cannot be deleted unless it is pending`});
    }
    return next();
}

module.exports = {
    listOrders,
    getOrder: [
        orderExists,
        getOrder,
    ],
    createOrder: [
        bodyHasProperty("deliverTo"),
        bodyHasProperty("mobileNumber"),
        bodyHasProperty("dishes"),
        dishesArrayCheck,
        dishesQtyCheck,
        createOrder,
    ],
    updateOrder: [
        orderExists,
        bodyHasProperty("deliverTo"),
        bodyHasProperty("mobileNumber"),
        bodyHasProperty("dishes"),
        dishesArrayCheck,
        dishesQtyCheck,
        statusChecks,
        updateOrder,
    ],
    deleteOrder: [
        orderExists, 
        deleteOrderChecks,
        deleteOrder,
    ],
}
