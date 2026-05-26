const Router = require("express");
const router = new Router();
const statisticsController = require("../controllers/statisticsController");
const authMiddleware = require("../middleware/authMiddleware")

router.get("/tests", authMiddleware, statisticsController.getTestsStats);
router.get("/tests/:id", authMiddleware, statisticsController.getTestDetailedStats);

module.exports = router;