import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <Package size={32} className="opacity-80" />
            <span className="bg-blue-400 bg-opacity-30 px-3 py-1 rounded-full text-sm">+12%</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">
            {userRole === 'farmer' ? '15' : '47'}
          </p>
          <p className="text-blue-100 text-sm">
            {userRole === 'farmer' ? 'Produits actifs' : 'Produits trouvés'}
          </p>
        </div>

        <div className="bg-linear-to-br from-green-500 to-green-600 text-white p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <ShoppingCart size={32} className="opacity-80" />
            <span className="bg-green-400 bg-opacity-30 px-3 py-1 rounded-full text-sm">+8%</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">23</p>
          <p className="text-green-100 text-sm">Commandes</p>
        </div>

        <div className="bg-linear-to-br from-yellow-500 to-orange-500 text-white p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <DollarSign size={32} className="opacity-80" />
            <span className="bg-yellow-400 bg-opacity-30 px-3 py-1 rounded-full text-sm">+25%</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">450K Ar</p>
          <p className="text-yellow-100 text-sm">
            {userRole === 'farmer' ? 'Revenus ce mois' : 'Dépenses ce mois'}
          </p>
        </div>

        <div className="bg-linear-to-br from-purple-500 to-purple-600 text-white p-4 md:p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <TrendingUp size={32} className="opacity-80" />
            <span className="bg-purple-400 bg-opacity-30 px-3 py-1 rounded-full text-sm">+18%</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold mb-1">89%</p>
          <p className="text-purple-100 text-sm">Taux de succès</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" />
          Activité récente
        </h3>
        <div className="space-y-3">
          {[
            { action: 'Nouvelle commande reçue', product: 'Riz Premium - 100kg', time: 'Il y a 2h', icon: '🛒', color: 'bg-blue-100 text-blue-600' },
            { action: 'Paiement confirmé', product: 'Maïs Bio - 50kg', time: 'Il y a 5h', icon: '💰', color: 'bg-green-100 text-green-600' },
            { action: 'Nouveau produit ajouté', product: 'Haricots Secs', time: 'Il y a 1j', icon: '📦', color: 'bg-purple-100 text-purple-600' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
              <div className={`w-10 h-10 md:w-12 md:h-12 ${item.color} rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm md:text-base">{item.action}</p>
                <p className="text-xs md:text-sm text-gray-600 truncate">{item.product}</p>
              </div>
              <span className="text-xs md:text-sm text-gray-400 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard