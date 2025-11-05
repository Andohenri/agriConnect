import { MessageSquare, Package, Phone, User, Map } from 'lucide-react';

const MapView = () => {
  const products = [
    { id: 1, name: 'Riz Premium', type: 'Grain', quantity: 500, unit: 'kg', price: 2500, date: '2025-01-15', image: '🌾', location: 'Analamanga', lat: -18.8792, lng: 47.5079, farmer: 'Jean Rakoto', phone: '034 12 345 67' },
    { id: 2, name: 'Maïs Bio', type: 'Grain', quantity: 300, unit: 'kg', price: 1800, date: '2025-01-20', image: '🌽', location: 'Vakinankaratra', lat: -19.4, lng: 46.95, farmer: 'Marie Rasoa', phone: '033 98 765 43' },
    { id: 3, name: 'Haricots Secs', type: 'Légumineuse', quantity: 200, unit: 'kg', price: 3200, date: '2025-01-18', image: '🫘', location: 'Analamanga', lat: -18.95, lng: 47.52, farmer: 'Paul Randria', phone: '032 55 444 33' },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Map className="text-green-600" />
        Carte des Producteurs
      </h2>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="relative h-96 md:h-[600px] bg-linear-to-br from-green-50 to-blue-50">
          {/* Simulation de carte avec marqueurs */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Centre: Antananarivo */}
              <div className="absolute" style={{ top: '45%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                <div className="relative group cursor-pointer">
                  <div className="w-8 h-8 bg-red-500 rounded-full animate-pulse flex items-center justify-center text-white font-bold shadow-lg">
                    📍
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <strong>Antananarivo</strong><br />
                    3 producteurs actifs
                  </div>
                </div>
              </div>

              {/* Autres régions */}
              {products.map((product, i) => (
                <div
                  key={product.id}
                  className="absolute"
                  style={{
                    top: `${40 + i * 15}%`,
                    left: `${45 + i * 10}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="relative group cursor-pointer">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-xl shadow-lg hover:scale-110 transition">
                      {product.image}
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-white border-2 border-green-500 p-4 rounded-xl text-sm whitespace-nowrap shadow-xl z-10">
                      <div className="space-y-1">
                        <p className="font-bold text-lg">{product.name}</p>
                        <p className="text-gray-600">{product.farmer}</p>
                        <p className="text-green-600 font-semibold">{product.quantity} {product.unit} disponibles</p>
                        <p className="text-sm text-gray-500">{product.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-white p-4 rounded-xl shadow-lg">
                <h4 className="font-bold mb-2">Légende</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Votre position</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Producteurs</span>
                  </div>
                </div>
              </div>

              {/* Statistiques de la carte */}
              <div className="absolute top-4 right-4 bg-white p-4 rounded-xl shadow-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Package size={20} className="text-green-600" />
                  <div>
                    <p className="text-xs text-gray-500">Produits actifs</p>
                    <p className="text-lg font-bold">47</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500">Producteurs</p>
                    <p className="text-lg font-bold">15</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des producteurs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition">
            <div className="flex items-start gap-3">
              <div className="text-4xl">{product.image}</div>
              <div className="flex-1">
                <h4 className="font-bold">{product.farmer}</h4>
                <p className="text-sm text-gray-600">{product.location}</p>
                <p className="text-xs text-green-600 mt-1">{product.name} - {product.quantity}{product.unit}</p>
                <div className="flex gap-2 mt-2">
                  <button className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    <Phone size={12} />
                    Appeler
                  </button>
                  <button className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    <MessageSquare size={12} />
                    Message
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapView;