/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  User,
  Package,
  ShoppingCart,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Edit,
  Star,
  TrendingUp,
  Eye,
  Loader2,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { UserService } from "@/service/user.service";
import { ProductService } from "@/service/product.service";
import { OrderService } from "@/service/order.service";
import { Role, ProductStatut, CommandeStatut } from "@/types/enums";
import { toast } from "sonner";
import Tooltip from "@/components/composant/Tooltip";

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const isOwnProfile = !id || id === currentUser?.id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  useEffect(() => {
    loadProfileData();
  }, [id]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      // Charger les données de l'utilisateur si ce n'est pas son propre profil
      if (!isOwnProfile && id) {
        const userData = await UserService.getUserById(id);
        setProfileUser(userData);
      }

      // Charger les produits de l'utilisateur (si paysan)
      if (displayUser?.role === Role.PAYSAN) {
        const productsData = await ProductService.getAllProductsPaysan();
        setProducts(productsData.data || []);
      }

      // Charger les commandes
      if (isOwnProfile) {
        if (currentUser?.role === Role.PAYSAN) {
          const ordersData = await OrderService.getAllOrdersPaysan();
          setOrders(ordersData.data || []);
        } else if (currentUser?.role === Role.COLLECTEUR) {
          const ordersData = await OrderService.getAllOrdersCollecteur(
            currentUser?.id || ""
          );
          setOrders(ordersData.data || []);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les statistiques
  const stats = {
    totalProducts: products.length,
    availableProducts: products.filter(
      (p) => p.statut === ProductStatut.DISPONIBLE
    ).length,
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.statut === CommandeStatut.COMPLETE)
      .length,
    pendingOrders: orders.filter((o) => o.statut === CommandeStatut.EN_ATTENTE)
      .length,
    totalRevenue: orders.reduce((sum, order) => {
      if (!order.lignes || order.lignes.length === 0) return sum;
      return (
        sum +
        order.lignes.reduce((lineSum, line) => {
          const sousTotal =
            typeof line.sousTotal === "string"
              ? parseFloat(line.sousTotal)
              : line.sousTotal || 0;
          return lineSum + sousTotal;
        }, 0)
      );
    }, 0),
  };

  const handleEditProfile = () => {
    navigate(`/profile/${displayUser?.id}`);
  };

  const handleContact = () => {
    toast.info("Fonctionnalité de messagerie à venir");
  };

  const handleViewProduct = (productId?: string) => {
    if (productId) {
      navigate(`/products/${productId}`);
    }
  };

  if (isLoading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </section>
    );
  }

  if (!displayUser) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <Card className="p-12 text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Utilisateur introuvable</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Retour à l'accueil
          </Button>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header Card */}
      <Card className="p-0! overflow-hidden">
        {/* Banner */}

        {/* Profile Content */}
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-linear-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-6xl border-4 border-white shadow-md">
                {displayUser.avatar ? (
                  <img
                    src={displayUser.avatar}
                    alt={displayUser.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  "👤"
                )}
              </div>
              {displayUser.role === Role.PAYSAN && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                  <Star size={16} fill="white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 pt-4">
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {displayUser.prenom} {displayUser.nom}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <Badge className="bg-green-600">
                      {displayUser.role === Role.PAYSAN
                        ? "🌾 Paysan"
                        : displayUser.role === Role.COLLECTEUR
                        ? "🚚 Collecteur"
                        : "🛡️ Admin"}
                    </Badge>
                    {displayUser.localisation && (
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={14} className="text-green-600" />
                        {displayUser.localisation}
                      </span>
                    )}
                    {displayUser.createdAt && (
                      <span className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar size={14} className="text-green-600" />
                        Membre depuis{" "}
                        {new Date(displayUser.createdAt).toLocaleDateString(
                          "fr-FR"
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {isOwnProfile ? (
                    <Button
                      onClick={handleEditProfile}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Edit size={18} className="mr-2" />
                      Modifier
                    </Button>
                  ) : (
                    <Button
                      onClick={handleContact}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Mail size={18} className="mr-2" />
                      Contacter
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                {displayUser.role === Role.PAYSAN && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.totalProducts}
                      </div>
                      <div className="text-xs text-gray-600">Produits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.availableProducts}
                      </div>
                      <div className="text-xs text-gray-600">Disponibles</div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalOrders}
                  </div>
                  <div className="text-xs text-gray-600">Commandes</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.completedOrders}
                  </div>
                  <div className="text-xs text-gray-600">Complétées</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="border-b mb-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User size={16} />
            Aperçu
          </TabsTrigger>
          {displayUser.role === Role.PAYSAN && (
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package size={16} />
              <span className="hidden sm:block">Produits publiés</span>
              <Tooltip text="Produits publiés">
                <Badge variant="secondary">{stats.totalProducts}</Badge>
              </Tooltip>
            </TabsTrigger>
          )}
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart size={16} />
            {displayUser.role === Role.PAYSAN ? (
              <span className="hidden sm:block">Commandes reçues</span>
            ) : (
              <span className="hidden sm:block">Commandes passées</span>
            )}
            <Tooltip text="Commandes">
              <Badge variant="secondary">{stats.totalOrders}</Badge>
            </Tooltip>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          {isOwnProfile && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenus Totaux</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(stats.totalRevenue).toLocaleString()} Ar
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-linear-to-br from-blue-50 to-cyan-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingCart className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Commandes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.totalOrders}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-linear-to-br from-yellow-50 to-orange-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="text-yellow-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">En Attente</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.pendingOrders}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-linear-to-br from-purple-50 to-pink-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Complétées</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {stats.completedOrders}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Informations de Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Mail className="text-blue-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{displayUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Phone className="text-green-600" size={20} />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold">{displayUser.telephone}</p>
                </div>
              </div>

              {displayUser.adresse && (
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg md:col-span-2">
                  <MapPin className="text-purple-600" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-semibold">{displayUser.adresse}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        {displayUser.role === Role.PAYSAN && (
          <TabsContent value="products" className="space-y-4">
            {products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun produit disponible</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="p-6 hover:shadow-md transition cursor-pointer"
                    onClick={() => handleViewProduct(product.id)}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-linear-to-br from-orange-100 to-amber-100 rounded-xl flex items-center justify-center text-3xl overflow-hidden">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.nom}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          "📦"
                        )}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-bold truncate">{product.nom}</h4>
                        <p className="text-sm text-gray-600">{product.type}</p>
                      </div>
                      <Badge
                        className={
                          product.statut === ProductStatut.DISPONIBLE
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {product.statut === ProductStatut.DISPONIBLE
                          ? "Disponible"
                          : "Épuisé"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Quantité</p>
                        <p className="font-bold">
                          {product.quantiteDisponible} {product.unite}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">Prix</p>
                        <p className="font-bold text-green-600">
                          {product.prixUnitaire.toLocaleString()} Ar
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} />
                        {product.localisation?.adresse || "Localisation"}
                      </span>
                      <Button size="sm" variant="ghost">
                        <Eye size={14} className="mr-1" />
                        Voir
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card className="p-12 text-center">
              <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune commande</p>
            </Card>
          ) : (
            orders.slice(0, 5).map((order) => {
              const getStatusConfig = (status?: CommandeStatut) => {
                const defaultConfig = {
                  label: "En attente",
                  color: "bg-yellow-100 text-yellow-700",
                };

                const configs: Partial<
                  Record<CommandeStatut, { label: string; color: string }>
                > = {
                  [CommandeStatut.EN_ATTENTE]: {
                    label: "En attente",
                    color: "bg-yellow-100 text-yellow-700",
                  },
                  [CommandeStatut.ACCEPTEE]: {
                    label: "Acceptée",
                    color: "bg-green-100 text-green-700",
                  },
                  [CommandeStatut.COMPLETE]: {
                    label: "Complète",
                    color: "bg-green-100 text-green-700",
                  },
                  [CommandeStatut.ANNULEE]: {
                    label: "Annulée",
                    color: "bg-red-100 text-red-700",
                  },
                };

                return status
                  ? configs[status] ?? defaultConfig
                  : defaultConfig;
              };

              const statusConfig = getStatusConfig(order.statut);

              return (
                <Card key={order.id} className="p-6 hover:shadow-md transition">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-bold">
                        {order.produitRecherche ||
                          `Commande #${order.id?.slice(0, 8)}`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {order.collecteur
                          ? `${order.collecteur.prenom} ${order.collecteur.nom}`
                          : "Collecteur"}
                      </p>
                    </div>
                    <Badge className={statusConfig.color}>
                      {statusConfig.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {order.quantiteTotal} {order.unite}
                    </span>
                    {order.createdAt && (
                      <span className="text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default Profile;
