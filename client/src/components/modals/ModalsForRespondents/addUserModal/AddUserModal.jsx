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
import { useToast } from "../../../../context/ToastContext";

export default function AddUserModal({ open, onClose, onCreate }) {
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const showToast = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleCloseModal = () => {
    setErrors({});
    setFormData({ fullName: "", email: "", password: "" });
    setFileName("");
    setSelectedFile(null);
    setTabValue(0);
    onClose();
  };

  

  const handleSave = async () => {
    setErrors({});

    if (tabValue === 0) {
      const newErrors = {};
      let isValid = true;

      if (!formData.fullName.trim()) {
        newErrors.fullName = "ФИО обязательно";
        isValid = false;
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email обязателен";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Введите корректный email";
        isValid = false;
      }
      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Минимум 8 символов";
        isValid = false;
      }

      setErrors(newErrors);
      if (!isValid) return;

      try {
        await $authHost.post("api/user/create", formData);
        setFormData({ fullName: "", email: "", password: "" });

        if (onCreate) onCreate();
        showToast("Пользователь успешно создан!", "success");
        handleCloseModal();
      } catch (error) {
        showToast(
          error.response?.data?.message || "Ошибка при создании пользователя",
          "error",
        );
      }
    } else {
      if (!selectedFile) {
        showToast("Пожалуйста, выберите файл для загрузки", "error");
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

          const fileErrors = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];

            if (row.length === 0 || row[0] === "ФИО" || row[0] === "fullName") {
              continue;
            }

            const fullName = String(row[0] || "").trim();
            const email = String(row[1] || "").trim();
            const password = String(row[2] || "").trim();

            if (!fullName || !email || !password) {
              fileErrors.push(`Строка ${i + 1}: Заполнены не все поля`);
              continue;
            }

            if (!/\S+@\S+\.\S+/.test(email)) {
              fileErrors.push(
                `Строка ${i + 1}: Неверный формат email у "${fullName}"`,
              );
              continue;
            }

            if (password.length < 8) {
              fileErrors.push(
                `Строка ${i + 1}: Пароль у "${fullName}" меньше 8 символов`,
              );
              continue;
            }

            usersArray.push({ fullName, email, password });
          }

          if (fileErrors.length > 0) {
            const errorDisplay =
              fileErrors.length > 3
                ? fileErrors.slice(0, 3).join("\n") +
                  `\n...и еще ${fileErrors.length - 3} ошибок`
                : fileErrors.join("\n");

            showToast(`Исправьте ошибки в файле:\n${errorDisplay}`, "error");
            return;
          }

          if (usersArray.length === 0) {
            showToast("Файл пуст или имеет неверный формат!", "error");
            return;
          }

          const response = await $authHost.post("api/user/bulk", {
            users: usersArray,
          });

          setFileName("");
          setSelectedFile(null);
          if (onCreate) onCreate();

          if (response.data.errors && response.data.errors.length > 0) {
            showToast(
              `Загружено частично. Дубликатов пропущено: ${response.data.errors.length}`,
              "warning",
            );
          } else {
            showToast(
              response.data.message || "Пользователи успешно загружены!",
              "success",
            );
          }

          handleCloseModal();
        } catch (error) {
          console.error(error);
          showToast(
            error.response?.data?.message ||
              "Ошибка при обработке данных из файла",
            "error",
          );
        }
      };

      reader.onerror = () => showToast("Ошибка при чтении файла", "error");

      reader.readAsBinaryString(selectedFile);
    }
  };
  
  return (
    <AppModal
      open={open}
      onClose={handleCloseModal}
      title="Добавить респондента"
      actions={
        <>
          <Button onClick={handleCloseModal} className={classes.cancelBtn}>
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
            setErrors({});
          }}
          variant="fullWidth"
        >
          <Tab label="Вручную" />
          <Tab label="Загрузка файла" />
        </Tabs>
      </Box>

      <Box sx={{ minHeight: "200px" }}>
        {tabValue === 0 ? (
          <Stack
            spacing={3}
            style={{ paddingBottom: "20px", marginBottom: "-20px" }}
          >
            <Input
              label="ФИО"
              name="fullName"
              autoFocus
              value={formData.fullName}
              onChange={handleInputChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
            />
            <Input
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              error={!!errors.email}
              helperText={errors.email}
            />
            <Input
              label="Пароль"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleInputChange}
              error={!!errors.password}
              helperText={errors.password}
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

            <Typography
              variant="body1"
              color="textSecondary"
              align="center"
              px={2}
            >
              Файл должен иметь столбцы в порядке: <br />{" "}
              <strong>ФИО, электронная почта, пароль</strong>
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
