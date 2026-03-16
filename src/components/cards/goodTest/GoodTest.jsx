import classes from "./goodTest.module.css";
import Header from "../../UI/cardHeader/Header";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

export default function GoodTest() {
  return (
    <div className={classes.cardContainer}>
      <Header titleStyle = {classes.good}>Хороший тест <FontAwesomeIcon icon={faThumbsUp} /></Header>
      <div>
        <p><strong>Название:</strong> Тест на память</p>
        <p><strong>Средняя оценка тесту:</strong> <span>8</span></p>
        <p><strong>Ср. внешняя когнитивная нагрузка:</strong> <span>1</span></p>
        <p><strong>Ср. внутреняя когнитивная нагрузка:</strong> <span>1</span></p>
        <p><strong>Ср. время прохождения:</strong> 10</p>
      </div>
    </div>
  )
}
