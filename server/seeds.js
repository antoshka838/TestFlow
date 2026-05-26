require("dotenv").config();
const { Test } = require("./models/index");
const sequelize = require("./db");

async function seed() {
  try {
    await sequelize.authenticate();
    await Test.create({
      name: "Тест на пространственное вращение (MRT)",
      description: "Определите, какие две из четырех фигур являются повернутой версией оригинала.",
      testType: "INTERNAL",
      externalUrl: "/preview-mental",
      status: "ACTIVE",
      authorId: 26, 
    });
    console.log("Тест успешно добавлен!");
    process.exit(0);
  } catch (error) {
    console.log(error);
  }
}
seed();