import { useState } from "react";

function CreateAlert() {
  const [loading, setLoading] = useState(false);

  async function handleAlert() {
    const token = localStorage.getItem("token");
    console.log("TOKEN =", token);

    setLoading(true);

    try {
      const response = await fetch(
        "https://rescuenet-g41t.onrender.com/api/alerts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(data);

      alert("🚨 Emergency Alert Created!");
    } catch (err) {
      console.error(err);
      alert("Failed to Create Alert");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "80vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "500px",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            marginBottom: "10px",
            color: "#dc2626",
          }}
        >
          🚨 Emergency Alert
        </h1>

        <p
          style={{
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Send an emergency alert to nearby volunteers.
        </p>

        <button
          onClick={handleAlert}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#dc2626",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Sending..."
            : "🚨 Send Emergency Alert"}
        </button>
      </div>
    </div>
  );
}

export default CreateAlert;