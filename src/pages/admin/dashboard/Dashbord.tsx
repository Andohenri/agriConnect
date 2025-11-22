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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserService } from "@/service/user.service";
import { ProductService } from "@/service/product.service";
import { OrderService } from "@/service/order.service";
import { Role, CommandeStatut } from "@/types/enums";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // États pour les données
  const [users, setUsers] = useState<User[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [availableProducts, setAvailableProducts] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Stats calculées
  const [stats, setStats] = useState({
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

  const [productsByType, setProductsByType] = useState<
    { name: string; count: number; revenue: number }[]
  >([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchProducts(),
        fetchOrders(),
        fetchProductsStats(),
      ]);
      calculateStats();
    } catch (error) {
      console.error("Erreur lors du chargement:", error);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);

      // Calculer la répartition par rôle
      setUsersByRole({
        paysans: usersData.filter((u) => u.role === Role.PAYSAN).length,
        collecteurs: usersData.filter((u) => u.role === Role.COLLECTEUR).length,
        admins: usersData.filter((u) => u.role === Role.ADMIN).length,
      });
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const productsData = await ProductService.getAllProducts(1, 100);
      
      if (productsData?.data) {
        // Grouper par type et calculer les stats
        const typeStats: Record<string, { count: number; revenue: number }> = {};
        
        productsData.data.forEach((product: any) => {
          const type = product.type || "Autre";
          if (!typeStats[type]) {
            typeStats[type] = { count: 0, revenue: 0 };
          }
          typeStats[type].count += 1;
          typeStats[type].revenue += product.prixUnitaire * (product.quantiteDisponible || 0);
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
      }
    } catch (error) {
      console.error("Erreur chargement produits:", error);
    }
  };

  const fetchProductsStats = async () => {
    try {
      const statsData = await ProductService.getGlobalProductsStats();
      if (statsData) {
        setTotalProducts(statsData.totalProduits || 0);
        setAvailableProducts(statsData.produitsDisponibles || 0);
      }
    } catch (error) {
      console.error("Erreur chargement stats produits:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const ordersData = await OrderService.getAllOrdersAdmin(1, 100);
      
      if (ordersData?.data) {
        setOrders(ordersData.data);
        
        // Dernières commandes pour les activités
        setRecentOrders(ordersData.data.slice(0, 5));

        // Calculer la répartition par statut
        const pending = ordersData.data.filter(
          (o: any) =>
            o.statut === CommandeStatut.EN_ATTENTE ||
            o.statut === CommandeStatut.OUVERTE ||
            o.statut === CommandeStatut.ACCEPTEE
        ).length;

        const completed = ordersData.data.filter(
          (o: any) =>
            o.statut === CommandeStatut.COMPLETE ||
            o.statut === CommandeStatut.LIVREE
        ).length;

        const cancelled = ordersData.data.filter(
          (o: any) => o.statut === CommandeStatut.ANNULEE
        ).length;

        setOrdersByStatus({ pending, completed, cancelled });
      }
    } catch (error) {
      console.error("Erreur chargement commandes:", error);
    }
  };

  const calculateStats = () => {
    // Calculer le revenu total
    const totalRevenue = orders.reduce((sum, order) => {
      if (!order.lignes || order.lignes.length === 0) return sum;
      
      const orderTotal = order.lignes.reduce((lineSum, line) => {
        const sousTotal =
          typeof line.sousTotal === "string"
            ? parseFloat(line.sousTotal)
            : line.sousTotal || 0;
        return lineSum + sousTotal;
      }, 0);
      
      return sum + orderTotal;
    }, 0);

    // Simuler la croissance (à remplacer par des données historiques)
    const calculateGrowth = () => Math.floor(Math.random() * 20) - 5;

    setStats({
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: totalProducts,
      totalRevenue: Math.round(totalRevenue),
      usersGrowth: calculateGrowth(),
      ordersGrowth: calculateGrowth(),
      productsGrowth: calculateGrowth(),
      revenueGrowth: calculateGrowth(),
    });
  };

  const getStatusConfig = (status?: CommandeStatut) => {
    const configs: Record<string, { label: string; color: string; icon: any }> = {
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
    const key = status ?? CommandeStatut.EN_ATTENTE;
    return configs[key as string];
  };

  const formatTimeAgo = (dateInput?: string | Date) => {
    if (!dateInput) return "Récemment";
    const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (!(date instanceof Date) || isNaN(date.getTime())) return "Récemment";
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
    return date.toLocaleDateString("fr-FR");
  };

  const calculateOrderTotal = (order: Order) => {
    if (!order.lignes || order.lignes.length === 0) return 0;
    
    return order.lignes.reduce((sum, line) => {
      const sousTotal =
        typeof line.sousTotal === "string"
          ? parseFloat(line.sousTotal)
          : line.sousTotal || 0;
      return sum + sousTotal;
    }, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  // Stats cards configuration
  const statsCards = [
    {
      title: "Utilisateurs Totaux",
      value: stats.totalUsers.toString(),
      change: `${stats.usersGrowth >= 0 ? "+" : ""}${stats.usersGrowth}%`,
      trend: stats.usersGrowth >= 0 ? "up" : "down",
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      link: "/admin/users",
    },
    {
      title: "Commandes",
      value: stats.totalOrders.toString(),
      change: `${stats.ordersGrowth >= 0 ? "+" : ""}${stats.ordersGrowth}%`,
      trend: stats.ordersGrowth >= 0 ? "up" : "down",
      icon: ShoppingCart,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      link: "/admin/orders",
    },
    {
      title: "Produits",
      value: stats.totalProducts.toString(),
      change: `${stats.productsGrowth >= 0 ? "+" : ""}${stats.productsGrowth}%`,
      trend: stats.productsGrowth >= 0 ? "up" : "down",
      icon: Package,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      link: "/admin/products",
    },
    {
      title: "Revenus",
      value: `${Math.round(stats.totalRevenue / 1000)}K Ar`,
      change: `${stats.revenueGrowth >= 0 ? "+" : ""}${stats.revenueGrowth}%`,
      trend: stats.revenueGrowth >= 0 ? "up" : "down",
      icon: DollarSign,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      link: "/admin/analytics",
    },
  ];

  // Répartition des utilisateurs
  const userStatsCards = [
    {
      role: "Paysans",
      count: usersByRole.paysans,
      icon: Wheat,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
    {
      role: "Collecteurs",
      count: usersByRole.collecteurs,
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      role: "Admins",
      count: usersByRole.admins,
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
          <h1 className="text-3xl font-bold">Tableau de Bord Administrateur</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            className="flex items-center gap-2"
          >
            <Activity size={16} />
            Actualiser
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600">
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

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;

          return (
            <Card
              key={index}
              className="p-6 hover:shadow-lg transition cursor-pointer group border-l-4"
              style={{ borderLeftColor: stat.textColor.replace("text-", "#") }}
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition`}
                >
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
                <Badge
                  variant="secondary"
                  className={`${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  } flex items-center gap-1`}
                >
                  <TrendIcon size={12} />
                  {stat.change}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold">{stat.value}</h3>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Répartition des utilisateurs */}
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
                className={`${stat.bg} p-6 rounded-xl border-2 ${stat.border} hover:shadow-md transition cursor-pointer`}
                onClick={() => navigate("/admin/users")}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Icon className={`${stat.color}`} size={28} />
                  <span className="font-semibold text-gray-700 text-lg">
                    {stat.role}
                  </span>
                </div>
                <p className="text-4xl font-bold">{stat.count}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {((stat.count / stats.totalUsers) * 100).toFixed(1)}% du total
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activités récentes */}
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
                        {order.produitRecherche || `Commande #${order.id?.slice(0, 8)}`}
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

        {/* Commandes en attente */}
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
                        {order.produitRecherche || `Commande #${order.id?.slice(0, 8)}`}
                      </h4>
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Clock size={12} className="mr-1" />
                        En attente
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        Quantité: <span className="font-semibold">{order.quantiteTotal} {order.unite}</span>
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
                          <span className="font-semibold">{order.lignes.length}</span>
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-3 pt-2 border-t">
                        <span className="text-green-600 font-bold">
                          {total > 0 ? `${total.toLocaleString()} Ar` : "À définir"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            {ordersByStatus.pending === 0 && (
              <div className="text-center py-12">
                <CheckCircle size={48} className="mx-auto text-green-300 mb-4" />
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
            Types de Produits les Plus Populaires
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
          {productsByType.map((product, index) => (
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
          ))}
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
          <h3 className="text-4xl font-bold mb-2">{ordersByStatus.completed}</h3>
          <p className="text-sm text-gray-600">Commandes terminées</p>
        </Card>

        <Card className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-4">
            <Package className="w-12 h-12 text-blue-600" />
            <Badge className="bg-blue-100 text-blue-700">Actifs</Badge>
          </div>
          <h3 className="text-4xl font-bold mb-2">{availableProducts}</h3>
          <p className="text-sm text-gray-600">Produits disponibles</p>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-200 cursor-pointer hover:shadow-lg transition group"
          onClick={() => navigate("/admin/users")}
        >
          <Users className="w-12 h-12 text-blue-600 mb-4 group-hover:scale-110 transition" />
          <h3 className="font-semibold text-lg mb-2">Gérer les Utilisateurs</h3>
          <p className="text-sm text-gray-600 mb-4">
            Voir, modifier, suspendre les comptes
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