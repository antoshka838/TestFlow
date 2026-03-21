import { useState } from "react";
import AppModal from "../../UI/modal/AppModal";
import Button from "../../UI/button/Button";
import classes from "../addUserToGroupModal/addUserToGroupModal.module.css";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  children,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <Button
            onClick={onClose}
            className={classes.cancelBtn}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            onClick={handleConfirm}
            className={classes.saveBtn}
            disabled={isLoading}
          >
            {isLoading ? "Удаление..." : "Удалить"}
          </Button>
        </>
      }
    >{children}</AppModal>
  );
}
