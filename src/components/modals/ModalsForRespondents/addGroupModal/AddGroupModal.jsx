import {
  Checkbox,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { useState } from "react";
import Button from "../../../UI/button/Button";
import Search from "../../../UI/search/Search";
import { useSearch } from "../../../../utils/hooks/useSearch";
import classes from "./addGroupModal.module.css";
import AppModal from "../../../UI/modal/AppModal";

export default function AddGroupModal({ open, onClose, onAdd, groups }) {
  const [selectedGroups, setSelectedGroups] = useState([]);
  const { search, setSearch, filteredData } = useSearch(groups, "name");

  const handleToggleGroup = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  const handleAdd = () => {
    onAdd(selectedGroups);
    setSelectedGroups([]);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={"Добавить в группу"}
      actions={
        <>
          <Button onClick={onClose} className={classes.cancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleAdd} className={classes.saveBtn}>
            Сохранить
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
        {filteredData.map((group) => (
          <FormControlLabel
            key={group.id}
            control={
              <Checkbox
                checked={selectedGroups.includes(group.id)}
                onChange={() => handleToggleGroup(group.id)}
              />
            }
            label={group.name}
          />
        ))}
      </Stack>
    </AppModal>
  );
}
