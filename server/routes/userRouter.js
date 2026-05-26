const Router = require("express");
const router = new Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/create", authMiddleware, userController.createUser);
router.post("/bulk", authMiddleware, userController.bulkCreateUsers);
router.post("/add-tests", authMiddleware, userController.addTests);
router.post("/add-groups", authMiddleware, userController.addGroups);
router.post("/remove-group", authMiddleware, userController.removeGroup);

router.get("/auth", authMiddleware, userController.check);
router.get("/", authMiddleware, userController.getAllUsers);
router.get("/my-tests", authMiddleware, userController.getMyTests);

router.put("/profile", authMiddleware, userController.updateProfile);
router.put("/:id", authMiddleware, userController.updateUser);

router.delete("/bulk-delete", authMiddleware, userController.bulkDelete);
router.delete("/:id", authMiddleware, userController.deleteUser);

module.exports = router;
