const Router = require("express");
const router = new Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, groupController.create);
router.post("/add-tests", authMiddleware, groupController.addTests);

router.get("/", authMiddleware, groupController.getAll);

router.put("/:id", authMiddleware, groupController.update);

router.delete("/:id", authMiddleware, groupController.delete);

module.exports = router;
