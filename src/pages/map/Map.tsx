/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ProductService } from "@/service/product.service";
import { Role } from "@/types/enums";
import { PRODUCT_TYPE_ICONS } from "@/lib/utils";
import { toast } from "sonner";
import {
  Phone,
  MessageSquare,
  User,
  ShoppingCart,
  Eye,
  Loader2,
  MapPin,
  Search,
  Sliders,
  Save,
  Bookmark,
  Trash2,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

const MapView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la recherche de zone (Collecteur)
  const [searchAddress, setSearchAddress] = useState("");
  const [searchRadius, setSearchRadius] = useState(10); // en km
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);

  // Gestion des zones sauvegardées
  const [savedZones, setSavedZones] = useState<Zone[]>([]);
  const [zoneName, setZoneName] = useState("");
  const [zoneDescription, setZoneDescription] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (isCollector) {
      loadSavedZones();
    }
  }, []);

  useEffect(() => {
    filterProductsByRadius();
  }, [products, searchCenter, searchRadius]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.getAllProducts();
      if (response?.data) {
        setProducts(response.data);
      } else {
        console.warn("Unexpected products response:", response);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchProducts = async () => {
  //   setIsLoading(true);
  //   try {
  //     const data = await ProductService.getAllProducts();
  //     const availableProducts = data.filter(
  //       (product: { statut: string; localisation: { latitude: any; longitude: any; }; }) =>
  //         product.statut === ProductStatut.DISPONIBLE &&
  //         product.localisation?.latitude &&
  //         product.localisation?.longitude
  //     );
  //     setProducts(availableProducts);
  //     setFilteredProducts(availableProducts);
  //   } catch (error) {
  //     console.error("Erreur lors du chargement des produits:", error);
  //     toast.error("Erreur lors du chargement de la carte");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filtrer les produits dans le rayon
  const filterProductsByRadius = () => {
    if (!searchCenter) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const lat = product.localisation?.latitude;
      const lng = product.localisation?.longitude;
      if (!lat || !lng) return false;

      const distance = calculateDistance(
        searchCenter[0],
        searchCenter[1],
        lat,
        lng
      );
      return distance <= searchRadius;
    });

    setFilteredProducts(filtered);
  };

  // Géocodage de l'adresse (utilise Nominatim - OpenStreetMap)
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
        setSearchCenter(center);
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

  const handleResetSearch = () => {
    setSearchAddress("");
    setSearchCenter(null);
    setSearchRadius(10);
    setFilteredProducts(products);
  };

  // Charger les zones sauvegardées (depuis localStorage temporairement)
  const loadSavedZones = () => {
    try {
      const saved = localStorage.getItem(`zones_${user?.id}`);
      if (saved) {
        setSavedZones(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des zones:", error);
    }
  };

  // Sauvegarder une nouvelle zone
  const handleSaveZone = () => {
    if (!searchCenter || !zoneName.trim()) {
      toast.error("Veuillez définir un nom pour la zone");
      return;
    }

    const newZone: Zone = {
      id: Date.now().toString(),
      nom: zoneName,
      description: zoneDescription || undefined,
      coordinates: [], // Sera calculé pour le cercle
      centre: {
        latitude: searchCenter[0],
        longitude: searchCenter[1],
        adresse: searchAddress || undefined,
      },
      createdBy: user
        ? {
            id: user.id || "",
            nom: user.nom,
            prenom: user.prenom,
            role: user.role,
          }
        : undefined,
      createdAt: new Date().toISOString(),
    };

    // Ajouter le rayon comme propriété custom
    (newZone as any).radius = searchRadius;

    const updatedZones = [...savedZones, newZone];
    setSavedZones(updatedZones);

    // Sauvegarder dans localStorage (ou API plus tard)
    try {
      localStorage.setItem(`zones_${user?.id}`, JSON.stringify(updatedZones));
      toast.success("Zone sauvegardée avec succès");
      setIsSaveDialogOpen(false);
      setZoneName("");
      setZoneDescription("");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  // Charger une zone sauvegardée
  const handleLoadZone = (zone: Zone) => {
    if (zone.centre) {
      setSearchCenter([zone.centre.latitude, zone.centre.longitude]);
      setSearchAddress(zone.centre.adresse || "");
      setSearchRadius((zone as any).radius || 10);
      toast.success(`Zone "${zone.nom}" chargée`);
    }
  };

  // Supprimer une zone
  const handleDeleteZone = (zoneId?: string) => {
    if (!zoneId) return;

    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir supprimer cette zone ?"
    );
    if (!confirmed) return;

    const updatedZones = savedZones.filter((z) => z.id !== zoneId);
    setSavedZones(updatedZones);

    try {
      localStorage.setItem(`zones_${user?.id}`, JSON.stringify(updatedZones));
      toast.success("Zone supprimée");
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const createProductIcon = (product: Product) => {
    const imageSrc =
      product.imageUrl || PRODUCT_TYPE_ICONS[product.type] || "📦";

    // Si c’est une image (URL), on affiche une balise <img>
    const isImage = imageSrc.startsWith("http") || imageSrc.startsWith("/");

    const htmlContent = isImage
      ? `<div style="
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: white;
        border: 2px solid #16a34a;
        box-shadow: 0 0 6px rgba(0,0,0,0.2);
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <img src="${imageSrc}" alt="${product.nom}" style="width:100%; height:100%; object-fit:cover;" />
      </div>`
      : `<div style="
        font-size: 26px;
        background: white;
        border-radius: 50%;
        width: 45px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #16a34a;
        box-shadow: 0 0 6px rgba(0,0,0,0.2);
      ">${imageSrc}</div>`;

    return L.divIcon({
      html: htmlContent,
      className: "",
      iconSize: [45, 45],
      iconAnchor: [22, 45],
      popupAnchor: [0, -40],
    });
  };

  const handleCall = (phone?: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error("Numéro de téléphone non disponible");
    }
  };

  const handleMessage = (email?: string) => {
    if (email) {
      window.location.href = `mailto:${email}`;
    } else {
      toast.info("Fonctionnalité de messagerie à venir");
    }
  };

  const handleViewProfile = (farmerId?: string) => {
    if (farmerId) {
      navigate(`/farmers/${farmerId}`);
    } else {
      toast.error("Profil non disponible");
    }
  };

  const handleViewProduct = (productId?: string) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  const handleCommand = (productId?: string) => {
    if (productId) {
      toast.info("Fonctionnalité de commande à venir");
    }
  };

  const defaultCenter: [number, number] = [-18.8792, 47.5079];
  const mapCenter = searchCenter || defaultCenter;
  const mapZoom = searchCenter ? 11 : 7;

  const isCollector = user?.role === Role.COLLECTEUR;

  return (
    <div
      className={`${
        isCollector ? "flex" : ""
      } bg-white shadow-lg overflow-hidden mt-16 z-10 relative h-[calc(100vh-64px)]`}
    >
      {/* Panel de recherche pour les collecteurs */}
      {isCollector && (
        <div className="w-full md:w-96 bg-white border-r overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              Recherche de Zone
            </h2>
            <p className="text-sm text-gray-600">
              Trouvez les produits près de vous
            </p>
          </div>

          {/* Recherche d'adresse */}
          <Card className="p-4 space-y-4">
            <div>
              <Label htmlFor="address" className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-green-600" />
                Adresse ou Localité
              </Label>
              <div className="flex gap-2">
                <Input
                  id="address"
                  type="text"
                  placeholder="Ex: Antananarivo, Antsirabe..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchAddress()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSearchAddress}
                  disabled={isSearching}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSearching ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Search size={20} />
                  )}
                </Button>
              </div>
            </div>

            {/* Rayon de recherche */}
            <div>
              <Label className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-2">
                  <Sliders size={16} className="text-green-600" />
                  Rayon de recherche
                </span>
                <span className="text-green-600 font-bold">
                  {searchRadius} km
                </span>
              </Label>
              <Slider
                value={[searchRadius]}
                onValueChange={(value) => setSearchRadius(value[0])}
                min={1}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>50 km</span>
                <span>100 km</span>
              </div>
            </div>

            {searchCenter && (
              <div className="flex gap-2">
                <Button
                  onClick={handleResetSearch}
                  variant="outline"
                  className="flex-1"
                >
                  Réinitialiser
                </Button>

                <Dialog
                  open={isSaveDialogOpen}
                  onOpenChange={setIsSaveDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <Save size={16} className="mr-1" />
                      Sauvegarder
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        Sauvegarder la zone de recherche
                      </DialogTitle>
                      <DialogDescription>
                        Enregistrez cette zone pour y accéder rapidement plus
                        tard
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="zone-name">Nom de la zone *</Label>
                        <Input
                          id="zone-name"
                          placeholder="Ex: Zone Antananarivo Centre"
                          value={zoneName}
                          onChange={(e) => setZoneName(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zone-desc">
                          Description (optionnel)
                        </Label>
                        <Input
                          id="zone-desc"
                          placeholder="Ex: Livraisons quotidiennes"
                          value={zoneDescription}
                          onChange={(e) => setZoneDescription(e.target.value)}
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        <p className="text-gray-600">
                          Centre: {searchAddress || "Position actuelle"}
                        </p>
                        <p className="text-gray-600">
                          Rayon: {searchRadius} km
                        </p>
                        <p className="text-gray-600">
                          Produits: {filteredProducts.length}
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsSaveDialogOpen(false)}
                      >
                        Annuler
                      </Button>
                      <Button
                        onClick={handleSaveZone}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Sauvegarder
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </Card>

          {/* Zones sauvegardées */}
          {savedZones.length > 0 && (
            <Card className="p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Bookmark className="text-green-600" size={18} />
                Mes zones sauvegardées
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedZones.map((zone) => (
                  <div
                    key={zone.id}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition"
                  >
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleLoadZone(zone)}
                    >
                      <p className="font-semibold text-sm">{zone.nom}</p>
                      {zone.description && (
                        <p className="text-xs text-gray-500">
                          {zone.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        📍 {zone.centre?.adresse || "Position GPS"} •{" "}
                        {(zone as any).radius || 10} km
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteZone(zone.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Résultats */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Package className="text-green-600" size={18} />
              Résultats de recherche
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Produits trouvés:</span>
                <span className="font-bold text-green-600">
                  {filteredProducts.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total disponible:</span>
                <span className="font-bold text-gray-700">
                  {products.length}
                </span>
              </div>
              {searchCenter && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dans un rayon de:</span>
                  <span className="font-bold text-green-600">
                    {searchRadius} km
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Liste des produits filtrés */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-700">
              Produits dans la zone
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Aucun produit dans cette zone
                </p>
              ) : (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="p-3 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden bg-gray-100">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.nom}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">
                            {PRODUCT_TYPE_ICONS[product.type] || "📦"}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">
                          {product.nom}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {product.localisation?.adresse}
                        </p>
                        <p className="text-xs text-green-600 font-semibold">
                          {product.prixUnitaire?.toLocaleString()} Ar/
                          {product.unite}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carte */}
      <div className={`relative ${isCollector ? "flex-1" : "w-full h-full"}`}>
        {isLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-1000 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">
              Chargement des produits...
            </span>
          </div>
        )}

        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <ChangeMapView center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Cercle de zone de recherche */}
          {searchCenter && (
            <Circle
              center={searchCenter}
              radius={searchRadius * 1000} // convertir km en mètres
              pathOptions={{
                color: "#16a34a",
                fillColor: "#16a34a",
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          )}

          {/* Marqueur du centre de recherche */}
          {searchCenter && (
            <Marker
              position={searchCenter}
              icon={L.divIcon({
                html: `<div style="
                  font-size: 32px;
                  color: #dc2626;
                ">📍</div>`,
                className: "",
                iconSize: [32, 32],
                iconAnchor: [16, 32],
              })}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-red-600">
                    📍 Centre de recherche
                  </p>
                  <p className="text-xs text-gray-500">
                    Rayon: {searchRadius} km
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marqueurs des produits */}
          {filteredProducts.map((product, index) => {
            const lat = product.localisation?.latitude;
            const lng = product.localisation?.longitude;

            if (!lat || !lng) return null;

            const farmerName =
              product.paysan?.nom && product.paysan?.prenom
                ? `${product.paysan.nom} ${product.paysan.prenom}`
                : "Producteur";

            return (
              <Marker
                key={product.id}
                position={[lat, lng]}
                icon={createProductIcon(product)}
                ref={(ref) => {
                  markerRefs.current[index] = ref;
                }}
                eventHandlers={{
                  mouseover: () => markerRefs.current[index]?.openPopup(),
                }}
              >
                <Popup closeButton={true} closeOnClick={false}>
                  <div className="space-y-2 min-w-[250px]">
                    <p className="font-bold text-lg text-green-700">
                      {product.nom}
                    </p>
                    <p className="text-sm text-gray-600">{product.type}</p>

                    <div className="bg-green-50 p-2 rounded">
                      <p className="text-green-600 font-semibold">
                        {product.quantiteDisponible} {product.unite} —{" "}
                        {product.prixUnitaire?.toLocaleString()} Ar
                      </p>
                    </div>

                    <p className="text-sm text-gray-500">
                      📍 {product.localisation?.adresse || "Localisation"}
                    </p>

                    <p className="text-sm">👨‍🌾 {farmerName}</p>

                    {product.paysan?.telephone && (
                      <p className="text-sm">📞 {product.paysan.telephone}</p>
                    )}

                    {product.dateRecolte && (
                      <p className="text-xs text-gray-400">
                        🗓️ Récolté le{" "}
                        {new Date(product.dateRecolte).toLocaleDateString()}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t">
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-blue-200 transition flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Voir détails
                      </button>

                      {isCollector && (
                        <>
                          <button
                            onClick={() => handleCommand(product.id)}
                            className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-green-200 transition flex items-center gap-1"
                          >
                            <ShoppingCart size={14} />
                            Commander
                          </button>

                          {product.paysan?.telephone && (
                            <button
                              onClick={() =>
                                handleCall(product.paysan?.telephone)
                              }
                              className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-orange-200 transition flex items-center gap-1"
                            >
                              <Phone size={14} />
                              Appeler
                            </button>
                          )}

                          <button
                            onClick={() => handleMessage(product.paysan?.email)}
                            className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-purple-200 transition flex items-center gap-1"
                          >
                            <MessageSquare size={14} />
                            Message
                          </button>
                        </>
                      )}

                      {product.paysan?.id && (
                        <button
                          onClick={() => handleViewProfile(product.paysan?.id)}
                          className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:bg-gray-200 transition flex items-center gap-1"
                        >
                          <User size={14} />
                          Profil
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Légende */}
        {!isCollector && (
          <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-1000">
            <h3 className="font-bold text-sm mb-2">Légende</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Produits disponibles</span>
              </div>
              <p className="text-gray-500 mt-2">
                Total: <span className="font-bold">{products.length}</span>{" "}
                produit(s)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;
