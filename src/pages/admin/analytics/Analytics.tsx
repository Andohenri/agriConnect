import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Loader2, RefreshCw, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { UserService } from "@/service/user.service";
import { ProductService } from "@/service/product.service";
import { OrderService } from "@/service/order.service";
import { CommandeStatut } from "@/types/enums";
import { toast } from "sonner";

interface MonthlyData {
  month: string;
  ventes: number;
  commandes: number;
  revenus: number;
}

interface ProductTypeData {
  name: string;
  value: number;
  count: number;
  color: string;
  [key: string]: any;
}

interface PerformanceMetric {
  label: string;
  value: string;
  percentage: number;
  color: string;
  trend: "up" | "down";
}

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // États pour les données
  const [salesData, setSalesData] = useState<MonthlyData[]>([]);
  const [productDistribution, setProductDistribution] = useState<ProductTypeData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  
  // Stats générales
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    completionRate: 0,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    const isRefresh = !loading;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Charger toutes les données
      const [usersResponse, productsResponse, ordersResponse] = await Promise.allSettled([
        UserService.getAllUsers(),
        ProductService.getAllProducts(1, 1000),
        OrderService.getAllOrdersAdmin(1, 1000),
      ]);

      let users: any[] = [];
      let products: any[] = [];
      let orders: any[] = [];

      // Normaliser les utilisateurs
      if (usersResponse.status === "fulfilled") {
        const usersData = usersResponse.value;
        if (Array.isArray(usersData)) {
          users = usersData;
        } else if (typeof usersData === "object") {
          users = Object.values(usersData).filter(
            (u: any) => u && typeof u === "object" && u.id
          );
        }
      }

      // Normaliser les produits
      if (productsResponse.status === "fulfilled") {
        const productsData = productsResponse.value;
        products = productsData?.data || productsData || [];
      }

      // Normaliser les commandes
      if (ordersResponse.status === "fulfilled") {
        const ordersData = ordersResponse.value;
        orders = ordersData?.data || ordersData || [];
      }

      // Traiter les données
      processMonthlyData(orders);
      processProductDistribution(products);
      processPerformanceMetrics(orders, products);
      calculateTotalStats(users, products, orders);

      if (isRefresh) {
        toast.success("Statistiques actualisées !");
      }
    } catch (error) {
      console.error("Erreur chargement analytics:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Calculer les données mensuelles
  const processMonthlyData = (orders: any[]) => {
    const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const currentYear = new Date().getFullYear();
    const monthlyStats: Record<number, { ventes: number; commandes: number; revenus: number }> = {};

    // Initialiser les 6 derniers mois
    const currentMonth = new Date().getMonth();
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      monthlyStats[monthIndex] = { ventes: 0, commandes: 0, revenus: 0 };
    }

    // Agréger les données
    orders.forEach((order) => {
      if (!order.createdAt) return;

      const orderDate = new Date(order.createdAt);
      if (orderDate.getFullYear() !== currentYear) return;

      const monthIndex = orderDate.getMonth();
      if (!monthlyStats[monthIndex]) return;

      monthlyStats[monthIndex].commandes += 1;

      // Calculer le revenu de la commande
      if (order.lignes && Array.isArray(order.lignes)) {
        const orderRevenue = order.lignes.reduce((sum: number, line: any) => {
          const sousTotal = typeof line.sousTotal === "string"
            ? parseFloat(line.sousTotal) || 0
            : line.sousTotal || 0;
          return sum + sousTotal;
        }, 0);
        monthlyStats[monthIndex].revenus += orderRevenue;
        monthlyStats[monthIndex].ventes += orderRevenue;
      }
    });

    // Convertir en tableau pour le graphique
    const chartData: MonthlyData[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      chartData.push({
        month: monthNames[monthIndex],
        ventes: Math.round(monthlyStats[monthIndex].ventes),
        commandes: monthlyStats[monthIndex].commandes,
        revenus: Math.round(monthlyStats[monthIndex].revenus),
      });
    }

    setSalesData(chartData);
  };

  // Calculer la distribution des produits par type
  const processProductDistribution = (products: any[]) => {
    const typeStats: Record<string, { count: number; value: number }> = {};
    const colors = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ef4444", "#06b6d4"];

    products.forEach((product) => {
      const type = product.type || "Autre";
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, value: 0 };
      }
      typeStats[type].count += 1;
      typeStats[type].value += (product.prixUnitaire || 0) * (product.quantiteDisponible || 0);
    });

    const distribution = Object.entries(typeStats)
      .map(([name, data], index) => ({
        name,
        value: data.count,
        count: data.count,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    setProductDistribution(distribution);
  };

  // Calculer les métriques de performance
  const processPerformanceMetrics = (orders: any[], products: any[]) => {
    const totalOrders = orders.length;
    if (totalOrders === 0) {
      setPerformanceMetrics([
        { label: "Taux de conversion", value: "0%", percentage: 0, color: "bg-green-500", trend: "up" },
        { label: "Commandes complètes", value: "0%", percentage: 0, color: "bg-blue-500", trend: "up" },
        { label: "Produits disponibles", value: "0%", percentage: 0, color: "bg-yellow-500", trend: "up" },
        { label: "Commandes annulées", value: "0%", percentage: 0, color: "bg-red-500", trend: "down" },
      ]);
      return;
    }

    // Calculer les taux
    const completedOrders = orders.filter(
      (o) => o.statut === CommandeStatut.COMPLETE || o.statut === CommandeStatut.LIVREE
    ).length;
    const cancelledOrders = orders.filter((o) => o.statut === CommandeStatut.ANNULEE).length;
    const acceptedOrders = orders.filter(
      (o) => o.statut === CommandeStatut.ACCEPTEE || o.statut === CommandeStatut.COMPLETE
    ).length;
    
    const availableProducts = products.filter((p) => p.statut === "disponible").length;
    const totalProducts = products.length || 1;

    const completionRate = Math.round((completedOrders / totalOrders) * 100);
    const conversionRate = Math.round((acceptedOrders / totalOrders) * 100);
    const availabilityRate = Math.round((availableProducts / totalProducts) * 100);
    const cancellationRate = Math.round((cancelledOrders / totalOrders) * 100);

    setPerformanceMetrics([
      {
        label: "Taux de conversion",
        value: `${conversionRate}%`,
        percentage: conversionRate,
        color: "bg-green-500",
        trend: "up",
      },
      {
        label: "Commandes complètes",
        value: `${completionRate}%`,
        percentage: completionRate,
        color: "bg-blue-500",
        trend: "up",
      },
      {
        label: "Produits disponibles",
        value: `${availabilityRate}%`,
        percentage: availabilityRate,
        color: "bg-yellow-500",
        trend: "up",
      },
      {
        label: "Taux d'annulation",
        value: `${cancellationRate}%`,
        percentage: cancellationRate,
        color: "bg-red-500",
        trend: "down",
      },
    ]);
  };

  // Calculer les stats totales
  const calculateTotalStats = (users: any[], products: any[], orders: any[]) => {
    const totalRevenue = orders.reduce((sum, order) => {
      if (!order.lignes || !Array.isArray(order.lignes)) return sum;
      const orderTotal = order.lignes.reduce((lineSum: number, line: any) => {
        const sousTotal = typeof line.sousTotal === "string"
          ? parseFloat(line.sousTotal) || 0
          : line.sousTotal || 0;
        return lineSum + sousTotal;
      }, 0);
      return sum + orderTotal;
    }, 0);

    const completedOrders = orders.filter(
      (o) => o.statut === CommandeStatut.COMPLETE || o.statut === CommandeStatut.LIVREE
    ).length;

    setTotalStats({
      totalRevenue: Math.round(totalRevenue),
      totalOrders: orders.length,
      totalProducts: products.length,
      totalUsers: users.length,
      averageOrderValue: orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0,
      completionRate: orders.length > 0 ? Math.round((completedOrders / orders.length) * 100) : 0,
    });
  };

  // Custom Tooltip pour les graphiques
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.name.includes("ventes") || entry.name.includes("revenus")
                ? `${entry.value.toLocaleString()} Ar`
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600 font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <BarChart3 className="text-green-600" />
            Statistiques et Analyses
          </h1>
          <p className="text-gray-600 mt-1">Analyse détaillée des performances</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalyticsData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Actualiser
          </Button>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
            <Calendar size={16} />
            <span>
              {new Date().toLocaleDateString("fr-FR", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des Ventes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Évolution des Ventes (6 derniers mois)</h3>
            <Badge variant="outline" className="text-green-600">
              <TrendingUp size={14} className="mr-1" />
              Revenus
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventes"
                name="Ventes (Ar)"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Nombre de Commandes */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Nombre de Commandes</h3>
            <Badge variant="outline" className="text-blue-600">Total: {totalStats.totalOrders}</Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="commandes" name="Commandes" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribution des Produits */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Distribution des Produits par Type</h3>
            <Badge variant="outline">{productDistribution.length} types</Badge>
          </div>
          {productDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p>Aucune donnée disponible</p>
            </div>
          )}
        </Card>

        {/* Métriques de Performance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Métriques de Performance</h3>
            <Badge variant="outline" className="text-green-600">En temps réel</Badge>
          </div>
          <div className="space-y-4 mt-6">
            {performanceMetrics.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold text-gray-900">{item.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${item.color} h-3 rounded-full transition-all duration-1000 ease-out`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Résumé statistique */}
      <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-2 border-green-200">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" />
          Résumé de Performance
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Valeur moy./commande</p>
            <p className="text-2xl font-bold text-gray-900">
              {totalStats.averageOrderValue.toLocaleString()} Ar
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Taux de complétion</p>
            <p className="text-2xl font-bold text-gray-900">{totalStats.completionRate}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Commandes mensuelles</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(totalStats.totalOrders / 6)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Revenus mensuels</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(totalStats.totalRevenue / 6000)}K Ar
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
};

export default AdminAnalytics;