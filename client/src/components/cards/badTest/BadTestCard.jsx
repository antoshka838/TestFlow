import Header from "../../UI/cardHeader/Header"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import classes from "./badTest.module.css";

export default function BadTestCard({ test }) {
  if (!test) {
    return (
      <div className={classes.cardContainer}>
        <Header titleStyle={classes.red} linkTo="/tests">
          <FontAwesomeIcon icon={faTriangleExclamation} /> Проблемный тест
        </Header>
        <div style={{ marginTop: "15px", color: "#888" }}>
          <p>Недостаточно данных для определения проблемного теста.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={classes.cardContainer}>
      <Header titleStyle={classes.red} linkTo={`/tests/${test.id}`}>
        <FontAwesomeIcon icon={faTriangleExclamation} /> Проблемный тест
      </Header>
      <div>
        <p><strong>Название:</strong> {test.name}</p>
        <p><strong>Средняя оценка тесту:</strong> <span>{test.avgRating}</span></p>
        <p><strong>Ср. внешняя когнитивная нагрузка:</strong> <span>{test.avgExtLoad}</span></p>
        <p><strong>Ср. внутреняя когнитивная нагрузка:</strong> <span>{test.avgIntLoad}</span></p>
        <p><strong>Ср. время прохождения:</strong> {test.avgTime} мин.</p>
      </div>
    </div>
  )
}