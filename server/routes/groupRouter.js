const Router = require("express");
const router = new Router();
const groupController = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, groupController.create);

router.get("/", authMiddleware, groupController.getAll);

router.delete("/:id", authMiddleware, groupController.delete);

module.exports = router;