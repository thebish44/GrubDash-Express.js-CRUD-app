const path = require("path");
const dishes = require(path.resolve("src/data/dishes-data"));
const nextId = require("../utils/nextId");

// ROUTE HANDLERS
function listAllDishes(req, res) {
    res.json({ data: dishes });
}

function getDish(req, res) {
    res.json({ data: res.locals.dish });
}

function createDish(req, res) {
    const { data: { name, description, price, image_url } } = req.body;
    const newDish = {
        id: nextId(),
        name, 
        description,
        price,
        image_url
    }
    dishes.push(newDish);
    res.status(201).json({data: newDish});
}

function updateDish(req, res, next) {
    const dish = res.locals.dish;
    const { dishId } = req.params;
    const { data: { id, name, description, price, image_url } = {} } = req.body;
    if (id && id !== dishId) {
        return next({
            status: 400,
            message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
        });
    }

    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
}

// VALIDATION MIDDLEWARE
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
        res.locals.dish = foundDish;
       next();
    }
    next({status: 404, message: `Dish does not exist: ${dishId}.`});
}

function bodyHasProperty(propertyName) {
    return function missingProperty(req, res, next) {
        const { data = {} } = req.body;
        if (data[propertyName]) {
            next();
        }
        next({status: 400, message: `Dish must include a ${propertyName}`});
    }
}

function priceIsValidNumber(req, res, next) {
    const { data: { price }  = {} } = req.body;
    if (price <= 0 || !Number.isInteger(price)) {
        next({
            status: 400,
            message: `Dish must have a price that is an integer greater than 0`
        });
    }
    next();
}

module.exports = {
    listAllDishes,
    getDish: [
        dishExists,
        getDish
    ],
    createDish: [
        bodyHasProperty("name"),
        bodyHasProperty("description"),
        bodyHasProperty("price"),
        bodyHasProperty("image_url"),
        priceIsValidNumber,
        createDish
    ],
    updateDish: [
        dishExists,
        bodyHasProperty("name"),
        bodyHasProperty("description"),
        bodyHasProperty("price"),
        bodyHasProperty("image_url"),
        priceIsValidNumber,
        updateDish
    ],
}
