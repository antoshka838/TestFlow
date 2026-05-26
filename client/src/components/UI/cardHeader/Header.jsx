import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import classes from "./header.module.css";
import { useNavigate } from "react-router";

export default function Header({ children, titleStyle = "", linkTo }) {
  const navigate = useNavigate();

  return (
    <div className={classes.cardHeader}>
      <h3 className={titleStyle}>{children}</h3>
      {linkTo && (
        <a className={classes.details} onClick={() => navigate(linkTo)}>
          Подробнее <FontAwesomeIcon icon={faArrowRight} />
        </a>
      )}
    </div>
  );
}
