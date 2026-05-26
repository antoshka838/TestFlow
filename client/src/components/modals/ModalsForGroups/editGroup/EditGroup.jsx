import { useState, useEffect } from "react";
import { Stack } from "@mui/material";
import AppModal from "../../../UI/modal/AppModal";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/button/Button";
import classes from "./editGroupModal.module.css";

export default function EditGroup({ open, onClose, group, onSave }) {
  const [name, setName] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
    setErrors({});
  }, [group, open]);

  const handleCloseModal = () => {
    setErrors({});
    if (group) {
      setName(group.name);
    }
    onClose();
  };

  const handleSave = () => {
    if (!name.trim()) {
      setErrors({ name: "Введите название группы" });
      return;
    }

    onSave({
      ...group,
      name,
    });
  };

  return (
    <AppModal
      open={open}
      onClose={handleCloseModal}
      title="Редактировать группу"
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
        spacing={2}
        style={{
          marginTop: "10px",
          paddingBottom: "20px",
          marginBottom: "-20px",
        }}
      >
        <Input
          label="Название группы"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: null }));
            }
          }}
          error={!!errors.name}
          helperText={errors.name}
        />
      </Stack>
    </AppModal>
  );
}
