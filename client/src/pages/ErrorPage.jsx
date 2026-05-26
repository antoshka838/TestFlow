import React from 'react'
import Header from "../components/UI/header/Header";
import errorImg from "../assets/image9.png"
import Button from '../components/UI/button/Button';
import { useNavigate } from 'react-router';

export default function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div style={{display: "flex", justifyContent: "center", alignItems: "center", height: "80dvh", gap: "48px", flexDirection: "column"}}>
      <img src={errorImg} alt="Ошибка" />
      <div style={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", fontSize: "48px", fontWeight: "bold"}}>
        <p>404</p>
        <p>Упс, что-то пошло не так</p>
      </div>
      <Button onClick={() => navigate(-1)}>
        Вернуться назад
      </Button>
    </div>
  )
}
