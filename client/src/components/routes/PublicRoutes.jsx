import { Route, Routes ,Navigate } from "react-router";
import LoginPage from "../../pages/loginPage/LoginPage";

export default function PublicRoutes(){
  return(
    <Routes>
      <Route path="/login" element={<LoginPage/>}/>
      <Route path="*" element={<Navigate to="/login" replace/>} />
    </Routes>
  )
}