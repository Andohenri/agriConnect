import { useAuth } from '../../contexts/AuthContext';
import { Calendar, MapPin, Package, Plus, ShoppingCart } from 'lucide-react';

const Products = () => {
  const { user } = useAuth();
  const userRole = user?.role;

  const products = [
    { id: 1, name: 'Riz Premium', type: 'Grain', quantity: 500, unit: 'kg', price: 2500, date: '2025-01-15', image: '🌾', location: 'Analamanga', lat: -18.8792, lng: 47.5079, farmer: 'Jean Rakoto', phone: '034 12 345 67' },
    { id: 2, name: 'Maïs Bio', type: 'Grain', quantity: 300, unit: 'kg', price: 1800, date: '2025-01-20', image: '🌽', location: 'Vakinankaratra', lat: -19.4, lng: 46.95, farmer: 'Marie Rasoa', phone: '033 98 765 43' },
    { id: 3, name: 'Haricots Secs', type: 'Légumineuse', quantity: 200, unit: 'kg', price: 3200, date: '2025-01-18', image: '🫘', location: 'Analamanga', lat: -18.95, lng: 47.52, farmer: 'Paul Randria', phone: '032 55 444 33' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold">
          {userRole === 'farmer' ? 'Mes Produits' : 'Produits Disponibles'}
        </h2>
        {userRole === 'farmer' && (
          <button className="w-full sm:w-auto bg-linear-to-r from-green-600 to-green-700 text-white px-4 md:px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition">
            <Plus size={20} />
            Ajouter un produit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group">
            <div className="h-40 md:h-48 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-6xl md:text-8xl group-hover:scale-110 transition">
              {product.image}
            </div>
            <div className="p-4 md:p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg md:text-xl font-bold">{product.name}</h3>
                  <p className="text-xs md:text-sm text-gray-500">{product.type}</p>
                </div>
                <span className="bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold">
                  Disponible
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Package size={14} className="shrink-0" />
                  <span className="text-xs md:text-sm">{product.quantity} {product.unit}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={14} className="shrink-0" />
                  <span className="text-xs md:text-sm">{product.location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={14} className="shrink-0" />
                  <span className="text-xs md:text-sm">Récolté le {product.date}</span>
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <p className="text-xl md:text-2xl font-bold text-green-600">{product.price.toLocaleString()} Ar</p>
                  <p className="text-xs text-gray-500">par kg</p>
                </div>
                {userRole === 'collector' ? (
                  <button className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    Commander
                  </button>
                ) : (
                  <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                    Modifier
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;