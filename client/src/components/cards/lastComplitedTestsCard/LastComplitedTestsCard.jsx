import classes from "./tests.module.css";
import Header from "../../UI/cardHeader/Header";

export default function LastComplitedTestsCard() {
  return (
    <div className={classes.cardContainer}>
      <Header>Последние пройденные тесты</Header>
      <div className={classes.testList}>
        <div className={classes.testRow}>
          <span>Иванов А.А.</span>
          <span className={classes.testName}>Тест на память</span>
          <span className={classes.testDate}>26.02.2026</span>
        </div>
        <div className={classes.testRow}>
          <span>Иванов А.А.</span>
          <span className={classes.testName}>Тест на память</span>
          <span className={classes.testDate}>26.02.2026</span>
        </div>
        <div className={classes.testRow}>
          <span>Иванов А.А.</span>
          <span className={classes.testName}>Тест на память</span>
          <span className={classes.testDate}>26.02.2026</span>
        </div>
      </div>
    </div>
  );
}
