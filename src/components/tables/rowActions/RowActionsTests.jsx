import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function RowActionsTests({ test, onOpenGroup, onOpenUser, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (e) => {
    e?.stopPropagation();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <MoreVertIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={(e) => { handleClose(e); onOpenGroup(test); }}>
          Открыть группе
        </MenuItem>

        <MenuItem onClick={(e) => { handleClose(e); onOpenUser(test); }}>
          Открыть респонденту
        </MenuItem>

        <MenuItem 
          onClick={(e) => { handleClose(e); onDelete(test); }}
        >
          Удалить
        </MenuItem>
      </Menu>
    </>
  );
}