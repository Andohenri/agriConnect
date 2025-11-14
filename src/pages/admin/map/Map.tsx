/* eslint-disable react-hooks/exhaustive-deps */
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductService } from "@/service/product.service";
import { PRODUCT_TYPE_ICONS } from "@/lib/utils";
import { toast } from "sonner";
import {
  Phone,
  MessageSquare,
  User,
  Eye,
  Loader2,
  MapPin,
  Package,
  TrendingUp,
  Users,
  ShoppingBag,
  Filter,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const AdminMapView = () => {
  const navigate = useNavigate();
  const markerRefs = useRef<(L.Marker | null)[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filtres administrateur
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");

  // Mobile panel collapse
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);

  // Statistiques
  const [stats, setStats] = useState({
    total: 0,
    disponibles: 0,
    enRupture: 0,
    farmers: 0,
    regions: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [products, statusFilter, typeFilter, regionFilter]);

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
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filtre par statut
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.statut === statusFilter);
    }

    // Filtre par type
    if (typeFilter !== "all") {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    // Filtre par région (basé sur l'adresse)
    if (regionFilter !== "all") {
      filtered = filtered.filter((p) =>
        p.localisation?.adresse
          ?.toLowerCase()
          .includes(regionFilter.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const calculateStats = () => {
    const disponibles = products.filter(
      (p) => p.statut === ProductStatut.DISPONIBLE
    ).length;
    const enRupture = products.filter(
      (p) => p.statut === ProductStatut.RUPTURE
    ).length;

    const uniqueFarmers = new Set(
      products.map((p) => p.paysan?.id).filter(Boolean)
    ).size;

    const uniqueRegions = new Set(
      products
        .map((p) => {
          const addr = p.localisation?.adresse || "";
          return addr.split(",")[0].trim();
        })
        .filter(Boolean)
    ).size;

    setStats({
      total: products.length,
      disponibles,
      enRupture,
      farmers: uniqueFarmers,
      regions: uniqueRegions,
    });
  };

  const getUniqueRegions = () => {
    const regions = new Set(
      products
        .map((p) => {
          const addr = p.localisation?.adresse || "";
          return addr.split(",")[0].trim();
        })
        .filter(Boolean)
    );
    return Array.from(regions).sort();
  };

  const handleExportData = () => {
    // Préparer les données pour l'export CSV
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
          `${p.paysan?.nom || ""} ${p.paysan?.prenom || ""}`,
          p.paysan?.telephone || "",
        ].join(",");
      })
      .join("\n");

    const header =
      "Nom,Type,Statut,Quantité,Unité,Prix,Localisation,Producteur,Téléphone\n";
    const csv = header + csvData;

    // Créer et télécharger le fichier
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
      toast.info("Email non disponible");
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
      navigate(`/admin/products/${productId}`);
    }
    else {
      toast.error("Produit non disponible");
    }
  };

  const defaultCenter: [number, number] = [-18.8792, 47.5079];

  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg overflow-hidden mt-16 z-10 relative h-[calc(100vh-64px)]">
      {/* Carte */}
      <div className="relative flex-1 order-1 md:order-2">
        {isLoading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-1000 bg-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm font-medium">
              Chargement des produits...
            </span>
          </div>
        )}

        {/* Bouton de collapse pour mobile */}
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

        <MapContainer
          center={defaultCenter}
          zoom={7}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <ChangeMapView center={defaultCenter} zoom={7} />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
                  <div className="min-w-[260px] p-4 rounded-xl bg-white shadow-xl border border-gray-100 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-lg text-gray-800">
                          {product.nom}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full inline-block mt-1">
                          {product.type}
                        </p>
                      </div>
                    </div>

                    {/* Stock & Price */}
                    <div
                      className={`p-3 rounded-lg border ${
                        product.statut === ProductStatut.DISPONIBLE
                          ? "bg-green-50 border-green-100"
                          : "bg-red-50 border-red-100"
                      }`}
                    >
                      <p
                        className={`font-semibold text-sm ${
                          product.statut === ProductStatut.DISPONIBLE
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {product.statut} — {product.quantiteDisponible}{" "}
                        {product.unite}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        💰 {product.prixUnitaire?.toLocaleString()} Ar
                      </p>
                    </div>

                    {/* Informations */}
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600">
                        📍{" "}
                        {product.localisation?.adresse ||
                          "Localisation inconnue"}
                      </p>
                      <p className="text-gray-600">👨‍🌾 {farmerName}</p>

                      {product.paysan?.telephone && (
                        <p className="text-gray-600">
                          📞 {product.paysan.telephone}
                        </p>
                      )}

                      {product.dateRecolte && (
                        <p className="text-xs text-gray-400">
                          🗓️ Récolté le{" "}
                          {new Date(product.dateRecolte).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="border-t pt-4 flex flex-wrap gap-2">
                      {/* Voir détails */}
                      <button
                        onClick={() => handleViewProduct(product.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg 
                   bg-blue-600 text-white hover:bg-blue-700 transition"
                      >
                        <Eye size={14} />
                        Voir détails
                      </button>

                      {/* Appeler */}
                      {product.paysan?.telephone && (
                        <button
                          onClick={() => handleCall(product.paysan?.telephone)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg 
                     bg-orange-500 text-white hover:bg-orange-600 transition"
                        >
                          <Phone size={14} />
                          Appeler
                        </button>
                      )}

                      {/* Message */}
                      <button
                        onClick={() => handleMessage(product.paysan?.email)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg 
                   bg-purple-600 text-white hover:bg-purple-700 transition"
                      >
                        <MessageSquare size={14} />
                        Message
                      </button>

                      {/* Profil */}
                      {product.paysan?.id && (
                        <button
                          onClick={() => handleViewProfile(product.paysan?.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg 
                     bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
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
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-1000">
          <h3 className="font-bold text-sm mb-2">Légende</h3>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-green-700"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-red-700"></div>
              <span>Rupture de stock</span>
            </div>
            <p className="text-gray-500 mt-2">
              Affichage:{" "}
              <span className="font-bold">{filteredProducts.length}</span> /{" "}
              {products.length}
            </p>
          </div>
        </div>
      </div>

      {/* Panel administrateur */}
      <div
        className={`w-full md:w-96 bg-white border-r md:border-b-0 border-b overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 order-2 md:order-1 transition-all ${
          isPanelCollapsed
            ? "h-0 md:h-auto overflow-hidden md:overflow-y-auto p-0 md:p-6"
            : "h-auto"
        }`}
      >
        <div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">
            Vue Administrateur
          </h2>
          <p className="text-sm text-gray-600">
            Gestion et statistiques des produits
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Package className="text-green-600" size={18} />
              <span className="text-xs text-gray-600">Total</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.total}</p>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-blue-600" size={18} />
              <span className="text-xs text-gray-600">Disponibles</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {stats.disponibles}
            </p>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="text-purple-600" size={18} />
              <span className="text-xs text-gray-600">Producteurs</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {stats.farmers}
            </p>
          </Card>

          <Card className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="text-orange-600" size={18} />
              <span className="text-xs text-gray-600">Régions</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">
              {stats.regions}
            </p>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Filter className="text-green-600" size={18} />
            <h3 className="font-bold">Filtres</h3>
          </div>

          {/* Filtre par statut */}
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
                  Disponible
                </SelectItem>
                <SelectItem value={ProductStatut.RUPTURE}>
                  Rupture de stock
                </SelectItem>
                <SelectItem value={ProductStatut.ARCHIVE}>Archivé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par type */}
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
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par région */}
          <div>
            <Label htmlFor="region-filter" className="mb-2 block">
              Région
            </Label>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger id="region-filter">
                <SelectValue placeholder="Toutes les régions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {getUniqueRegions().map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={() => {
              setStatusFilter("all");
              setTypeFilter("all");
              setRegionFilter("all");
            }}
            variant="outline"
            className="w-full"
          >
            Réinitialiser les filtres
          </Button>
        </Card>

        {/* Actions */}
        <Card className="p-4 space-y-3">
          <h3 className="font-bold flex items-center gap-2">
            <ShoppingBag className="text-green-600" size={18} />
            Actions
          </h3>
          <Button
            onClick={handleExportData}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Download size={16} className="mr-2" />
            Exporter les données (CSV)
          </Button>
        </Card>

        {/* Liste des produits filtrés */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-gray-700">
            Produits ({filteredProducts.length})
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucun produit trouvé
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
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            product.statut === ProductStatut.DISPONIBLE
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.statut}
                        </span>
                        <p className="text-xs text-green-600 font-semibold">
                          {product.prixUnitaire?.toLocaleString()} Ar
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
    </div>
  );
};

export default AdminMapView;
