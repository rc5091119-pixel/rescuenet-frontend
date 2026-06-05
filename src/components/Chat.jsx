import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function Chat() {
  const { roomID } = useParams();
  const currentUserID = localStorage.getItem("user_id");
  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [locationName, setLocationName] = useState("");
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  async function getLocationName(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();

      console.log("Location Data:", data);

      setLocationName(data.display_name);
    } catch (err) {
      console.error("Location lookup failed:", err);
    }
  }

  useEffect(() => {
    fetchRoomInfo();
    fetchMessages();
    
    const token = localStorage.getItem("token");

    const ws = new WebSocket(
      `ws://localhost:8080/ws/rooms/${roomID}?token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      console.log("WS Message:", msg);

      setMessages((prev) => [...prev, msg]);
    };

    ws.onclose = () => {
      console.log("WebSocket Closed");
    };

    return () => {
      ws.close();
    };
  }, [roomID]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function fetchRoomInfo() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/rooms/${roomID}/info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

console.log("Room Info:", data);

setRoomInfo(data);

getLocationName(
  data.Latitude,
  data.Longitude
);
    } catch (err) {
      console.error("Failed to fetch room info:", err);
    }
  }

  async function fetchMessages() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://localhost:8080/api/rooms/${roomID}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Messages:", data);

      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }

  function sendMessage() {
    if (!wsRef.current) return;

    if (content.trim() === "") return;

    const text = content;

    wsRef.current.send(text);

    setMessages((prev) => [
      ...prev,
      {
        ID: Date.now().toString(),
        SenderName: {
          String: "Me",
          Valid: true,
        },
        Content: text,
      },
    ]);

    setContent("");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>🚑 Rescue Group Chat</h2>

      <div
        style={{
          padding: "12px",
          marginBottom: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>🚑 Rescue Group</h3>

        <p>
          <strong>Created By:</strong>{" "}
          {roomInfo?.CreatorName?.Valid
            ? roomInfo.CreatorName.String
            : "Unknown User"}
        </p>

        <p>
          <strong>📍 Alert Location:</strong>{" "}
          {locationName || "Loading location..."}
        </p>
        <button
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${roomInfo.Latitude},${roomInfo.Longitude}`,
              "_blank"
            )
          }
          style={{
            marginTop: "10px",
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          🧭 Navigate
        </button>
      </div>

      <div
        style={{
          height: "500px",
          overflowY: "auto",
          padding: "20px",
          marginBottom: "15px",
          borderRadius: "12px",
          backgroundColor: "#f8fafc",
          border: "1px solid #e2e8f0",
        }}
      >
        {messages.map((msg) => {
          const isMine =
            msg.SenderID === currentUserID ||
            msg.SenderName?.String === "Me";

          return (
            <div
              key={msg.ID}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  maxWidth: "60%",
                  minWidth: "120px",
                  backgroundColor: isMine ? "#2563eb" : "#f1f5f9",
                  color: isMine ? "white" : "black",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                }}
              >
                {!isMine && (
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      marginBottom: "4px",
                    }}
                  >
                    {msg.SenderName?.Valid
                      ? msg.SenderName.String
                      : "Unknown User"}
                  </div>
                )}

                <div>{msg.Content}</div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>

      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type message..."
        style={{
          width: "300px",
          marginRight: "10px",
        }}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default Chat;