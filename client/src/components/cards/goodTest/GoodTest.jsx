import classes from "./goodTest.module.css";
import Header from "../../UI/cardHeader/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

export default function GoodTest({test}) {
  return (
    <div className={classes.cardContainer}>
      <Header titleStyle = {classes.good} linkTo={`/tests/${test.id}`}>Хороший тест <FontAwesomeIcon icon={faThumbsUp} /></Header>
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
