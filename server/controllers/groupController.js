const { Group, User, TestAccess } = require("../models/index");

class GroupController {
  async create(req, res) {
    try {
      const { name, userIds } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Название группы отсутствует" });
      }

      const existingGroup = await Group.findOne({ where: { name } });
      if (existingGroup) {
        return res
          .status(400)
          .json({ message: "Группа с таким названием уже существует" });
      }

      const group = await Group.create({ name });

      if (userIds && userIds.length > 0) {
        await group.addUsers(userIds);
      }

      return res.json(group);
    } catch (error) {
      console.error("Ошибка при создании группы:", error);
      return res.status(500).json({ message: "Ошибка при создании группы" });
    }
  }

  async getAll(req, res) {
    try {
      const groups = await Group.findAll({
        include: [
          {
            model: User,
            attributes: ["id"],
            through: { attributes: [] },
          },
          {
            model: TestAccess,
            attributes: ["testId"],
            required: false,
          },
        ],
      });

      const formattedGroups = groups.map((group) => {
        const plainGroup = group.toJSON();

        const groupUsers = plainGroup.Users || plainGroup.users || [];
        const testAccesses =
          plainGroup.TestAccesses || plainGroup.testAccesses || [];

        return {
          ...plainGroup,
          usersCount: groupUsers.length,
          tests: testAccesses.map((ta) => ta.testId),
        };
      });

      return res.json(formattedGroups);
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
      return res
        .status(500)
        .json({ message: "Ошибка при загрузке списка групп" });
    }
  }

  async addTests(req, res) {
    try {
      const { groupId, testIds } = req.body;

      if (!groupId || !Array.isArray(testIds)) {
        return res.status(400).json({ message: "Некорректные данные!" });
      }

      const group = await Group.findByPk(groupId);
      if (!group) {
        return res.status(404).json({ message: "Группа не найдена!" });
      }

      await TestAccess.destroy({ where: { groupId, accessType: "GROUP" } });

      if (testIds.length > 0) {
        const accessData = testIds.map((testId) => ({
          testId,
          groupId,
          accessType: "GROUP",
        }));
        await TestAccess.bulkCreate(accessData);
      }

      return res.json({ message: "Тесты успешно привязаны к группе" });
    } catch (error) {
      console.error("Опибка при привязке тестов: ", error);
      return res.status(500).json({ message: "Ошибка при привязке тестов" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      if (!name) {
        return res
          .status(400)
          .json({ message: "Название группы не может быть пустым" });
      }

      const group = await Group.findByPk(id);
      if (!group) {
        return res.status(404).json({ message: "Группа не найдена" });
      }

      group.name = name;
      await group.save();

      return res.json({ message: "Группа успешно обновлена", group });
    } catch (error) {
      console.error("Ошибка при обновлении группы:", error);
      return res.status(500).json({ message: "Ошибка при обновлении группы" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      const deletedGroup = await Group.destroy({ where: { id } });

      if (!deletedGroup) {
        return res.status(404).json({ message: "Группа не найдена" });
      }

      return res.json({ message: "Группа успешно удалена" });
    } catch (error) {
      console.error("Ошибка при удалении группы:", error);
      return res.status(500).json({ message: "Ошибка при удалении группы" });
    }
  }
}

module.exports = new GroupController();
