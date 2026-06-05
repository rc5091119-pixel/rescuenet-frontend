import { useEffect, useState } from "react";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "http://localhost:8080/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Notifications:", data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }

  async function acceptAlert(alertID) {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/alerts/${alertID}/accept`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to accept");
        return;
      }

      alert(data.message);

      fetchNotifications();
    } catch (err) {
      console.error(err);
      alert("Failed to accept alert");
    }
  }

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading Notifications...
      </h2>
    );
  }

  return (
    <div
      style={{
        padding: "30px",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        🔔 Emergency Notifications
      </h2>

      {notifications.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            color: "#64748b",
          }}
        >
          No active notifications.
        </div>
      ) : (
        notifications.map((notification) => (
          <div
            key={notification.ID}
            style={{
              maxWidth: "700px",
              margin: "0 auto 20px auto",
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow:
                "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                color: "#dc2626",
                marginTop: 0,
              }}
            >
              🚨 Emergency Alert
            </h3>

            <p>
              <strong>Created By:</strong>{" "}
              {notification.CreatorName?.Valid
                ? notification.CreatorName.String
                : "Unknown User"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {notification.Status}
            </p>

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "10px",
              }}
            >
              <button
                disabled={
                  notification.Status === "accepted"
                }
                onClick={() =>
                  acceptAlert(notification.AlertID)
                }
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor:
                    notification.Status === "accepted"
                      ? "#94a3b8"
                      : "#16a34a",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {notification.Status === "accepted"
                  ? "✅ Accepted"
                  : "Accept Alert"}
              </button>

              <button
                onClick={() =>
                  console.log(notification)
                }
                style={{
                  padding: "12px 20px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor: "#2563eb",
                  color: "white",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                🧭 Navigate
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Notifications;