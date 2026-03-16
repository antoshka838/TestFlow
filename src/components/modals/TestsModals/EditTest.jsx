import React, { useState } from "react";
import AppModal from "../../UI/modal/AppModal";
import Button from "../../UI/button/Button";
import classes from "../addUserToGroupModal/addUserToGroupModal.module.css";
import styled from "./createNewTest/style.module.css";
import Input from "../../UI/Input/Input";

export default function EditTest({ open, onClose, onCreate }) {
  const [testData, setTestData] = useState({
    title: "",
    description: "",
    link: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestData((prev) => ({ ...prev, [name]: value }));
  };
  return (
    <div>
      <AppModal
        open={open}
        onClose={onClose}
        title="Редактировать тест"
        actions={
          <>
            <Button onClick={onClose} className={classes.cancelBtn}>
              Отмена
            </Button>
            <Button onClick={onClose} className={classes.saveBtn}>
              Сохранить
            </Button>
          </>
        }
      >
        <div className={styled.cardWrapper}>
          <Input
            label="Название теста"
            name="testTitle"
            value={testData.title}
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
            name="link"
            value={testData.link}
            onChange={handleChange}
          />
        </div>
      </AppModal>
    </div>
  );
}
