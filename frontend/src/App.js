import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import Admin from "./pages/Admin";


// 🔐 Route protégée utilisateur connecté
function PrivateRoute({ children }) {
  const userId = localStorage.getItem("user_id");

  return userId ? children : <Navigate to="/" />;
}


// 👑 Route admin seulement
function AdminRoute({ children }) {
  const role = localStorage.getItem("role");

  return role === "admin"
    ? children
    : <Navigate to="/profile" />;
}

function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Connecté seulement */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        {/* Admin seulement */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;