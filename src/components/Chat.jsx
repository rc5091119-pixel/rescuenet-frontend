import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

function Chat() {
  const { roomID } = useParams();
  const currentUserID = localStorage.getItem("user_id");
  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [responders, setResponders] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [victimLocation, setVictimLocation] =
    useState(null);
  const wsRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  async function fetchResponders() {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `http://localhost:8080/api/rooms/${roomID}/locations`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    setResponders(Array.isArray(data) ? data : []);
  }

  async function getLocationName(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();

      console.log("Location Data Full:", JSON.stringify(data, null, 2));

      setLocationName(
        data.display_name
      );
    } catch (err) {
      console.error("Location lookup failed:", err);
    }
  }
  useEffect(() => {
    fetchRoomInfo();
    fetchMessages();
    fetchResponders();

    const token = localStorage.getItem("token");

    const ws = new WebSocket(
      `ws://localhost:8080/ws/rooms/${roomID}?token=${token}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      locationIntervalRef.current = setInterval(() => {

        navigator.geolocation.getCurrentPosition(
          (position) => {

            if (!wsRef.current) return;

            wsRef.current.send(
              JSON.stringify({
                type: "location",
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              })
            );

          },
          (err) => console.log(err)
        );

      }, 10000);
      console.log("WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "location") {
        setVictimLocation({
          latitude: msg.latitude,
          longitude: msg.longitude,
        });
      } else {
        setMessages((prev) => [...prev, msg]);
      }
    };
    ws.onclose = () => {
      console.log("WebSocket Closed");
    };

    return () => {
      clearInterval(locationIntervalRef.current);
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

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        content: text,
      })
    );

    setMessages((prev) => [
      ...prev,
      {
        ID: Date.now().toString(),
        SenderName: {
          String: "Me",
          Valid: true,
        },
        Content: text,
        CreatedAt: new Date().toISOString(),
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
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            backgroundColor: "white",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
          }}
        >
          <strong>
            👥 Active Responders ({responders.length})
          </strong>

          {responders.length === 0 ? (
            <p style={{ marginTop: "8px" }}>
              No responders found
            </p>
          ) : (
            responders.map((r) => (
              <div key={r.ID}>
                🟢 {r.Name?.Valid
                  ? r.Name.String
                  : "Unknown User"}
              </div>
            ))
          )}
        </div>

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
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                  }}
                >
                  {isMine
                    ? "Me"
                    : (
                      msg.SenderName?.Valid
                        ? msg.SenderName.String
                        : "Unknown User"
                    )}
                </div>

                <div>{msg.Content}</div>

                <div
                  style={{
                    fontSize: "11px",
                    color: isMine
                      ? "#dbeafe"
                      : "#64748b",
                    marginTop: "6px",
                    textAlign:
                      msg.SenderID === currentUserID
                        ? "right"
                        : "left",
                  }}
                >
                  {new Date(msg.CreatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef}></div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginTop: "15px",
        }}
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          style={{
            flex: 1,
            padding: "14px 18px",
            borderRadius: "14px",
            border: "1px solid #cbd5e1",
            outline: "none",
            fontSize: "15px",
            backgroundColor: "white",
            color: "#0f172a",
            caretColor: "#2563eb",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            border: "none",
            borderRadius: "14px",
            padding: "14px 22px",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "15px",
          }}
        >
          ➤
        </button>
      </div>
    </div>

  );
}

export default Chat;