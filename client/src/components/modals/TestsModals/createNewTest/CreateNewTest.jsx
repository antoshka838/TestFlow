import React, { useState } from "react";
import AppModal from "../../../UI/modal/AppModal";
import Button from "../../../UI/button/Button";
import classes from "../../addUserToGroupModal/addUserToGroupModal.module.css";
import styled from "./style.module.css";
import Input from "../../../UI/Input/Input";
import { $authHost } from "../../../../http";
import { useToast } from "../../../../context/ToastContext";

export default function CreateNewTest({ open, onClose, onSuccess }) {
  const [testData, setTestData] = useState({
    name: "",
    description: "",
    externalUrl: "",
  });

  const [errors, setErrors] = useState({});
  const showToast = useToast(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleCreate = async () => {
    const newErrors = {};
    let isValid = true;

    if (!testData.name.trim()) {
      newErrors.name = "Введите название теста";
      isValid = false;
    }
    if (!testData.externalUrl.trim()) {
      newErrors.externalUrl = "Укажите ссылку на тест";
      isValid = false;
    }

    setErrors(newErrors);

    if (!isValid) return;

    try {
      await $authHost.post("api/test", testData);
      
      setTestData({ name: "", description: "", externalUrl: "" });
      setErrors({});
      
      if (onSuccess) {
        onSuccess();
      }
      
      showToast("Тест успешно создан!", "success"); 
      onClose();
    } catch (error) {
      showToast(error.response?.data?.message || "Ошибка при создании теста", "error"); 
    }
  };

  const handleCloseModal = () => {
    setTestData({ name: "", description: "", externalUrl: "" });
    setErrors({});
    onClose();
  };

  return (
    <div>
      <AppModal
        open={open}
        onClose={handleCloseModal}
        title="Создать тест"
        actions={
          <>
            <Button onClick={handleCloseModal} className={classes.cancelBtn}>
              Отмена
            </Button>
            <Button onClick={handleCreate} className={classes.saveBtn}>
              Создать
            </Button>
          </>
        }
      >
        <div className={styled.cardWrapper} style={{ marginTop: "10px" }}>
          <Input
            label="Название теста"
            name="name"
            autoFocus
            value={testData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <Input
            label="Описание теста (необязательно)"
            name="description"
            value={testData.description}
            onChange={handleChange}
            multiline
            rows={6}
          />
          <Input
            label="Ссылка на тест"
            name="externalUrl"
            value={testData.externalUrl}
            onChange={handleChange}
            error={!!errors.externalUrl}
            helperText={errors.externalUrl}
          />
        </div>
      </AppModal>
    </div>
  );
}