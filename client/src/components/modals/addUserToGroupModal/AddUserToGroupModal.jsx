import { useState } from "react";
import { Checkbox, FormControlLabel, Stack } from "@mui/material";
import Button from "../../UI/button/Button";
import Search from "../../UI/search/Search";
import { useSearch } from "../../../utils/hooks/useSearch";
import AppModal from "../../UI/modal/AppModal";
import classes from "./addUserToGroupModal.module.css";

export default function AddUserToGroupModal({ open, onClose, onAdd, users }) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { search, setSearch, filteredData } = useSearch(users, "fullName");

  const handleToggleUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAdd = () => {
    onAdd(selectedUsers);
    setSelectedUsers([]);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Добавить пользователей в группу"
      actions={
        <>
          <Button onClick={onClose} className={classes.cancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleAdd} className={classes.saveBtn}>
            Добавить
          </Button>
        </>
      }
    >
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
    </AppModal>
  );
}