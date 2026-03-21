const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Role = sequelize.define("Role", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.ENUM("ADMIN", "USER"), unique: true },
});

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: true, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  roleId: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 2 },
});

const Group = sequelize.define("Group", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

const UserGroup = sequelize.define("UserGroup", {
  userId: { type: DataTypes.INTEGER, primaryKey: true },
  groupId: { type: DataTypes.INTEGER, primaryKey: true },
});

const Test = sequelize.define("Test", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  testType: {
    type: DataTypes.ENUM("INTERNAL", "EXTERNAL"),
    allowNull: false,
  },
  externalUrl: { type: DataTypes.STRING, allowNull: true },
  status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE"), allowNull: false },
  authorId: { type: DataTypes.INTEGER, allowNull: false },
});

const TestAccess = sequelize.define("TestAccess", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  testId: { type: DataTypes.INTEGER, allowNull: false },
  userId: { type: DataTypes.INTEGER, allowNull: true },
  groupId: { type: DataTypes.INTEGER, allowNull: true },
  accessType: {
    type: DataTypes.ENUM("ALL_USERS", "GROUP", "USER"),
    allowNull: false,
  },
});

const TestResult = sequelize.define("TestResult", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  testId: { type: DataTypes.INTEGER, allowNull: false },
  startedAt: { type: DataTypes.DATE, allowNull: false },
  completedAt: { type: DataTypes.DATE, allowNull: true },
  score: { type: DataTypes.FLOAT, allowNull: true },
  answersJson: { type: DataTypes.JSONB, allowNull: true },

  rating: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: { min: 1, max: 10 },
  },
  comment: { type: DataTypes.TEXT, allowNull: true },

  cognitiveLoad: { type: DataTypes.JSONB, allowNull: true },
});

Role.hasMany(User, { foreignKey: "roleId" });
User.belongsTo(Role, { foreignKey: "roleId" });

User.belongsToMany(Group, { through: UserGroup, foreignKey: "userId" });
Group.belongsToMany(User, { through: UserGroup, foreignKey: "groupId" });

User.hasMany(Test, { foreignKey: "authorId" });
Test.belongsTo(User, { foreignKey: "authorId" });

Test.hasMany(TestAccess, { foreignKey: "testId", onDelete: "CASCADE" });
TestAccess.belongsTo(Test, { foreignKey: "testId" });

User.hasMany(TestAccess, { foreignKey: "userId", onDelete: "CASCADE" });
TestAccess.belongsTo(User, { foreignKey: "userId" });

Group.hasMany(TestAccess, { foreignKey: "groupId", onDelete: "CASCADE" });
TestAccess.belongsTo(Group, { foreignKey: "groupId" });

// Связи для гибридной таблицы TestResult
Test.hasMany(TestResult, { foreignKey: "testId", onDelete: "CASCADE" });
TestResult.belongsTo(Test, { foreignKey: "testId" });

User.hasMany(TestResult, { foreignKey: "userId", onDelete: "CASCADE" });
TestResult.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  Role,
  User,
  Group,
  UserGroup,
  Test,
  TestAccess,
  TestResult,
};
