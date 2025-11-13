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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { UserService } from "@/service/user.service";
import { ProductService } from "@/service/product.service";
import { OrderService } from "@/service/order.service";
import { Role } from "@/types/enums";
import { toast } from "sonner";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState< User[]>([]);
  const [products, setProducts] = useState< Product[]>([]);
  const [orders, setOrders] = useState< Order[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersData = await UserService.getAllUsers();
        setUsers(usersData)
        const productsData = await ProductService.getAllProducts();
        setProducts(productsData.data)
        const ordersData = await OrderService.getAllOrders();
        setOrders(ordersData.data)
      } catch (error) {
        toast.error("Erreur lors du chargement des données.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-gray-500" size={48} />
      </div>
    );
  }



  // Données statistiques
  const stats = [
    {
      title: "Utilisateurs Totaux",
      value: users.length.toString(),
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "blue",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      link: "/admin/users",
    },
    {
      title: "Commandes",
      value: orders.length.toString(),
      change: "+8%",
      trend: "up",
      icon: ShoppingCart,
      color: "green",
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      link: "/admin/orders",
    },
    {
      title: "Produits",
      value: products.length.toString(),
      change: "+15%",
      trend: "up",
      icon: Package,
      color: "purple",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      link: "/admin/products",
    },
    {
      title: "Revenus",
      value: "3,450,000 Ar",
      change: "-3%",
      trend: "down",
      icon: TrendingUp,
      color: "orange",
      bgColor: "bg-orange-100",
      textColor: "text-orange-600",
      link: "/admin/analytics",
    },
  ];

  // Répartition des utilisateurs
  const userStats = [
    {
      role: "Paysan",
      count: users.filter((user) => user.role === Role.PAYSAN).length,
      icon: Wheat,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      role: "Collecteur",
      count: users.filter((user) => user.role === Role.COLLECTEUR).length,
      icon: Truck,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      role: "Admin",
      count: users.filter((user) => user.role === Role.ADMIN).length,
      icon: UserCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  // Activités récentes
  const recentActivities = [
    {
      id: 1,
      user: "Jean Rakoto",
      action: "a créé une nouvelle commande pour",
      product: "Riz Premium",
      role: "Collecteur",
      time: "Il y a 10 minutes",
      status: "success",
      icon: CheckCircle,
    },
    {
      id: 2,
      user: "Marie Rasoa",
      action: "a ajouté un nouveau produit",
      product: "Maïs Bio",
      role: "Paysan",
      time: "Il y a 30 minutes",
      status: "pending",
      icon: Clock,
    },
    {
      id: 3,
      user: "Paul Randria",
      action: "a mis à jour son profil",
      time: "Il y a 1 heure",
      status: "success",
      icon: CheckCircle,
    },
    {
      id: 4,
      user: "Lina Rasoanaivo",
      action: "a supprimé une commande",
      product: "Haricots Secs",
      role: "Collecteur",
      time: "Il y a 2 heures",
      status: "error",
      icon: AlertCircle,
    },
    {
      id: 5,
      user: "Andry Rakotomalala",
      action: "a créé un nouveau produit",
      product: "Tomates",
      role: "Paysan",
      time: "Il y a 3 heures",
      status: "success",
      icon: CheckCircle,
    },
  ];

  // Commandes en attente
  const pendingOrders = [
    {
      id: 1,
      product: "Riz Premium",
      quantity: 100,
      buyer: "AgriTrade",
      seller: "Jean Rakoto",
      price: 250000,
      date: "2025-01-10",
    },
    {
      id: 2,
      product: "Maïs Bio",
      quantity: 50,
      buyer: "CoopéGrain",
      seller: "Marie Rasoa",
      price: 90000,
      date: "2025-01-09",
    },
    {
      id: 3,
      product: "Haricots Secs",
      quantity: 75,
      buyer: "Distribution Pro",
      seller: "Paul Randria",
      price: 240000,
      date: "2025-01-08",
    },
  ];

  // Produits populaires
  const topProducts = [
    { name: "Riz Premium", sales: 456, revenue: "1,140,000 Ar", trend: "up" },
    { name: "Maïs Bio", sales: 324, revenue: "583,200 Ar", trend: "up" },
    { name: "Haricots Secs", sales: 289, revenue: "924,800 Ar", trend: "up" },
    { name: "Tomates", sales: 198, revenue: "297,000 Ar", trend: "down" },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-700",
      success: "bg-green-100 text-green-700",
      error: "bg-red-100 text-red-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      success: CheckCircle,
      error: AlertCircle,
    };
    const Icon = icons[status as keyof typeof icons] || Activity;
    return <Icon size={14} />;
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card
              key={index}
              className="p-6 hover:shadow-xl transition cursor-pointer group"
              onClick={() => navigate(stat.link)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 ${stat.bgColor} rounded-xl group-hover:scale-110 transition`}>
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
          <h3 className="text-lg font-semibold">Répartition des Utilisateurs</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>
            Voir tout <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {userStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`${stat.bg} p-4 rounded-xl border-2 border-transparent hover:border-current transition cursor-pointer`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`${stat.color}`} size={24} />
                  <span className="font-semibold text-gray-700">{stat.role}</span>
                </div>
                <p className="text-3xl font-bold">{stat.count}</p>
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
            <Button variant="ghost" size="sm">
              Voir tout <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivities.map((activity) => {
              const Icon = activity.icon;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className={`p-2 rounded-lg ${getStatusColor(activity.status)}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span>{" "}
                      {activity.action}
                      {activity.product && (
                        <span className="text-blue-600"> {activity.product}</span>
                      )}
                      {activity.role && (
                        <span className="text-blue-600"> {activity.role}</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {getStatusIcon(activity.status)}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Commandes en attente */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock size={20} className="text-orange-600" />
              Commandes en Attente
            </h3>
            <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")}>
              Voir tout <ArrowRight size={16} className="ml-1" />
            </Button>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
                onClick={() => navigate(`/admin/orders/${order.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{order.product}</h4>
                  <Badge className="bg-yellow-100 text-yellow-700">
                    <Clock size={12} className="mr-1" />
                    En attente
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Quantité: <span className="font-semibold">{order.quantity} kg</span></p>
                  <p>Acheteur: <span className="font-semibold">{order.buyer}</span></p>
                  <p>Vendeur: <span className="font-semibold">{order.seller}</span></p>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t">
                    <span className="text-green-600 font-bold">{order.price.toLocaleString()} Ar</span>
                    <span className="text-xs text-gray-500">{order.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Produits populaires */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-green-600" />
            Produits les Plus Vendus
          </h3>
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/products")}>
            Voir tout <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {topProducts.map((product, index) => (
            <div
              key={index}
              className="p-4 border rounded-lg hover:shadow-md transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{product.name}</h4>
                {product.trend === "up" ? (
                  <TrendingUp size={18} className="text-green-600" />
                ) : (
                  <TrendingDown size={18} className="text-red-600" />
                )}
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-1">{product.sales}</p>
              <p className="text-xs text-gray-600 mb-2">ventes</p>
              <p className="text-sm font-semibold text-green-600">{product.revenue}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Carte rapide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="p-6 bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate("/admin/users")}
        >
          <Users className="w-10 h-10 text-blue-600 mb-3" />
          <h3 className="font-semibold mb-2">Gérer les Utilisateurs</h3>
          <p className="text-sm text-gray-600">Voir, modifier, suspendre les comptes</p>
        </Card>

        <Card
          className="p-6 bg-linear-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate("/admin/products")}
        >
          <Package className="w-10 h-10 text-green-600 mb-3" />
          <h3 className="font-semibold mb-2">Gérer les Produits</h3>
          <p className="text-sm text-gray-600">Superviser, modérer les annonces</p>
        </Card>

        <Card
          className="p-6 bg-linear-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-lg transition"
          onClick={() => navigate("/admin/orders")}
        >
          <ShoppingCart className="w-10 h-10 text-purple-600 mb-3" />
          <h3 className="font-semibold mb-2">Suivre les Commandes</h3>
          <p className="text-sm text-gray-600">Monitorer les transactions</p>
        </Card>
      </div>
    </section>
  );
}