import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Location() {
  const navigate = useNavigate();
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loading, setLoading] = useState(false);

  async function detectLocation() {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setLat(latitude);
        setLng(longitude);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          const address = data.address;

          setLocationName(
            `${address.suburb || ""}, ${address.city || address.town || ""}, ${address.state || ""}`
          );
        } catch (err) {
          console.log(err);
        }
      },
      (err) => {
        console.log(err);
        alert(
          "Please allow location access to use RescueNet."
        );
      }
    );
  }

  async function handleLocation() {
    const token = localStorage.getItem("token");

    setLoading(true);

    try {
      const response = await fetch(
        "https://rescuenet-g41t.onrender.com/api/location",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lat: Number(lat),
            lng: Number(lng),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Location update failed");
      }

      const data = await response.json();

      console.log(data);

      alert("📍 Location Updated!");

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Location Update Failed");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    detectLocation();
  }, []);

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
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "10px",
          }}
        >
          📍 Update Location
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "25px",
          }}
        >
          Keep your location updated so nearby
          emergency alerts can reach you.
        </p>

        <div
          style={{
            background: "#f1f5f9",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "20px",
            maxHeight: "150px",
            overflowY: "auto",
          }}
        >
          <strong>Current Location:</strong>

          <p
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "normal",
              lineHeight: "1.5",
              color: "#111827",
            }}
          >
            {locationName || "Detecting location..."}
          </p>
        </div>

        <button
          onClick={detectLocation}
          style={{
            width: "100%",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: "1px solid #2563eb",
            background: "white",
            color: "#2563eb",
            cursor: "pointer",
          }}
        >
          📍 Detect Again
        </button>


        <button
          onClick={handleLocation}
          disabled={loading || lat === null || lng === null}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#2563eb",
            color: "white",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Updating..."
            : "📍 Update Location"}
        </button>
      </div>
    </div>
  );
}

export default Location;