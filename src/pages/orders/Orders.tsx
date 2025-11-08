import { Calendar, Check, DollarSign, MessageSquare, X } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const Orders = () => {
  const orders = [
    { id: 1, product: 'Riz Premium', quantity: 100, status: 'pending', buyer: 'Société AgriTrade', date: '2025-11-03' },
    { id: 2, product: 'Maïs Bio', quantity: 50, status: 'accepted', buyer: 'CoopéGrain', date: '2025-11-02' },
  ];
  const { user } = useAuth();
  const userRole = user?.role;

  return (
    <div className="space-y-6">
      <h2 className="text-xl md:text-2xl font-bold">
        {userRole === 'farmer' ? 'Commandes reçues' : 'Mes Commandes'}
      </h2>

      <div className="flex flex-col gap-4">
        {orders.map(order => (
          <Link to={`/orders/${order.id}`} key={order.id}>
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 hover:shadow-xl transition">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex items-start gap-3 md:gap-4 w-full">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-2xl md:text-3xl shrink-0">
                    📦
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-xl font-bold">{order.product}</h3>
                    <p className="text-sm md:text-base text-gray-600">Quantité: {order.quantity} kg</p>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">
                      {userRole === 'farmer' ? `Acheteur: ${order.buyer}` : 'Vendeur: Jean Rakoto'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  order.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                  {order.status === 'pending' ? '⏳ En attente' :
                    order.status === 'accepted' ? '✅ Acceptée' : '📦 Livrée'}
                </span>
              </div>

              <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-600 mb-4">
                <Calendar size={16} className="shrink-0" />
                <span>Commandé le {order.date}</span>
              </div>

              {userRole === 'farmer' && order.status === 'pending' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                    <Check size={20} />
                    Accepter
                  </button>
                  <button className="flex-1 bg-red-600 text-white px-4 py-3 rounded-xl hover:bg-red-700 transition flex items-center justify-center gap-2 font-semibold">
                    <X size={20} />
                    Refuser
                  </button>
                </div>
              )}

              {order.status === 'accepted' && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                  <button className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-semibold">
                    <MessageSquare size={20} />
                    Contacter
                  </button>
                  {userRole === 'collector' && (
                    <button className="flex-1 bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 font-semibold">
                      <DollarSign size={20} />
                      Payer
                    </button>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;