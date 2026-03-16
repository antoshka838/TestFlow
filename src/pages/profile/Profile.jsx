import { useState } from "react";
import Header from "../../components/UI/header/Header";
import Input from "../../components/UI/Input/Input";
import classes from "./profile.module.css";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Button from "../../components/UI/button/Button";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    email: "user@example.com",
    login: "ivan_ivanov",
    password: "",
  });

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("Профиль сохранен: ", profileData);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <Header title={"Профиль"}>
        <Button className={classes.cancelBtn} onClick={handleLogout}>
          Выход
        </Button>
      </Header>
      <div className={classes.editWrapper}>
        <div className={classes.editContent}>
          <Input
            label="Электронная почта"
            name="email"
            value={profileData.email}
            onChange={handleChange}
          />
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
            value={profileData.password}
            onChange={handleChange}
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

        <div className={classes.actions}>
          <Button className={classes.cancelBtn}>Отмена</Button>
          <Button className={classes.saveBtn}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
