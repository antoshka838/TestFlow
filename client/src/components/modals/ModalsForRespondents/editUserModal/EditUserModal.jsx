import classes from "./editUserModal.module.css";
import { Stack } from "@mui/material";
import { useState } from "react";
import AppModal from "../../../UI/modal/AppModal";
import Button from "../../../UI/button/Button";
import Input from "../../../UI/Input/Input";

export default function EditUserModal({ open, onClose }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSave = () => {
    const newUser = { fullName, email, password };
    console.log(newUser);

    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Редактировать респондента"
      actions={
        <>
          <Button onClick={onClose} className={classes.cancelBtn}>Отмена</Button>
          <Button onClick={handleSave} className={classes.saveBtn}>Сохранить</Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Input
          label="ФИО"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Stack>
    </AppModal>
  );
}