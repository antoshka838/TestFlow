import { NavLink } from "react-router";
import classes from "./sidebar.module.css";
import logo from "../../../assets/logo.png";
import { useAuth } from "../../../context/AuthContext";

export default function Sidebar() {
  const {user} = useAuth();

  const adminLinks = [
    { path: "/", label: "Главная" },
    { path: "/tests", label: "Тесты" },
    { path: "/groups", label: "Группы" },
    { path: "/respondents", label: "Респонденты" },
    { path: "/statistics", label: "Статистика" },
    { path: "/profile", label: "Профиль" },
  ];

  const respondentLinks = [
    { path: "/tests", label: "Главная" },
    { path: "/profile", label: "Профиль" },
  ];

  const linksToRender = user?.role === "ADMIN" ? adminLinks : respondentLinks;

  return (
    <aside className={classes.sidebar}>
      <div className={classes.logoContainer}>
        <img src={logo} alt="TestFlow" />
        <h2>TestFlow</h2>
      </div>
      <ul>
        {linksToRender.map((link) => (
          <li key={link.path}>
            <NavLink
              to={link.path}
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
