import { useState, useRef } from "react";
import { Stack, Tabs, Tab, Box, Typography } from "@mui/material";
import AppModal from "../../../UI/modal/AppModal";
import Button from "../../../UI/button/Button";
import Input from "../../../UI/Input/Input";
import classes from "./addUserModal.module.css";
import { InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { $authHost } from "../../../../http";
import * as XLSX from "xlsx";

export default function AddUserModal({ open, onClose, onCreate }) {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setError("");
    }
  };

  const handleSave = async () => {
    setError("");

    if (tabValue === 0) {
      if (!formData.fullName || !formData.email || !formData.password) {
        setError("Пожалуйста, заполните все поля");
        return;
      }

      try {
        await $authHost.post("api/user/create", formData);
        setFormData({ fullName: "", email: "", password: "" });

        if (onCreate) {
          onCreate();
        }

        onClose();
      } catch (error) {
        setError(
          error.response?.data?.message || "Ошибка при создании пользователя",
        );
      }
    } else {
      if (!selectedFile) {
        setError("Выберите файл");
        return;
      }

      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "binary" });

          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          const usersArray = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];

            if (row.length === 0 || row[0] === "ФИО" || row[0] === "fullName") {
              continue;
            }

            if (row[0] && row[1] && row[2]) {
              usersArray.push({
                fullName: String(row[0]).trim(),
                email: String(row[1]).trim(),
                password: String(row[2]).trim(),
              });
            }
          }

          if (usersArray.length === 0) {
            setError("Файл пуст или не имеет неверный формат!");
            return;
          }

          const response = await $authHost.post("api/user/bulk", {
            users: usersArray,
          });

          setFileName("");
          setSelectedFile(null);
          if (onCreate) onCreate();
          onClose();

          alert(response.data.message);
        } catch (error) {
          console.error(error);
          setError(
            error.response?.data?.message || "Ошибка при обработке данных",
          );
        }
      };

      reader.onerror = () => setError("Ошибка при чтении файла");

      reader.readAsBinaryString(selectedFile);
    }
  };

  const handleClose = () => {
    setError("");
    setFileName("");
    setSelectedFile(null);
    onClose();
  };

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      title="Добавить респондента"
      actions={
        <>
          <Button onClick={handleClose} className={classes.cancelBtn}>
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
          onChange={(e, val) => {
            setTabValue(val);
            setError("");
          }}
          variant="fullWidth"
        >
          <Tab label="Вручную" />
          <Tab label="Загрузка файла" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: "200px" }}>
        {tabValue === 0 ? (
          <Stack spacing={2}>
            {error && <Typography color="error">{error}</Typography>}
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
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
              {fileName
                ? `Выбран файл: ${fileName}`
                : "Выберите файл формата .xlsx или .csv"}
            </Typography>

            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              id="file-input"
              style={{ display: "none" }}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            <Button onClick={() => fileInputRef.current.click()}>
              Обзор...
            </Button>

            <Typography variant="caption" color="textSecondary">
              Максимальный размер файла: 5МБ
            </Typography>
          </Stack>
        )}
      </Box>
    </AppModal>
  );
}
