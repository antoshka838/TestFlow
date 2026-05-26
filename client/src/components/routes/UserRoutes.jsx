import { Route, Routes, Navigate } from "react-router";
import UserProfilePage from "../../pagesForUsers/userProfilePage/userProgilePage";
import MainPage from "../../pagesForUsers/mainPage/MainPage";
import ErrorPage from "../../pages/ErrorPage";
import RespondentTestPage from "../../pagesForUsers/respondentTestPage/RespondentTestPage";
import EvaluationPage from "../../pagesForUsers/evaluationPage/EvaluationPage";
import MentalRotationTest from "../tests/mentalRotationTest/MentalRotationTest";
import MainLayout from "../MainLayout";

export default function UserRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/tests">
          <Route index element={<MainPage />} />
          <Route path=":id" element={<RespondentTestPage />} />
          <Route path=":id/evaluation" element={<EvaluationPage />} />
        </Route>
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="*" element={<ErrorPage />} />
        <Route path="/" element={<Navigate to={"/tests"} replace={true} />} />
      </Route>
      <Route path="/preview-mental/:id" element={<MentalRotationTest />} />
    </Routes>
  );
}
