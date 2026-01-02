import { useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";
import appRoutes from "@/configs/routes/Routes";
import User from "@/models/User";

const AppRoutesBuilder = () => {
  const { data } = useSelector((state) => state.auth);
  const user = new User(data);

  const buildRoute = (route) => {
    let redirect = null;
    const access = route.access || [];

    access.forEach((access) => {
      switch (access) {
        case "guest":
          if (data) redirect = "/home/main-view";
          break;
        case "auth":
          if (!data) redirect = "/login/session";
          break;
        default:
          if (!user?._permissions?.includes(access))
            redirect = "/access-denied";
          break;
      }
    });

    if (redirect) return <Navigate to={redirect} replace />;
    return route.element;
  };

  const displayRoutes = (routes) =>
    routes.map((item, index) => (
      <Route key={index} path={item.path} element={buildRoute(item)}>
        {item.children && displayRoutes(item.children)}
      </Route>
    ));

  return <Routes>{displayRoutes(appRoutes)}</Routes>;
};

export default AppRoutesBuilder;
