import { useEffect, useState } from "react";
import Header from "../../components/UI/header/Header";
import Input from "../../components/UI/Input/Input";
import classes from "./profile.module.css";
import { IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Button from "../../components/UI/button/Button";
import { useAuth } from "../../context/AuthContext";
import { $authHost } from "../../http";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        fullName: user.fullName,
        email: user.email,
      }));
    }
  }, [user]);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
    setStatusMsg({ text: "", type: "" });
  };

  const handleSave = async () => {
    try {
      const response = await $authHost.put("api/user/profile", profileData);

      const newToken = response.data.token;
      localStorage.setItem("token", newToken);

      const decoded = jwtDecode(newToken);

      setUser((prev) => ({
        ...prev,
        fullName: decoded.fullName,
        emai: decoded.email,
      }));

      setProfileData((prev) => ({ ...prev, password: "" }));
      setStatusMsg({
        text: "Профиль успешно изменен!",
        type: "success",
      });
    } catch (error) {
      setStatusMsg({
        text: error.response?.data?.message || "Ошибка при обновлении",
        type: "error",
      });
    }
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
          {statusMsg.text && (
            <div
              style={{
                color: statusMsg.type === "success" ? "green" : "red",
                marginBottom: "15px",
                fontWeight: "bold",
              }}
            >
              {statusMsg.text}
            </div>
          )}
          <Input
            label="ФИО"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
          />
          <Input
            label="Электронная почта"
            name="email"
            value={profileData.email}
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
          <Button className={classes.saveBtn} onClick={handleSave}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}
