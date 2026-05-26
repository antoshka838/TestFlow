import React, { useEffect, useState } from "react";
import { Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import Button from "../../../UI/button/Button";
import Input from "../../../UI/Input/Input";
import Search from "../../../UI/search/Search";
import { useSearch } from "../../../../utils/hooks/useSearch";
import AppModal from "../../../UI/modal/AppModal";
import classes from "./createGroupModal.module.css";
import { $authHost } from "../../../../http";
import { useToast } from "../../../../context/ToastContext";

export default function CreateGroupModal({ open, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [errors, setErrors] = useState({});
  const [dbUsers, setDbUsers] = useState([]);
  const showToast = useToast();

  const fetchUsers = async () => {
    try {
      const response = await $authHost.get("api/user");
      setDbUsers(response.data);
    } catch (error) {
      console.error("Ошибка загрузки пользователей", error);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const { search, setSearch, filteredData } = useSearch(dbUsers, "fullName");

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreate = async () => {
    setErrors({});

    if (!groupName.trim()) {
      setErrors({ name: "Введите название группы" });
      return;
    }

    try {
      await $authHost.post("api/group", {
        name: groupName,
        userIds: selectedUsers,
      });

      setGroupName("");
      setSelectedUsers([]);
      setErrors({});

      if (onCreate) onCreate();
      showToast("Группа успешно создана!", "success");
      onClose();
    } catch (error) {
      showToast(error.response?.data?.message || "Ошибка при создании группы", "error");
    }
  };

  const handleClose = () => {
    setGroupName("");
    setSelectedUsers([]);
    setErrors({});
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Создать группу"
      actions={
        <>
          <Button onClick={handleClose} className={classes.cancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleCreate} className={classes.saveBtn}>
            Создать
          </Button>
        </>
      }
    >
      <Stack spacing={2} style={{ marginTop: "10px" }}>
        <Input
          label="Название группы"
          value={groupName}
          autoFocus
          onChange={(e) => {
            setGroupName(e.target.value);
            if (errors.name) {
              setErrors((prev) => ({ ...prev, name: null }));
            }
          }}
          error={!!errors.name}
          helperText={errors.name}
        />
        <Search
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", marginBottom: "8px" }}
        />
        <Stack>
          {filteredData.map((user) => (
            <FormControlLabel
              key={user.id}
              control={
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onChange={() => handleToggleUser(user.id)}
                />
              }
              label={user.fullName}
            />
          ))}
          {filteredData.length === 0 && (
            <Typography color="textSecondary">
              Пользователи не найдены
            </Typography>
          )}
        </Stack>
      </Stack>
    </AppModal>
  );
}