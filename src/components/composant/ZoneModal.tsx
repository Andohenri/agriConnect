import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import L from "leaflet";

interface ZoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onZoneSelected: (zone: {
    territoire: string;
    latitude: number;
    longitude: number;
    rayon: number;
  }) => void;
}

// Composant pour recentrer la carte
function ChangeMapView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const ZoneModal = ({ isOpen, onClose, onZoneSelected }: ZoneModalProps) => {
  const [searchAddress, setSearchAddress] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchAddress = async () => {
    if (!searchAddress.trim()) {
      toast.error("Veuillez entrer une adresse");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchAddress + ", Madagascar"
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const center: [number, number] = [parseFloat(lat), parseFloat(lon)];
        setSelectedCenter(center);
        toast.success(`Zone trouvée : ${display_name}`);
      } else {
        toast.error("Adresse introuvable à Madagascar");
      }
    } catch (error) {
      console.error("Erreur de géocodage:", error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsSearching(false);
    }
  };

  const handleConfirm = () => {
    if (!selectedCenter) {
      toast.error("Veuillez sélectionner une zone");
      return;
    }

    onZoneSelected({
      territoire: searchAddress,
      latitude: selectedCenter[0],
      longitude: selectedCenter[1],
      rayon: searchRadius,
    });
    onClose();
  };

  if (!isOpen) return null;

  const defaultCenter: [number, number] = [-18.8792, 47.5079];
  const mapCenter = selectedCenter || defaultCenter;
  const mapZoom = selectedCenter ? 11 : 7;

  return (
    // <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 transition-all duration-300">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Carte en haut */}
        <div className="h-64 w-full relative">
          <MapContainer
            center={defaultCenter}
            zoom={7}
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ zIndex: 0 }}
          >
            <ChangeMapView center={mapCenter} zoom={mapZoom} />

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Cercle de zone de recherche */}
            {selectedCenter && (
              <>
                <Circle
                  center={selectedCenter}
                  radius={searchRadius * 1000}
                  pathOptions={{
                    color: "#16a34a",
                    fillColor: "#16a34a",
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />

                <Marker
                  position={selectedCenter}
                  icon={L.divIcon({
                    html: `<div style="font-size: 32px; color: #dc2626;">📍</div>`,
                    className: "",
                    iconSize: [32, 32],
                    iconAnchor: [16, 32],
                  })}
                />
              </>
            )}
          </MapContainer>
        </div>

        {/* Contenu du formulaire en bas */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">Définir la Zone de Collecte</h3>
              <Button variant="ghost" onClick={onClose}>
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Adresse ou Localité
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border rounded-lg"
                    placeholder="Ex: Antananarivo, Antsirabe..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchAddress()
                    }
                  />
                  <Button
                    onClick={handleSearchAddress}
                    disabled={isSearching}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSearching ? "Recherche..." : "Rechercher"}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Rayon de collecte:{" "}
                  <span className="text-green-600 font-bold">
                    {searchRadius} km
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 km</span>
                  <span>50 km</span>
                  <span>100 km</span>
                </div>
              </div>

              {selectedCenter && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-green-700">
                    Zone sélectionnée :
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    📍 {searchAddress}
                  </p>
                  <p className="text-sm text-gray-700">
                    🎯 Rayon: {searchRadius} km
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordonnées: {selectedCenter[0].toFixed(4)},{" "}
                    {selectedCenter[1].toFixed(4)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Annuler
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!selectedCenter}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmer la zone
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};


export default ZoneModal;