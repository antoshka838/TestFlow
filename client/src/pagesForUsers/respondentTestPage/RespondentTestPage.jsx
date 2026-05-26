import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import Header from "../../components/UI/header/Header";
import Button from "../../components/UI/button/Button";
import classes from "./style.module.css";
import { $authHost } from "../../http";
import ConfirmModal from "../../components/modals/confirmModal/ConfirmModal";
import Loader from "../../components/UI/loader/Loader";

export default function RespondentTestPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInProgress, setIsInProgress] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const fetchTest = async () => {
    try {
      setIsLoading(true);
      const response = await $authHost.get(`api/test/${id}`);
      setTest(response.data);
    } catch (error) {
      console.error("Ошибка при загрузке теста: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTest();
  }, [id]);

  useEffect(() => {
    const startedTime = localStorage.getItem(`activeTest_${id}`);
    if (startedTime) {
      setIsInProgress(true);
    }
  }, [id]);

  const handleStart = () => {
    localStorage.setItem(`activeTest_${id}`, Date.now());
    setIsInProgress(true);

    if (test.testType === "INTERNAL") {
      navigate(`${test.externalUrl}/${id}`);
    } else {
      window.open(test.externalUrl, "_blank");
    }
  };

  const handleFinish = () => {
    localStorage.setItem(`finishedTest_${id}`, Date.now());
    navigate(`/tests/${id}/evaluation`);
  };

  const handleCancelClick = () => {
    setIsCancelModalOpen(true);
  };

  const executeCancel = async () => {
    localStorage.removeItem(`activeTest_${id}`);
    localStorage.removeItem(`finishedTest_${id}`);
    localStorage.removeItem(`testResults_${id}`);
    setIsInProgress(false);
    setIsCancelModalOpen(false);
  };

  if (isLoading) {
    return (
      <div>
        <Header title="Загрузка..." />
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <Header
        title={test.name}
        crumbs={[{ label: "Главная", to: "/tests" }, { label: test.name }]}
      />

      <div className={classes.cardWrapper}>
        <div className={classes.card}>
          <h2>{test.name}</h2>

          <p className={classes.information}>
            <strong>Описание: </strong> {test.description}
          </p>

          <div className={classes.actions}>
            {test.isCompleted ? (
              <div className={classes.actionsContent}>
                <p className={classes.confirmedTest}>
                  Вы уже успешно прошли тест.
                </p>
                <Button onClick={() => navigate("/tests")}>
                  Вернуться к списку
                </Button>
              </div>
            ) : isInProgress ? (
              <div className={classes.actionsContent}>
                <p className={classes.inProcess}>
                  Тест открыт в новом окне и сейчас выполняется.
                </p>
                <p>
                  Пожалуйста, не закрывайте эту страницу. После того как вы
                  получите результат в соседней вкладке, вернитесь сюда и
                  нажмите «Я завершил».
                </p>
                <div className={classes.buttons}>
                  <Button
                    onClick={handleFinish}
                    className={classes.completeBtn}
                  >
                    Я завершил
                  </Button>
                  <Button
                    onClick={handleCancelClick}
                    className={classes.cancelBtn}
                  >
                    Прервать
                  </Button>
                </div>
              </div>
            ) : (
              <div className={classes.actionsContent}>
                <p>
                  При нажатии на кнопку тест откроется в новой вкладке, и
                  начнется отсчет времени.
                </p>
                <Button onClick={handleStart}>Начать тест</Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <ConfirmModal
        open={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={executeCancel}
        title="Прервать тестирование?"
        confirmText="Прервать"
        loadingText="Отмена..."
      >
        <p>
          Вы уверены, что хотите прервать? Время и прогресс{" "}
          <strong>не сохранятся</strong>, и вам придется начать тест заново.
        </p>
      </ConfirmModal>
    </div>
  );
}
