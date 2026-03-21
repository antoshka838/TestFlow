const { Group, User } = require("../models/index");

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
        ],
      });

      const formattedGroups = groups.map(group => {
        const plainGroup = group.toJSON();

        const groupUsers = plainGroup.Users || plainGroup.users || [];

        return {
          ...plainGroup,
          usersCount: groupUsers.length,
          tests: plainGroup.tests || [],
        }
      })

      return res.json(formattedGroups);
    } catch (error) {
      console.error("Ошибка при получении групп:", error);
      return res
        .status(500)
        .json({ message: "Ошибка при загрузке списка групп" });
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
