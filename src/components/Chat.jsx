import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./chat.css";

/* ─── Avatar color pool ─────────────────────── */
const AVATAR_COLORS = [
  "linear-gradient(135deg,#e53935,#b71c1c)",
  "linear-gradient(135deg,#1e88e5,#0d47a1)",
  "linear-gradient(135deg,#43a047,#1b5e20)",
  "linear-gradient(135deg,#8e24aa,#4a148c)",
  "linear-gradient(135deg,#fb8c00,#e65100)",
  "linear-gradient(135deg,#00acc1,#006064)",
  "linear-gradient(135deg,#6d4c41,#3e2723)",
];

/* Unwrap Go sql.NullString: {String:"...", Valid:true} or plain string */
function unwrap(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "object" && "String" in val) return val.Valid ? val.String : "";
  return String(val);
}

function getAvatarColor(name) {
  const safe = unwrap(name) || "?";
  const code = safe.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function Avatar({ name = "?", size = 30 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: getAvatarColor(name),
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.38,
        fontWeight: 800,
        color: "#fff",
        flexShrink: 0,
        fontFamily: "var(--font)",
        letterSpacing: -0.5,
      }}
    >
      {name[0]?.toUpperCase() || "?"}
    </div>
  );
}

/* ─── Format time ────────────────────────────── */
function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function fmtDate(iso) {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

/* ─── Main Chat Component ────────────────────── */
export default function Chat() {
  const { roomID } = useParams();
  const navigate = useNavigate();
  const currentUserID = localStorage.getItem("user_id");
  const currentUserName = localStorage.getItem("user_name") || "Me";

  const [roomInfo, setRoomInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [responders, setResponders] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [victimLocation, setVictimLocation] = useState(null);
  const [wsStatus, setWsStatus] = useState("connecting"); // connecting | online | offline
  const [showSidebar, setShowSidebar] = useState(true);

  const wsRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Auto-scroll ── */
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  /* ── Fetch helpers ── */
  async function fetchResponders() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://rescuenet-g41t.onrender.com/api/rooms/${roomID}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResponders(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("fetchResponders:", e);
    }
  }

  async function getLocationName(lat, lng) {
    if (!lat || !lng) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setLocationName(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } catch (e) {
      setLocationName(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  }

  async function fetchRoomInfo() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://rescuenet-g41t.onrender.com/api/rooms/${roomID}/info`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRoomInfo(data);
      getLocationName(data.Latitude, data.Longitude);
    } catch (e) {
      console.error("fetchRoomInfo:", e);
    }
  }

  async function fetchMessages() {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`https://rescuenet-g41t.onrender.com/api/rooms/${roomID}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setMessages(data || []);
      setTimeout(() => scrollToBottom(false), 80);
    } catch (e) {
      console.error("fetchMessages:", e);
    }
  }

  /* ── WebSocket ── */
  useEffect(() => {
    fetchRoomInfo();
    fetchMessages();
    fetchResponders();

    const token = localStorage.getItem("token");
    const ws = new WebSocket(
      `wss://rescuenet-g41t.onrender.com/ws/rooms/${roomID}?token=${token}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket Connected");

      setWsStatus("online");

      locationIntervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (
              !wsRef.current ||
              wsRef.current.readyState !== WebSocket.OPEN
            ) {
              return;
            }

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
    };

    ws.onmessage = (event) => {
      console.log("RAW WS:", event.data);

      const msg = JSON.parse(event.data);

      console.log("PARSED WS:", msg);

      if (msg.type === "location") {
        setVictimLocation({
          latitude: msg.latitude,
          longitude: msg.longitude,
        });
      } else {
        setMessages((prev) => {
          console.log("Adding message:", msg);
          return [...prev, msg];
        });
      }
    };

    ws.onerror = (err) => {
      console.log("WS ERROR", err);

      setWsStatus("offline");
    };

    ws.onclose = (event) => {
      console.log(
        "WebSocket Closed",
        event.code,
        event.reason
      );

      setWsStatus("offline");
    };
    return () => {
      clearInterval(locationIntervalRef.current);
      ws.close();
    };
  }, [roomID]);

  /* ── Send ── */
  function sendMessage() {
    if (!wsRef.current) {
      console.log("WebSocket ref is null");
      return;
    }

    console.log(
      "WS STATE:",
      wsRef.current.readyState
    );

    if (
      wsRef.current.readyState !== WebSocket.OPEN
    ) {
      console.log(
        "WebSocket not connected"
      );
      return;
    }

    if (content.trim() === "") {
      return;
    }

    const text = content.trim();

    wsRef.current.send(
      JSON.stringify({
        type: "chat",
        content: text,
      })
    );

    setContent("");
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  /* ── Group messages by date ── */
  const grouped = [];
  let lastDate = null;
  messages.forEach((msg, i) => {
    const msgDate = fmtDate(msg.CreatedAt);
    if (msgDate !== lastDate) {
      grouped.push({ type: "divider", label: msgDate, key: `div-${i}` });
      lastDate = msgDate;
    }
    grouped.push({ type: "message", msg, key: msg.ID || i });
  });

  /* ── WS status pill ── */
  const statusDot = wsStatus === "online"
    ? { color: "#00E676", label: "Live" }
    : wsStatus === "connecting"
      ? { color: "#FFB300", label: "Connecting…" }
      : { color: "#FF2D3B", label: "Reconnecting…" };

  return (
    <div className="chat-layout">

      {/* ══════════════════ SIDEBAR ══════════════════ */}
      {showSidebar && (
        <aside className="chat-sidebar">
          {/* Brand */}
          <div className="sidebar-header">
            <div className="sidebar-brand" onClick={() => navigate("/dashboard")}>
              <div className="sidebar-logo">🛡</div>
              <span className="sidebar-brand-name">
                Rescue<span>Net</span>
              </span>
            </div>

            {/* SOS Badge */}
            <div className="sidebar-sos-badge">
              <div className="sidebar-sos-dot" />
              <span className="sidebar-sos-label">🚨 Active Rescue</span>
              <span className="sidebar-sos-id">#{roomID?.slice(-4)}</span>
            </div>
          </div>

          {/* Responders */}
          <div className="sidebar-section-title">
            Responders · {responders.length}
          </div>

          <div className="sidebar-responders">
            {responders.length === 0 && (
              <div style={{ padding: "10px", fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                Waiting for responders…
              </div>
            )}
            {responders.map((r, i) => (
              <div key={r.UserID || i} className="responder-item">
                <div className="responder-avatar" style={{ background: getAvatarColor(unwrap(r.Name) || unwrap(r.UserName) || "?") }}>
                  {(unwrap(r.Name) || unwrap(r.UserName) || "?")[0]?.toUpperCase()}
                  <div className="responder-status-dot" />
                </div>
                <div>
                  <div className="responder-name">
                    {unwrap(r.Name) || unwrap(r.UserName) || "Volunteer"}
                  </div>
                  <div className="responder-role">
                    {r.Distance ? `${(r.Distance / 1000).toFixed(1)} km away` : "Responding"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigate button */}
          <button
            className="sidebar-navigate-btn"
            onClick={() =>
              roomInfo &&
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${roomInfo.Latitude},${roomInfo.Longitude}`,
                "_blank"
              )
            }
          >
            🧭 Navigate to Victim
          </button>
        </aside>
      )}

      {/* ══════════════════ MAIN ══════════════════ */}
      <div className="chat-main">

        {/* Header */}
        <div className="chat-header">
          {/* Sidebar toggle (mobile / hide) */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={{
              background: "var(--bg3)", border: "1px solid var(--border)",
              borderRadius: 9, width: 36, height: 36,
              display: "grid", placeItems: "center",
              cursor: "pointer", fontSize: 14, flexShrink: 0,
              color: "var(--text)",
            }}
          >
            ☰
          </button>

          {/* Title block */}
          <div className="chat-header-info">
            <div className="chat-header-title">
              <span>🚨</span>
              <span>Rescue Operation #{roomID?.slice(-6)}</span>
              {/* WS status */}
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "2px 9px", borderRadius: 20,
                background: wsStatus === "online" ? "rgba(0,230,118,0.1)" : "rgba(255,179,0,0.1)",
                border: `1px solid ${wsStatus === "online" ? "rgba(0,230,118,0.25)" : "rgba(255,179,0,0.25)"}`,
                fontSize: 10, fontFamily: "var(--mono)",
                color: statusDot.color,
                animation: wsStatus !== "online" ? "pulse 1.4s infinite" : "none",
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot.color, display: "inline-block" }} />
                {statusDot.label}
              </span>
            </div>
            <div className="chat-header-sub">
              📍 {locationName || "Fetching location…"} · {responders.length} active responders
            </div>
          </div>

          {/* Actions */}
          <div className="chat-header-actions">
            <button
              className="hdr-btn"
              onClick={() =>
                roomInfo &&
                window.open(
                  `https://www.google.com/maps/dir/?api=1&destination=${roomInfo.Latitude},${roomInfo.Longitude}`,
                  "_blank"
                )
              }
            >
              🧭 Navigate
            </button>
            <button className="hdr-btn sos" onClick={() => navigate("/create-alert")}>
              ⚡ New SOS
            </button>
            <button className="hdr-btn" onClick={() => navigate("/rooms")}>
              ← Rooms
            </button>
          </div>
        </div>

        {/* Location banner */}
        {victimLocation && (
          <div className="location-banner">
            <span>📍</span>
            <span>
              Victim location updated:{" "}
              <b>{victimLocation.latitude.toFixed(5)}, {victimLocation.longitude.toFixed(5)}</b>
            </span>
            <a
              onClick={() =>
                window.open(
                  `https://www.google.com/maps?q=${victimLocation.latitude},${victimLocation.longitude}`,
                  "_blank"
                )
              }
            >
              Open Map →
            </a>
          </div>
        )}

        {/* Messages */}
        <div className="chat-messages">
          {/* System welcome */}
          <div className="system-msg">
            <div className="system-msg-inner">
              🛡 RescueNet encrypted rescue channel · Rescue #{roomID?.slice(-6)}
            </div>
          </div>

          {grouped.length === 1 && (
            <div className="chat-empty">
              <div className="chat-empty-icon">💬</div>
              <div className="chat-empty-title">No messages yet</div>
              <div className="chat-empty-sub">
                Be the first to coordinate. Send a message to all responders in this rescue channel.
              </div>
            </div>
          )}

          {grouped.map((item) => {
            if (item.type === "divider") {
              return (
                <div key={item.key} className="date-divider">
                  <div className="date-divider-line" />
                  <div className="date-divider-label">{item.label}</div>
                  <div className="date-divider-line" />
                </div>
              );
            }

            const { msg } = item;
            const isMine =
              msg.SenderID === currentUserID || msg.SenderName?.String === currentUserName || msg._local;
            const senderName = isMine
              ? currentUserName
              : unwrap(msg.SenderName) || "Volunteer";

            return (
              <div key={item.key} className={`message-row ${isMine ? "mine" : "other"}`}>
                {/* Avatar shown for others */}
                {!isMine && <Avatar name={senderName} size={30} />}

                <div className={`message-bubble ${isMine ? "my-bubble" : "other-bubble"}`}>
                  {/* Sender name (hide for consecutive mine msgs) */}
                  <div className="sender-name">
                    {isMine ? "You" : senderName}
                  </div>

                  <div className="msg-content">{msg.Content}</div>

                  <div className="message-meta">
                    <span className="message-time">{fmtTime(msg.CreatedAt)}</span>
                    {isMine && (
                      <span className={`read-tick ${msg._local ? "sent" : "read"}`}>
                        {msg._local ? "✓" : "✓✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-wrapper">
          <div className="chat-input-container">
            <button className="input-emoji-btn">😊</button>

            <textarea
              ref={inputRef}
              className="chat-input"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Message rescue team…"
              rows={1}
            />

            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={content.trim() === ""}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
