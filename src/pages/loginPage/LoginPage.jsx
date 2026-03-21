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

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [profileData, setProfileData] = useState({
    email: "",
    password: "",
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const { email, password } = profileData;
    
    try {
      await login(email, password);
    } catch (error) {
      setError(error.response?.data?.message || "Ошибка при авторизации");
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
              label="Почта"
              name="email"
              type="email"
              value={profileData.email}
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
