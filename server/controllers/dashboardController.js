const { TestResult, Test, User, Group, TestAccess } = require("../models/index");

class DashboardController {
  async getSummary(req, res) {
    try {
      const users = await User.findAll({
        where: { roleId: 2 },
        include: [
          { model: Group, attributes: ["id"] },
          { model: TestResult, attributes: ["testId"] },
        ],
      });

      const allAccesses = await TestAccess.findAll();

      let passed = 0;
      let failed = 0;

      users.forEach((user) => {
        const assignedTestIds = new Set();

        allAccesses.forEach((access) => {
          if (access.userId === user.id) {
            assignedTestIds.add(access.testId);
          }
          if (
            access.groupId &&
            user.Groups.some((g) => g.id === access.groupId)
          ) {
            assignedTestIds.add(access.testId);
          }
        });

        if (assignedTestIds.size === 0) return;

        const completedTestIds = new Set(
          user.TestResults.map((result) => result.testId)
        );

        let hasCompletedAll = true;
        for (const testId of assignedTestIds) {
          if (!completedTestIds.has(testId)) {
            hasCompletedAll = false;
            break;
          }
        }

        if (hasCompletedAll) {
          passed += 1;
        } else {
          failed += 1;
        }
      });

      const recentResults = await TestResult.findAll({
        order: [["createdAt", "DESC"]],
        limit: 3,
        include: [
          { model: Test, attributes: ["id", "name"] },
          { model: User, attributes: ["fullName"] },
        ],
      });

      const recentTests = recentResults.map((r) => ({
        id: r.id,
        testId: r.Test.id,
        testName: r.Test.name,
        userName: r.User ? r.User.fullName : "Неизвестный",
        date: r.createdAt,
      }));

      const allTestResults = await TestResult.findAll({
        include: [{ model: Test, attributes: ["id", "name"] }],
      });

      const testStats = {};

      allTestResults.forEach((result) => {
        const tId = result.testId;
        if (!testStats[tId]) {
          testStats[tId] = {
            id: tId,
            name: result.Test.name,
            totalRating: 0,
            totalExtLoad: 0,
            totalIntLoad: 0,
            totalTimeMs: 0,
            count: 0,
          };
        }

        const cog = result.cognitiveLoad || {};

        const intLoadSum =
          Number(cog.lackedPriorKnowledge || 3) + 
          Number(cog.informationLoadWasHigh || 3) +
          Number(cog.requiredHighConcentration || 3) +
          Number(cog.difficultyProcessingMultipleItems || 3) +
          Number(cog.requiredSignificantMentalEffort || 3);
        const intLoadAvg = intLoadSum / 5;

        const extLoadSum =
          Number(cog.instructionWasConfusing || 3) +
          Number(cog.interfaceWasNotIntuitive || 3) +
          Number(cog.screenHadDistractingElements || 3) +
          Number(cog.navigationWasConfusing || 3) +
          Number(cog.questionsWereAmbiguous || 3);
        const extLoadAvg = extLoadSum / 5;

        let timeMs = 0;
        if (result.startedAt && result.completedAt) {
          timeMs = new Date(result.completedAt) - new Date(result.startedAt);
        }

        testStats[tId].totalRating += Number(result.rating || 5);
        testStats[tId].totalIntLoad += intLoadAvg;
        testStats[tId].totalExtLoad += extLoadAvg;
        testStats[tId].totalTimeMs += timeMs;
        testStats[tId].count += 1;
      });

      const statsArray = Object.values(testStats).map((t) => {
        const timeMins = t.count > 0 ? Math.round(t.totalTimeMs / t.count / 60000) : 0;
        const avgRating = t.totalRating / t.count;
        const avgExtLoad = t.totalExtLoad / t.count;
        
        const problemScore = (10 - avgRating) + (avgExtLoad * 2);

        return {
          id: t.id,
          name: t.name,
          avgRating: avgRating.toFixed(1),
          avgIntLoad: (t.totalIntLoad / t.count).toFixed(1),
          avgExtLoad: avgExtLoad.toFixed(1),
          avgTime: timeMins,
          problemScore: problemScore 
        };
      });

      statsArray.sort((a, b) => a.problemScore - b.problemScore);

      const bestTest = statsArray.length > 0 ? statsArray[0] : null;
      const problemTest = statsArray.length > 1 ? statsArray[statsArray.length - 1] : null;

      return res.json({
        respondents: { passed, failed },
        recentTests,
        bestTest,
        problemTest,
      });
    } catch (error) {
      console.error("Ошибка при сборке дашборда: ", error);
      return res.status(500).json({ message: "Ошибка при загрузке данных дашборда" });
    }
  }
}

module.exports = new DashboardController();