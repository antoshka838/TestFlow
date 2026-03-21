import ErrorPage from "../pages/ErrorPage";
import AdminRoutes from "./routes/AdminRoutes";
import UserRoutes from "./routes/UserRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import { useAuth } from "../context/AuthContext";

export default function AppRouter() {
  const { user } = useAuth();

  if(!user.isAuthenticated){
    return <PublicRoutes/>
  }

  if (user.role === "ADMIN") {
    return <AdminRoutes />;
  }

  if (user.role === "USER") {
    return <UserRoutes />;
  }

  return <ErrorPage/>
}
