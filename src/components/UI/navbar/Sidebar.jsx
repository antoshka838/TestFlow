import { NavLink } from "react-router";
import classes from "./sidebar.module.css";
import logo from "../../../assets/logo.png"

export default function Sidebar() {
  return (
    <aside className={classes.sidebar}>
      <div className={classes.logoContainer}>
        <img src={logo} alt="TextFlow" />
        <h2>TextFlow</h2>
      </div>
      <ul>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? classes.active : undefined)}>Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/tests" className={({ isActive }) => (isActive ? classes.active : undefined)}>Тесты</NavLink>
        </li>
        <li>
          <NavLink to="/groups" className={({ isActive }) => (isActive ? classes.active : undefined)}>Группы</NavLink>
        </li>
        <li>
          <NavLink to="/respondents" className={({ isActive }) => (isActive ? classes.active : undefined)}>Респонденты</NavLink>
        </li>
        <li>
          <NavLink to="/statistics" className={({ isActive }) => (isActive ? classes.active : undefined)}>Статистика</NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? classes.active : undefined)}>Профиль</NavLink>
        </li>
      </ul>
    </aside>
  );
}
