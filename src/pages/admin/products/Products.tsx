import { Link } from "react-router-dom";
import { Ban, Calendar, CheckCircle, MapPin, Package, Trash2 } from "lucide-react";

const AdminProducts = () => {

  const products = [
    {
      id: 1,
      nom: "Riz Premium",
      type: "Grain",
      sous_type: "Bio",
      quantite_disponible: 500,
      unite: "kg",
      prix_unitaire: 2500,
      date_recolte: "2025-01-15",
      image: "🌾",
      localisation: "Analamanga",
      latitude: -18.8792,
      longitude: 47.5079,
      paysan: "Jean Rakoto",
      owner: "Jean Rakoto",
      telephone: "034 12 345 67",
      description: "Riz de qualité supérieure, cultivé biologiquement",
      certification: "Bio",
      statut: "disponible",
      active: true,
    },
    {
      id: 2,
      nom: "Maïs Bio",
      type: "Grain",
      sous_type: "Frais",
      quantite_disponible: 300,
      unite: "kg",
      prix_unitaire: 1800,
      date_recolte: "2025-01-20",
      image: "🌽",
      localisation: "Vakinankaratra",
      latitude: -19.4,
      longitude: 46.95,
      paysan: "Marie Rasoa",
      owner: "Marie Rasoa",
      telephone: "033 98 765 43",
      description: "Maïs frais et bio",
      certification: "Bio",
      statut: "disponible",
      active: true,
    },
    {
      id: 3,
      nom: "Haricots Secs",
      type: "Légumineuse",
      sous_type: "Sec",
      quantite_disponible: 200,
      unite: "kg",
      prix_unitaire: 3200,
      date_recolte: "2025-01-18",
      image: "🫘",
      localisation: "Analamanga",
      latitude: -18.95,
      longitude: 47.52,
      paysan: "Paul Randria",
      owner: "Paul Randria",
      telephone: "032 55 444 33",
      description: "Haricots secs de première qualité",
      certification: "",
      statut: "disponible",
      active: true,
    },
  ];

  return (
    <section>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold">
            Gestion des Produits
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/products/${product.id}`}>
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition group">
                <div className="h-40 md:h-48 bg-linear-to-br from-green-100 to-green-200 flex items-center justify-center text-6xl md:text-8xl group-hover:scale-110 transition">
                  {product.image}
                </div>

                <div className="p-4 md:p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg md:text-xl font-bold">
                        {product.nom}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-500">
                        {product.type}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 mt-1">
                        Créé par :{" "}
                        <span className="font-semibold">{product.owner}</span>
                      </p>
                    </div>
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-semibold ${
                        product.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {product.active ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package size={14} className="shrink-0" />
                      <span className="text-xs md:text-sm">
                        {product.quantite_disponible} {product.unite}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={14} className="shrink-0" />
                      <span className="text-xs md:text-sm">
                        {product.localisation}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={14} className="shrink-0" />
                      <span className="text-xs md:text-sm">
                        Récolté le {product.date_recolte}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-xl md:text-2xl font-bold text-green-600">
                        {product.prix_unitaire.toLocaleString()} Ar
                      </p>
                      <p className="text-xs text-gray-500">par kg</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm flex items-center gap-2">
                        <Trash2 size={16} />
                        Supprimer
                      </button>

                      <button
                        className={`${
                          product.active
                            ? "bg-gray-600 hover:bg-gray-700"
                            : "bg-green-600 hover:bg-green-700"
                        } text-white px-3 py-2 rounded-lg transition text-sm flex items-center gap-2`}
                      >
                        {product.active ? (
                          <>
                            <Ban size={16} /> Désactiver
                          </>
                        ) : (
                          <>
                            <CheckCircle size={16} /> Activer
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminProducts;
