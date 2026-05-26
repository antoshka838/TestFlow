import React, { useState, useEffect } from "react";
import AppModal from "../../UI/modal/AppModal";
import Button from "../../UI/button/Button";
import classes from "../addUserToGroupModal/addUserToGroupModal.module.css";
import styled from "./createNewTest/style.module.css";
import Input from "../../UI/Input/Input";

export default function EditTest({ open, onClose, test, onSave }) {
  const [testData, setTestData] = useState({
    name: "",
    description: "",
    externalUrl: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (test) {
      setTestData({
        name: test.name || "",
        description: test.description || "",
        externalUrl: test.externalUrl || "",
      });
      setErrors({});
    }
  }, [test, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData((prev) => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveClick = () => {
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

    onSave(testData);
  };

  const handleCloseModal = () => {
    setErrors({});
    if (test) {
      setTestData({
        name: test.name || "",
        description: test.description || "",
        externalUrl: test.externalUrl || "",
      });
    }
    onClose();
  };

  return (
    <div>
      <AppModal
        open={open}
        onClose={handleCloseModal}
        title="Редактировать тест"
        actions={
          <>
            <Button onClick={handleCloseModal} className={classes.cancelBtn}>
              Отмена
            </Button>
            <Button onClick={handleSaveClick} className={classes.saveBtn}>
              Сохранить
            </Button>
          </>
        }
      >
        <div className={styled.cardWrapper} style={{ marginTop: "10px", gap: "25px" }}>
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