const {
  TestResult,
  Test,
  User,
  Group,
  TestAccess,
} = require("../models/index");

class StatisticsController {
  async getTestsStats(req, res) {
    try {
      const tests = await Test.findAll();
      const results = await TestResult.findAll();
      const users = await User.findAll({
        where: { roleId: 2 },
        include: [Group],
      });
      const accesses = await TestAccess.findAll();

      const stats = tests.map((test) => {
        const assignedUsers = new Set();
        const testAccesses = accesses.filter((a) => a.testId === test.id);

        testAccesses.forEach((access) => {
          if (access.accessType === "ALL_USERS") {
            users.forEach((u) => assignedUsers.add(u.id));
          } else if (access.accessType === "USER") {
            assignedUsers.add(access.userId);
          } else if (access.accessType === "GROUP") {
            users.forEach((u) => {
              if (u.Groups.some((g) => g.id === access.groupId)) {
                assignedUsers.add(u.id);
              }
            });
          }
        });

        const testResults = results.filter((r) => r.testId === test.id);
        const passedCount = new Set(testResults.map((r) => r.userId)).size;

        let sumRating = 0;
        let sumInt = 0,
          sumExt = 0;
        let sumTime = 0;

        testResults.forEach((r) => {
          sumRating += Number(r.rating || 5);

          const cog = r.cognitiveLoad || {};
          const intL =
            (Number(cog.testTasksSeemedDifficult || 3) +
              Number(cog.informationLoadWasHigh || 3) +
              Number(cog.requiredHighConcentration || 3) +
              Number(cog.difficultyProcessingMultipleItems || 3) +
              Number(cog.requiredSignificantMentalEffort || 3)) /
            5;

          const extL =
            (Number(cog.instructionWasConfusing || 3) +
              Number(cog.interfaceWasNotIntuitive || 3) +
              Number(cog.screenHadDistractingElements || 3) +
              Number(cog.navigationWasConfusing || 3) +
              Number(cog.questionsWereAmbiguous || 3)) /
            5;

          sumInt += intL;
          sumExt += extL;

          if (r.startedAt && r.completedAt) {
            sumTime += Math.round(
              (new Date(r.completedAt) - new Date(r.startedAt)) / 1000,
            );
          }
        });

        const count = testResults.length;

        return {
          id: test.id,
          name: test.name,
          totalAssigned: assignedUsers.size,
          passedCount: passedCount,
          avgScore: count ? (sumRating / count).toFixed(1) : "—",
          avgTime: count ? Math.round(sumTime / count) : "—",
          avgInternal: count ? (sumInt / count).toFixed(1) : "—",
          avgExternal: count ? (sumExt / count).toFixed(1) : "—",
        };
      });

      return res.json(stats);
    } catch (error) {
      console.error("Ошибка при получении статистики:", error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }

  async getTestDetailedStats(req, res) {
    try {
      const { id } = req.params; 

      const test = await Test.findByPk(id);
      if (!test) return res.status(404).json({ message: "Тест не найден" });

      const accesses = await TestAccess.findAll({ where: { testId: id } });

      const allUsers = await User.findAll({
        where: { roleId: 2 },
        include: [{ model: Group, attributes: ["id", "name"] }]
      });

      const assignedUserIds = new Set();
      accesses.forEach((access) => {
        if (access.accessType === "ALL_USERS") {
          allUsers.forEach((u) => assignedUserIds.add(u.id));
        } else if (access.accessType === "USER") {
          assignedUserIds.add(access.userId);
        } else if (access.accessType === "GROUP") {
          allUsers.forEach((u) => {
            if (u.Groups.some((g) => g.id === access.groupId)) {
              assignedUserIds.add(u.id);
            }
          });
        }
      });

      const assignedUsers = allUsers.filter((u) => assignedUserIds.has(u.id));
      const results = await TestResult.findAll({ where: { testId: id } });

      const detailedStats = assignedUsers.map((user) => {
        const result = results.find((r) => r.userId === user.id);
        const groupName = user.Groups && user.Groups.length > 0 ? user.Groups[0].name : "—";

        if (result) {
          const cog = result.cognitiveLoad || {};
          const intL = (Number(cog.testTasksSeemedDifficult || 3) + Number(cog.informationLoadWasHigh || 3) + Number(cog.requiredHighConcentration || 3) + Number(cog.difficultyProcessingMultipleItems || 3) + Number(cog.requiredSignificantMentalEffort || 3)) / 5;
          const extL = (Number(cog.instructionWasConfusing || 3) + Number(cog.interfaceWasNotIntuitive || 3) + Number(cog.screenHadDistractingElements || 3) + Number(cog.navigationWasConfusing || 3) + Number(cog.questionsWereAmbiguous || 3)) / 5;

          let timeMs = 0;
          if (result.startedAt && result.completedAt) {
            timeMs = new Date(result.completedAt) - new Date(result.startedAt);
          }

          return {
            id: result.id,
            userName: user.fullName,
            groupName: groupName,
            status: "Пройден",
            date: result.createdAt,
            score: result.rating || result.score || 0,
            timeMs: timeMs,
            intLoad: intL.toFixed(1),
            extLoad: extL.toFixed(1)
          };
        } 
        
        return {
          id: `unpassed_${user.id}`,
          userName: user.fullName,
          groupName: groupName,
          status: "Не пройден",
          date: null,
          score: "—",
          timeMs: 0,
          intLoad: "—",
          extLoad: "—"
        };
      });

      return res.json({
        testName: test.name,
        results: detailedStats
      });

    } catch (error) {
      console.error("Ошибка при получении деталей теста:", error);
      return res.status(500).json({ message: "Ошибка сервера" });
    }
  }
}

module.exports = new StatisticsController();
