import { Route, Routes } from "react-router";
import Dashboard from "../../pages/dashboard/Dashboard";
import Tests from "../../pages/tests/Tests";
import Groups from "../../pages/groups/Groups";
import Respondents from "../../pages/respondents/Respondents";
import Statistics from "../../pages/Statistics/Statistics";
import Profile from "../../pages/profile/Profile";
import ErrorPage from "../../pages/ErrorPage";
import GroupDetailedData from "../../pages/groups/GroupDetailedData";
import RespondentsDetailedInfo from "../../pages/respondents/RespondentsDetailedInfo";
import TestResults from "../../pages/respondents/TestResults";
import TestDetailedInfo from "../../pages/tests/TestDetailedInfo";
import MainLayout from "../MainLayout";
import DetailedStatistics from "../../pages/Statistics/DetailedStatistics";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/statistics">
          <Route index element={<Statistics />} />
          <Route path="/statistics/:id" element={<DetailedStatistics/>}/>
        </Route>

        <Route path="/tests">
          <Route index element={<Tests />} />
          <Route path=":testId" element={<TestDetailedInfo />} />
        </Route>

        <Route path="/groups">
          <Route index element={<Groups />} />
          <Route path=":id" element={<GroupDetailedData />} />
        </Route>

        <Route path="/respondents">
          <Route index element={<Respondents />} />
          <Route path=":id" element={<RespondentsDetailedInfo />} />
          <Route path=":id/tests/:testId" element={<TestResults />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Routes>
  );
}
