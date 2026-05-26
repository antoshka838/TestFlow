const Router = require("express");
const router = new Router();
const testController = require("../controllers/testController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, testController.create);
router.post("/:id/submit", authMiddleware, testController.submitTestResult);

router.get("/", authMiddleware, testController.getAll);
router.get("/:id", authMiddleware, testController.getOne);
router.get("/results/:userId", authMiddleware, testController.getUserResults);
router.get("/:id/results", authMiddleware, testController.getResultsForTest);
router.get("/:id/my-result", authMiddleware, testController.getMyResult);

router.put("/:id", authMiddleware, testController.update);

router.delete("/:id", authMiddleware, testController.delete);
router.delete(
  "/:testId/results/:userId",
  authMiddleware,
  testController.resetTestResult,
);
router.delete('/:testId/access/user/:userId', testController.removeUserAccess);

module.exports = router;
