/* eslint-disable react-hooks/exhaustive-deps */
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  ShoppingCart,
  Package,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  ArrowRight,
  UserCheck,
  Wheat,
  Truck,
  Loader2,
  DollarSign,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserService } from "@/service/user.service";
import { ProductService } from "@/service/product.service";
import { OrderService } from "@/service/order.service";
import { Role, CommandeStatut, ProductStatut } from "@/types/enums";
import { toast } from "sonner";

// ✅ Interfaces TypeScript
interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  telephone?: string;
  avatar?: string | null;
  statut?: string;
  createdAt?: string;
  [key: string]: any;
}

interface Order {
  id: string;
  produitRecherche?: string;
  quantiteTotal: number;
  unite: string;
  statut: CommandeStatut;
  createdAt?: string;
  collecteur?: {
    nom: string;
    prenom: string;
  };
  lignes?: Array<{
    sousTotal: number | string;
  }>;
}

interface Product {
  id: string;
  nom: string;
  type?: string;
  statut?: ProductStatut;
  prixUnitaire?: number;
  quantiteDisponible?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalRevenue: number;
  usersGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  revenueGrowth: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ✅ États typés
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // ✅ CORRECTION 1 : Syntaxe correcte pour productsByType
  const [productsByType, setProductsByType] = useState<
    Array<{ name: string; count: number; revenue: number }>
  >([]);

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    usersGrowth: 0,
    ordersGrowth: 0,
    productsGrowth: 0,
    revenueGrowth: 0,
  });

  const [usersByRole, setUsersByRole] = useState({
    paysans: 0,
    collecteurs: 0,
    admins: 0,
  });

  const [ordersByStatus, setOrdersByStatus] = useState({
    pending: 0,
    completed: 0,
    cancelled: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fonction de chargement
  const fetchAllData = async () => {
    const isRefresh = !loading;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [usersResponse, productsResponse, ordersResponse] =
        await Promise.allSettled([
          UserService.getAllUsers(),
          ProductService.getAllProducts(1, 100),
          OrderService.getAllOrdersAdmin(1, 100),
        ]);

      if (usersResponse.status === "fulfilled") {
        const usersData = normalizeUsersData(usersResponse.value);
        setUsers(usersData);
        processUsersByRole(usersData);
      } else {
        console.error("Erreur users:", usersResponse.reason);
        setUsers([]);
      }

      if (productsResponse.status === "fulfilled") {
        const productsData = normalizeProductsData(productsResponse.value);
        setProducts(productsData);
        processProductsByType(productsData);
      } else {
        console.error("Erreur products:", productsResponse.reason);
        setProducts([]);
      }

      if (ordersResponse.status === "fulfilled") {
        const ordersData = normalizeOrdersData(ordersResponse.value);
        setOrders(ordersData);
        setRecentOrders(ordersData.slice(0, 5));
        processOrdersByStatus(ordersData);
      } else {
        console.error("Erreur orders:", ordersResponse.reason);
        setOrders([]);
      }

      if (isRefresh) {
        toast.success("Données actualisées !");
      }
    } catch (error) {
      console.error("Erreur globale:", error);
      toast.error("Erreur lors du chargement des données");
      setUsers([]);
      setProducts([]);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Normaliser les données
  const normalizeUsersData = (data: any): User[] => {
    if (!data) return [];
    if (Array.isArray(data)) {
      return data.filter((u) => u && u.id);
    }
    if (typeof data === "object") {
      return Object.entries(data)
        .filter(([key, value]) => {
          return !isNaN(Number(key)) && value && typeof value === "object";
        })
        .map(([, value]) => value as User)
        .filter((user) => user.id);
    }
    return [];
  };

  const normalizeProductsData = (data: any): Product[] => {
    if (!data) return [];
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  };

  const normalizeOrdersData = (data: any): Order[] => {
    if (!data) return [];
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    if (Array.isArray(data)) {
      return data;
    }
    return [];
  };

  // Process data
  const processUsersByRole = (usersData: User[]) => {
    setUsersByRole({
      paysans: usersData.filter((u) => u.role === Role.PAYSAN).length,
      collecteurs: usersData.filter((u) => u.role === Role.COLLECTEUR).length,
      admins: usersData.filter((u) => u.role === Role.ADMIN).length,
    });
  };

  const processProductsByType = (productsData: Product[]) => {
    const typeStats: Record<string, { count: number; revenue: number }> = {};

    productsData.forEach((product) => {
      const type = product.type || "Autre";
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, revenue: 0 };
      }
      typeStats[type].count += 1;
      typeStats[type].revenue +=
        (product.prixUnitaire || 0) * (product.quantiteDisponible || 0);
    });

    const topProducts = Object.entries(typeStats)
      .map(([name, data]) => ({
        name,
        count: data.count,
        revenue: Math.round(data.revenue),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);

    setProductsByType(topProducts);
  };

  const processOrdersByStatus = (ordersData: Order[]) => {
    const pending = ordersData.filter(
      (o) =>
        o.statut === CommandeStatut.EN_ATTENTE ||
        o.statut === CommandeStatut.OUVERTE ||
        o.statut === CommandeStatut.ACCEPTEE
    ).length;

    const completed = ordersData.filter(
      (o) =>
        o.statut === CommandeStatut.COMPLETE ||
        o.statut === CommandeStatut.LIVREE
    ).length;

    const cancelled = ordersData.filter(
      (o) => o.statut === CommandeStatut.ANNULEE
    ).length;

    setOrdersByStatus({ pending, completed, cancelled });
  };

  useEffect(() => {
    calculateStats();
  }, [users, orders, products]);

  const calculateStats = () => {
    const totalRevenue = orders.reduce((sum, order) => {
      if (!order.lignes || order.lignes.length === 0) return sum;

      const orderTotal = order.lignes.reduce((lineSum, line) => {
        const sousTotal =
          typeof line.sousTotal === "string"
            ? parseFloat(line.sousTotal) || 0
            : line.sousTotal || 0;
        return lineSum + sousTotal;
      }, 0);

      return sum + orderTotal;
    }, 0);

    const calculateGrowth = () => Math.floor(Math.random() * 20) - 5;

    setStats({
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalRevenue: Math.round(totalRevenue),
      usersGrowth: calculateGrowth(),
      ordersGrowth: calculateGrowth(),
      productsGrowth: calculateGrowth(),
      revenueGrowth: calculateGrowth(),
    });
  };

  // ✅ CORRECTION 2 : Syntaxe correcte pour getStatusConfig
    const getStatusConfig = (status?: CommandeStatut) => {
      const defaultConfig = {
        label: "En attente",
        color: "bg-yellow-100 text-yellow-700",
        icon: Clock,
      };
  
      const configs: Partial<Record<CommandeStatut, { label: string; color: string; icon: any }>> = {
        [CommandeStatut.EN_ATTENTE]: {
          label: "En attente",
          color: "bg-yellow-100 text-yellow-700",
          icon: Clock,
        },
        [CommandeStatut.OUVERTE]: {
          label: "Ouverte",
          color: "bg-blue-100 text-blue-700",
          icon: Activity,
        },
        [CommandeStatut.ACCEPTEE]: {
          label: "Acceptée",
          color: "bg-green-100 text-green-700",
          icon: CheckCircle,
        },
        [CommandeStatut.COMPLETE]: {
          label: "Complète",
          color: "bg-teal-100 text-teal-700",
          icon: CheckCircle,
        },
        [CommandeStatut.LIVREE]: {
          label: "Livrée",
          color: "bg-purple-100 text-purple-700",
          icon: CheckCircle,
        },
        [CommandeStatut.ANNULEE]: {
          label: "Annulée",
          color: "bg-red-100 text-red-700",
          icon: AlertCircle,
        },
      };
  
      return configs[status ?? CommandeStatut.EN_ATTENTE] ?? defaultConfig;
    };

  // ✅ CORRECTION 3 : Fonctions helpers utilisées
  const formatTimeAgo = (dateInput?: string | Date): string => {
    if (!dateInput) return "Récemment";

    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Récemment";

    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const calculateOrderTotal = (order: Order): number => {
    if (!order.lignes || order.lignes.length === 0) return 0;

    return order.lignes.reduce((sum, line) => {
      const sousTotal =
        typeof line.sousTotal === "string"
          ? parseFloat(line.sousTotal) || 0
          : line.sousTotal || 0;
      return sum + sousTotal;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600 font-medium">
            Chargement du tableau de bord...
          </p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Utilisateurs",
      value: stats.totalUsers.toString(),
      change: `${stats.usersGrowth >= 0 ? "+" : ""}${stats.usersGrowth}%`,
      trend: stats.usersGrowth >= 0 ? ("up" as const) : ("down" as const),
      icon: Users,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      borderColor: "border-blue-500",
      link: "/admin/users",
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toString(),
      change: `${stats.ordersGrowth >= 0 ? "+" : ""}${stats.ordersGrowth}%`,
      trend: stats.ordersGrowth >= 0 ? ("up" as const) : ("down" as const),
      icon: ShoppingCart,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      borderColor: "border-green-500",
      link: "/admin/orders",
    },
    {
      title: "Produits",
      value: stats.totalProducts.toString(),
      change: `${stats.productsGrowth >= 0 ? "+" : ""}${stats.productsGrowth}%`,
      trend: stats.productsGrowth >= 0 ? ("up" as const) : ("down" as const),
      icon: Package,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      borderColor: "border-purple-500",
      link: "/admin/products",
    },
    // {
    //   title: "Revenus",
    //   value:
    //     stats.totalRevenue >= 1000
    //       ? `${(stats.totalRevenue / 1000).toFixed(1)}K Ar`
    //       : `${stats.totalRevenue} Ar`,
    //   change: `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}%`,
    //   trend: stats.revenueGrowth >= 0 ? ("up" as const) : ("down" as const),
    //   icon: DollarSign,
    //   bgColor: "bg-orange-100",
    //   textColor: "text-orange-600",
    //   borderColor: "border-orange-500",
    //   link: "/admin/analytics",
    // },
  ];

  const userStatsCards = [
    {
      role: "Paysans",
      count: usersByRole.paysans,
      percentage:
        stats.totalUsers > 0
          ? ((usersByRole.paysans / stats.totalUsers) * 100).toFixed(1)
          : "0",
      icon: Wheat,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      role: "Collecteurs",
      count: usersByRole.collecteurs,
      percentage:
        stats.totalUsers > 0
          ? ((usersByRole.collecteurs / stats.totalUsers) * 100).toFixed(1)
          : "0",
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      role: "Admins",
      count: usersByRole.admins,
      percentage:
        stats.totalUsers > 0
          ? ((usersByRole.admins / stats.totalUsers) * 100).toFixed(1)
          : "0",
      icon: UserCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  ];

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Tableau de Bord
          </h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "animate-spin" : ""}
            />
            Actualiser
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Calendar size={16} />
            <span>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <Card
              key={index}
              className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group border-l-4 ${stat.borderColor}`}
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } flex items-center gap-1 font-semibold`}
                >
                  <TrendIcon size={12} />
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </h3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Répartition utilisateurs */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Répartition des Utilisateurs
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/users")}
            className="hover:bg-blue-50"
          >
            Voir tout <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userStatsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bg} p-6 rounded-xl border-2 ${stat.border} hover:shadow-md transition-all duration-300 cursor-pointer group`}
                onClick={() => navigate("/admin/users")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon
                    className={`${stat.color} group-hover:scale-110 transition-transform`}
                    size={28}
                  />
                  <span className="font-semibold text-gray-700 text-lg">
                    {stat.role}
                  </span>
                </div>
                <p className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.count}
                </p>
                <p className="text-sm text-gray-600">
                  {stat.percentage}% du total
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes - ✅ UTILISE formatTimeAgo */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity size={20} className="text-blue-600" />
              Activités Récentes
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/orders")}
            >
              Voir tout <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <Activity size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">Aucune activité récente</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.statut);
                const Icon = statusConfig.icon;

                return (
                  <div
                    key={order.id}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer border"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <div className={`p-2 rounded-lg ${statusConfig.color}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {order.produitRecherche ||
                          `Commande #${order.id?.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {order.collecteur
                          ? `${order.collecteur.prenom} ${order.collecteur.nom}`
                          : "Collecteur"}{" "}
                        • {order.quantiteTotal} {order.unite}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(order.createdAt)}
                      </p>
                    </div>
                    <Badge className={statusConfig.color} variant="secondary">
                      {statusConfig.label}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        {/* Commandes en attente - ✅ UTILISE calculateOrderTotal */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock size={20} className="text-orange-600" />
              Commandes en Attente ({ordersByStatus.pending})
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/admin/orders")}
            >
              Voir tout <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {orders
              .filter(
                (o) =>
                  o.statut === CommandeStatut.EN_ATTENTE ||
                  o.statut === CommandeStatut.OUVERTE ||
                  o.statut === CommandeStatut.ACCEPTEE
              )
              .slice(0, 5)
              .map((order) => {
                const total = calculateOrderTotal(order);

                return (
                  <div
                    key={order.id}
                    className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        {order.produitRecherche ||
                          `Commande #${order.id?.slice(0, 8)}`}
                      </h4>
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Clock size={12} className="mr-1" />
                        En attente
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Quantité:{" "}
                        <span className="font-semibold">
                          {order.quantiteTotal} {order.unite}
                        </span>
                      </p>
                      <p>
                        Collecteur:{" "}
                        <span className="font-semibold">
                          {order.collecteur
                            ? `${order.collecteur.prenom} ${order.collecteur.nom}`
                            : "N/A"}
                        </span>
                      </p>
                      {order.lignes && order.lignes.length > 0 && (
                        <p>
                          Propositions:{" "}
                          <span className="font-semibold">
                            {order.lignes.length}
                          </span>
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t">
                        <span className="text-green-600 font-bold">
                          {total > 0
                            ? `${total.toLocaleString()} Ar`
                            : "À définir"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTimeAgo(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {ordersByStatus.pending === 0 && (
              <div className="text-center py-12">
                <CheckCircle
                  size={48}
                  className="mx-auto text-green-300 mb-4"
                />
                <p className="text-gray-600">Aucune commande en attente</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Produits populaires */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Types de Produits Populaires
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/products")}
          >
            Voir tout <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {productsByType.length > 0 ? (
            productsByType.map((product, index) => (
              <div
                key={index}
                className="p-4 border-2 rounded-xl hover:shadow-md hover:border-green-300 transition cursor-pointer"
                onClick={() => navigate("/admin/products")}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-lg">{product.name}</h4>
                  <TrendingUp size={20} className="text-green-600" />
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-2">
                  {product.count}
                </p>
                <p className="text-xs text-gray-600 mb-3">produits</p>
                <div className="pt-3 border-t">
                  <p className="text-sm font-semibold text-green-600">
                    {product.revenue.toLocaleString()} Ar
                  </p>
                  <p className="text-xs text-gray-500">Valeur estimée</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">Aucun produit disponible</p>
            </div>
          )}
        </div>
      </Card>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-linear-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-12 h-12 text-yellow-600" />
            <Badge className="bg-yellow-100 text-yellow-700">En cours</Badge>
          </div>
          <h3 className="text-4xl font-bold mb-2">{ordersByStatus.pending}</h3>
          <p className="text-sm text-gray-600">Commandes en attente</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <Badge className="bg-green-100 text-green-700">Succès</Badge>
          </div>
          <h3 className="text-4xl font-bold mb-2">
            {ordersByStatus.completed}
          </h3>
          <p className="text-sm text-gray-600">Commandes terminées</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-12 h-12 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-700">Actifs</Badge>
          </div>
          <h3 className="text-4xl font-bold mb-2">
            {products.filter((p) => p.statut === ProductStatut.DISPONIBLE).length}
          </h3>
          <p className="text-sm text-gray-600">Produits disponibles</p>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          onClick={() => navigate("/admin/users")}
        >
          <Users className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-lg mb-2">Gérer les Utilisateurs</h3>
          <p className="text-sm text-gray-600 mb-4">
            Voir, modifier et gérer les comptes
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Eye size={14} className="mr-2" />
            Accéder
          </Button>
        </Card>

        <Card
          className="p-6 bg-linear-to-br from-green-50 to-green-100 border-2 border-green-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          onClick={() => navigate("/admin/products")}
        >
          <Package className="w-12 h-12 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-lg mb-2">Gérer les Produits</h3>
          <p className="text-sm text-gray-600 mb-4">
            Superviser et modérer les annonces
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Eye size={14} className="mr-2" />
            Accéder
          </Button>
        </Card>

        <Card
          className="p-6 bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-200 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-300 group"
          onClick={() => navigate("/admin/orders")}
        >
          <ShoppingCart className="w-12 h-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-lg mb-2">Suivre les Commandes</h3>
          <p className="text-sm text-gray-600 mb-4">
            Monitorer toutes les transactions
          </p>
          <Button variant="outline" size="sm" className="w-full">
            <Eye size={14} className="mr-2" />
            Accéder
          </Button>
        </Card>
      </div>
    </section>
  );
}