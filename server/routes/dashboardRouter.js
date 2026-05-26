const Router = require("express");
const router = new Router();
const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware")

router.get("/summary", authMiddleware, dashboardController.getSummary);

module.exports = router;