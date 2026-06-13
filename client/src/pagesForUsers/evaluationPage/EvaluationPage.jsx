import React, { useState, useEffect } from "react";
import Header from "../../components/UI/header/Header";
import { useNavigate, useParams, useLocation } from "react-router";
import {
  Slider,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import classes from "./style.module.css";
import { $authHost } from "../../http/index";
import Button from "../../components/UI/button/Button";
import { useToast } from "../../context/ToastContext";

const steps = [
  "Результаты теста",
  "Внутренняя когнитивная нагрузка",
  "Внешняя когнитивная нагрузка",
];

export default function EvaluationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [testName, setTestName] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    correctAnswers: false,
    incorrectAnswers: false,
  });

  useEffect(() => {
    const fetchTestName = async () => {
      try {
        const response = await $authHost.get(`api/test/${id}`);
        setTestName(response.data.name);
      } catch (error) {
        console.error("Ошибка при загрузке названия теста:", error);
        setTestName("Тест");
      }
    };
    fetchTestName();
  }, [id]);

  const savedResultsStr = localStorage.getItem(`testResults_${id}`);
  const internalResults = location.state?.internalTestResults || (savedResultsStr ? JSON.parse(savedResultsStr) : null);
  const isInternalTest = !!internalResults;

  const [evaluationData, setEvaluationData] = useState({
    correctAnswers: internalResults ? internalResults.correctAnswers : "",
    incorrectAnswers: internalResults ? internalResults.incorrectAnswers : "",
    testRating: 5,
    comment: "",

    testTasksSeemedDifficult: 3,
    informationLoadWasHigh: 3,
    requiredHighConcentration: 3,
    difficultyProcessingMultipleItems: 3,
    requiredSignificantMentalEffort: 3,

    instructionWasConfusing: 3,
    interfaceWasNotIntuitive: 3,
    screenHadDistractingElements: 3,
    navigationWasConfusing: 3,
    questionsWereAmbiguous: 3,
  });

  const handleChange = (field, value) => {
    setEvaluationData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: false }));
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      const isCorrectEmpty =
        evaluationData.correctAnswers === "" ||
        evaluationData.correctAnswers === null;
      const isIncorrectEmpty =
        evaluationData.incorrectAnswers === "" ||
        evaluationData.incorrectAnswers === null;

      if (isCorrectEmpty || isIncorrectEmpty) {
        setErrors({
          correctAnswers: isCorrectEmpty,
          incorrectAnswers: isIncorrectEmpty,
        });
        showToast(
          "Пожалуйста, заполните количество верных и неверных ответов",
          "error",
        );
        return;
      }
    }

    if (activeStep === steps.length - 1) {
      try {
        setIsSubmitting(true);

        const startTime = localStorage.getItem(`activeTest_${id}`);
        const finishedTime = localStorage.getItem(`finishedTest_${id}`);

        if (!startTime || !finishedTime) {
          console.warn("Время прохождения теста не найдено в localStorage");
        }

        await $authHost.post(`api/test/${id}/submit`, {
          evaluationData,
          startTime,
          finishedTime,
        });

        localStorage.removeItem(`activeTest_${id}`);
        localStorage.removeItem(`finishedTest_${id}`);
        localStorage.removeItem(`testResults_${id}`);

        showToast(
          "Результаты успешно сохранены! Спасибо за прохождение.",
          "success",
        );
        navigate("/tests");
      } catch (error) {
        console.error("Ошибка при отправке результатов:", error);
        showToast(
          error.response?.data?.message ||
            "Произошла ошибка при сохранении данных.",
          "error",
        );
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };


  const renderStep1 = () => (
    <div className={classes.cardStep}>
      <div className={classes.answer}>
        <Typography sx={{marginTop: "10px"}}>
          Введите количество <span style={{ color: "green"}}>верных</span>{" "}
          ответов:
        </Typography>
        <TextField
          type="number"
          size="small"
          value={evaluationData.correctAnswers}
          onChange={(e) => handleChange("correctAnswers", e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
          disabled={isInternalTest}
          error={!!errors.correctAnswers}
          helperText={errors.correctAnswers ? "Обязательное поле" : " "}
        />
      </div>
      <div className={classes.answer}>
        <Typography sx={{marginTop: "10px"}}>
          Введите количество <span style={{ color: "red" }}>неверных</span>{" "}
          ответов:
        </Typography>
        <TextField
          type="number"
          size="small"
          value={evaluationData.incorrectAnswers}
          onChange={(e) => handleChange("incorrectAnswers", e.target.value)}
          slotProps={{ htmlInput: { min: 0 } }}
          disabled={isInternalTest}
          error={!!errors.incorrectAnswers}
          helperText={errors.incorrectAnswers ? "Обязательное поле" : " "}
        />
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Оцените качество теста (от 1 до 10)
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.testRating}
            onChange={(e, newValue) => handleChange("testRating", newValue)}
            step={1}
            marks
            min={1}
            max={10}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <TextField
        label="Комментарий (необязательно)"
        multiline
        rows={4}
        fullWidth
        placeholder="Напишите ваши впечатления от теста, были ли сложности с пониманием вопросов..."
        value={evaluationData.comment}
        onChange={(e) => handleChange("comment", e.target.value)}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className={classes.cardStep}>
      <div style={{ justifyItems: "center" }}>
        <Typography>
          Ответьте на вопросы по шкале от 1 до 5 (от "полностью не согласен" до
          "полностью согласен" )
        </Typography>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Моих текущих знаний было недостаточно для легкого прохождения теста:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.testTasksSeemedDifficult}
            onChange={(e, newValue) =>
              handleChange("testTasksSeemedDifficult", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Объём информации, который необходимо было удерживать в памяти, был
          большим:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.informationLoadWasHigh}
            onChange={(e, newValue) =>
              handleChange("informationLoadWasHigh", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Для выполнения теста требовалась высокая концентрация внимания:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.requiredHighConcentration}
            onChange={(e, newValue) =>
              handleChange("requiredHighConcentration", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Мне было трудно одновременно обрабатывать несколько элементов
          информации:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.difficultyProcessingMultipleItems}
            onChange={(e, newValue) =>
              handleChange("difficultyProcessingMultipleItems", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Содержание теста требовало значительных умственных усилий:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.requiredSignificantMentalEffort}
            onChange={(e, newValue) =>
              handleChange("requiredSignificantMentalEffort", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className={classes.cardStep}>
      <div style={{ justifyItems: "center" }}>
        <Typography>
          Ответьте на вопросы по шкале от 1 до 5 (от "полностью не согласен" до
          "полностью согласен" )
        </Typography>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Инструкция к тесту показалась мне не понятной с первого прочтения:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.instructionWasConfusing}
            onChange={(e, newValue) =>
              handleChange("instructionWasConfusing", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Интерфейс оказался сложным и непонятным:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.interfaceWasNotIntuitive}
            onChange={(e, newValue) =>
              handleChange("interfaceWasNotIntuitive", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Визуальное оформление содержало отвлекающие элементы:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.screenHadDistractingElements}
            onChange={(e, newValue) =>
              handleChange("screenHadDistractingElements", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Переключаться между заданиями было неудобно:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.navigationWasConfusing}
            onChange={(e, newValue) =>
              handleChange("navigationWasConfusing", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
      <div className={classes.answer}>
        <Typography gutterBottom>
          Некоторые вопросы были неоднозначны:
        </Typography>
        <div className={classes.slider}>
          <Slider
            value={evaluationData.questionsWereAmbiguous}
            onChange={(e, newValue) =>
              handleChange("questionsWereAmbiguous", newValue)
            }
            step={1}
            marks
            min={1}
            max={5}
            valueLabelDisplay="auto"
            sx={{
              color: "#FFDA53",
              "& .MuiSlider-track": {
                height: 5,
              },
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: "100%" }}>
      <Header
        title="Оценка и результаты"
        crumbs={[
          { label: "Главная", to: "/tests" },
          { label: testName, to: `/tests/${id}` },
          { label: "Оценка и результаты" },
        ]}
      />

      <div className={classes.cardWrapper}>
        <div className={classes.stepHeader}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  sx={{
                    color: "#2A292B",
                    "& .MuiStepIcon-root.Mui-active": {
                      color: "#ff8400",
                    },
                    "& .MuiStepIcon-root.Mui-completed": {
                      color: "#ff8400",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </div>
        <div>
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}
        </div>
        <div className={classes.cardButtons}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            className={classes.btn}
            style={{ backgroundColor: "#f6bc86" }}
          >
            Назад
          </Button>
          <Button
            onClick={handleNext}
            disabled={isSubmitting}
            className={classes.btn}
          >
            {isSubmitting
              ? "Отправка..."
              : activeStep === steps.length - 1
                ? "Завершить и отправить"
                : "Далее"}
          </Button>
        </div>
      </div>
    </div>
  );
}
