import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function RowActionsGroups({ group, onDelete, onOpenTest }) {
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
            onOpenTest(group);
            handleClose();
          }}
        >
          Открыть тест
        </MenuItem>

        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(group);
            handleClose();
          }}
        >
          Удалить
        </MenuItem>
      </Menu>
    </>
  );
}
