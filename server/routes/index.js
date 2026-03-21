const Router = require("express");
const router = new Router();
const userRouter = require("./userRouter");
const testRouter = require("./testRouter");
const groupRouter = require("./groupRouter");

router.use("/user", userRouter);
router.use("/test", testRouter);
router.use("/group", groupRouter);

module.exports = router;
