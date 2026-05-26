import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Header from "../../components/UI/header/Header";
import TestResultCard from "../../components/testResultCard/TestResultCard";
import Button from "../../components/UI/button/Button";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import { $authHost } from "../../http";
import Loader from "../../components/UI/loader/Loader";
import { useToast } from "../../context/ToastContext";

export default function TestResults() {
  const { id: userId, testId } = useParams();
  const navigate = useNavigate();
  const showToast = useToast();

  const [userData, setUserData] = useState(null);
  const [testData, setTestData] = useState(null);
  const [resultData, setResultData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersRes, testRes, resultsRes] = await Promise.all([
          $authHost.get("api/user"),
          $authHost.get(`api/test/${testId}`),
          $authHost.get(`api/test/results/${userId}`),
        ]);

        setUserData(usersRes.data.find((u) => u.id === Number(userId)));
        setTestData(testRes.data);
        setResultData(resultsRes.data.find((r) => r.testId === Number(testId)));
      } catch (error) {
        console.error("Ошибка загрузки результатов:", error);
        showToast("Ошибка при загрузке данных с сервера", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, testId]);

  const handleOpenResetModal = () => {
    setIsResetModalOpen(true);
  };

  const executeReset = async () => {
    try {
      await $authHost.delete(`api/test/${testId}/results/${userId}`);
      setIsResetModalOpen(false);
      showToast(
        "Результат успешно сброшен, назначена новая попытка",
        "success",
      );
      navigate(`/respondents/${userId}`);
    } catch (error) {
      console.error("Ошибка при сбросе попытки:", error);
      showToast(
        error.response?.data?.message ||
          "Произошла ошибка при сбросе результата",
        "error",
      );
      setIsResetModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }
  if (!userData || !testData || !resultData)
    return <Header title="Результаты не найдены" />;

  const parts = userData.fullName.split(" ");
  const lastName = parts[0];
  const firstName = parts[1] ? `${parts[1][0]}.` : "";
  const surname = parts[2] ? `${parts[2][0]}.` : "";
  const title = `${lastName} ${firstName} ${surname}`.trim();

  const timeSpentInSeconds = Math.round(
    (new Date(resultData.completedAt) - new Date(resultData.startedAt)) / 1000,
  );
  const mins = Math.floor(timeSpentInSeconds / 60);
  const secs = timeSpentInSeconds % 60;
  const formattedTime = mins > 0 ? `${mins} мин. ${secs} сек.` : `${secs} сек.`;

  const correct = Number(resultData.answersJson?.correctAnswers || 0);
  const incorrect = Number(resultData.answersJson?.incorrectAnswers || 0);
  const total = correct + incorrect;
  const accuracy = total > 0 ? ((correct / total) * 100).toFixed(0) : 0;

  const testResultInfo = {
    testName: testData.name,
    rating: resultData.rating,
    score: resultData.score,
    correctAnswers: correct,
    totalQuestions: total,
    accuracy: accuracy,
    timeSpent: formattedTime,
    cognitiveLoad: resultData.cognitiveLoad || {},
    comment: resultData.comment,
  };

  return (
    <div>
      <Header
        title={testData.name}
        crumbs={[
          { label: "Респонденты", to: "/respondents" },
          { label: title, to: `/respondents/${userId}` },
          { label: testData.name },
        ]}
      >
        <Button
          style={{ backgroundColor: "#E52327", color: "white" }}
          onClick={handleOpenResetModal}
        >
          Сбросить результат (Новая попытка)
        </Button>
      </Header>

      <TestResultCard result={testResultInfo} />

      <ConfirmModal
        open={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={executeReset}
        title="Сброс результата"
        confirmText="Сбросить результат"
        loadingText="Сброс..."
      >
        <p>
          Вы уверены, что хотите удалить результат теста{" "}
          <strong>{testData.name}</strong> у респондента{" "}
          <strong>{userData.fullName}</strong>?
        </p>
        <p style={{ marginTop: "10px", color: "#E52327", fontSize: "14px" }}>
          Данные о текущем прохождении будут безвозвратно удалены, а респондент
          получит новую попытку.
        </p>
      </ConfirmModal>
    </div>
  );
}
