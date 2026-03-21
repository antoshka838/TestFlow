const { Test } = require("../models/index");

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
