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
  ChevronLeft,
  ChevronRight,
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
  // États pour le chargement
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // États pour la pagination des produits
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotalPages, setProductsTotalPages] = useState(1);
  const [productsLimit] = useState(9);

  // États pour la pagination des commandes
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersTotalPages, setOrdersTotalPages] = useState(1);
  const [ordersLimit] = useState(5);

  // Stats réelles (totales, pas paginées)
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalAvailableProducts, setTotalAvailableProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const isOwnProfile = !id || id === currentUser?.id;
  const displayUser = isOwnProfile ? currentUser : profileUser;

  // Tabs state
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    loadProfileData();
  }, [id]);

  useEffect(() => {
    if (displayUser?.role === Role.PAYSAN) {
      loadProducts();
    }
  }, [productsPage, displayUser]);

  useEffect(() => {
    if (isOwnProfile) {
      loadOrders();
    }
  }, [ordersPage, isOwnProfile]);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      let userToDisplay: User | null = null;

      // 1. Charger les données de l'utilisateur
      if (isOwnProfile) {
        userToDisplay = currentUser;
      } else if (id) {
        const userData = await UserService.getUserById(id);
        setProfileUser(userData);
        userToDisplay = userData;
      }

      if (!userToDisplay) {
        setIsLoading(false);
        return;
      }

      // 2. Charger les statistiques réelles (sans pagination)
      if (userToDisplay.role === Role.PAYSAN) {
        await loadProductsStats();
      }

      if (isOwnProfile) {
        await loadOrdersStats();
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
      toast.error("Erreur lors du chargement du profil");
    } finally {
      setIsLoading(false);
    }
  };

  const loadProductsStats = async () => {
    try {
      let statsData;
      if (isOwnProfile) {
        statsData = await ProductService.getProductsStats();
      } else {
        statsData = await ProductService.getProductsStatsByUserId(id!);
      }

      if (statsData) {
        setTotalProducts(statsData.totalProduits || 0);
        setTotalAvailableProducts(statsData.produitsDisponibles || 0);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats produits:", error);
    }
  };

  const loadOrdersStats = async () => {
    try {
      let statsData;
      if (currentUser?.role === Role.PAYSAN) {
        statsData = await OrderService.getOrdersStatsPaysan();
      } else if (currentUser?.role === Role.COLLECTEUR) {
        statsData = await OrderService.getOrdersStatsCollecteur();
      }

      if (statsData) {
        setTotalOrders(statsData.totalCommandes || 0);
        setTotalCompletedOrders(statsData.commandesCompletees || 0);
        
        // En attente = Ouvertes + Acceptées (commandes non finalisées)
        const pending = (statsData.commandesOuvertes || 0) + (statsData.commandesAcceptees || 0);
        setTotalPendingOrders(pending);
        
        // Revenue: vous devrez peut-être ajouter ce champ dans votre backend
        // ou le calculer côté frontend si nécessaire
        setTotalRevenue(0); // À ajuster selon votre logique métier
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats commandes:", error);
    }
  };

  const loadProducts = async () => {
    try {
      let productsData;
      if (isOwnProfile) {
        productsData = await ProductService.getAllProductsPaysan(productsPage, productsLimit);
      } else {
        productsData = await ProductService.getProductsByUserId(id!, productsPage, productsLimit);
      }

      if (productsData?.data) {
        setProducts(productsData.data);
        setProductsTotalPages(productsData.totalPages || 1);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des produits:", error);
    }
  };

  const loadOrders = async () => {
    try {
      let ordersData;
      if (currentUser?.role === Role.PAYSAN) {
        ordersData = await OrderService.getAllOrdersDirectPaysan(ordersPage, ordersLimit);
        console.log("Orders Data getAllOrdersPaysan:", ordersData);
      } else if (currentUser?.role === Role.COLLECTEUR) {
        ordersData = await OrderService.getAllOrdersCollecteur(
          currentUser.id!,
          ordersPage,
          ordersLimit
        );
      }

      if (ordersData?.data) {
        setOrders(ordersData.data);
        setOrdersTotalPages(ordersData.totalPages || 1);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    }
  };

  const handleProductsPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= productsTotalPages) {
      setProductsPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleOrdersPageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= ordersTotalPages) {
      setOrdersPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const pages = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const PaginationControls = ({
    currentPage,
    totalPages,
    onPageChange,
  }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => (
    <>
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
          <div className="text-sm text-green-700 font-medium">
            Page {currentPage} sur {totalPages}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              <ChevronLeft size={16} />
              Précédent
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers(currentPage, totalPages).map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-10 ${
                      currentPage === page
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <div className="sm:hidden">
              <select
                value={currentPage}
                onChange={(e) => onPageChange(Number(e.target.value))}
                className="px-3 py-1 border rounded-md text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 hover:bg-green-50 hover:text-green-700 hover:border-green-300 disabled:hover:bg-transparent disabled:hover:text-gray-400"
            >
              Suivant
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );

  const handleEditProfile = () => {
    navigate(`/profile/edit/${displayUser?.id}`);
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

  const getRoleConfig = (role?: Role) => {
    if (!role)
      return {
        icon: "👤",
        label: "Utilisateur",
        color: "bg-gray-100 text-gray-700",
      };

    const configs = {
      [Role.PAYSAN]: {
        icon: "👨‍🌾",
        label: "Paysan",
        color: "bg-green-100 text-green-700",
      },
      [Role.COLLECTEUR]: {
        icon: "🚚",
        label: "Collecteur",
        color: "bg-blue-100 text-blue-700",
      },
      [Role.ADMIN]: {
        icon: "🛡️",
        label: "Administrateur",
        color: "bg-purple-100 text-purple-700",
      },
    };
    return configs[role];
  };

  const roleConfig = getRoleConfig(displayUser?.role);

  return (
    <section className="space-y-6">
      {/* Header Card */}
      <Card className="p-0! overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-linear-to-br rounded-2xl flex items-center justify-center text-6xl border-4 border-white shadow-md">
                {displayUser.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_UPLOAD_URL}${displayUser.avatar}`}
                    alt={displayUser.nom}
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl bg-linear-to-br rounded-2xl from-green-400 to-emerald-600">
                    {roleConfig.icon}
                  </div>
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
                    <Badge className={roleConfig.color}>
                      {roleConfig.icon} {roleConfig.label}
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
                        {new Date(displayUser.createdAt).toLocaleDateString("fr-FR")}
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
                        {totalProducts}
                      </div>
                      <div className="text-xs text-gray-600">Produits</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {totalAvailableProducts}
                      </div>
                      <div className="text-xs text-gray-600">Disponibles</div>
                    </div>
                  </>
                )}

                {isOwnProfile && (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {totalOrders}
                      </div>
                      <div className="text-xs text-gray-600">Commandes</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {totalCompletedOrders}
                      </div>
                      <div className="text-xs text-gray-600">Complétées</div>
                    </div>
                  </>
                )}
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
              <span className="hidden sm:block">Produits</span>
              <Tooltip text="Produits publiés">
                <Badge variant="secondary">{totalProducts}</Badge>
              </Tooltip>
            </TabsTrigger>
          )}
          {isOwnProfile && (
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart size={16} />
              {displayUser.role === Role.PAYSAN ? (
                <span className="hidden sm:block">Commandes reçues</span>
              ) : (
                <span className="hidden sm:block">Mes commandes</span>
              )}
              <Tooltip text="Commandes">
                <Badge variant="secondary">{totalOrders}</Badge>
              </Tooltip>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
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
                      {Math.round(totalRevenue).toLocaleString()} Ar
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
                    <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
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
                      {totalPendingOrders}
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
                      {totalCompletedOrders}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Informations de Contact</h3>
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
            {isLoadingProducts ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : totalProducts === 0 ? (
              <Card className="p-12 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  {isOwnProfile
                    ? "Vous n'avez aucun produit publié"
                    : "Aucun produit disponible"}
                </p>
              </Card>
            ) : products.length === 0 ? (
              <Card className="p-12 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun produit sur cette page</p>
              </Card>
            ) : (
              <>
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

                <PaginationControls
                  currentPage={productsPage}
                  totalPages={productsTotalPages}
                  onPageChange={handleProductsPageChange}
                />
              </>
            )}
          </TabsContent>
        )}

        {/* Orders Tab */}
        {isOwnProfile && (
          <TabsContent value="orders" className="space-y-4">
            {isLoadingOrders ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : totalOrders === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucune commande</p>
              </Card>
            ) : orders.length === 0 ? (
              <Card className="p-12 text-center">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucune commande sur cette page</p>
              </Card>
            ) : (
              <>
                <div className="space-y-4">
                  {orders.map((order) => {
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

                      return status ? configs[status] ?? defaultConfig : defaultConfig;
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
                  })}
                </div>

                <PaginationControls
                  currentPage={ordersPage}
                  totalPages={ordersTotalPages}
                  onPageChange={handleOrdersPageChange}
                />
              </>
            )}
          </TabsContent>
        )}
      </Tabs>
    </section>
  );
};

export default Profile;