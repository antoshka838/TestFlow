import React, { useState } from "react";
import {
  Checkbox,
  FormControlLabel,
  Stack,
} from "@mui/material";
import Button from "../../../UI/button/Button";
import Input from "../../../UI/Input/Input";
import Search from "../../../UI/search/Search";
import { useSearch } from "../../../../utils/hooks/useSearch";
import { users } from "../../../../utils/users";
import AppModal from "../../../UI/modal/AppModal";
import classes from "./createGroupModal.module.css"

export default function CreateGroupModal({ open, onClose, onCreate }) {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { search, setSearch, filteredData } = useSearch(users, "fullName");

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert("Введите название группы");
      return;
    }
    const newGroup = {
      id: Date.now(),
      name: groupName,
      users: selectedUsers,
      tests: [],
      usersCount: selectedUsers.length,
    };
    onCreate(newGroup);
    setGroupName("");
    setSelectedUsers([]);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Создать группу"
      actions={
        <>
          <Button onClick={onClose} className={classes.cancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleCreate} className={classes.saveBtn}>
            Создать
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Input
          label="Название группы"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
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
        </Stack>
      </Stack>
    </AppModal>
  );
}
