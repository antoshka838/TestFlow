import React from "react";
import H2 from "../../components/UI/h2/H2";
import classes from "./testResultCard.module.css";

const internalQuestions = {
  testTasksSeemedDifficult: "Моих текущих знаний было недостаточно для легкого прохождения теста:",
  informationLoadWasHigh: "Объём информации был большим:",
  requiredHighConcentration: "Требовалась высокая концентрация внимания:",
  difficultyProcessingMultipleItems:
    "Трудно одновременно обрабатывать несколько элементов:",
  requiredSignificantMentalEffort:
    "Требовались значительные умственные усилия:",
};

const externalQuestions = {
  instructionWasConfusing: "Инструкция к тесту показалась непонятной:",
  interfaceWasNotIntuitive: "Интерфейс оказался сложным и непонятным:",
  screenHadDistractingElements: "Были отвлекающие элементы:",
  navigationWasConfusing: "Переключаться между заданиями было неудобно:",
  questionsWereAmbiguous: "Некоторые вопросы были неоднозначны:",
};

export default function TestResultCard({ result }) {
  if (!result) return <p>Данные теста недоступны</p>;

  const {
    testName,
    rating,
    correctAnswers,
    totalQuestions,
    accuracy,
    timeSpent,
    cognitiveLoad,
    comment,
  } = result;

  const internalKeys = Object.keys(internalQuestions);
  const avgInternal =
    internalKeys.reduce(
      (sum, key) => sum + Number(cognitiveLoad[key] || 0),
      0,
    ) / (internalKeys.length || 1);

  const externalKeys = Object.keys(externalQuestions);
  const avgExternal =
    externalKeys.reduce(
      (sum, key) => sum + Number(cognitiveLoad[key] || 0),
      0,
    ) / (externalKeys.length || 1);

  return (
    <div className={classes.card}>
      <H2>{testName}</H2>

      <div className={classes.info}>
        <p>
          <strong>Оценка теста респондентом:</strong>{" "}
          {rating ? `${rating}/10` : "—"}
        </p>
        <p>
          <strong>Правильных ответов:</strong> {correctAnswers} из{" "}
          {totalQuestions} ({accuracy}%)
        </p>
        <p>
          <strong>Время прохождения:</strong> {timeSpent}
        </p>
        <p>
          <strong>Статус:</strong> Пройден
        </p>
        <p>
          <strong>Средняя внутренняя нагрузка:</strong> {avgInternal.toFixed(2)}{" "}
          / 5
        </p>
        <p>
          <strong>Средняя внешняя нагрузка:</strong> {avgExternal.toFixed(2)} /
          5
        </p>
      </div>

      <div className={classes.section}>
        <h3>Внутренняя когнитивная нагрузка (от 1 до 5)</h3>
        <table className={classes.table}>
          <tbody>
            {internalKeys.map((key) => (
              <tr key={key}>
                <td>{internalQuestions[key]}</td>
                <td style={{ fontWeight: "bold" }}>
                  {cognitiveLoad[key] || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={classes.section}>
        <h3>Внешняя когнитивная нагрузка</h3>
        <table className={classes.table}>
          <tbody>
            {externalKeys.map((key) => (
              <tr key={key}>
                <td>{externalQuestions[key]}</td>
                <td style={{ fontWeight: "bold" }}>
                  {cognitiveLoad[key] || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {comment && (
        <div className={classes.section}>
          <h3>Комментарий</h3>
          <p>"{comment}"</p>
        </div>
      )}
    </div>
  );
}
