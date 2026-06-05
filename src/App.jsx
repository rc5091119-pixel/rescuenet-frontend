import ProtectedRoute from "./components/ProtectedRoute";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";

import Register from "./components/Register";
import Login from "./components/Login";
import Location from "./components/Location";
import CreateAlert from "./components/CreateAlert";
import Notifications from "./components/Notifications";
import Rooms from "./components/Rooms";
import Chat from "./components/Chat";

function Navbar() {
  const navigate = useNavigate();

  const userName = localStorage.getItem("user_name");
  const token = localStorage.getItem("token");

  const navLinkStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "15px",
  };

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("user_name");

    navigate("/login");
  }

  return (
    <nav
      style={{
        backgroundColor: "#0f172a",
        color: "white",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          fontSize: "24px",
          fontWeight: "bold",
        }}
      >
        🚑 RescueNet
      </div>

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          gap: "25px",
          alignItems: "center",
        }}
      >
        {token ? (
          <>
            <Link
              to="/location"
              style={navLinkStyle}
            >
              📍 Location
            </Link>

            <Link
              to="/create-alert"
              style={navLinkStyle}
            >
              🚨 Alert
            </Link>

            <Link
              to="/notifications"
              style={navLinkStyle}
            >
              🔔 Notifications
            </Link>

            <Link
              to="/rooms"
              style={navLinkStyle}
            >
              👥 Groups
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={navLinkStyle}
            >
              Login
            </Link>

            <Link
              to="/register"
              style={navLinkStyle}
            >
              Register
            </Link>
          </>
        )}
      </div>

      {/* User Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {token && (
          <>
            <span>{userName || "User"}</span>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/location"
          element={
            <ProtectedRoute>
              <Location />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-alert"
          element={
            <ProtectedRoute>
              <CreateAlert />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rooms"
          element={
            <ProtectedRoute>
              <Rooms />
            </ProtectedRoute>
          }
        />

        <Route
          path="/chat/:roomID"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;