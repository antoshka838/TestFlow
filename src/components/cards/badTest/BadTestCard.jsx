import Header from "../../UI/cardHeader/Header"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"
import classes from "./badTest.module.css";


export default function BаdTestCard() {
  return (
    <div className={classes.cardContainer}>
      <Header titleStyle = {classes.red}>
        <FontAwesomeIcon icon={faTriangleExclamation} /> Проблемный тест
      </Header>
      <div>
        <p><strong>Название:</strong> Тест на память</p>
        <p><strong>Средняя оценка тесту:</strong> <span>3</span></p>
        <p><strong>Ср. внешняя когнитивная нагрузка:</strong> <span>4</span></p>
        <p><strong>Ср. внутреняя когнитивная нагрузка:</strong> <span>4</span></p>
        <p><strong>Ср. время прохождения:</strong> 15</p>
      </div>
    </div>
  )
}
