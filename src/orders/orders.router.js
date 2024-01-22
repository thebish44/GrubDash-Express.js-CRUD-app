const router = require("express").Router();
const controller = require("./orders.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");

router.route("/")
    .get(controller.listOrders)
    .post(controller.createOrder)
    .all(methodNotAllowed);

router.route("/:orderId")
    .get(controller.getOrder)
    .put(controller.updateOrder)
    .delete(controller.deleteOrder)
    .all(methodNotAllowed);

module.exports = router;
