import classes from "./tests.module.css";
import Header from "../../UI/cardHeader/Header";

export default function LastComplitedTestsCard({ tests }) {
  const formatFullName = (fullName) => {
  const words = fullName.trim().split(" ").filter(Boolean);
  if (words.length === 1) return words[0];
  if (words.length === 2) return `${words[0]} ${words[1][0]}.`;
  return `${words[0]} ${words[1][0]}.${words[2][0]}.`;
};

  return (
    <div className={classes.cardContainer}>
      <Header linkTo="/statistics">Последние пройденные тесты</Header>
      <div className={classes.testList}>
        {tests.map((test) => (
          <div key={test.id} className={classes.testRow}>
            <span>{formatFullName(test.userName)}</span>
            <span className={classes.testName}>{test.testName}</span>
            <span className={classes.testDate}>
              {new Date(test.date).toLocaleDateString("ru-RU")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
