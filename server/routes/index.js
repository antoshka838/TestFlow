const Router = require("express");
const router = new Router();
const userRouter = require("./userRouter");
const testRouter = require("./testRouter");
const groupRouter = require("./groupRouter");
const dashboardRouter = require("./dashboardRouter");
const statisticsRouter = require("./statisticsRouter");

router.use("/user", userRouter);
router.use("/test", testRouter);
router.use("/group", groupRouter);
router.use("/dashboard", dashboardRouter);
router.use("/statistics", statisticsRouter);
module.exports = router;
