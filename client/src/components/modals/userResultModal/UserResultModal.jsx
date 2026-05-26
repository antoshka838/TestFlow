import { useState, useEffect } from "react";
import AppModal from "../../UI/modal/AppModal";
import TestResultCard from "../../testResultCard/TestResultCard";
import { $authHost } from "../../../http";

export default function UserResultModal({ open, onClose, testId }) {
  const [resultInfo, setResultInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResult = async () => {
    try {
      setIsLoading(true);
      const response = await $authHost.get(`api/test/${testId}/my-result`);
      const { result, test } = response.data;

      const correct = Number(result.answersJson?.correctAnswers || 0);
      const incorrect = Number(result.answersJson?.incorrectAnswers || 0);
      const total = correct + incorrect;
      const accuracy = total > 0 ? ((correct / total) * 100).toFixed(0) : 0;

      const timeSpentInSeconds = Math.round(
        (new Date(result.completedAt) - new Date(result.startedAt)) / 1000,
      );
      const mins = Math.floor(timeSpentInSeconds / 60);
      const secs = timeSpentInSeconds % 60;
      const formattedTime =
        mins > 0 ? `${mins} мин. ${secs} сек.` : `${secs} сек.`;

      setResultInfo({
        testName: test.name,
        rating: result.rating,
        score: result.score,
        correctAnswers: correct,
        totalQuestions: total,
        accuracy: accuracy,
        timeSpent: formattedTime,
        cognitiveLoad: result.cognitiveLoad || {},
        comment: result.comment,
      });
    } catch (error) {
      console.error("Ошибка при загрузке результата:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && testId) {
      fetchResult();
    } else {
      setResultInfo(null);
    }
  }, [open, testId]);

  return (
    <AppModal open={open} onClose={onClose} title="Мой результат теста">
      {isLoading ? (
        <p style={{ padding: "30px", textAlign: "center", color: "#666" }}>
          Загрузка результатов...
        </p>
      ) : resultInfo ? (
        <div
          style={{ maxHeight: "70vh", overflowY: "auto"}}
        >
          <TestResultCard result={resultInfo} />
        </div>
      ) : (
        <p style={{ padding: "30px", textAlign: "center", color: "#E52327" }}>
          Не удалось загрузить данные.
        </p>
      )}
    </AppModal>
  );
}
