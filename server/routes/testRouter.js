const Router = require("express");
const router = new Router();
const testController = require("../controllers/testController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, testController.create);

router.get("/", authMiddleware, testController.getAll);

router.delete("/:id", authMiddleware, testController.delete);

module.exports = router;
