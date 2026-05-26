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
import { useNavigate } from "react-router";
import { useToast } from "../../context/ToastContext";

export default function Profile() {
  const { user, logout, setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();
  const showToast = useToast();

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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        fullName: user.fullName,
        email: user.email,
        password: "",
      });
      setErrors({});
    }
  };

  const handleSave = async () => {
    const newErrors = {};
    let isValid = true;

    if (!profileData.fullName.trim()) {
      newErrors.fullName = "ФИО обязательно для заполнения";
      isValid = false;
    }

    if (!profileData.email.trim()) {
      newErrors.email = "Электронная почта обязательна";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = "Введите корректный email";
      isValid = false;
    }

    if (profileData.password && profileData.password.length < 8) {
      newErrors.password = "Пароль должен содержать минимум 8 символов";
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;
    try {
      const response = await $authHost.put("api/user/profile", profileData);

      const newToken = response.data.token;
      localStorage.setItem("token", newToken);

      const decoded = jwtDecode(newToken);

      setUser((prev) => ({
        ...prev,
        fullName: decoded.fullName,
        email: decoded.email,
      }));

      setProfileData((prev) => ({ ...prev, password: "" }));

      showToast("Данные успешно обновлены!", "success");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Ошибка при обновлении",
        "error",
      );
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
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
            label="ФИО"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />
          <Input
            label="Электронная почта"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
          />
          <Input
            label="Пароль"
            type={showPassword ? "text" : "password"}
            name="password"
            value={profileData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
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
          <Button className={classes.cancelBtn} onClick={handleCancel}>
            Отмена
          </Button>
          <Button className={classes.saveBtn} onClick={handleSave}>
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
