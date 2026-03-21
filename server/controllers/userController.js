const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/index");

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
      console.log("НАСТОЯЩАЯ ОШИБКА:", error);
      return res.status(500).json({ message: "Ошибка при регистрации" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        return res.status(400).json({ message: "Неверный пароль" });
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
        attributes: { exclude: "password" },
      });
      return res.json(users);
    } catch (error) {
      console.error("Ошибка получения данных!", error);
      res
        .status(500)
        .json({ message: "Ошибка при получении данных пользователя" });
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

      const usersToInsert = [];
      const errors = [];

      for (const user of users) {
        if (!user.email || !user.fullName || !user.password) {
          errors.push(
            `Пропущены данные у пользователя ${user.fullName || "Неизвестный пользователь"}`,
          );
          continue;
        }

        const condidate = await User.findOne({ where: { email: user.email } });

        if (condidate) {
          errors.push(`Почта ${user.email} уже существует в базе`);
          continue;
        }

        const hashPassword = await bcrypt.hash(user.password.toString(), 5);

        usersToInsert.push({
          fullName: user.fullName,
          email: user.email,
          password: user.password,
          roleId: 2,
        });
      }

      if (usersToInsert.length === 0) {
        return res.status(400).json({
          message: "Ни один пользователь не был добавлен",
          details: errors,
        });
      }

      await User.bulkCreate(usersToInsert);

      return res.json({
        message: `Успешно добавлено: ${usersToInsert.length} пользователей.`,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      console.error("Ошибка при массовом создании", error);
      return res.status(500).json({ message: "Ошибка при обработке данных" });
    }
  }

  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const deletedUser = await User.destroy({
        where: { id },
      });

      if(!deletedUser){
        return res.status(404).json({message: "Пользователь не найден"});
      }

      return res.json({message: "Пользователь успешно удален!"});
    } catch (error) {
      console.error("Ошибка при удалении пользователя: ", error);
      return res.status(500).json({message: "Ошибка при удалении"})
    }
  }
}

module.exports = new UserController();
