import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister() {
    try {
      const response = await fetch(
        "https://rescuenet-g41t.onrender.com/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
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

      alert("User Created Successfully!");
    } catch (err) {
      console.error(err);
      alert("Registration Failed");
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

          <h1
            style={{
              color: "white",
              margin: "0",
              lineHeight: "1.1",
              fontSize: "42px",
              fontWeight: "800",
            }}
          >
            JOIN THE
          </h1>

          <h1
            style={{
              color: "#2563eb",
              margin: "0 0 15px 0",
              lineHeight: "1.1",
              fontSize: "42px",
              fontWeight: "800",
            }}
          >
            NETWORK
          </h1>

          <p
            style={{
              color: "#94a3b8",
              marginTop: "15px",
            }}
          >
            Become a volunteer responder today
          </p>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              color: "#cbd5e1",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              color: "#cbd5e1",
              display: "block",
              marginBottom: "8px",
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
            }}
          >
            Password
          </label>

          <input
            type="password"
            placeholder="Create password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #334155",
              backgroundColor: "#0f172a",
              color: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleRegister}
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
          CREATE ACCOUNT
        </button>

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            marginTop: "30px",
          }}
        >
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#2563eb",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;