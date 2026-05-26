const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  User,
  TestAccess,
  Group,
  Test,
  TestResult,
} = require("../models/index");
const mailService = require("../service/mailService");

const generateJwt = (id, email, fullName, roleId) => {
  return jwt.sign(
    { id, email, fullName, roleId },
    process.env.SECRET_KEY || "random_secret_key_123",
    { expiresIn: "24h" },
  );
};

class UserController {
  async registration(req, res) {
    try {
      const { email, fullName, password, roleId } = req.body;

      if (!email || !password || !fullName) {
        return res
          .status(400)
          .json({ message: "Не заполнены обязательные поля" });
      }

      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с такой почтой уже существует" });
      }

      const hashPassword = await bcrypt.hash(password, 5);

      const user = await User.create({
        fullName,
        email,
        password: hashPassword,
        roleId: roleId || 2,
      });

      const token = generateJwt(
        user.id,
        user.email,
        user.fullName,
        user.roleId,
      );
      return res.json({ token });
    } catch (error) {
      console.log("Ошибка:", error);
      return res.status(500).json({ message: "Ошибка при регистрации" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return res.status(401).json({ message: "Неверный email или пароль" });
      }

      const token = generateJwt(
        user.id,
        user.email,
        user.fullName,
        user.roleId,
      );
      return res.json({ token });
    } catch (error) {
      return res.status(500).json({ message: "Ошибка авторизации" });
    }
  }

  async check(req, res) {
    const token = generateJwt(
      req.user.id,
      req.user.email,
      req.user.fullName,
      req.user.roleId,
    );

    return res.json({ token });
  }

  async updateProfile(req, res) {
    try {
      const { fullName, email, password } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "пользователь не найден" });
      }

      if (email && email !== user.email) {
        const candidate = await User.findOne({ where: { email } });
        if (candidate) {
          res
            .status(400)
            .json({ message: "Эта почта уже занята другим пользователем" });
        }
        user.email = email;
      }

      if (fullName) {
        user.fullName = fullName;
      }

      if (password && password.trim() !== "") {
        const hashPassword = await bcrypt.hash(password, 5);
        user.password = hashPassword;
      }

      await user.save();
      const token = generateJwt(
        user.id,
        user.email,
        user.fullName,
        user.roleId,
      );
      return res.json({ token, message: "Профиль успешно обновлен!" });
    } catch (error) {
      console.error("Ошибка обновления профиля!", error);
      return res.status(500).json({ message: "Ошибка при обновлении профиля" });
    }
  }

  async createUser(req, res) {
    try {
      const { email, fullName, password, roleId } = req.body;

      if (!email || !fullName || !password) {
        return res.status(400).json({ message: "Заполните все поля" });
      }

      const candidate = await User.findOne({ where: { email } });
      if (candidate) {
        return res
          .status(400)
          .json({ message: "Пользователь с такой почтой уже существует" });
      }

      const hashPassword = await bcrypt.hash(password, 5);
      const user = await User.create({
        fullName,
        email,
        password: hashPassword,
        roleId: roleId || 2,
      });

      mailService.sendPasswordMail(email, email, password, fullName);

      return res.json({
        message: "Пользователь создан",
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          roleId: user.roleId,
        },
      });
    } catch (error) {
      console.error("Ошибка при создании пользователя: ", error);
      return res
        .status(500)
        .json({ message: "Ошибка при создании пользователя" });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
        include: [
          {
            model: TestAccess,
            attributes: ["testId"],
            required: false,
            where: { accessType: "USER" },
          },
          {
            model: Group,
            attributes: ["id"],
            through: { attributes: [] },
          },
          {
            model: TestResult,
            attributes: ["testId"],
            required: false,
          },
        ],
      });

      const formattedUsers = users.map((user) => {
        const plainUser = user.toJSON();
        const testAccesses =
          plainUser.TestAccesses || plainUser.testAccesses || [];
        const userGroups = plainUser.Groups || plainUser.groups || [];
        const testResults =
          plainUser.TestResults || plainUser.testResults || [];
        const completedTestIds = Array.from(
          new Set(testResults.map((tr) => tr.testId)),
        );

        return {
          ...plainUser,
          openTests: testAccesses.map((ta) => ta.testId),
          groups: userGroups.map((g) => g.id),
          completedTests: completedTestIds,
        };
      });

      return res.json(formattedUsers);
    } catch (error) {
      console.error("Ошибка получения данных!", error);
      res
        .status(500)
        .json({ message: "Ошибка при получении данных пользователя" });
    }
  }

  async addTests(req, res) {
    try {
      const { userId, testIds } = req.body;

      if (!userId || !Array.isArray(testIds)) {
        return res.status(400).json({ message: "Некорректные данные" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (testIds.length > 0) {
        const accessData = testIds.map((testId) => ({
          testId,
          userId,
          accessType: "USER",
        }));
        await TestAccess.bulkCreate(accessData);
      }

      return res.json({ message: "Тесты успешно назначены пользователю" });
    } catch (error) {
      console.error("Ошибка при назначении тестов пользователю: ", error);
      return res.status(500).json({ message: "Ошибка при назначении тестов" });
    }
  }

  async addGroups(req, res) {
    try {
      const { userId, groupIds } = req.body;

      if (!userId || !Array.isArray(groupIds)) {
        return res.status(400).json({ message: "Некорректные данные" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      await user.addGroups(groupIds);

      return res.json({ message: "Пользователь успешно добавлен в группы" });
    } catch (error) {
      console.error("Ошибка при привязке групп пользователю: ", error);
      return res
        .status(500)
        .json({ message: "Ошибка при добавлении в группы" });
    }
  }

  async removeGroup(req, res) {
    try {
      const { userId, groupId } = req.body;

      if (!userId || !groupId) {
        return res.status(400).json({ message: "Некорректные данные" });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      await user.removeGroup(groupId);

      return res.json({ message: "Пользователь успешно удален из группы" });
    } catch (error) {
      console.error("Ошибка при удалении из группы: ", error);
      return res.status(500).json({ message: "Ошибка при удалении из группы" });
    }
  }

  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { fullName, email, password } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      if (email && email !== user.email) {
        const candidate = await User.findOne({ where: { email } });
        if (candidate) {
          return res
            .status(400)
            .json({ message: "Этот email уже занят другим пользователем" });
        }
        user.email = email;
      }

      if (fullName) {
        user.fullName = fullName;
      }

      if (password && password.trim() !== "") {
        const hashPassword = await bcrypt.hash(password, 5);
        user.password = hashPassword;
      }

      await user.save();

      return res.json({
        message: "Данные пользователя успешно обновлены!",
        user,
      });
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      return res
        .status(500)
        .json({ message: "Ошибка при обновлении пользователя" });
    }
  }

  async bulkCreateUsers(req, res) {
    try {
      const { users } = req.body;

      if (!users || !Array.isArray(users) || users.length === 0) {
        return res
          .status(400)
          .json({ message: "Список пользователей пуст или передан неверно" });
      }

      const incomingEmails = users.map(user => user.email).filter(Boolean);

      const existingUsers = await User.findAll({
        where: { email: incomingEmails },
        attributes: ['email']
      });

      if (existingUsers.length > 0) {
        const duplicateEmails = existingUsers.map(u => u.email);
        
        const errorDetails = duplicateEmails.length > 3
          ? duplicateEmails.slice(0, 3).join(', ') + ` ...и еще ${duplicateEmails.length - 3}`
          : duplicateEmails.join(', ');

        return res.status(400).json({ 
          message: `Загрузка отменена. Эти email уже зарегистрированы:\n${errorDetails}` 
        });
      }

      const usersToInsert = [];
      const emailsToSend = [];

      for (const user of users) {
        if (!user.email || !user.fullName || !user.password) continue;

        const hashPassword = await bcrypt.hash(user.password.toString(), 5);

        usersToInsert.push({
          fullName: user.fullName,
          email: user.email,
          password: hashPassword,
          roleId: 2,
        });

        emailsToSend.push({
          email: user.email,
          rawPassword: user.password.toString(),
          fullName: user.fullName,
        });
      }

      if (usersToInsert.length === 0) {
        return res.status(400).json({ message: "Нет валидных данных для добавления." });
      }
      await User.bulkCreate(usersToInsert);
      for (const mailData of emailsToSend) {
        mailService
          .sendPasswordMail(
            mailData.email,
            mailData.email,
            mailData.rawPassword,
            mailData.fullName,
          )
          .catch((err) =>
            console.error(`Ошибка фоновой отправки письма на ${mailData.email}:`, err),
          );
      }

      return res.json({
        message: `Успешно добавлено: ${usersToInsert.length} пользователей.`,
      });
    } catch (error) {
      console.error("Ошибка при массовом создании", error);
      return res.status(500).json({ message: "Ошибка при обработке данных сервера" });
    }
  }

  async getMyTests(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        include: [
          {
            model: TestAccess,
            attributes: ["testId"],
            required: false,
            where: { accessType: "USER" },
          },
          {
            model: Group,
            attributes: ["id"],
            through: { attributes: [] },
            include: [
              {
                model: TestAccess,
                attributes: ["testId"],
                required: false,
                where: { accessType: "GROUP" },
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const personalTestIds = user.TestAccesses
        ? user.TestAccesses.map((ta) => ta.testId)
        : [];

      let groupTestIds = [];
      if (user.Groups) {
        user.Groups.forEach((group) => {
          const gTests = group.TestAccesses
            ? group.TestAccesses.map((ta) => ta.testId)
            : [];
          groupTestIds = [...groupTestIds, ...gTests];
        });
      }
      const allTestIds = Array.from(
        new Set([...personalTestIds, ...groupTestIds]),
      );

      const tests = await Test.findAll({
        where: { id: allTestIds },
      });

      const userResults = await TestResult.findAll({
        where: {
          userId: userId,
          testId: allTestIds,
        },
        attributes: ["testId"],
      });

      const completedTestIds = new Set(userResults.map((r) => r.testId));

      const formattedTests = tests.map((t) => ({
        ...t.toJSON(),
        isCompleted: completedTestIds.has(t.id),
      }));

      return res.json(formattedTests);
    } catch (error) {
      console.error("Ошибка при получении тестов пользователя:", error);
      return res.status(500).json({ message: "Ошибка при загрузке тестов" });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const deletedUser = await User.destroy({
        where: { id },
      });

      if (!deletedUser) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      return res.json({ message: "Пользователь успешно удален!" });
    } catch (error) {
      console.error("Ошибка при удалении пользователя: ", error);
      return res.status(500).json({ message: "Ошибка при удалении" });
    }
  }

  async bulkDelete(req, res) {
    try {
      const { userIds } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res
          .status(400)
          .json({ message: "Не выбраны пользователи для удаления" });
      }

      await User.destroy({ where: { id: userIds } });

      return res.json({
        message: `Успешно удалено пользователей: ${userIds.length}`,
      });
    } catch (error) {
      console.error("Ошибка при массовом удалении пользователей", error);
      return res.status(500).json({ message: "Ошибка при удалении" });
    }
  }
}

module.exports = new UserController();
