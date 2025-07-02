import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const routes = [
  { path: "/", element: <HomePage /> },
  { path: "/logowanie", element: <AuthPage /> },
];

export default routes;
