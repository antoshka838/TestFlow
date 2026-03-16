import { useState } from "react";
import { Stack, Tabs, Tab, Box, Typography } from "@mui/material";
import AppModal from "../../../UI/modal/AppModal";
import Button from "../../../UI/button/Button";
import Input from "../../../UI/Input/Input";
import classes from "./addUserModal.module.css";

export default function AddUserModal({ open, onClose }) {
  const [tabValue, setTabValue] = useState(0); 
  const [fileName, setFileName] = useState(""); 


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleSave = () => {
    if (tabValue === 0) {
      console.log("Данные из инпутов:", formData);
    } else {
      console.log("Файл для отправки:", fileName);
    }

    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Добавить респондента"
      actions={
        <>
          <Button onClick={onClose} className={classes.cancelBtn}>
            Отмена
          </Button>
          <Button onClick={handleSave} className={classes.saveBtn}>
            Сохранить
          </Button>
        </>
      }
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          variant="fullWidth"
        >
          <Tab label="Вручную" />
          <Tab label="Загрузка файла" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: "200px" }}>
        {tabValue === 0 ? (
          <Stack spacing={2}>
            <Input
              label="ФИО"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <Input
              label="Пароль"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </Stack>
        ) : (
          <Stack
            spacing={2}
            alignItems="center"
            justifyContent="center"
            className={classes.fileUploadContainer}
            sx={{
              py: 4,
              border: "2px dashed #ccc",
              borderRadius: 2,
              backgroundColor: "#fafafa",
            }}
          >
            <Typography variant="body1" color="textSecondary">
              {fileName ? `Выбран файл: ${fileName}` : "Выберите файл формата .xlsx или .csv"}
            </Typography>
            
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              id="file-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <label htmlFor="file-input">
              <Button component="span" variant="outlined">
                Обзор...
              </Button>
            </label>
            
            <Typography variant="caption" color="textSecondary">
              Максимальный размер файла: 5МБ
            </Typography>
          </Stack>
        )}
      </Box>
    </AppModal>
  );
}