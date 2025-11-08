// import { MessageSquare, Package, Phone, User, Map } from "lucide-react";
// import { MessageSquare, Phone } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const MapView = () => {
  const products = [
    {
      id: 1,
      name: "Riz Premium",
      type: "Grain",
      quantity: 500,
      unit: "kg",
      price: 2500,
      date: "2025-01-15",
      image: "🌾",
      location: "Analamanga",
      lat: -18.8792,
      lng: 47.5079,
      farmer: "Jean Rakoto",
      phone: "034 12 345 67",
    },
    {
      id: 2,
      name: "Maïs Bio",
      type: "Grain",
      quantity: 300,
      unit: "kg",
      price: 1800,
      date: "2025-01-20",
      image: "🌽",
      location: "Vakinankaratra",
      lat: -19.4,
      lng: 46.95,
      farmer: "Marie Rasoa",
      phone: "033 98 765 43",
    },
    {
      id: 3,
      name: "Haricots Secs",
      type: "Légumineuse",
      quantity: 200,
      unit: "kg",
      price: 3200,
      date: "2025-01-18",
      image: "🫘",
      location: "Analamanga",
      lat: -18.95,
      lng: 47.52,
      farmer: "Paul Randria",
      phone: "032 55 444 33",
    },
  ];

  const navigate = useNavigate();
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  const createEmojiIcon = (emoji: string) =>
    L.divIcon({
      html: `<div style="
        font-size: 28px;
        background: white;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #16a34a;
        box-shadow: 0 0 6px rgba(0,0,0,0.2);
      ">${emoji}</div>`,
      className: "", // pour éviter le style par défaut
      iconSize: [45, 45],
      iconAnchor: [22, 45],
      popupAnchor: [0, -40],
    });
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <MapContainer
        center={[-18.8792, 47.5079]}
        zoom={7}
        scrollWheelZoom={true}
        className="w-full h-[600px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {products.map((product, index) => (
          <Marker
            key={product.id}
            position={[product.lat, product.lng]}
            icon={createEmojiIcon(product.image)}
            ref={(ref) => {
              markerRefs.current[index] = ref;
            }}
            eventHandlers={{
              mouseover: () => markerRefs.current[index]?.openPopup(),
              // mouseout supprimé
            }}
          >
            <Popup closeButton={true} closeOnClick={false}>
              <div className="space-y-2">
                <p className="font-bold text-lg">{product.name}</p>
                <p className="text-sm text-gray-600">{product.type}</p>
                <p className="text-green-600 font-semibold">
                  {product.quantity} {product.unit} —{" "}
                  {product.price.toLocaleString()} Ar
                </p>
                <p className="text-sm text-gray-500">📍 {product.location}</p>
                <p className="text-sm">👨‍🌾 {product.farmer}</p>
                <p className="text-sm">📞 {product.phone}</p>
                <p className="text-xs text-gray-400">🗓️ {product.date}</p>

                {/* Boutons */}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => alert(`Appeler ${product.farmer}`)}
                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    📞 Appeler
                  </button>
                  <button
                    onClick={() => alert(`Message à ${product.farmer}`)}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    ✉️ Message
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${product.id}`)}
                    className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs cursor-pointer"
                  >
                    👤 Voir Profil
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
