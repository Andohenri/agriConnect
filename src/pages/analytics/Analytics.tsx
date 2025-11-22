import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  ShoppingCart,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
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
  Area,
  AreaChart,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { Role } from "@/types/enums";
import { OrderService } from "@/service/order.service";
import { ProductService } from "@/service/product.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const Analytics = () => {
  const { user } = useAuth();
  const isPysan = user?.role === Role.PAYSAN;
  const isCollector = user?.role === Role.COLLECTEUR;

  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("6months");

  // Stats générales
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    cancelledOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    successRate: 0,
    growthRate: 0,
  });

  // Données pour les graphiques
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [productDistribution, setProductDistribution] = useState<any[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadOrdersAnalytics(),
        loadProductsAnalytics(),
        loadPerformanceMetrics(),
      ]);
    } catch (error) {
      console.error("Erreur lors du chargement des analytics:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrdersAnalytics = async () => {
    try {
      let ordersStatsData;
      let ordersData;

      if (isPysan) {
        ordersStatsData = await OrderService.getOrdersStatsPaysan();
        ordersData = await OrderService.getAllOrdersDirectPaysan(1, 100);
      } else if (isCollector) {
        ordersStatsData = await OrderService.getOrdersStatsCollecteur();
        ordersData = await OrderService.getAllOrdersCollecteur(user?.id!, 1, 100);
      }

      if (ordersStatsData) {
        const total = ordersStatsData.totalCommandes || 0;
        const completed = ordersStatsData.commandesCompletees || 0;
        const pending =
          (ordersStatsData.commandesOuvertes || 0) +
          (ordersStatsData.commandesAcceptees || 0);
        const cancelled = ordersStatsData.commandesAnnulees || 0;

        const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        setStats({
          totalOrders: total,
          completedOrders: completed,
          pendingOrders: pending,
          cancelledOrders: cancelled,
          totalRevenue: 0, // À calculer depuis les commandes
          averageOrderValue: 0,
          successRate,
          growthRate: 0,
        });

        // Répartition par statut
        setStatusDistribution([
          {
            name: "En attente",
            value: pending,
            color: "#f59e0b",
          },
          {
            name: "Complétées",
            value: completed,
            color: "#10b981",
          },
          {
            name: "Annulées",
            value: cancelled,
            color: "#ef4444",
          },
        ].filter(item => item.value > 0));
      }

      if (ordersData?.data) {
        // Créer les données mensuelles
        const monthly = processMonthlyData(ordersData.data);
        setMonthlyData(monthly);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des analytics commandes:", error);
    }
  };

  const loadProductsAnalytics = async () => {
    try {
      if (isPysan) {
        const productsData = await ProductService.getAllProductsPaysan(1, 100);

        if (productsData?.data) {
          // Répartition par type de produit
          const typeCount: Record<string, number> = {};
          productsData.data.forEach((product: any) => {
            const type = product.type || "Autre";
            typeCount[type] = (typeCount[type] || 0) + 1;
          });

          const distribution = Object.entries(typeCount).map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length],
          }));

          setProductDistribution(distribution);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des analytics produits:", error);
    }
  };

  const loadPerformanceMetrics = async () => {
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
        const livrees = ordersStatsData.commandesLivrees || 0;
        const cancelled = ordersStatsData.commandesAnnulees || 0;

        const conversionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        const deliveryRate = total > 0 ? Math.round((livrees / total) * 100) : 0;
        const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

        setPerformanceMetrics([
          {
            label: isPysan ? "Taux d'acceptation" : "Taux de conversion",
            value: `${conversionRate}%`,
            color: "bg-green-500",
            width: `${conversionRate}%`,
            description: `${completed}/${total} commandes`,
          },
          {
            label: "Livraisons réussies",
            value: `${deliveryRate}%`,
            color: "bg-blue-500",
            width: `${deliveryRate}%`,
            description: `${livrees}/${total} commandes`,
          },
          {
            label: isPysan ? "Commandes en cours" : "En attente de réponse",
            value: `${100 - conversionRate - cancellationRate}%`,
            color: "bg-yellow-500",
            width: `${100 - conversionRate - cancellationRate}%`,
            description: "En traitement",
          },
          {
            label: "Taux d'annulation",
            value: `${cancellationRate}%`,
            color: "bg-red-500",
            width: `${cancellationRate}%`,
            description: `${cancelled}/${total} commandes`,
          },
        ]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des métriques:", error);
    }
  };

  const processMonthlyData = (orders: any[]) => {
    const monthlyMap: Record<string, { commandes: number; revenus: number }> = {};

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { commandes: 0, revenus: 0 };
      }

      monthlyMap[monthKey].commandes += 1;

      // Calculer le revenu (si disponible)
      if (order.lignes && order.lignes.length > 0) {
        const revenue = order.lignes.reduce((sum: number, line: any) => {
          const sousTotal =
            typeof line.sousTotal === "string"
              ? parseFloat(line.sousTotal)
              : line.sousTotal || 0;
          return sum + sousTotal;
        }, 0);
        monthlyMap[monthKey].revenus += revenue;
      }
    });

    // Convertir en tableau et trier
    const months = Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6) // 6 derniers mois
      .map(([key, data]) => {
        const [year, month] = key.split("-");
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
          "fr-FR",
          { month: "short" }
        );
        return {
          month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          commandes: data.commandes,
          revenus: Math.round(data.revenus),
        };
      });

    return months;
  };

  const handleExport = () => {
    const csvContent = [
      ["Métrique", "Valeur"],
      ["Commandes totales", stats.totalOrders],
      ["Commandes complétées", stats.completedOrders],
      ["Commandes en attente", stats.pendingOrders],
      ["Commandes annulées", stats.cancelledOrders],
      ["Taux de succès", `${stats.successRate}%`],
      ["Revenus totaux", `${stats.totalRevenue} Ar`],
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Données exportées avec succès");
  };

  if (isLoading) {
    return (
      <section className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-green-600 mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="text-green-600" />
            Statistiques et Analyses
          </h2>
          <p className="text-gray-600 mt-1">
            {isPysan
              ? "Analysez vos performances de vente"
              : "Suivez vos activités d'achat"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 mois</SelectItem>
              <SelectItem value="3months">3 mois</SelectItem>
              <SelectItem value="6months">6 mois</SelectItem>
              <SelectItem value="1year">1 an</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={loadAnalyticsData} size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>

          <Button variant="outline" onClick={handleExport} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-linear-to-br from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Commandes</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
            <ShoppingCart className="text-blue-500" size={40} />
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-600">
            <TrendingUp size={12} className="text-green-600" />
            <span>Sur {timeRange === "6months" ? "6 mois" : "la période"}</span>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-green-50 to-emerald-50 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Complétées</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
            </div>
            <Package className="text-green-500" size={40} />
          </div>
          <div className="mt-2">
            <Badge className="bg-green-100 text-green-700">
              {stats.successRate}% de succès
            </Badge>
          </div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-yellow-50 to-orange-50 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En attente</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
            </div>
            <AlertCircle className="text-yellow-500" size={40} />
          </div>
          <div className="mt-2 text-xs text-gray-600">En cours de traitement</div>
        </Card>

        <Card className="p-6 bg-linear-to-br from-purple-50 to-pink-50 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {isPysan ? "Revenus" : "Dépenses"}
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalRevenue.toLocaleString()} Ar
              </p>
            </div>
            <TrendingUp className="text-purple-500" size={40} />
          </div>
          <div className="mt-2 text-xs text-gray-600">Total sur la période</div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Évolution des commandes */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Évolution des Commandes
          </h3>
          {monthlyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorCommandes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="commandes"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorCommandes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Revenus mensuels */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} />
            {isPysan ? "Revenus Mensuels" : "Dépenses Mensuelles"}
          </h3>
          {monthlyData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()} Ar`} />
                <Bar dataKey="revenus" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Répartition par statut */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Répartition par Statut</h3>
          {statusDistribution.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                <p>Aucune commande</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name} ${Math.round((percent as number) * 100)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Distribution des produits (Paysan uniquement) */}
        {isPysan && (
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Distribution des Produits</h3>
            {productDistribution.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Package size={48} className="mx-auto mb-2 opacity-50" />
                  <p>Aucun produit</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) =>
                      `${name} ${Math.round((percent as number) * 100)}%`
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
            )}
          </Card>
        )}
      </div>

      {/* Métriques de performance */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} />
          Métriques de Performance
        </h3>
        <div className="space-y-6">
          {performanceMetrics.map((metric, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <div>
                  <span className="text-sm font-semibold">{metric.label}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{metric.description}</p>
                </div>
                <span className="text-sm font-bold">{metric.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`${metric.color} h-3 rounded-full transition-all duration-1000`}
                  style={{ width: metric.width }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
};

// Couleurs pour les graphiques
const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
];

export default Analytics;