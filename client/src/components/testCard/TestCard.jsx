// import React from "react";
// import { useNavigate } from "react-router";
// import classes from "./style.module.css";
// import Button from "../UI/button/Button";

// export default function TestCard({ test, onViewResult }) {
//   const navigate = useNavigate();

//   const statusText = test.isCompleted ? "Пройден" : "Не пройден";
//   const statusClass = test.isCompleted
//     ? classes.statusPassed
//     : classes.statusNotPassed;

//   const shortDescription = test.description
//     ? test.description.length > 200
//       ? test.description.slice(0, 200) + "..."
//       : test.description
//     : "Описание отсутствует";

//   return (
//     <div className={classes.cardWrapper}>
//       <div className={classes.cardWrapperContent}>
//         <p>
//           <strong>{test.name}</strong>
//         </p>
//         <p>{shortDescription}</p>
//         <p>
//           <strong>Статус: </strong>{" "}
//           <span className={`${classes.status} ${statusClass}`}>
//             {statusText}
//           </span>
//         </p>
//       </div>
//       <div>
//         {test.isCompleted ? (
//           <Button onClick={onViewResult} style={{backgroundColor: "green", color: "white"}}>Мой результат</Button>
//         ) : (
//           <Button onClick={() => navigate(`/tests/${test.id}`)}>
//             Пройти тест
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }
import React from "react";
import { useNavigate } from "react-router";
import classes from "./style.module.css";
import Button from "../UI/button/Button";

export default function TestCard({ test, onViewResult }) {
  const navigate = useNavigate();
  let statusText = "Не пройден";
  let statusClass = classes.statusNotPassed;

  if (test.isCompleted) {
    statusText = "Пройден";
    statusClass = classes.statusPassed;
  } else if (test.needsEvaluation) {
    statusText = "Ожидает оценки";
    statusClass = classes.statusNotPassed; 
  }

  const shortDescription = test.description
    ? test.description.length > 200
      ? test.description.slice(0, 200) + "..."
      : test.description
    : "Описание отсутствует";

  return (
    <div className={classes.cardWrapper}>
      <div className={classes.cardWrapperContent}>
        <p>
          <strong>{test.name}</strong>
        </p>
        <p>{shortDescription}</p>
        <p>
          <strong>Статус: </strong>{" "}
          <span 
            className={`${classes.status} ${statusClass}`}
            style={test.needsEvaluation && !test.isCompleted ? { color: "#ff8400" } : {}}
          >
            {statusText}
          </span>
        </p>
      </div>
      <div>
        {test.isCompleted ? (
          <Button 
            onClick={onViewResult} 
            style={{ backgroundColor: "green", color: "white" }}
          >
            Мой результат
          </Button>
        ) : test.needsEvaluation ? (
          <Button 
            onClick={() => navigate(`/tests/${test.id}/evaluation`)} 
            style={{ backgroundColor: "#FFDA53", color: "black" }}
          >
            Заполнить результаты
          </Button>
        ) : (
          <Button onClick={() => navigate(`/tests/${test.id}`)}>
            Пройти тест
          </Button>
        )}
      </div>
    </div>
  );
}