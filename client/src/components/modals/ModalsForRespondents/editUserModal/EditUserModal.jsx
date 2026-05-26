import classes from "./editUserModal.module.css";
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import AppModal from "../../../UI/modal/AppModal";
import Button from "../../../UI/button/Button";
import Input from "../../../UI/Input/Input";

export default function EditUserModal({ open, onClose, user, onSave }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPassword("");
    }
    setErrors({});
  }, [user, open]);

  const handleCloseModal = () => {
    setErrors({});
    if (user) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPassword("");
    }
    onClose();
  };

  const handleSave = () => {
    const newErrors = {};
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "ФИО обязательно";
      isValid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email обязателен";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Введите корректный email";
      isValid = false;
    }

    if (password && password.length < 8) {
      newErrors.password = "Минимум 8 символов";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    const updatedData = { fullName, email };

    if (password.trim() !== "") {
      updatedData.password = password;
    }

    onSave(updatedData);
  };

  return (
    <AppModal
      open={open}
      onClose={handleCloseModal}
      title="Редактировать респондента"
      actions={
        <>
          <Button onClick={handleCloseModal} className={classes.cancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleSave} className={classes.saveBtn}>
            Сохранить
          </Button>
        </>
      }
    >
      <Stack 
        spacing={3}
        style={{ 
          marginTop: "10px", 
          paddingBottom: "20px", 
          marginBottom: "-20px" 
        }}
      >
        <Input
          label="ФИО"
          autoFocus
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: null }));
          }}
          error={!!errors.fullName}
          helperText={errors.fullName}
        />
        <Input
          label="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
          }}
          error={!!errors.email}
          helperText={errors.email}
        />
        <Input
          label="Пароль"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
          }}
          type="password"
          error={!!errors.password}
          helperText={errors.password}
        />
      </Stack>
    </AppModal>
  );
}