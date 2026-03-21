import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import classes from "./header.module.css";

export default function Header({children, titleStyle = ""}) {
  return (
    <div className={classes.cardHeader}>
        <h3 className={titleStyle}>{children}</h3>
        <span className={classes.details}>Подробнее <FontAwesomeIcon icon={faArrowRight} /></span>
      </div>
  )
}
