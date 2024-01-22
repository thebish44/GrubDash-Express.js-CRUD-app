const router = require("express").Router();
const controller = require("./dishes.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/")
    .get(controller.listAllDishes)
    .post(controller.createDish)
    .all(methodNotAllowed);

router.route("/:dishId")
    .get(controller.getDish)
    .put(controller.updateDish)
    .all(methodNotAllowed);

module.exports = router;
