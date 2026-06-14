import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [locationNames, setLocationNames] = useState({});
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);
  async function getLocationName(lat, lng, roomID) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );

      const data = await response.json();

      const location =
        `${data.address.suburb || ""}
       ${data.address.city || data.address.town || ""}
       ${data.address.state || ""}`;

      setLocationNames((prev) => ({
        ...prev,
        [roomID]: location,
      }));
    } catch (err) {
      console.error("Location lookup failed:", err);
    }
  }

  async function fetchRooms() {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://rescuenet-g41t.onrender.com/api/my-rooms",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("Rooms:", data);

      const roomsData = Array.isArray(data) ? data : [];

      setRooms(roomsData);

      roomsData.forEach((room) => {
        getLocationName(
          room.Latitude,
          room.Longitude,
          room.RoomID
        );
      });
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading rooms...</h2>;
  }

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      <h2
        style={{
          marginBottom: "25px",
          color: "#0f172a",
        }}
      >
        🚑 Active Rescue Groups
      </h2>
      <div
        style={{
          maxWidth: "700px",
          margin: "0 auto",
        }}
      ></div>
      {rooms.length === 0 ? (
        <p>No rooms found.</p>
      ) : (
        rooms.map((room) => (
          <div
            key={room.RoomID}
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              margin: "0 auto 20px auto",
              textAlign: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              border: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                color: "#111827",
              }}
            >
              🚑 Rescue Group
            </h3>

            <p style={{ color: "#111827" }}>
              <strong>Created By:</strong>{" "}
              {room.CreatorName?.Valid
                ? room.CreatorName.String
                : "Unknown"}
            </p>

            <p style={{ color: "#111827" }}>
              <strong>📍 Location:</strong>{" "}
              {locationNames[room.RoomID] ||
                "Loading location..."}
            </p>
            <button
              onClick={() =>
                navigate(`/chat/${room.RoomID}`)
              }
              style={{
                marginTop: "12px",
                padding: "12px 22px",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "15px",
              }}
            >
              Open Chat
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Rooms;