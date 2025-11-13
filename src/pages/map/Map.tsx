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
  Filter,
  X,
  TrendingUp,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderModal } from "@/components/composant/OrderModal";
import { ProductStatut, ProductType } from "@/types/enums";

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

const EnhancedMapView = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // États pour la recherche de zone (Collecteur)
  const [searchAddress, setSearchAddress] = useState("");
  const [searchRadius, setSearchRadius] = useState(10);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Gestion des zones sauvegardées
  const [savedZones, setSavedZones] = useState<Zone[]>([]);
  const [zoneName, setZoneName] = useState("");
  const [zoneDescription, setZoneDescription] = useState("");
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

  // Filtres pour paysans
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  // Mobile panel collapse
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    enRupture: 0,
    avgPrice: 0,
  });

  const isCollector = user?.role === Role.COLLECTEUR;
  const isFarmer = user?.role === Role.PAYSAN;

  useEffect(() => {
    fetchProducts();
    if (isCollector) {
      loadSavedZones();
    }
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [
    products,
    searchCenter,
    searchRadius,
    statusFilter,
    typeFilter,
    priceRange,
  ]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await ProductService.getAllProducts();
      if (response?.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
      toast.error("Erreur lors du chargement des produits");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = () => {
    const disponibles = filteredProducts.filter(
      (p) => p.statut === ProductStatut.DISPONIBLE
    ).length;
    const enRupture = filteredProducts.filter(
      (p) => p.statut === ProductStatut.RUPTURE
    ).length;
    const avgPrice =
      filteredProducts.length > 0
        ? filteredProducts.reduce((sum, p) => sum + (p.prixUnitaire || 0), 0) /
          filteredProducts.length
        : 0;

    setStats({
      total: filteredProducts.length,
      disponibles,
      enRupture,
      avgPrice: Math.round(avgPrice),
    });
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371;
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

  const applyFilters = () => {
    let filtered = [...products];

    // Filtre par rayon (collecteur)
    if (searchCenter && isCollector) {
      filtered = filtered.filter((product) => {
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
    }

    // Filtre par statut (paysan)
    if (statusFilter !== "all" && isFarmer) {
      filtered = filtered.filter((p) => p.statut === statusFilter);
    }

    // Filtre par type (paysan)
    if (typeFilter !== "all" && isFarmer) {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    // Filtre par prix (paysan)
    if (isFarmer) {
      filtered = filtered.filter(
        (p) =>
          (p.prixUnitaire || 0) >= priceRange[0] &&
          (p.prixUnitaire || 0) <= priceRange[1]
      );
    }

    setFilteredProducts(filtered);
  };

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
  };

  const handleResetFilters = () => {
    setStatusFilter("all");
    setTypeFilter("all");
    setPriceRange([0, 100000]);
  };

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

  const handleSaveZone = () => {
    if (!searchCenter || !zoneName.trim()) {
      toast.error("Veuillez définir un nom pour la zone");
      return;
    }

    const newZone: Zone = {
      id: Date.now().toString(),
      nom: zoneName,
      description: zoneDescription || undefined,
      coordinates: [],
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

    (newZone as any).radius = searchRadius;

    const updatedZones = [...savedZones, newZone];
    setSavedZones(updatedZones);

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

  const handleLoadZone = (zone: Zone) => {
    if (zone.centre) {
      setSearchCenter([zone.centre.latitude, zone.centre.longitude]);
      setSearchAddress(zone.centre.adresse || "");
      setSearchRadius((zone as any).radius || 10);
      toast.success(`Zone "${zone.nom}" chargée`);
    }
  };

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

  const handleExportData = () => {
    const csvData = filteredProducts
      .map((p) => {
        return [
          p.nom,
          p.type,
          p.statut,
          p.quantiteDisponible,
          p.unite,
          p.prixUnitaire,
          p.localisation?.adresse || "",
        ].join(",");
      })
      .join("\n");

    const header = "Nom,Type,Statut,Quantité,Unité,Prix,Localisation\n";
    const csv = header + csvData;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `produits_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Données exportées avec succès");
  };

  const createProductIcon = (product: Product) => {
    const imageSrc =
      product.imageUrl || PRODUCT_TYPE_ICONS[product.type] || "📦";
    const isImage = imageSrc.startsWith("http") || imageSrc.startsWith("/");
    const borderColor =
      product.statut === ProductStatut.DISPONIBLE ? "#16a34a" : "#dc2626";

    const htmlContent = isImage
      ? `<div style="
        width: 45px;
        height: 45px;
        border-radius: 50%;
        background: white;
        border: 2px solid ${borderColor};
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
        border: 2px solid ${borderColor};
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

  const defaultCenter: [number, number] = [-18.8792, 47.5079];
  const mapCenter = searchCenter || defaultCenter;
  const mapZoom = searchCenter ? 11 : 7;

  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg overflow-hidden mt-16 z-10 relative h-[calc(100vh-64px)]">
      {/* Carte - Affichée en premier sur mobile */}
      <div className={`relative ${(isCollector || isFarmer) ? "flex-1 order-1 md:order-2" : "w-full h-full"}`}>
        {isLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-1000 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">
              Chargement des produits...
            </span>
          </div>
        )}

        {/* Bouton de collapse pour mobile */}
        {(isCollector || isFarmer) && (
          <button
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
            className="md:hidden absolute top-4 left-4 z-1000 bg-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-gray-50 transition"
          >
            {isPanelCollapsed ? (
              <>
                <ChevronDown size={18} />
                Afficher le panneau
              </>
            ) : (
              <>
                <ChevronUp size={18} />
                Masquer le panneau
              </>
            )}
          </button>
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

          {searchCenter && isCollector && (
            <>
              <Circle
                center={searchCenter}
                radius={searchRadius * 1000}
                pathOptions={{
                  color: "#16a34a",
                  fillColor: "#16a34a",
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
              <Marker
                position={searchCenter}
                icon={L.divIcon({
                  html: `<div style="font-size: 32px; color: #dc2626;">📍</div>`,
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
            </>
          )}

          {filteredProducts.map((product, index) => {
            const lat = product.localisation?.latitude;
            const lng = product.localisation?.longitude;
            const isAvailable = product.statut === ProductStatut.DISPONIBLE;

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
                          <OrderModal
                            product={product}
                            disableTrigger={!isAvailable}
                            classTrigger="w-full sm:w-auto bg-green-600 hover:bg-green-700 cursor-pointer"
                          >
                            <ShoppingCart size={18} />
                            Commander
                          </OrderModal>

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

        {!isCollector && !isFarmer && (
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

      {/* Panel de filtrage - Affichée en second sur mobile */}
      {(isCollector || isFarmer) && (
        <div
          className={`w-full md:w-96 bg-white border-r md:border-b-0 border-b overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 order-2 md:order-1 transition-all ${
            isPanelCollapsed ? "h-0 md:h-auto overflow-hidden md:overflow-y-auto p-0 md:p-6" : "h-auto"
          }`}
        >
          {/* Header avec statistiques */}
          <div className="bg-linear-to-r from-green-50 to-blue-50 rounded-xl p-4 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-green-700 mb-2">
              {isCollector ? "Recherche de Zone" : "Filtres de Recherche"}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mb-3">
              {isCollector
                ? "Trouvez les produits près de vous"
                : "Explorez les produits disponibles"}
            </p>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-3 gap-2 mt-3">
              <div className="bg-white rounded-lg px-2 py-1.5 text-center">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-green-600">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white rounded-lg px-2 py-1.5 text-center">
                <p className="text-xs text-gray-500">Disponibles</p>
                <p className="text-lg font-bold text-blue-600">
                  {stats.disponibles}
                </p>
              </div>
              <div className="bg-white rounded-lg px-2 py-1.5 text-center">
                <p className="text-xs text-gray-500">Prix moyen</p>
                <p className="text-sm font-bold text-purple-600">
                  {stats.avgPrice.toLocaleString()} Ar
                </p>
              </div>
            </div>
          </div>

          {/* Panel collecteur */}
          {isCollector && (
            <>
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
                      placeholder="Ex: Antananarivo..."
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSearchAddress()
                      }
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSearchAddress}
                      disabled={isSearching}
                      className="bg-green-600 hover:bg-green-700"
                      size="icon"
                    >
                      {isSearching ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <Search size={20} />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2">
                      <Sliders size={16} className="text-green-600" />
                      Rayon
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
                      size="sm"
                    >
                      Réinitialiser
                    </Button>

                    <Dialog
                      open={isSaveDialogOpen}
                      onOpenChange={setIsSaveDialogOpen}
                    >
                      <DialogTrigger asChild>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
                          <Save size={16} className="mr-1" />
                          Sauvegarder
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Sauvegarder la zone</DialogTitle>
                          <DialogDescription>
                            Enregistrez cette zone pour y accéder rapidement
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="zone-name">Nom de la zone *</Label>
                            <Input
                              id="zone-name"
                              placeholder="Ex: Zone Antananarivo"
                              value={zoneName}
                              onChange={(e) => setZoneName(e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zone-desc">Description</Label>
                            <Input
                              id="zone-desc"
                              placeholder="Ex: Livraisons quotidiennes"
                              value={zoneDescription}
                              onChange={(e) =>
                                setZoneDescription(e.target.value)
                              }
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
            </>
          )}

          {/* Panel paysan */}
          {isFarmer && (
            <Card className="p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold flex items-center gap-2">
                  <Filter className="text-green-600" size={18} />
                  Filtres
                </h3>
                {(statusFilter !== "all" ||
                  typeFilter !== "all" ||
                  priceRange[0] !== 0 ||
                  priceRange[1] !== 100000) && (
                  <Button
                    onClick={handleResetFilters}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    <X size={14} className="mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor="status-filter" className="mb-2 block">
                  Statut
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value={ProductStatut.DISPONIBLE}>
                      ✅ Disponible
                    </SelectItem>
                    <SelectItem value={ProductStatut.RUPTURE}>
                      ❌ Rupture de stock
                    </SelectItem>
                    <SelectItem value={ProductStatut.ARCHIVE}>
                      🗄️ Archivé
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type-filter" className="mb-2 block">
                  Type de produit
                </Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger id="type-filter">
                    <SelectValue placeholder="Tous les types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {Object.values(ProductType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {PRODUCT_TYPE_ICONS[type] || "📦"} {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="flex items-center justify-between mb-2">
                  <span>Fourchette de prix</span>
                  <span className="text-green-600 font-bold text-sm">
                    {priceRange[0].toLocaleString()} -{" "}
                    {priceRange[1].toLocaleString()} Ar
                  </span>
                </Label>
                <Slider
                  value={priceRange}
                  onValueChange={(value) =>
                    setPriceRange(value as [number, number])
                  }
                  min={0}
                  max={100000}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 Ar</span>
                  <span>50k Ar</span>
                  <span>100k Ar</span>
                </div>
              </div>
            </Card>
          )}

          {/* Actions */}
          <Card className="p-4 space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <TrendingUp className="text-green-600" size={18} />
              Actions
            </h3>
            <div className="flex gap-2">
              <Button
                onClick={handleExportData}
                variant="outline"
                className="flex-1 text-sm"
                size="sm"
              >
                <Download size={16} className="mr-1" />
                Exporter
              </Button>
              <Button
                onClick={fetchProducts}
                variant="outline"
                className="flex-1 text-sm"
                size="sm"
              >
                <RefreshCw size={16} className="mr-1" />
                Actualiser
              </Button>
            </div>
          </Card>

          {/* Résultats */}
          <Card className="p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Package className="text-green-600" size={18} />
              Résultats
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
              {isCollector && searchCenter && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Dans un rayon de:</span>
                  <span className="font-bold text-green-600">
                    {searchRadius} km
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Disponibles:</span>
                <span className="font-bold text-blue-600">
                  {stats.disponibles}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">En rupture:</span>
                <span className="font-bold text-red-600">
                  {stats.enRupture}
                </span>
              </div>
            </div>
          </Card>

          {/* Liste des produits filtrés */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-gray-700">
              Produits ({filteredProducts.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Aucun produit trouvé
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Essayez de modifier vos filtres
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="p-3 hover:shadow-md transition cursor-pointer border-l-4"
                    style={{
                      borderLeftColor:
                        product.statut === ProductStatut.DISPONIBLE
                          ? "#16a34a"
                          : "#dc2626",
                    }}
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center rounded-full overflow-hidden bg-linear-to-br from-green-50 to-green-100 shrink-0">
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
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm truncate">
                            {product.nom}
                          </p>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                              product.statut === ProductStatut.DISPONIBLE
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {product.statut === ProductStatut.DISPONIBLE
                              ? "✅"
                              : "❌"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {product.type}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          📍 {product.localisation?.adresse}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-green-600 font-semibold">
                            {product.prixUnitaire?.toLocaleString()} Ar/
                            {product.unite}
                          </p>
                          <p className="text-xs text-gray-500">
                            {product.quantiteDisponible} {product.unite}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedMapView;