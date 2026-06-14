import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {

    try {
      const response = await fetch(
        "https://rescuenet-g41t.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
       console.log(data);
       
      if (!response.ok) {
        alert(data.error);
        return;
      }

      localStorage.setItem("user_id", data.id);
      localStorage.setItem("user_name", data.name);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login Failed");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg, #0f172a 0%, #020617 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "#111827",
          borderRadius: "24px",
          padding: "50px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
          border: "1px solid #1e293b",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              color: "#2563eb",
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            🚑 RescueNet
          </div>

          <div
            style={{
              marginBottom: "25px",
            }}
          >
            <h1
              style={{
                color: "white",
                fontSize: "42px",
                fontWeight: "800",
                margin: "0",
                lineHeight: "1",
              }}
            >
              WELCOME
            </h1>

            <h1
              style={{
                color: "#2563eb",
                fontSize: "42px",
                fontWeight: "800",
                margin: "0",
                lineHeight: "1",
              }}
            >
              BACK
            </h1>
          </div>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "15px",
            }}
          >
            Secure access to emergency response network
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              color: "#cbd5e1",
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "white",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "30px" }}>
          <label
            style={{
              color: "#cbd5e1",
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "white",
              fontSize: "15px",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "16px",
            border: "none",
            borderRadius: "14px",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          SIGN IN
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: "30px",
          }}
        >
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            style={{
              color: "#2563eb",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;