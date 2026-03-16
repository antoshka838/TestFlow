import React from "react";
import H2 from "../../components/UI/h2/H2";
import classes from "./TestResultCard.module.css";

const internalQuestions = {
  taskDifficulty: "Задания теста показались мне сложными.",
  memoryLoad:
    "Объём информации, который необходимо было удерживать в памяти, был большим.",
  concentration:
    "Для выполнения теста требовалась высокая концентрация внимания.",
  multitasking:
    "Мне было трудно одновременно обрабатывать несколько элементов информации.",
  mentalEffort: "Содержание теста требовало значительных умственных усилий.",
};

const externalQuestions = {
  instructionClarity: "Инструкция к тесту была понятной с первого прочтения.",
  interfaceConvenience: "Интерфейс теста был удобным и интуитивно понятным.",
  noDistractions: "На экране не было лишних или отвлекающих элементов.",
  navigationEase: "Навигация между заданиями была простой и понятной.",
  questionClarity:
    "Формулировки вопросов были ясными и не вызывали двусмысленности.",
};

export default function TestResultCard({ result }) {
  if (!result) return <p>Данные теста недоступны</p>;

  const {
    testName,
    score,
    timeSpent,
    internalLoad,
    externalLoad,
    comment,
    correctAnswers,
    totalQuestions,
    accuracy,
  } = result;

  const avgInternal =
    Object.values(internalLoad).reduce((a, b) => a + b, 0) /
    Object.values(internalLoad).length;

  const avgExternal =
    Object.values(externalLoad).reduce((a, b) => a + b, 0) /
    Object.values(externalLoad).length;

  return (
    <div className={classes.card}>
      <H2>{testName}</H2>

      <div className={classes.info}>
        <p>
          <strong>Оценка:</strong> {score}/10
        </p>
        <p>
          <strong>Правильных ответов:</strong> {correctAnswers} из{" "}
          {totalQuestions} ({accuracy}%)
        </p>
        <p>
          <strong>Время:</strong> {timeSpent}
        </p>
        <p>
          <strong>Статус:</strong> Пройден
        </p>
        <p>
          <strong>Средняя внутренняя нагрузка:</strong> {avgInternal.toFixed(2)}
        </p>
        <p>
          <strong>Средняя внешняя нагрузка:</strong> {avgExternal.toFixed(2)}
        </p>
      </div>

      <div className={classes.section}>
        <h3>Внутренняя когнитивная нагрузка</h3>
        <table className={classes.table}>
          <tbody>
            {Object.entries(internalLoad).map(([key, value]) => (
              <tr key={key}>
                <td>{internalQuestions[key]}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={classes.section}>
        <h3>Внешняя нагрузка</h3>
        <table className={classes.table}>
          <tbody>
            {Object.entries(externalLoad).map(([key, value]) => (
              <tr key={key}>
                <td>{externalQuestions[key]}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comment && (
        <div className={classes.section}>
          <h3>Комментарий</h3>
          <p>{comment}</p>
        </div>
      )}
    </div>
  );
}
