import { useState } from "react";
import classes from "./style.module.css";
import logo from "../../assets/image4.png";
import Input from "../../components/UI/Input/Input";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Button from "../../components/UI/button/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [profileData, setProfileData] = useState({
    login: "",
    password: "",
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const { login: userLogin, password } = profileData;

    if (userLogin === "admin" && password === "123") {
      login({
        id: 1,
        fullName: "Иван Иванов (Админ)",
        login: userLogin,
        role: "ADMIN",
      });
      navigate("/")
    } else if (userLogin === "user" && password === "123") {
      login({
        id: 2,
        fullName: "Алексей Смирнов (Студент)",
        login: userLogin,
        role: "USER",
      });
      navigate("/my-tests")
    } else {
      setError("Неверный логин или пароль");
    }
  };

  return (
    <div className={classes.loginPage}>
      <div className={classes.loginCard}>
        <img src={logo} className="" />
        <form className={classes.content} onSubmit={handleLogin}>
          <div className={classes.cardInput}>
            <p>Система тестирования и оценки познавательных процессов</p>
            {error && (
              <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
            )}
            <Input
              label="Логин"
              name="login"
              value={profileData.login}
              onChange={handleChange}
            />
            <Input
              label="Пароль"
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handleChange}
              value={profileData.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </div>
          <Button type="submit">Авторизоваться</Button>
        </form>
      </div>
    </div>
  );
}
