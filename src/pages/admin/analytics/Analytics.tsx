import { BarChart3 } from "lucide-react";
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
} from "recharts";

const AdminAnalytics = () => {
  // Données pour les graphiques
  const salesData = [
    { month: "Jan", ventes: 45000, commandes: 12 },
    { month: "Fév", ventes: 52000, commandes: 15 },
    { month: "Mar", ventes: 48000, commandes: 13 },
    { month: "Avr", ventes: 61000, commandes: 18 },
    { month: "Mai", ventes: 55000, commandes: 16 },
    { month: "Juin", ventes: 67000, commandes: 20 },
  ];

  const productDistribution = [
    { name: "Riz", value: 40, color: "#10b981" },
    { name: "Maïs", value: 30, color: "#f59e0b" },
    { name: "Haricots", value: 20, color: "#3b82f6" },
    { name: "Autres", value: 10, color: "#8b5cf6" },
  ];

  return (
    <section>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="text-green-600" />
          Statistiques et Analyses
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Évolution des Ventes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="ventes"
                  stroke="#10b981"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Nombre de Commandes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="commandes" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">
              Distribution des Produits
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    name,
                    percent,
                  }: {
                    name?: string;
                    percent?: number;
                  }) => `${name ?? ""} ${Math.round((percent ?? 0) * 100)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4">Performance Mensuelle</h3>
            <div className="space-y-4 mt-6">
              {[
                {
                  label: "Taux de conversion",
                  value: "89%",
                  color: "bg-green-500",
                  width: "89%",
                },
                {
                  label: "Satisfaction client",
                  value: "94%",
                  color: "bg-blue-500",
                  width: "94%",
                },
                {
                  label: "Livraisons à temps",
                  value: "87%",
                  color: "bg-yellow-500",
                  width: "87%",
                },
                {
                  label: "Taux de retour",
                  value: "3%",
                  color: "bg-red-500",
                  width: "3%",
                },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-sm font-bold">{item.value}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${item.color} h-3 rounded-full transition-all duration-1000`}
                      style={{ width: item.width }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminAnalytics;
