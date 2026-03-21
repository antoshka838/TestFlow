import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function RowActionsRespondents({ user, onDelete, onAddGroup, onOpenTest }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    event?.stopPropagation();
    setAnchorEl(null);
  };
  return (
    <>
      <IconButton onClick={handleOpen}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onAddGroup(user);
            handleClose();
          }}
        >
          Добавить в группу
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onOpenTest(user);
            handleClose();
          }}
        >
          Открыть тест
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user);
            handleClose();
          }}
        >
          Удалить
        </MenuItem>
      </Menu>
    </>
  );
}
