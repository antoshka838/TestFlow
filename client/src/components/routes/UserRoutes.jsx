import { Route, Routes, Navigate } from "react-router";
import Profile from "../../pages/profile/Profile";
import ErrorPage from "../../pages/ErrorPage";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/profile" element={<Profile />} />
      <Route path="/my-tests" element={<div>Список доступных тестов</div>} />
      <Route path="/" element={<Navigate to="/my-tests" replace />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}