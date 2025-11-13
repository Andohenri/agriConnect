// src/components/ZoneModal.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Circle, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import {
  MapPin,
  Search,
  Target,
  Navigation,
  CheckCircle,
  Ruler,
  MousePointerClick,
  Locate,
} from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";

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

// Composant pour gérer les clics sur la carte
function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Composant pour recentrer la carte
function ChangeMapView({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMapEvents({});
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const ZoneModal = ({ isOpen, onClose, onZoneSelected }: ZoneModalProps) => {
  const [searchAddress, setSearchAddress] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);
  const [selectedCenter, setSelectedCenter] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [locationName, setLocationName] = useState("");

  // Géocodage inverse pour obtenir le nom du lieu
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.display_name) {
        const addressParts = data.address;
        const locationName =
          addressParts?.city ||
          addressParts?.town ||
          addressParts?.village ||
          addressParts?.county ||
          data.display_name.split(',')[0];

        setLocationName(locationName);
        setSearchAddress(locationName);
        return locationName;
      }
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error);
    }
    return "Localisation sélectionnée";
  };

  // Gérer le clic sur la carte
  const handleMapClick = async (lat: number, lng: number) => {
    const center: [number, number] = [lat, lng];
    setSelectedCenter(center);

    // Obtenir le nom du lieu
    const name = await reverseGeocode(lat, lng);
    toast.success(`Zone sélectionnée : ${name}`);
  };

  // Recherche par adresse
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
        setLocationName(display_name);
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

  // Géolocalisation automatique
  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const center: [number, number] = [latitude, longitude];
        setSelectedCenter(center);

        const name = await reverseGeocode(latitude, longitude);
        toast.success(`Position actuelle : ${name}`);
        setIsGeolocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        toast.error("Impossible d'obtenir votre position");
        setIsGeolocating(false);
      }
    );
  };

  const handleConfirm = () => {
    if (!selectedCenter) {
      toast.error("Veuillez sélectionner une zone sur la carte");
      return;
    }

    onZoneSelected({
      territoire: searchAddress || locationName || "Zone sélectionnée",
      latitude: selectedCenter[0],
      longitude: selectedCenter[1],
      rayon: searchRadius,
    });
    onClose();
  };

  const handleClose = () => {
    setSelectedCenter(null);
    setSearchAddress("");
    setLocationName("");
    setSearchRadius(10);
    onClose();
  };

  const defaultCenter: [number, number] = [-18.8792, 47.5079];
  const mapCenter = selectedCenter || defaultCenter;
  const mapZoom = selectedCenter ? 11 : 7;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-4xl max-h-[95vh] overflow-hidden p-0"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogTitle className="hidden">Définir la Zone de Collecte</DialogTitle>
        <DialogDescription className="hidden">Sélectionnez un territoire et précisez le rayon de recherche.</DialogDescription>
        {/* Container principal avec scroll */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] scrollbar-hide-default">
          {/* Carte interactive */}
          <div className="h-80 md:h-96 w-full relative border-b">
            <MapContainer
              center={defaultCenter}
              zoom={7}
              scrollWheelZoom={true}
              className="w-full h-full cursor-crosshair"
              style={{ zIndex: 0 }}
            >
              <ChangeMapView center={mapCenter} zoom={mapZoom} />
              <MapClickHandler onLocationSelect={handleMapClick} />

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
                      fillOpacity: 0.15,
                      weight: 3,
                      dashArray: "10, 5",
                    }}
                  />

                  <Marker
                    position={selectedCenter}
                    icon={L.divIcon({
                      html: `<div style="font-size: 32px; color: #dc2626; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">📍</div>`,
                      className: "",
                      iconSize: [32, 32],
                      iconAnchor: [16, 32],
                    })}
                  />
                </>
              )}
            </MapContainer>

            {/* Badge flottant avec info */}
            {selectedCenter && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-white/95 text-green-700 border-2 border-green-500 px-4 py-2 text-sm font-semibold shadow-lg">
                  <CheckCircle size={16} className="mr-2" />
                  Zone sélectionnée
                </Badge>
              </div>
            )}

            {/* Badge d'instruction */}
            {!selectedCenter && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-blue-600/90 text-white px-4 py-2 text-sm font-semibold shadow-lg">
                  <MousePointerClick size={16} className="mr-2" />
                  Cliquez sur la carte pour sélectionner
                </Badge>
              </div>
            )}
          </div>

          {/* Formulaire de configuration */}
          <div className="p-6 space-y-6">
            {/* Recherche d'adresse */}
            <div className="space-y-2">
              <Label className="form-label flex items-center gap-2">
                <Navigation size={16} className="text-green-600 h-10!" />
                Recherche par adresse (optionnel)
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <Input
                    type="text"
                    className="pl-10 w-full"
                    placeholder="Ex: Antananarivo, Antsirabe, Toamasina..."
                    value={searchAddress}
                    onChange={(e) => setSearchAddress(e.target.value)}
                    onKeyUp={(e) =>
                      e.key === "Enter" && handleSearchAddress()
                    }
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleSearchAddress}
                  disabled={isSearching || !searchAddress.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center"
                >
                  {isSearching ? (
                    <>
                      <span className="animate-spin md:mr-2">⏳</span>
                      <span className="hidden md:block">Recherche...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} className="md:mr-2" />
                      <span className="hidden md:block">Rechercher</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  onClick={handleGeolocation}
                  disabled={isGeolocating}
                  variant="outline"
                >
                  {isGeolocating ? (
                    <>
                      <span className="animate-spin md:mr-2">⏳</span>
                      <span className="hidden md:block">Localisation...</span>
                    </>
                  ) : (
                    <>
                      <Locate size={18} className="md:mr-2" />
                      <span className="hidden md:block">Ma position</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Rayon de collecte */}
            <div className="space-y-2">
              <Label className="form-label flex items-center gap-2">
                <Ruler size={16} className="text-green-600" />
                Rayon de collecte
              </Label>

              <Card className="p-4 bg-linear-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">
                    Distance maximale
                  </span>
                  <Badge className="bg-green-600 text-white text-sm px-4">
                    {searchRadius} km
                  </Badge>
                </div>

                <Slider
                  value={[searchRadius]}
                  onValueChange={(value) => setSearchRadius(value[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full accent-green-600 **:data-[orientation=horizontal]:bg-linear-to-r from-pink-500 via-purple-500 to-indigo-500"
                />

                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                    1 km
                  </span>
                  <span>50 km</span>
                  <span className="flex items-center gap-1">
                    100 km
                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  </span>
                </div>
              </Card>

              <p className="form-helper-text">
                Définissez la distance maximale dans laquelle vous souhaitez collecter
              </p>
            </div>

            {/* Résumé de la zone sélectionnée */}
            {selectedCenter && (
              <Card className="p-5 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-lg text-blue-900 flex items-center gap-2">
                      <CheckCircle size={18} className="text-green-600" />
                      Zone Confirmée
                    </h4>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start gap-2">
                        <Navigation size={14} className="text-blue-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-600">Territoire :</span>
                          <span className="font-semibold text-gray-900 ml-1">
                            {searchAddress || locationName || "Zone sélectionnée"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-blue-600 shrink-0" />
                        <span className="text-gray-600">Rayon de collecte :</span>
                        <Badge className="bg-blue-600 text-nowrap text-white">
                          {searchRadius} km
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-600 shrink-0" />
                        <span className="text-xs text-gray-500">
                          Coordonnées: {selectedCenter[0].toFixed(4)}, {selectedCenter[1].toFixed(4)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 mt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-700 flex items-center gap-2">
                        <CheckCircle size={12} />
                        Votre zone de collecte couvre environ {Math.round(Math.PI * searchRadius * searchRadius)} km²
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer avec boutons d'action */}
        <DialogFooter className="p-6 border-t bg-gray-50 flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1 h-12"
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCenter}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {selectedCenter ? (
              <>
                <CheckCircle size={20} className="mr-2" />
                Confirmer la zone
              </>
            ) : (
              <>
                <MousePointerClick size={20} className="mr-2" />
                Cliquez sur la carte d'abord
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ZoneModal;