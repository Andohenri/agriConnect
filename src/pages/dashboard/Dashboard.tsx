import { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Role, CommandeStatut } from "@/types/enums";
import { OrderService } from "@/service/order.service";
import { ProductService } from "@/service/product.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userRole = user?.role;
  const isPysan = userRole === Role.PAYSAN;
  const isCollector = userRole === Role.COLLECTEUR;

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    availableProducts: 0,
    outOfStockProducts: 0,
    successRate: 0,
    revenueGrowth: 0,
    ordersGrowth: 0,
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadOrdersStats(),
        loadProductsStats(),
        loadRecentActivities(),
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement du dashboard:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrdersStats = async () => {
    try {
      let ordersStatsData;
      if (isPysan) {
        ordersStatsData = await OrderService.getOrdersStatsPaysan();
      } else if (isCollector) {
        ordersStatsData = await OrderService.getOrdersStatsCollecteur();
      }

      if (ordersStatsData) {
        const total = ordersStatsData.totalCommandes || 0;
        const completed = ordersStatsData.commandesCompletees || 0;
        const cancelled = ordersStatsData.commandesAnnulees || 0;
        const pending =
          (ordersStatsData.commandesOuvertes || 0) +
          (ordersStatsData.commandesAcceptees || 0);

        const successRate =
          total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats((prev) => ({
          ...prev,
          totalOrders: total,
          pendingOrders: pending,
          completedOrders: completed,
          cancelledOrders: cancelled,
          successRate,
          ordersGrowth: calculateGrowth(total), // Simulé pour l'instant
        }));
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats commandes:", error);
    }
  };

  const loadProductsStats = async () => {
    try {
      if (isPysan) {
        const productsStatsData = await ProductService.getProductsStats();

        if (productsStatsData) {
          setStats((prev) => ({
            ...prev,
            totalProducts: productsStatsData.totalProduits || 0,
            availableProducts: productsStatsData.produitsDisponibles || 0,
            outOfStockProducts: productsStatsData.produitsRupture || 0,
          }));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des stats produits:", error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      let ordersData;
      if (isPysan) {
        ordersData = await OrderService.getAllOrdersRequestPaysan(1, 5);
      } else if (isCollector) {
        ordersData = await OrderService.getAllOrdersCollecteur(user?.id!, 1, 5);
      }

      if (ordersData?.data) {
        const activities = ordersData.data.map((order: any) => {
          const statusConfig = getStatusConfig(order.statut);
          return {
            id: order.id,
            action: isPysan ? "Commande reçue" : "Commande passée",
            product:
              order.produitRecherche || `Commande #${order.id?.slice(0, 8)}`,
            time: formatTimeAgo(order.createdAt),
            icon: statusConfig.icon,
            color: statusConfig.color,
            status: order.statut,
          };
        });
        setRecentActivities(activities);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des activités:", error);
    }
  };

  const calculateGrowth = (current: number) => {
    // Simulé - À remplacer par des vraies données historiques
    const random = Math.floor(Math.random() * 30) - 10;
    return random;
  };

  const getStatusConfig = (status?: CommandeStatut) => {
    type StatusConfig = {
      icon: string;
      color: string;
      label: string;
    };

    const configs: Partial<Record<CommandeStatut, StatusConfig>> = {
      [CommandeStatut.EN_ATTENTE]: {
        icon: "⏳",
        color: "bg-yellow-100 text-yellow-700",
        label: "En attente",
      },
      [CommandeStatut.OUVERTE]: {
        icon: "🔓",
        color: "bg-blue-100 text-blue-700",
        label: "Ouverte",
      },
      [CommandeStatut.ACCEPTEE]: {
        icon: "✅",
        color: "bg-green-100 text-green-700",
        label: "Acceptée",
      },
      [CommandeStatut.COMPLETE]: {
        icon: "🎉",
        color: "bg-teal-100 text-teal-700",
        label: "Complète",
      },
      [CommandeStatut.LIVREE]: {
        icon: "🚚",
        color: "bg-purple-100 text-purple-700",
        label: "Livrée",
      },
      [CommandeStatut.ANNULEE]: {
        icon: "❌",
        color: "bg-red-100 text-red-700",
        label: "Annulée",
      },
    };

    const key = status ?? CommandeStatut.EN_ATTENTE;
    return configs[key] ?? configs[CommandeStatut.EN_ATTENTE]!;
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Récemment";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const handleViewOrder = (orderId?: string) => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  if (isLoading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Tableau de bord {isPysan ? "Producteur" : "Collecteur"}
          </h1>
          <p className="text-gray-600 mt-1">
            Bienvenue, {user?.prenom} {user?.nom} 👋
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Produits (Paysan uniquement) */}
        {isPysan && (
          <Card className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <Package size={32} className="opacity-80" />
              <Badge className="bg-blue-400 bg-opacity-30 border-0 text-white">
                {stats.availableProducts}/{stats.totalProducts}
              </Badge>
            </div>
            <p className="text-2xl md:text-3xl font-bold mb-1">
              {stats.totalProducts}
            </p>
            <p className="text-blue-100 text-sm">Produits publiés</p>
            <div className="mt-3 flex items-center gap-1 text-xs">
              <CheckCircle size={14} />
              <span>{stats.availableProducts} disponibles</span>
            </div>
          </Card>
        )}

        {/* Commandes */}
        <Card className="bg-linear-to-br from-green-500 to-green-600 text-white p-4 md:p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <ShoppingCart size={32} className="opacity-80" />
            <Badge
              className={`bg-green-400 bg-opacity-30 border-0 text-white flex items-center gap-1`}
            >
              {stats.ordersGrowth >= 0 ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {Math.abs(stats.ordersGrowth)}%
            </Badge>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">
            {stats.totalOrders}
          </p>
          <p className="text-green-100 text-sm">
            {isPysan ? "Commandes reçues" : "Commandes passées"}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <Clock size={14} />
            <span>{stats.pendingOrders} en attente</span>
          </div>
        </Card>

        {/* Revenus / Dépenses */}
        <Card className="bg-linear-to-br from-yellow-500 to-orange-500 text-white p-4 md:p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <DollarSign size={32} className="opacity-80" />
            <Badge className="bg-yellow-400 bg-opacity-30 border-0 text-white flex items-center gap-1">
              <ArrowUpRight size={12} />
              {stats.revenueGrowth}%
            </Badge>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">
            {stats.totalRevenue.toLocaleString()} Ar
          </p>
          <p className="text-yellow-100 text-sm">
            {isPysan ? "Revenus ce mois" : "Dépenses ce mois"}
          </p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <TrendingUp size={14} />
            <span>En progression</span>
          </div>
        </Card>

        {/* Taux de succès */}
        <Card className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <TrendingUp size={32} className="opacity-80" />
            <Badge className="bg-purple-400 bg-opacity-30 border-0 text-white">
              {stats.completedOrders}/{stats.totalOrders}
            </Badge>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">
            {stats.successRate}%
          </p>
          <p className="text-purple-100 text-sm">Taux de succès</p>
          <div className="mt-3 flex items-center gap-1 text-xs">
            <CheckCircle size={14} />
            <span>{stats.completedOrders} complétées</span>
          </div>
        </Card>
      </div>

      {/* Stats supplémentaires */}
      {isCollector && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pendingOrders}
                </p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complétées</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.completedOrders}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Annulées</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.cancelledOrders}
                </p>
              </div>
              <XCircle className="text-red-500" size={32} />
            </div>
          </Card>
        </div>
      )}

      {/* Activité récente */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <TrendingUp className="text-green-600" />
            Activité récente
          </h3>
          <button
            onClick={() => navigate("/orders")}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Voir tout →
          </button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => handleViewOrder(activity.id)}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
              >
                <div
                  className={`w-10 h-10 md:w-12 md:h-12 ${activity.color} rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm md:text-base">
                      {activity.action}
                    </p>
                    <Badge className={activity.color} variant="secondary">
                      {getStatusConfig(activity.status).label}
                    </Badge>
                  </div>
                  <p className="text-xs md:text-sm text-gray-600 truncate">
                    {activity.product}
                  </p>
                </div>
                <span className="text-xs md:text-sm text-gray-400 shrink-0">
                  {activity.time}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg mb-2">
                {isPysan ? "Gérer mes produits" : "Explorer les produits"}
              </h4>
              <p className="text-sm text-gray-600">
                {isPysan
                  ? "Ajouter, modifier ou supprimer vos produits"
                  : "Parcourir le catalogue de produits"}
              </p>
            </div>
            <Package className="text-green-600" size={48} />
          </div>
          <button
            onClick={() => navigate("/products")}
            className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
          >
            Voir les produits →
          </button>
        </Card>

        <Card className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-lg mb-2">
                {isPysan ? "Mes commandes" : "Passer une commande"}
              </h4>
              <p className="text-sm text-gray-600">
                {isPysan
                  ? "Consulter et gérer vos commandes reçues"
                  : "Commander des produits agricoles"}
              </p>
            </div>
            <ShoppingCart className="text-blue-600" size={48} />
          </div>
          <button
            onClick={() => navigate("/orders")}
            className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {isPysan ? "Voir mes commandes" : "Commander"} →
          </button>
        </Card>
      </div>
    </section>
  );
};

export default Dashboard;
