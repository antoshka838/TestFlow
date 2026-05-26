import classes from "./App.module.css";
import { BrowserRouter } from "react-router";
import Sidebar from "./components/UI/navbar/Sidebar";
import AppRouter from "./components/AppRouter";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/loginPage/LoginPage";

function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      {!user.isAuthenticated ? <LoginPage /> : <AppRouter />}
    </BrowserRouter>
  );
}

export default App;
