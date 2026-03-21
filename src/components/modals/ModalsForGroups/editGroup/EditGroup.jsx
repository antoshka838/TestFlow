import { useState, useEffect } from "react";
import { Stack } from "@mui/material";
import AppModal from "../../../UI/modal/AppModal";
import Input from "../../../UI/Input/Input";
import Button from "../../../UI/button/Button";
import classes from "./editGroupModal.module.css"

export default function EditGroup({ open, onClose, group, onSave }) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
  }, [group]);

  const handleSave = () => {
    if (!name.trim()) return;

    onSave({
      ...group,
      name,
    });

    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Редактировать группу"
      actions={
        <>
          <Button onClick={onClose} className={classes.cancelBtn}>Отмена</Button>
          <Button onClick={handleSave} className={classes.saveBtn}>Сохранить</Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Input
          label="Название группы"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Stack>
    </AppModal>
  );
}