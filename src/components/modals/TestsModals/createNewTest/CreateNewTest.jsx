import React, { useState } from "react";
import AppModal from "../../../UI/modal/AppModal";
import Button from "../../../UI/button/Button";
import classes from "../../addUserToGroupModal/addUserToGroupModal.module.css";
import styled from "./style.module.css";
import Input from "../../../UI/Input/Input";
import { $authHost } from "../../../../http";

export default function CreateNewTest({ open, onClose, onSuccess }) {
  const [testData, setTestData] = useState({
    name: "",
    description: "",
    externalUrl: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleCreate = async () => {
    if (!testData.name || !testData.externalUrl) {
      setError("Название теста и описание обязательны!");
      return;
    }

    try {
      await $authHost.post("api/test", testData);
      setTestData({ name: "", description: "", externalUrl: "" });
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || "Ошибка при создании теста");
    }
  };

  return (
    <div>
      <AppModal
        open={open}
        onClose={onClose}
        title="Создать тест"
        actions={
          <>
            <Button onClick={onClose} className={classes.cancelBtn}>
              Отмена
            </Button>
            <Button onClick={handleCreate} className={classes.saveBtn}>
              Создать
            </Button>
          </>
        }
      >
        {error && (
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        )}
        <div className={styled.cardWrapper}>
          <Input
            label="Название теста"
            name="name"
            value={testData.name}
            onChange={handleChange}
          />
          <Input
            label="Описание теста"
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
          />
        </div>
      </AppModal>
    </div>
  );
}
