import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export default function AppModal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = "sm",
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: "15px"},
        },
      }}
    >
      <DialogTitle sx={{ padding: "16px", paddingBottom: "0"}}>{title}</DialogTitle>

      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ padding: "16px" }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{ padding: "16px", justifyContent: "space-between", gap: "16px" }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}