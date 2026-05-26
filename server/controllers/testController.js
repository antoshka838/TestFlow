const { Test, TestResult, TestAccess } = require("../models/index");

class TestController {
  async create(req, res) {
    try {
      const { name, description, externalUrl } = req.body;

      if (!name || !externalUrl) {
        return res.status(400).json({
          message:
            "Не заполнены обязательные поля (Название теста, ссылка на тест)",
        });
      }

      const authorId = req.user.id;

      const test = await Test.create({
        name,
        description,
        externalUrl,
        testType: "EXTERNAL",
        status: "ACTIVE",
        authorId,
      });

      return res.json(test);
    } catch (error) {
      console.log("Ошибка создания теста: ", error);
      return res.status(500).json({ message: "Ошибка при создании теста" });
    }
  }

  async getAll(req, res) {
    try {
      const tests = await Test.findAll();
      return res.json(tests);
    } catch (error) {
      console.log("Ошибка получения тестов: ", error);
      return res
        .status(500)
        .json({ message: "Ошибка при получении списка тестов" });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const test = await Test.findByPk(id);
      if (!test) {
        return res.status(404).json({ message: "Тест не найден" });
      }

      const result = await TestResult.findOne({
        where: { testId: id, userId },
      });

      const testData = test.get({ plain: true });
      testData.isCompleted = !!result;

      return res.json(testData);
    } catch (error) {
      console.error("Ошибка получения одного теста: ", error);
      return res.status(500).json({ message: "Ошибка при загрузке теста" });
    }
  }

  async getUserResults(req, res) {
    try {
      const { userId } = req.params;

      const results = await TestResult.findAll({
        where: { userId },
      });

      return res.json(results);
    } catch (error) {
      console.error("Ошибка при получении результатов пользователя:", error);
      return res.status(500).json({ message: "Ошибка загрузки результатов" });
    }
  }

  async getResultsForTest(req, res) {
    try {
      const { id } = req.params;

      const results = await TestResult.findAll({
        where: { testId: id },
      });

      return res.json(results);
    } catch (error) {
      console.error("Ошибка при получении результатов теста:", error);
      return res.status(500).json({ message: "Ошибка загрузки результатов" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, description, externalUrl } = req.body;

      if (!name || !externalUrl) {
        return res.status(400).json({
          message:
            "Не заполнены обязательные поля (Название теста, ссылка на тест)",
        });
      }

      const test = await Test.findByPk(id);
      if (!test) {
        return res.status(404).json({ message: "Тест не найден" });
      }

      test.name = name;
      test.description = description;
      test.externalUrl = externalUrl;

      await test.save();

      return res.json(test);
    } catch (error) {
      console.log("Ошибка обновления теста: ", error);
      return res.status(500).json({ message: "Ошибка при обновлении теста" });
    }
  }

  async getMyResult(req, res) {
    try {
      const { id: testId } = req.params;
      const userId = req.user.id;

      const result = await TestResult.findOne({
        where: { testId, userId },
      });

      if (!result) {
        return res.status(404).json({ message: "Результат не найден" });
      }

      const test = await Test.findByPk(testId, { attributes: ["name"] });

      return res.json({ result, test });
    } catch (error) {
      console.error("Ошибка при получении своего результата:", error);
      return res
        .status(500)
        .json({ message: "Ошибка при загрузке результата" });
    }
  }

  async submitTestResult(req, res) {
    try {
      const { id: testId } = req.params;
      const userId = req.user.id;

      const { evaluationData, startTime, finishedTime } = req.body;

      const {
        correctAnswers,
        incorrectAnswers,
        testRating,
        comment,
        ...cognitiveLoad
      } = evaluationData;

      if (!startTime || !finishedTime) {
        return res
          .status(400)
          .json({ message: "Не передано время прохождения теста" });
      }

      const startedAt = new Date(parseInt(startTime));
      const completedAt = new Date(parseInt(finishedTime));

      const result = await TestResult.create({
        userId,
        testId,
        startedAt,
        completedAt,
        score: correctAnswers !== "" ? parseFloat(correctAnswers) : null,
        answersJson: {
          correctAnswers: correctAnswers || 0,
          incorrectAnswers: incorrectAnswers || 0,
        },
        rating: testRating,
        comment: comment || null,
        cognitiveLoad,
      });

      return res.json({ message: "Результаты успешно сохранены", result });
    } catch (error) {
      console.error("Ошибка при сохранении результатов теста: ", error);
      return res
        .status(500)
        .json({ message: "Внутренняя ошибка сервера при сохранении" });
    }
  }

  async resetTestResult(req, res) {
    try {
      const { testId, userId } = req.params;
      const deletedResult = await TestResult.destroy({
        where: { testId, userId },
      });

      if (!deletedResult) {
        return res.status(404).json({ message: "Результат не найден" });
      }

      return res.json({ message: "Результат сброшен" });
    } catch (error) {
      console.error("Ошибка при сбросе результата: ", error);
      return res.status(500).json({ message: "Ошибка при сбросе результата" });
    }
  }

async removeUserAccess(req, res) {
  try {
    const { testId, userId } = req.params;

    const deletedCount = await TestAccess.destroy({
      where: { 
        testId: testId, 
        userId: userId,
        accessType: 'USER'
      }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: "Доступ не найден" });
    }

    return res.json({ message: "Доступ для пользователя успешно закрыт" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Ошибка сервера при удалении доступа" });
  }
}

  async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedTest = await Test.destroy({ where: { id } });

      if (!deletedTest) {
        return res.status(404).json({ message: "Тест не найден!" });
      }

      return res.json({ message: "Тест успешно удален!" });
    } catch (error) {
      console.log("Ошибка удаления теста: ", error);
      return res.status(500).json({ message: "Ошибка при удалении теста!" });
    }
  }
}

module.exports = new TestController();
