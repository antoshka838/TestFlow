import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import classes from "./mentalRotation.module.css";
import Button from "../../UI/button/Button";
import q1 from "../../../assets/mrt/q1.png";
import q2 from "../../../assets/mrt/q2.png";
import q3 from "../../../assets/mrt/q3.png";
import q4 from "../../../assets/mrt/q4.png";
import q5 from "../../../assets/mrt/q5.png";
import q6 from "../../../assets/mrt/q6.png";
import q7 from "../../../assets/mrt/q7.png";
import q8 from "../../../assets/mrt/q8.png";
import q9 from "../../../assets/mrt/q9.png";
import q10 from "../../../assets/mrt/q10.png";
import q11 from "../../../assets/mrt/q11.png";
import q12 from "../../../assets/mrt/q12.png";
import q13 from "../../../assets/mrt/q13.png";
import q14 from "../../../assets/mrt/q14.png";
import q15 from "../../../assets/mrt/q15.png";
import ConfirmModal from "../../modals/confirmModal/ConfirmModal";

const ROUNDS = [
  { id: 1, image: q1, correct: ["A", "C"] },
  { id: 2, image: q2, correct: ["A", "D"] },
  { id: 3, image: q3, correct: ["B", "D"] },
  { id: 4, image: q4, correct: ["B", "C"] },
  { id: 5, image: q5, correct: ["A", "C"] },
  { id: 6, image: q6, correct: ["A", "D"] },
  { id: 7, image: q7, correct: ["B", "D"] },
  { id: 8, image: q8, correct: ["B", "C"] },
  { id: 9, image: q9, correct: ["B", "D"] },
  { id: 10, image: q10, correct: ["A", "D"] },
  { id: 11, image: q11, correct: ["C", "D"] },
  { id: 12, image: q12, correct: ["B", "C"] },
  { id: 13, image: q13, correct: ["B", "D"] },
  { id: 14, image: q14, correct: ["B", "D"] },
  { id: 15, image: q15, correct: ["B", "D"] },
];

const TEST_DURATION_SECONDS = 8 * 60;

export default function MentalRotationTest() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isTestStarted, setIsTestStarted] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [testStartTime, setTestStartTime] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    let timer;
    if (isTestStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isTestStarted && timeLeft === 0) {
      handleFinishTest();
    }
    return () => clearInterval(timer);
  }, [isTestStarted, timeLeft]);

  const handleStart = () => {
    setIsTestStarted(true);
    setTestStartTime(Date.now());
  };

  const toggleOption = (option) => {
    setAnswers((prev) => {
      const currentAnswers = prev[currentRoundIndex] || [];

      if (currentAnswers.includes(option)) {
        return {
          ...prev,
          [currentRoundIndex]: currentAnswers.filter((ans) => ans !== option),
        };
      }

      if (currentAnswers.length >= 2) {
        return prev;
      }

      return { ...prev, [currentRoundIndex]: [...currentAnswers, option] };
    });
  };

  const handleFinishTest = () => {
    let score = 0;

    ROUNDS.forEach((round, index) => {
      const userAns = answers[index] || [];
      const correctAns = round.correct;

      const isCorrect =
        userAns.length === correctAns.length &&
        userAns.slice().sort().join(",") ===
          correctAns.slice().sort().join(",");

      if (isCorrect) score += 1;
    });

    const timeSpentMs = Date.now() - testStartTime;

    const results = {
      score: score,
      correctAnswers: score,
      incorrectAnswers: ROUNDS.length - score,
      totalQuestions: ROUNDS.length,
      avgReactionTimeMs: Math.round(timeSpentMs / ROUNDS.length),
    };

    localStorage.setItem(`finishedTest_${id}`, Date.now());

    localStorage.setItem(`testResults_${id}`, JSON.stringify(results));

    navigate(`/tests/${id}/evaluation`, {
      state: { internalTestResults: results },
    });
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!isTestStarted) {
    return (
      <div className={classes.startContainer}>
        <h1>Тест на пространственное вращение (MRT)</h1>
        <div
          style={{
            fontSize: "18px",
            margin: "30px 0",
            lineHeight: "1.6",
            textAlign: "left",
          }}
        >
          <p>
            Вам предстоит ответить на <strong>{ROUNDS.length} вопросов</strong>.
          </p>
          <p>
            Время на выполнение теста ограничено: <strong>8 минут</strong>.
          </p>
          <p>
            На каждой картинке показана фигура-образец и 4 варианта (A, B, C,
            D).
            <strong> Всегда ровно ДВЕ</strong> фигуры из нижних совпадают с
            верхней (они могут быть повернуты в плоскости). Остальные две — это
            похожие фигуры.
          </p>
          <p>
            Вы можете свободно перемещаться между вопросами с помощью бокового
            меню.
          </p>
        </div>
        <Button
          onClick={handleStart}
          style={{ padding: "15px 40px", fontSize: "18px" }}
        >
          Начать тест
        </Button>
      </div>
    );
  }

  const currentAnswers = answers[currentRoundIndex] || [];
  const isLastRound = currentRoundIndex === ROUNDS.length - 1;

  return (
    <div className={classes.layout}>
      <div className={classes.mainContent}>
        <h2>
          Вопрос {currentRoundIndex + 1} из {ROUNDS.length}
        </h2>

        <div className={classes.imageWrapper}>
          <img
            src={ROUNDS[currentRoundIndex].image}
            alt={`Задание ${currentRoundIndex + 1}`}
            className={classes.questionImage}
          />
        </div>

        <div className={classes.optionsRow}>
          {["A", "B", "C", "D"].map((letter) => {
            const isSelected = currentAnswers.includes(letter);
            return (
              <button
                key={letter}
                onClick={() => toggleOption(letter)}
                className={`${classes.optionBtn} ${isSelected ? classes.optionBtnSelected : ""}`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className={classes.navigationBtn}>
          <Button
            disabled={currentRoundIndex === 0}
            onClick={() => setCurrentRoundIndex((prev) => prev - 1)}
            style={{
              backgroundColor: "#f6bc86",
              width: "200px",
              fontSize: "16px",
            }}
          >
            Назад
          </Button>

          <Button
            disabled={isLastRound}
            onClick={() => setCurrentRoundIndex((prev) => prev + 1)}
            style={{ width: "200px", fontSize: "16px" }}
          >
            Далее
          </Button>
        </div>
      </div>

      <div className={classes.sidebar}>
        <div
          className={classes.timer}
          style={{ color: timeLeft < 60 ? "#E52327" : "#333" }}
        >
          {formatTime(timeLeft)}
        </div>

        <div className={classes.navHeader}>Навигация по тесту</div>

        <div className={classes.navGrid}>
          {ROUNDS.map((_, index) => {
            const isAnswered = answers[index] && answers[index].length === 2;
            const isActive = index === currentRoundIndex;

            return (
              <button
                key={index}
                onClick={() => setCurrentRoundIndex(index)}
                className={`
                  ${classes.navItem} 
                  ${isAnswered ? classes.navItemAnswered : ""} 
                  ${isActive ? classes.navItemActive : ""}
                `}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <Button
          style={{
            backgroundColor: "#E52327",
            color: "white",
            width: "100%",
          }}
          onClick={() => {
            setIsConfirmModalOpen(true);
          }}
        >
          Завершить тест
        </Button>
      </div>
      <ConfirmModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinishTest}
        title="Завершение теста"
        confirmText="Завершить тест"
        loadingText="Завершение..."
      >
        <p>
          Вы уверены, что хотите завершить тест? Убедитесь что ответили на все
          вопросы.
        </p>
      </ConfirmModal>
    </div>
  );
}
